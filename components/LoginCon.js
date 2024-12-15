import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Button,
  Alert
} from 'react-native';

export default function LoginCon({ navigation }) {
  
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [repeatPassword, setRepeatPassword] = React.useState('');
  const [userType, setUserType] = React.useState('Consumer');
  const [option, setOption] = React.useState(1); // 1 = Sign In, 2 = Sign Up, 3 = Forgot Password
  const translateYAnim = React.useRef(new Animated.Value(0)).current;
  const [message, setMessage] = React.useState('');
  const [uniqueid, setuniqueid] = React.useState('');

  React.useEffect(() => {
    let targetValue = 0;
    if (option === 2) targetValue = -29; // Sign-Up animation
    if (option === 3) targetValue = -65; // Forgot Password animation

    Animated.timing(translateYAnim, {
      toValue: targetValue,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [option]);

  const handleSignUp = async () => {
    if (password !== repeatPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const data = {
      username: username,
      password: password,
      user_type: userType,
    };

    try {
      const response = await fetch('http://192.168.29.101:5000/signup_app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.status === 201) {
        setMessage(result.message); // Success message
        Alert.alert('Success', result.message);
        navigation.navigate('HomeCon');
      } else {
        setMessage(result.error); // Error message
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };
  const handleSignIn = async () => {
    const data = {
      username: username,
      password: password,
    };
  
    try {
      const response = await fetch('http://192.168.29.101:5000/login_app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
  
      if (response.status === 200) {
        setMessage(result.message); // Success message
        // Alert.alert('Success', result.message);
        setuniqueid(result.unique_user_id); // Store unique user ID or handle further navigation
        navigation.navigate('HomeCon', { uniqueid: result.unique_user_id }); // Pass unique ID as parameter
      } else {
        setMessage(result.error); // Error message
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.View
          style={[styles.headerHeadings, { transform: [{ translateY: translateYAnim }] }]}
        >
          <Text style={styles.headerHeadingSpan}>Sign In As Consumer</Text>
          <Text style={styles.headerHeadingSpan}>Create an account</Text>
          <Text style={styles.headerHeadingSpan}>Forgot Password?</Text>
        </Animated.View>
      </View>

      {/* Options */}
      <View style={styles.options}>
        <TouchableOpacity onPress={() => setOption(1)}>
          <Text style={[styles.option, option === 1 && styles.activeOption]}>
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setOption(2)}>
          <Text style={[styles.option, option === 2 && styles.activeOption]}>
            Sign Up
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setOption(3)}>
          <Text style={[styles.option, option === 3 && styles.activeOption]}>
            Forgot
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.accountForm}>
        <View style={styles.formFields}>
          <TextInput
            style={styles.input}
            placeholder="Username or Number"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#0a47f0"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#0a47f0"
            value={password}
            onChangeText={setPassword}
          />
          {option === 2 && (
            <TextInput
              style={styles.input}
              placeholder="Repeat Password"
              secureTextEntry
              placeholderTextColor="#0a47f0"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={option === 1 ? handleSignIn : handleSignUp}
        >
          <Text style={styles.submitButtonText}>
            {option === 1
              ? 'Sign In'
              : option === 2
              ? 'Sign Up'
              : 'Reset Password'}
          </Text>
        </TouchableOpacity>

<TouchableOpacity style={styles.submitButton} onPress={() => navigation.navigate('Authentic', { uniqueid })}>
        <Text style={styles.optionText}>Verify Product Authenticity</Text>
      </TouchableOpacity>

      </View>
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
  header: {
    height: 25,
    width: 250,
    overflow: 'hidden',
    marginBottom: 60,
  },
  headerHeadings: {
    position: 'absolute',
    width: '100%',
  },
  headerHeadingSpan: {
    textAlign: 'center',
    color: '#0a47f0',
    fontSize: 18,
    marginVertical: 3,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width > 380 ? 350 : '100%',
    marginBottom: 20,
  },
  option: {
    fontSize: 16,
    color: '#0a47f0',
    opacity: 0.5,
  },
  activeOption: {
    opacity: 1,
    fontWeight: 'bold',
  },
  accountForm: {
    width: '80%',
  },
  formFields: {
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderColor: '#0a47f0',
    marginBottom: 10,
    padding: 15,
    fontSize: 16,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    color: '#0a47f0',
  },
  submitButton: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#00FF00',
    alignItems: 'center',
    marginTop: 15,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
