//npm install @react-navigation/native


import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { SocketProvider, useSocket } from './SocketContext';
import { useNavigation } from '@react-navigation/native';

const LoginScreenContent = () => {
  const [driverId, setDriverId] = useState('');
  const { socket, isConnected } = useSocket();
  const navigation = useNavigation();

  const handleLogin = () => {
    if (!driverId) {
      Alert.alert('Error', 'Please enter Driver ID');
      return;
    }
  
    if (isConnected) {
      console.log('Driver ID:', driverId);  // Log driverId
      socket.emit('user-role', { role: 'driver', driver_id: driverId });
      navigation.navigate('RouteTracking', { driverId: driverId });
    } else {
      Alert.alert('Connection Error', 'Unable to connect to server');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Driver ID"
        value={driverId}
        onChangeText={setDriverId}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const LoginScreen = () => {
  return (
    <SocketProvider>
      <LoginScreenContent />
    </SocketProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default LoginScreen;