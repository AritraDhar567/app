// npm install @react-navigation/native @react-navigation/native-stack
// npm install react-native-screens react-native-safe-area-context


import React from 'react';
import { View, Text, Button } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome</Text>
      <Button 
        title="Go to Login" 
        onPress={() => navigation.navigate('Login')} 
      />
    </View>
  );
};

export default HomeScreen;



// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import HomeScreen from './HomeScreen';
// import LoginScreen from './LoginScreen';

// const Stack = createNativeStackNavigator();

// function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Home">
//         <Stack.Screen 
//           name="Home" 
//           component={HomeScreen} 
//           options={{ title: 'Welcome' }}
//         />
//         <Stack.Screen 
//           name="Login" 
//           component={LoginScreen} 
//           options={{ title: 'Login' }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// export default App;