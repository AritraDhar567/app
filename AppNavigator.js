import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingPage from './components/Landingpage'; // Assuming App.tsx is LandingPage
import HomeCon from './components/consumer/homecon';
import LoginDrive from './components/LoginDrive';
import LoginCon from './components/LoginCon';

import Neareststore from './components/consumer/NearestStore/NearestStore';
 import CONorders from './components/consumer/Consumerorders/CONorders';
import Authentic from './components/consumer/Authenticity/authentic';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LandingPage" component={LandingPage} />
      <Stack.Screen name="LoginCon" component={LoginCon} />
      <Stack.Screen name="LoginDrive" component={LoginDrive} />
      <Stack.Screen name="HomeCon" component={HomeCon} />
    
      <Stack.Screen name="Neareststore" component={Neareststore} />
      <Stack.Screen name="CONorders" component={CONorders}/>
      <Stack.Screen name="Authentic" component={Authentic}/>
    
    </Stack.Navigator>
  );
}
