import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { BarcodeReader } from 'vision-camera-dynamsoft-barcode-reader';
import 'react-native-reanimated'; // Required for frame processing

export default function Authentic() {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cameraDevice, setCameraDevice] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const devices = useCameraDevices();
  const backDevice = devices.find(device => device.position === 'back');
  const frontDevice = devices.find(device => device.position === 'front');
  

   // Frame processor for barcode detection
   const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    BarcodeReader.scan(frame).then((barcodes) => {
      if (barcodes.length > 0) {
        console.log('Detected Barcodes:', barcodes);
        setScannedData(barcodes[0].text); // Set scanned QR code data
      }
    });
  }, []);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const result =
        Platform.OS === 'ios'
          ? await request(PERMISSIONS.IOS.CAMERA)
          : await request(PERMISSIONS.ANDROID.CAMERA);

      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        Alert.alert('Permission Denied', 'Camera permission is required.');
      }

      setLoading(false);
    };

    requestCameraPermission();
  }, []);

  useEffect(() => {
    // Log device information to see all the details
    console.log('Devices:', devices);
    if (backDevice) {
      console.log('Selected Back Camera:', backDevice);
      setCameraDevice(backDevice);
    } else if (frontDevice) {
      console.log('Selected Front Camera:', frontDevice);
      setCameraDevice(frontDevice);
    }
  }, [devices, backDevice, frontDevice]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Waiting for Camera Access...</Text>
      </View>
    );
  }

  if (!hasPermission || !cameraDevice) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Unable to Access Camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>


      <Text style={styles.title}>Camera Feed</Text>
      <Camera
        style={styles.camera}
        device={cameraDevice}
        isActive={true}
        photo={true}
        video={false}
        frameProcessor={frameProcessor} // Add frame processor for scanning
        frameProcessorFps={5} // Adjust FPS for frame processing
      />

<Text style={styles.title}>Scanned QR Data: {scannedData}</Text>

{scannedData && <Text style={styles.title}>Scanned QR Data: {scannedData}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
 
  title: {
    fontSize: 40,
    color: '#0a47f0',
    marginBottom: 30,
    zIndex:2,
  },
  camera: {
    width: '80%',
    height: '30%',
    position: 'absolute',
  },
});
