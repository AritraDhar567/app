import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

export default function LoginDrive() {
  const [option, setOption] = React.useState(1); // Option state for Sign In, Sign Up, Forgot
  const translateYAnim = React.useRef(new Animated.Value(0)).current;

  // Dropdown state
  const [open, setOpen] = React.useState(false); // For controlling the dropdown open state
  const [value, setValue] = React.useState(null); // For selected value
  const [items, setItems] = React.useState([
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ]);

  // Animation Effect
  React.useEffect(() => {
    let targetValue = 0;
    if (option === 2) targetValue = -29; // Sign-Up animation
    if (option === 3) targetValue = -65; // Forgot animation

    Animated.timing(translateYAnim, {
      toValue: targetValue,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [option]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.headerHeadings,
            { transform: [{ translateY: translateYAnim }] },
          ]}
        >
          <Text style={styles.headerHeadingSpan}>Sign In As Driver</Text>
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
            Sign up
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
          {/* Dropdown for Sign Up */}
          {option === 2 && (
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            placeholder="Tap to Select Manufacture Contact             ▽"
            searchable={true}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholderStyle={{ color: '#aaa' }}
            labelStyle={{ color: '#0a47f0' }} // Selected label text color
            listItemLabelStyle={{ color: '#0a47f0' }} // List items text color
            searchTextInputStyle={{ color: '#0a47f0', borderColor: '#0a47f0' }} // Search bar text color
            searchPlaceholderTextColor="#0a47f0" // Search bar placeholder text color
            searchPlaceholder="Search for Manufactures....."
            ListEmptyComponentStyle={{ color: '#0a47f0', textAlign: 'center', marginTop: 10 }} // No results text style
            ListEmptyComponent={() => (
              <Text style={{ color: '#0a47f0', textAlign: 'center', marginTop: 10 }}>
                No results found
              </Text>
            )}
          /> )}





          <TextInput style={styles.input} placeholder="Number" placeholderTextColor="#0a47f0" />
          {option === 2 && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#0a47f0"
              />

            </>
          )}
          {option !== 3 && (
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="#0a47f0"
            />
          )}
          {option === 2 && (
            <TextInput
              style={styles.input}
              placeholder="Repeat password"
              secureTextEntry
              placeholderTextColor="#0a47f0"
            />
          )}

        </View>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>
            {option === 1
              ? 'Sign in'
              : option === 2
                ? 'Sign up'
                : 'Reset password'}
          </Text>
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
  dropdown: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0a47f0',
    backgroundColor: '#FFFFFF',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0a47f0',
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


