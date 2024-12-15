import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export default function NearestStore({ navigation }) {
  const [Stores, setStores] = useState([]);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: '5km', value: '5' },
    { label: '10km', value: '10' },
    { label: '15km', value: '15' },
  ]);
  const watchIdRef = useRef(null);

  const sendLocation = async () => {
    const data = {
      radius: value,
      lat: location.latitude,
      lon: location.longitude,
    };

    try {
      const response = await fetch('http://192.168.29.101:5000/get_retailers_within_radius', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.status === 200) {
        // Alert.alert('Success', 'Stores fetched successfully!');

        // Convert object to array for custom visualization
        const storesArray = Object.keys(result).map((key) => ({
          name: key,
          ...result[key],
        }));
        setStores(storesArray);
      } else {
        Alert.alert('Error', result.error || 'Failed to fetch stores.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const requestLocationPermission = async () => {
    try {
      let permission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

      const result = await check(permission);

      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        return requestResult === RESULTS.GRANTED;
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert('Permission Blocked', 'Enable location permission from settings.');
        return false;
      }
    } catch (error) {
      console.error('Permission Error:', error);
      return false;
    }
  };

  const startWatching = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    watchIdRef.current = Geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => Alert.alert('Error', error.message),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 10000,
        fastestInterval: 5000,
      }
    );
  };

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      Alert.alert('Stopped Watching', 'Location updates have been stopped.');
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearest Store</Text>

      <DropDownPicker
        open={open}
        value={value}
        items={items}
        onChangeValue={(val) => {
          setValue(val);
          sendLocation();
        }}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder="Select Distance"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        placeholderStyle={{ color: '#0a47f0' }}
        labelStyle={{ color: '#0a47f0' }}
      />

      <Text>Latitude: {location.latitude}</Text>
      <Text>Longitude: {location.longitude}</Text>

      <View style={styles.buttonsContainer}>
        <Button title="Start Watching Location" onPress={startWatching} />
        <View style={styles.spacing} />
        <Button title="Stop Watching Location" onPress={stopWatching} />
      </View>

      <ScrollView contentContainerStyle={styles.storeList}>
        {Stores.length === 0 ? (
          <Text style={styles.noStores}>No Nearby Stores</Text>
        ) : (
          Stores.map((store, index) => (
            <View key={index} style={styles.storeItem}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.storeDetails}>
                Distance: {store.distance_km} km
              </Text>
              {/* <Text style={styles.storeDetails}>
                Latitude: {store.latitude}, Longitude: {store.longitude}
              </Text> */}
            </View>
          ))
        )}
      </ScrollView>
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
  dropdown: {
    width: '80%',
    marginBottom: 20,
  },
  dropdownContainer: {
    width: '80%',
  },
  buttonsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  spacing: {
    height: 10,
  },
  noStores: {
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
  storeList: {
    marginTop: 20,
    alignItems: 'center',
  },
  storeItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '90%',
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  storeDetails: {
    fontSize: 14,
    color: '#666',
  },
});
