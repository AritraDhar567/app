import math
from datetime import datetime, timezone
from typing import Dict, Any, List

from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(app, cors_allowed_origins="*")


# Enhanced state management
class StateManager:
    def __init__(self):
        self.current_route = None
        self.driver_location = None
        self.connected_users: Dict[str, Dict[str, Any]] = {}
        self.driver_update_history: List[Dict[str, Any]] = []
        self.deviation_history: List[Dict[str, Any]] = []
        self.active_routes: Dict[str, Any] = {}

    def calculate_distance(self, point1: Dict[str, float], point2: Dict[str, float]) -> float:
        """Calculate distance between two geographic points using Haversine formula."""
        R = 6371e3  # Earth's radius in meters
        φ1 = math.radians(point1['lat'])
        φ2 = math.radians(point2['lat'])
        Δφ = math.radians(point2['lat'] - point1['lat'])
        Δλ = math.radians(point2['lng'] - point1['lng'])

        a = (math.sin(Δφ / 2) * math.sin(Δφ / 2) +
             math.cos(φ1) * math.cos(φ2) *
             math.sin(Δλ / 2) * math.sin(Δλ / 2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c


# Global state
state = StateManager()


@socketio.on('connect')
def handle_connect():
    """Handle new socket connection."""
    print(f"Client connected: {request.sid}")
    role = request.args.get('role', 'unknown')
    state.connected_users[request.sid] = {
        'role': role,
        'last_update': datetime.now(timezone.utc)
    }


@socketio.on('user-role')
def handle_user_role(data):
    """Handle user role assignment."""
    role = data.get('role', 'unknown')
    state.connected_users[request.sid] = {
        'role': role,
        'last_update': datetime.now(timezone.utc)
    }
    print(f"User {request.sid} registered as {role}")


@socketio.on('route-created')
def handle_route_creation(route_data):
    """Handle route creation event."""
    print(f"New route created: {route_data}")
    state.current_route = route_data
    state.active_routes[request.sid] = route_data
    emit('route-broadcast', route_data, broadcast=True)


@socketio.on('driver-location-update')
def handle_driver_location(data):
    """Handle driver location updates with route deviation detection."""
    user_info = state.connected_users.get(request.sid, {})

    if user_info.get('role') == 'driver':
        location_data = {
            **data,
            'last_update': datetime.now(timezone.utc).isoformat()
        }
        state.driver_location = location_data

        # Route deviation check
        if state.current_route:
            waypoints = state.current_route.get('waypoints', [])
            min_distance = float('inf')

            for waypoint in waypoints[:-1]:
                distance = state.calculate_distance(
                    {'lat': data['latitude'], 'lng': data['longitude']},
                    waypoint
                )
                min_distance = min(min_distance, distance)

            # Deviation detection
            if min_distance > 100:  # 100 meters threshold
                deviation_data = {
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    'driver_id': request.sid,
                    'location': {'lat': data['latitude'], 'lng': data['longitude']},
                    'distance': min_distance,
                    'message': f"Driver deviated {round(min_distance)}m from planned route"
                }

                state.deviation_history.append(deviation_data)
                emit('route-deviation', deviation_data, broadcast=True)

        # Broadcast location update
        emit('driver-location-update', state.driver_location, broadcast=True, include_self=False)
        state.driver_update_history.append(state.driver_location)


@socketio.on('route-saved')
def handle_route_save(route_data):
    """Handle route saving event."""
    print(f"Route saved: {route_data}")
    state.active_routes[request.sid] = route_data


@socketio.on('request-initial-state')
def handle_initial_state_request():
    """Send initial state to newly connected clients."""
    emit('initial-state', {
        'driver_location': state.driver_location,
        'current_route': state.current_route,
        'deviation_history': state.deviation_history
    })

    # Send active route if exists
    if state.current_route:
        route_broadcast = {
            'waypoints': state.current_route.get('waypoints', []),
            'metadata': {
                'start_location': state.current_route.get('startLocation'),
                'checkpoint': state.current_route.get('checkpoint'),
                'destination': state.current_route.get('destination'),
                'checkpoint_coords': state.current_route.get('checkpointCoords'),
                'destination_coords': state.current_route.get('destinationCoords'),
                'start_time': state.current_route.get('startTime')
            }
        }
        emit('route-broadcast', route_broadcast)


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    user_info = state.connected_users.get(request.sid, {})
    if user_info.get('role') == 'driver':
        state.driver_location = None
        emit('driver-disconnected', broadcast=True)

    state.connected_users.pop(request.sid, None)
    print(f"Client disconnected: {request.sid}")


# Diagnostic endpoint
@app.route("/status")
def get_server_status():
    """Diagnostic status endpoint."""
    return jsonify({
        "connected_users": list(state.connected_users.items()),
        "active_routes": list(state.active_routes.items()),
        "last_driver_update": state.driver_location,
        "deviation_history": state.deviation_history,
        "update_count": len(state.driver_update_history)
    })


# Store routes and driver locations
stored_routes: Dict[str, Any] = {}
driver_locations: Dict[str, Any] = {}


@app.route('/api/routes', methods=['POST'])
def save_route():
    """
    Save route from web app.
    Expects GeoJSON format with additional metadata.
    """
    try:
        route_data = request.json
        route_id = str(datetime.now().timestamp())  # Generate unique ID

        # Convert to GeoJSON format
        geojson_route = {
            "type": "Feature",
            "properties": {
                "route_id": route_id,
                "created_at": datetime.now().isoformat(),
                "metadata": {
                    "start_location": route_data.get("startLocation"),
                    "checkpoint": route_data.get("checkpoint"),
                    "destination": route_data.get("destination"),
                    "start_time": route_data.get("startTime")
                }
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [[point["lng"], point["lat"]] for point in route_data.get("waypoints", [])]
            }
        }

        stored_routes[route_id] = geojson_route
        return jsonify({
            "success": True,
            "route_id": route_id,
            "message": "Route saved successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


@app.route('/api/routes/<route_id>', methods=['GET'])
def get_route(route_id):
    """
    Get saved route for mobile app.
    Returns route in GeoJSON format.
    """
    try:
        if route_id in stored_routes:
            return jsonify(stored_routes[route_id]), 200
        return jsonify({
            "success": False,
            "error": "Route not found"
        }), 404

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


@app.route('/api/driver/location', methods=['POST'])
def update_driver_location():
    """
    Update driver location from mobile app.
    Expects: {
        "driver_id": "string",
        "latitude": float,
        "longitude": float,
        "heading": float,
        "speed": float,
        "timestamp": string
    }
    """
    try:
        location_data = request.json
        driver_id = location_data.get("driver_id")

        # Convert to GeoJSON format
        geojson_location = {
            "type": "Feature",
            "properties": {
                "driver_id": driver_id,
                "heading": location_data.get("heading"),
                "speed": location_data.get("speed"),
                "timestamp": datetime.now().isoformat()
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    location_data.get("longitude"),
                    location_data.get("latitude")
                ]
            }
        }

        driver_locations[driver_id] = geojson_location
        return jsonify({
            "success": True,
            "message": "Location updated successfully"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


@app.route('/api/driver/location/<driver_id>', methods=['GET'])
def get_driver_location(driver_id):
    """
    Get current driver location for web app.
    Returns location in GeoJSON format.
    """
    try:
        if driver_id in driver_locations:
            return jsonify(driver_locations[driver_id]), 200
        return jsonify({
            "success": False,
            "error": "Driver location not found"
        }), 404

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)