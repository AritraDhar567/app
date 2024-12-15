// npx react-native link react-native-vector-icons
// npm install socket.io-client react-native-vector-icons

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import io from 'socket.io-client';

// Create a context for socket management
const SocketContext = React.createContext(null);

// Socket Provider Component
const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [routeDeviations, setRouteDeviations] = useState([]);

  const initializeSocket = (url) => {
    const newSocket = io(url);
    setSocket(newSocket);
    return newSocket;
  };

  const value = {
    socket,
    initializeSocket,
    currentRoute,
    setCurrentRoute,
    routeDeviations,
    setRouteDeviations
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Method 1: Manual Location Input
const ManualLocationInput = () => {
  const { socket, currentRoute } = useSocket();
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [driverId, setDriverId] = useState('test-driver');

  const simulateLocationUpdate = () => {
    if (!socket || !currentRoute) {
      Alert.alert('Error', 'No active socket or route');
      return;
    }

    const manualLocation = {
      coords: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      timestamp: new Date().toISOString()
    };

    // Simulate sending location update
    socket.emit('driver-location-update', {
      driver_id: driverId,
      latitude: manualLocation.coords.latitude,
      longitude: manualLocation.coords.longitude,
      timestamp: manualLocation.timestamp
    });

    console.log('Manually Updated Location:', manualLocation);
    Alert.alert('Location Update', `Sent location: ${latitude}, ${longitude}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Manual Location Input</Text>
      <TextInput
        style={styles.input}
        placeholder="Driver ID"
        value={driverId}
        onChangeText={setDriverId}
      />
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />
      <Button 
        title="Update Location" 
        onPress={simulateLocationUpdate} 
      />
    </View>
  );
};

// Method 2: Predefined Deviation Scenarios
const DeviationScenarios = () => {
  const { socket, currentRoute } = useSocket();
  const [driverId, setDriverId] = useState('test-driver');

  const generateDeviationScenario = (type) => {
    if (!currentRoute || !currentRoute.waypoints || currentRoute.waypoints.length < 2) {
      Alert.alert('Error', 'No valid route found');
      return;
    }

    // Use first two waypoints as reference
    const startPoint = currentRoute.waypoints[0];
    const endPoint = currentRoute.waypoints[1];

    let deviatedLocation;
    let severity;
    let message;

    switch (type) {
      case 'slight':
        // Slightly off the route (50-100 meters)
        deviatedLocation = {
          latitude: startPoint.lat + 0.001,
          longitude: startPoint.lng + 0.001
        };
        severity = 'low';
        message = 'Slight deviation from planned route';
        break;
      case 'moderate':
        // Moderately off the route (200-500 meters)
        deviatedLocation = {
          latitude: startPoint.lat + 0.005,
          longitude: startPoint.lng + 0.005
        };
        severity = 'medium';
        message = 'Moderate deviation detected. Returning to route.';
        break;
      case 'extreme':
        // Extremely off the route (1-2 km)
        deviatedLocation = {
          latitude: startPoint.lat + 0.01,
          longitude: startPoint.lng + 0.01
        };
        severity = 'high';
        message = 'EXTREME ROUTE DEVIATION! Immediate action required.';
        break;
    }

    // Simulate location update
    socket.emit('driver-location-update', {
      driver_id: driverId,
      latitude: deviatedLocation.latitude,
      longitude: deviatedLocation.longitude,
      timestamp: new Date().toISOString()
    });

    console.log(`Simulated ${type} Deviation:`, deviatedLocation);
    Alert.alert(`${severity.toUpperCase()} Deviation`, message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Deviation Scenarios</Text>
      <TextInput
        style={styles.input}
        placeholder="Driver ID"
        value={driverId}
        onChangeText={setDriverId}
      />
      <View style={styles.buttonContainer}>
        <Button 
          title="Slight Deviation" 
          onPress={() => generateDeviationScenario('slight')} 
          color="#4CAF50"
        />
        <Button 
          title="Moderate Deviation" 
          onPress={() => generateDeviationScenario('moderate')} 
          color="#FFC107"
        />
        <Button 
          title="Extreme Deviation" 
          onPress={() => generateDeviationScenario('extreme')} 
          color="#F44336"
        />
      </View>
    </View>
  );
};

// Comprehensive Deviation Testing Component
const RouteDeviationTestingPanel = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const { routeDeviations } = useSocket();

  return (
    <View style={styles.mainContainer}>
      <Button 
        title="Open Deviation Testing" 
        onPress={() => setModalVisible(true)} 
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.title}>Route Deviation Testing</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <ManualLocationInput />
              <DeviationScenarios />
              
              {/* Deviation History */}
              <View style={styles.container}>
                <Text style={styles.sectionTitle}>Deviation History</Text>
                {routeDeviations.length === 0 ? (
                  <Text style={styles.emptyText}>No deviations recorded</Text>
                ) : (
                  routeDeviations.map((deviation, index) => (
                    <View key={index} style={styles.deviationHistoryItem}>
                      <Text style={styles.deviationText}>
                        Severity: {deviation.severity}
                      </Text>
                      <Text>
                        Distance: {deviation.distance.toFixed(2)} meters
                      </Text>
                      <Text style={styles.deviationMessage}>
                        {deviation.message}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  container: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  deviationHistoryItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  deviationText: {
    fontWeight: 'bold',
  },
  deviationMessage: {
    fontStyle: 'italic',
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
  }
});

export { SocketProvider, RouteDeviationTestingPanel, useSocket };


// import { SocketProvider } from './path/to/RouteDeviationTestingPanel';

// const App = () => {
//   return (
//     <SocketProvider>
//       {/* Your app components */}
//     </SocketProvider>
//   );
// }

