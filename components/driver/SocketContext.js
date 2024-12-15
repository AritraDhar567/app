//You'll need to install socket.io-client: npm install socket.io-client
//Install Expo location module: npx expo install expo-location

import React, { createContext, useState, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [routeDeviations, setRouteDeviations] = useState([]);

  const initializeSocket = () => {
    // Increment connection attempts
    setConnectionAttempts(prev => prev + 1);

    const newSocket = io('http://192.168.0.162:8000', {
      query: { role: 'driver' },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionAttempts(0);
      console.log('Socket connected successfully');
    });

    newSocket.on('route-broadcast', (routeData) => {
      console.log('Received route:', routeData);
      setCurrentRoute(routeData);
    });

    newSocket.on('route-deviation', (deviationData) => {
      console.log('Detailed Route Deviation:', {
        timestamp: deviationData.timestamp,
        driverId: deviationData.driver_id,
        location: deviationData.location,
        deviationDetails: {
          distance: deviationData.distance,
          severity: deviationData.severity,
          message: deviationData.message
        }
      });
      
      // Add new deviation to state
      setRouteDeviations(prevDeviations => [...prevDeviations, deviationData]);

      // Show alert based on severity
      Alert.alert(
        `${deviationData.severity.toUpperCase()} Route Deviation`,
        deviationData.message,
        [{ 
          text: 'OK', 
          onPress: () => console.log('Deviation alert acknowledged') 
        }]
      );
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Socket disconnected:', reason);
    });

    setSocket(newSocket);
  };

  useEffect(() => {
    initializeSocket();

    return () => {
      socket?.disconnect();
    };
  }, []);

  const startLocationTracking = async (driverId, locationCallback) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Location permission not granted');
      throw new Error('Location permission not granted');
    }

    const trackLocation = async (location) => {
      try {
        const { latitude, longitude } = location.coords;

        // Call location callback if provided
        if (locationCallback) {
          locationCallback(location);
        }

        // Emit location update to server
        if (socket && isConnected) {
          socket.emit('driver-location-update', {
            driver_id: driverId,
            latitude,
            longitude,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error tracking location:', error);
      }
    };

    // Set up continuous tracking
    const locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10
      },
      trackLocation
    );

    return locationSubscription;
  };

  const clearRouteDeviations = () => {
    setRouteDeviations([]);
  };

  const retryConnection = () => {
    socket?.disconnect();
    initializeSocket();
  };

  return (
    <SocketContext.Provider value={{
      socket, 
      isConnected, 
      connectionAttempts,
      currentRoute, 
      routeDeviations,
      startLocationTracking,
      clearRouteDeviations,
      retryConnection
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;