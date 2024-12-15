import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SideCON({ navigation, uniqueid, toggleMenu }) {
  return (
    <View style={styles.menuContainer}>
      
    

      <TouchableOpacity style={styles.menuItem} onPress={() => {
        navigation.navigate('Neareststore');
        toggleMenu();
      }}>
        <Text style={styles.menuText}>Shop from Nearest Store</Text>
      </TouchableOpacity>


      <TouchableOpacity style={styles.menuItem} onPress={() => {
        navigation.navigate('CONorders', { uniqueid });
        toggleMenu();
      }}>
        <Text style={styles.menuText}>My Orders</Text>
      </TouchableOpacity>

      
      <TouchableOpacity style={styles.menuItem} onPress={() => {
        navigation.navigate('Authentic', { uniqueid });
        toggleMenu();
      }}>
        <Text style={styles.menuText}>Verify Product Authenticity</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  menuItem: {
    marginVertical: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  menuText: {
    color: '#0a47f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
