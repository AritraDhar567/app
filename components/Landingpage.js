import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function LandingPage({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate('LoginDrive')}
      >
        <Text style={styles.optionText}>Login as Driver</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate('LoginCon')}
      >
        <Text style={styles.optionText}>Login as Consumer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    color: '#0a47f0',
    marginBottom: 30,
  },
  optionButton: {
    padding: 15,
    marginVertical: 10,
    borderColor: '#00f500',
    backgroundColor: '#0a47f0',
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  optionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
