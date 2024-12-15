import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import SideCON from './SidemenuCON'; // Import the Menu component

export default function HomeCon({ route, navigation }) {
  const { uniqueid } = route.params;

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current; // Slide animation for the menu
  const iconRotate = useRef(new Animated.Value(0)).current; // To animate the rotation of the hamburger icon to form a cross

  const toggleMenu = () => {
    if (isMenuVisible) {
      // Hide menu
      Animated.timing(slideAnim, {
        toValue: -250, // Menu position off-screen
        duration: 300,
        useNativeDriver: true, // Use native driver for performance
      }).start(() => setIsMenuVisible(false));

      // Reset icon rotation
      Animated.timing(iconRotate, {
        toValue: 0, // Reset rotation to default (hamburger)
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Show menu
      setIsMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0, // Menu position on-screen
        duration: 300,
        useNativeDriver: true, // Use native driver for performance
      }).start();

      // Rotate icon to form cross
      Animated.timing(iconRotate, {
        toValue: 1, // Rotate icon to form a cross
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Interpolating the rotation value to create the cross effect
  const rotateIcon = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View style={styles.container}>
      {/* Side Menu with Animation */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            transform: [{ translateX: slideAnim }], // Ensure this is an animated value
          },
        ]}
      >
        <SideCON
          navigation={navigation}
          uniqueid={uniqueid}
          toggleMenu={toggleMenu}
        />
      </Animated.View>

      {/* Hamburger Icon positioned outside the animated menu */}
      <Animated.View
        style={[
          styles.menuButton,
          {
            transform: [{ rotate: rotateIcon }], // Apply rotation animation
          },
        ]}
      >
        <TouchableOpacity onPress={toggleMenu}>
          <Text style={styles.menuButtonText}>{ isMenuVisible ? ( <Text style={styles.menuButtonText}>X</Text>) : (<Text style={styles.menuButtonText}>☰</Text>)}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <Text style={styles.title}>Welcome Back, {uniqueid}!</Text>

    

      <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Neareststore')}>
        <Text style={styles.optionText}>Shop from Nearest Store</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('CONorders', { uniqueid })}>
        <Text style={styles.optionText}>My Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Authentic', { uniqueid })}>
        <Text style={styles.optionText}>Verify Product Authenticity</Text>
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
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#0a47f0',
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 5,
    elevation: 5,
  },
  menuButton: {
    position: 'absolute',
    top: 40, // Position it at the top of the screen
    right: 20, // Position it at the right edge of the screen
    // backgroundColor: '#0a47f0',
    padding: 10,
    borderRadius: 5,
    zIndex: 10, // Ensure it's above other content
  },
  menuButtonText: {
    color: '#0a47f0',
    fontSize: 24,
    fontWeight: 'bold',
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
