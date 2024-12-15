// npm install react-native-maps 
// npm install react-native-vector-icons
// npm install react-native-linear-gradient
// npm install @react-native-community/blur
// npm install react-native-gesture-handler
// npm install react-native-reanimated



import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import SocketContext from './SocketContext'; // Adjust import path as needed
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring
} from 'react-native-reanimated';
import BlurView from '@react-native-community/blur';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#4A6CF7',
  secondary: '#6E7DFF',
  background: {
    light: '#F7F9FF',
    dark: '#EEF1F9'
  },
  text: {
    dark: '#1E2A78',
    medium: '#4A5568',
    light: '#718096'
  },
  accent: {
    warning: '#FF6B6B',
    success: '#16A34A',
    info: '#3B82F6'
  }
};

const ConnectionStatusIndicator = ({ isConnected, connectionAttempts, retryConnection }) => {
  return (
    <BlurView
      style={styles.connectionStatusBlur}
      blurType="light"
      blurAmount={10}
    >
      <TouchableOpacity 
        style={[
          styles.connectionStatus, 
          { 
            backgroundColor: isConnected 
              ? 'rgba(76, 175, 80, 0.2)' 
              : 'rgba(255, 87, 34, 0.2)',
          }
        ]}
        onPress={retryConnection}
        disabled={isConnected}
      >
        <Icon 
          name={isConnected ? "wifi" : "wifi-off"} 
          size={18} 
          color={isConnected ? COLORS.accent.success : COLORS.accent.warning} 
          style={styles.icon}
        />
        <Text style={[
          styles.connectionStatusText, 
          { color: isConnected ? COLORS.accent.success : COLORS.accent.warning }
        ]}>
          {isConnected ? 'Connected' : `Disconnected (${connectionAttempts} attempts)`}
        </Text>
      </TouchableOpacity>
    </BlurView>
  );
};

const TrackingScreen = () => {
  const route = useRoute();
  const [driverId, setDriverId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showDeviations, setShowDeviations] = useState(false);

  // Info container slide animation
  const translateY = useSharedValue(0);
  const infoContainerHeight = height * 0.5;
  const MAX_INFO_CONTAINER_HEIGHT = height * 0.39;

  const {
    socket,
    isConnected,
    connectionAttempts,
    currentRoute,
    routeDeviations,
    startLocationTracking,
    clearRouteDeviations,
    retryConnection
  } = React.useContext(SocketContext);

  const extractDriverId = useMemo(() => {
    return route.params?.driverId;
  }, [route.params]);

  // Gesture handler for sliding info container
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      const newTranslateY = context.startY + event.translationY;
      translateY.value = Math.max(-MAX_INFO_CONTAINER_HEIGHT, Math.min(0, newTranslateY));
    },
    onEnd: (event) => {
      if (event.translationY < -50) {
        // Slide up (hide)
        translateY.value = withSpring(-MAX_INFO_CONTAINER_HEIGHT);
      } else if (event.translationY > 50) {
        // Slide down (show)
        translateY.value = withSpring(0);
      } else {
        // Return to previous position
        translateY.value = withSpring(translateY.value);
      }
    }
  });

  const animatedInfoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    };
  });

  useEffect(() => {
    if (extractDriverId) {
      setDriverId(extractDriverId);
      setLoading(false);
    } else {
      setLoading(false);
      Alert.alert('Error', 'Driver ID is not defined.');
    }
  }, [extractDriverId]);

  useEffect(() => {
    const initTracking = async () => {
      try {
        if (driverId) {
          const subscription = await startLocationTracking(driverId, (location) =>
            setCurrentLocation(location)
          );
          setLocationSubscription(subscription);
        } else {
          Alert.alert('Error', 'Driver ID is missing');
        }
      } catch (error) {
        Alert.alert('Tracking Error', 'Could not start location tracking');
      }
    };

    if (driverId) {
      initTracking();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [driverId, startLocationTracking]);

  const renderRouteOnMap = () => {
    if (!currentRoute?.waypoints || currentRoute.waypoints.length < 2) return null;

    const routeCoordinates = currentRoute.waypoints.map((wp) => ({
      latitude: wp.lat,
      longitude: wp.lng,
    }));

    return (
      <>
        <Polyline 
          coordinates={routeCoordinates} 
          strokeWidth={4} 
          strokeColor="blue" 
        />
        {renderRouteMarkers()}
      </>
    );
  };

  const renderRouteMarkers = () => {
    if (!currentRoute?.waypoints) return null;
  
    return currentRoute.waypoints.map((wp, index) => (
      <Marker
        key={index}
        coordinate={{
          latitude: wp.lat,
          longitude: wp.lng,
        }}
        title={
          index === 0
            ? 'Start Location'
            : index === 1
            ? 'Wholesaler Location'
            : index === currentRoute.waypoints.length - 1
            ? 'Retailer Location'
            : `Waypoint ${index}`
        }
        pinColor={
          index === 0
            ? 'red'
            : index === 1
            ? 'red'
            : index === currentRoute.waypoints.length - 1
            ? 'red'
            : 'red'
        }
      />
    ));
  };
  
  const renderDriverMarker = () => {
    if (!currentLocation) return null;

    return (
      <Marker
        coordinate={{
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        }}
        title="Driver Location"
        description="Current driver position"
      >
        <View style={styles.driverMarker}>
          <Image
            source={require('./assets/NHC.png')} // Adjust path as needed
            style={styles.markerImage}
          />
        </View>
      </Marker>
    );
  };

  const renderDeviationModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDeviations}
        onRequestClose={() => {
          setShowDeviations(false);
          clearRouteDeviations();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deviationModalContent}>
            <Text style={styles.deviationModalTitle}>Route Deviations</Text>
            <ScrollView style={styles.scrollContainer}>
              {routeDeviations.map((deviation, index) => (
                <View key={index} style={styles.deviationItem}>
                  <Text style={styles.deviationText}>
                    {deviation.message}
                  </Text>
                  <Text style={styles.deviationSubtext}>
                    Distance: {deviation.distance.toFixed(2)} meters
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeDeviationButton}
              onPress={() => {
                setShowDeviations(false);
                clearRouteDeviations();
              }}
            >
              <Text style={styles.closeDeviationButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <LinearGradient 
        colors={['#f5f5f5', '#e0e0e0']} 
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>Loading Tracking...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={
          currentLocation
            ? {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : undefined
        }
      >
        {renderRouteOnMap()}
        {renderDriverMarker()}
      </MapView>

      {renderDeviationModal()}
      <ConnectionStatusIndicator 
        isConnected={isConnected} 
        connectionAttempts={connectionAttempts}
        retryConnection={retryConnection}
      />
      
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View 
          style={[
            styles.infoContainer, 
            animatedInfoStyle,
            { height: infoContainerHeight }
          ]}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.headerGradient}
          >
            <View style={styles.infoHeader}>
              <Text style={styles.headerText}>Route Overview</Text>
              {routeDeviations.length > 0 && (
                <TouchableOpacity 
                  style={styles.deviationAlertButton}
                  onPress={() => setShowDeviations(true)}
                >
                  <Icon 
                    name="warning" 
                    size={20} 
                    color={COLORS.accent.warning} 
                  />
                  <Text style={styles.deviationAlertText}>
                    {routeDeviations.length} Deviations
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.detailsSection}>
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <Ionicons 
                    name="person" 
                    size={20} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.labelText}>Driver ID</Text>
                  <Text style={styles.valueText}>{driverId}</Text>
                </View>

                {currentRoute?.metadata && (
                  <>
                    <View style={styles.detailRow}>
                      <Ionicons 
                        name="location" 
                        size={20} 
                        color={COLORS.primary} 
                      />
                      <View style={styles.textContainer}>
                        <Text style={styles.labelText}>Start Location</Text>
                        <Text style={styles.valueText}>{currentRoute.metadata.startLocation}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons 
                        name="flag" 
                        size={20} 
                        color={COLORS.primary} 
                      />
                      <View style={styles.textContainer}>
                        <Text style={styles.labelText}>Wholesaler Location </Text>
                        <Text style={styles.valueText}>{currentRoute.metadata.checkpoint}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons 
                        name="flag" 
                        size={20} 
                        color={COLORS.primary} 
                      />
                      <View style={styles.textContainer}>
                        <Text style={styles.labelText}>Retailer Location</Text>
                        <Text style={styles.valueText}>{currentRoute.metadata.destination}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.light,
      },
      map: {
        flex: 1,
        width: width,
        height: height,
      },
      infoContainer: {
        position: 'absolute',
        bottom: -320,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: '#000',
        shadowOffset: { 
          width: 0, 
          height: -5
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 15,
      },
      modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
      deviationModalContent: {
        width: width * 0.9,
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 20,
        maxHeight: height * 0.7,
        shadowColor: '#000',
        shadowOffset: { 
          width: 0, 
          height: 2 
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
     connectionStatusBlur: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        borderRadius: 20,
        overflow: 'hidden',
      },
      connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 20,
      },
      connectionStatusText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
      },
      scrollContent: {
        paddingBottom: 20,
      },
    headerGradient: {
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingVertical: 15,
        paddingHorizontal: 20,
      },
      infoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      headerText: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
      },
      deviationAlertButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
      },
      deviationAlertText: {
        color:'red',
        marginLeft: 5,
        fontWeight: '600',
        fontSize: 14,
      },
      detailsSection: {
        paddingHorizontal: 20,
        marginTop: 15,
      },
      detailCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
      },
      detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
      },
      labelText: {
        fontSize: 16,
        color: COLORS.text.medium,
        marginLeft: 10,
        flex: 1,
      },
      valueText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.dark,
        textAlign: 'center', // Center the text horizontally
        marginLeft: 10,
        marginTop:10, // Add left margin
      }
      
      ,
      markerImage: {
        width: 40,
        height: 55,
        resizeMode: 'contain',
      },
      driverMarker: {
        backgroundColor: COLORS.primary,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { 
          width: 0, 
          height: 2 
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.secondary + '20',
        padding: 12,
        margin: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: COLORS.secondary + '50',
      },
      connectionStatusText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
      },
      deviationModal: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        maxHeight: height * 0.8,
        shadowColor: '#000',
        shadowOffset: { 
          width: 0, 
          height: -5 
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 15,
      },
      deviationModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text.dark,
        marginBottom: 15,
        textAlign: 'center',
      },
      deviationItem: {
        backgroundColor: COLORS.background,
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { 
          width: 0, 
          height: 2 
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
      },
      deviationText: {
        fontSize: 16,
        color: COLORS.text.dark,
        marginBottom: 5,
      },
      deviationSubtext: {
        fontSize: 14,
        color: COLORS.text.medium,
        fontStyle: 'italic',
      },
      closeDeviationButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { 
          width: 0, 
          height: 4 
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
      },
      closeDeviationButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
      },
});

export default TrackingScreen;