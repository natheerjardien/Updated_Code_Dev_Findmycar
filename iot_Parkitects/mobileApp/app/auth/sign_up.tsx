//(Withfra.me, 2022)
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { registerForPushNotificationsAsync } from '../../utils/pushNotifications';
import {
  StyleSheet,
  SafeAreaView,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert // importing Alert so we can pop up error messages easily (React Native, 2026)
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors } from '@/constants/theme';

// pulling in the specific firebase registration function
import { createUserWithEmailAndPassword } from 'firebase/auth';
// importing our custom auth setup
import { auth } from '../../config/firebaseConfig';

export default function SignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // loading state for the registration process
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    userRole: 'Student', // default role for new users
    userNumber: ''
  });

  const handleRegister = async () => {
    // checks that they dont submit blank forms
    if (!form.name ||!form.email || !form.password || !form.userNumber) {
      Alert.alert('Hold up!', 'Please enter your name, email, password and user number.');
      return;
    }

    setIsLoading(true);

    try {
      // Creates the secure account in Firebase
      // sends the email and password to firebase to create the account
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const firebaseUid = userCredential.user.uid; // Grab the secure ID
      
      // Syncs the profile data to our .NET SQL Database
      // Pulls the IP address from the local .env file (Expo, 2026)
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/User/sync`;

      const backendResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: firebaseUid,
          userNumber: form.userNumber,
          name: form.name,
          email: form.email,
          userRole: form.userRole
        })
      });

      if (!backendResponse.ok) 
      {
        const errorText = await backendResponse.text();
        await userCredential.user.delete(); // deletes the firebase account if the backend fails to sync
        throw new Error(`Server returned error: ${errorText}`);
      }
      
      await registerForPushNotificationsAsync(firebaseUid); //push notification token given after user registers
      Alert.alert('Success!', 'Your account has been created.');
      
      // takes them to the sign in page so they can log in
      router.push('/auth/sign_in');
    } 
    catch (error: any) 
    {
      // if firebase complains about a weak password or existing email, this tells the user
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, 
       backgroundColor: Colors.light.background,}}>
      <KeyboardAwareScrollView>
        <View style={styles.logoContainer}>
          <Image
            alt="My Shop logo"
            resizeMode="cover"
            source={require('@/assets/images/parki-splash.png')}
            style={styles.logoImg} />
        </View>
        <View style={styles.form}>
          <Text style={styles.title}>Create a new account</Text>

          <Text style={styles.subtitle}>
            Please put all of your information below to create a new account.
          </Text>

          <View style={styles.input}>
            <TextInput
              clearButtonMode="while-editing"
              onChangeText={name => setForm({ ...form, name })}
              placeholder="Full Name"
              placeholderTextColor="#A5A5AE"
              style={styles.inputControl}
              value={form.name} />
          </View>

          <View style={styles.input}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              keyboardType="email-address"
              onChangeText={email => setForm({ ...form, email })}
              placeholder="Email Address"
              placeholderTextColor="#A5A5AE"
              style={styles.inputControl}
              value={form.email} />
          </View>

          {/* custom radio button layout for role selection */}
          <View style={styles.radioContainer}>
            <TouchableOpacity 
              style={[styles.radioButton, form.userRole === 'Student' && styles.radioSelected]} 
              onPress={() => setForm({ ...form, userRole: 'Student' })}
            >
              <Text style={form.userRole === 'Student' ? styles.textSelected : styles.textUnselected}>Student</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.radioButton, form.userRole === 'Lecturer' && styles.radioSelected]} 
              onPress={() => setForm({ ...form, userRole: 'Lecturer' })}
            >
              <Text style={form.userRole === 'Lecturer' ? styles.textSelected : styles.textUnselected}>Lecturer</Text>
            </TouchableOpacity>
          </View>

          {/* dynamic input that changes based on the selected radio button */}
          <View style={styles.input}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={userNumber => setForm({ ...form, userNumber })}
              placeholder={form.userRole === 'Student' ? "Student Number" : "Lecturer / Staff ID"}
              placeholderTextColor="#A5A5AE"
              style={styles.inputControl}
              value={form.userNumber} />
          </View>

          <View style={styles.input}>
  <View style={styles.passwordContainer}>
    <TextInput
      autoCorrect={false}
      clearButtonMode="while-editing"
      onChangeText={password => setForm({ ...form, password })}
      placeholder="Password"
      placeholderTextColor="#A5A5AE"
      secureTextEntry={!showPassword}
      style={styles.passwordInput}
      value={form.password}
    />

    <TouchableOpacity
      onPressIn={() => setShowPassword(true)}
      onPressOut={() => setShowPassword(false)}
      style={styles.eyeButton}
    >
      <MaterialCommunityIcons
        name={showPassword ? 'eye' : 'eye-off'}
        size={22}
        color="#6b7280"
      />
    </TouchableOpacity>
  </View>
</View>

          <TouchableOpacity
          // routing through our new signup function (Firebase, 2026)
            onPress={handleRegister}
            disabled={isLoading} // disbaled when loading to prevent multiple submissions
            >
            <View style={[styles.btn, isLoading && { opacity: 0.7 }]}>
              <Text style={styles.btnText}>
                {isLoading ? 'Creating Account...' : 'Sign up now'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              router.push('/auth/sign_in');
            }}>
            <Text style={styles.formFooter}>
              Already have an account?
              <Text style={{ color: '#0c6064' }}> Log in</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.formSpacer}>
            <Text style={styles.formSpacerText}>Or Sign up with</Text>

            <View style={styles.formSpacerDivider} />
          </View>

          <View style={styles.btnGroup}>
           
            <TouchableOpacity
              onPress={() => {
                // handle onPress
              }}
              style={{ flex: 1, paddingHorizontal: 6 }}>
              <View style={styles.btnGoogle}>
                <MaterialCommunityIcons
                  color="#fff"
                  name="google"
                  size={18}
                  style={{ marginRight: 12 }} />

                <Text style={styles.btnGoogleText}>Google</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    width: '60%',
    height: 200,
    marginTop:40,
    marginLeft:80,
    borderRadius:30,
    overflow: 'hidden',
    
  },
  logoImg: {
    width: '100%',
     height: '100%',
    
   
    
  },
  title: {
    fontSize: 29,
    fontWeight: '700',
    color: '#242424',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#989898',
    marginBottom: 16,
    textAlign: 'center',
  },
  /** Form */
  form: {
    paddingHorizontal: 24,
  },
  formFooter: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '500',
    color: '#454545',
    textAlign: 'center',
   
  },
  formSpacer: {
    marginTop: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSpacerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#454545',
    lineHeight: 20,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    zIndex: 9,
  },
  formSpacerDivider: {
    borderBottomWidth: 2,
    borderColor: '#eff1f5',
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
  },
  /** Input */
  input: {
    marginBottom: 12,
  },
  inputControl: {
    height: 44,
    backgroundColor: '#EFF1F5',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  /** Radio Buttons */
  radioContainer: 
  { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  radioButton: 
  { 
    flex: 0.48, 
    paddingVertical: 10, 
    borderWidth: 1, 
    borderColor: '#C9D3DB', 
    borderRadius: 12, 
    alignItems: 'center', 
    backgroundColor: '#EFF1F5' 
  },
  radioSelected: 
  { 
    backgroundColor: '#0c4b64', 
    borderColor: '#0c4b64' 
  },
  textSelected: 
  { 
    color: '#fff', 
    fontWeight: '600' 
  },
  textUnselected: 
  { 
    color: '#A5A5AE', 
    fontWeight: '500'
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#0c4b64',
    borderColor: '#a8ddd4',
    marginTop: 24,
  },
  btnText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginHorizontal: -6,
  },
 
  
  btnGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#0c6064',
    borderColor: '#a8ddd4',
  },
  btnGoogleText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },

  passwordContainer: {
  height: 44,
  backgroundColor: '#EFF1F5',
  borderRadius: 12,
  flexDirection: 'row',
  alignItems: 'center',
},

passwordInput: {
  flex: 1,
  height: 44,
  paddingHorizontal: 16,
  fontSize: 15,
  fontWeight: '500',
  color: '#222',
},

eyeButton: {
  height: 44,
  paddingHorizontal: 14,
  alignItems: 'center',
  justifyContent: 'center',
},

});
/**
 * References
 * Expo, 2026. Environment variables in Expo. [online] Available at: <https://docs.expo.dev/guides/environment-variables/> [Accessed 30 August 2026].
 * Firebase, 2026. Password Authentication. [source code]. Available: <https://firebase.google.com/docs/auth/web/password-auth> [Accessed 28 August 2026].
 * React Native, 2026. Alert. [source code]. Available: <https://reactnative.dev/docs/alert> [Accessed 28 August 2026].
 * Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
 */