//(Withfra.me, 2022)
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { registerForPushNotificationsAsync } from '../../utils/pushNotifications';
import FeatherIcon from '@expo/vector-icons/Feather';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  InteractionManager,
  TextInput,
  Alert // pulling in alerts to show login errors (React Native, 2026)
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

// importing the login function from firebase
import {
  signInWithEmailAndPassword,
} from 'firebase/auth';
// importing our custom auth setup
import { auth } from '../../config/firebaseConfig';

export default function SignIn() {
  const router = useRouter();
  const [form, setForm] = useState({
    userNumber: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


 
  // this fires when the user presses the login button
  const handleLogin = async () => {
    if (!form.userNumber || !form.password) 
    {
      Alert.alert('Oops', 'Please fill in both your user number and password.');
      return;
    }

    setIsLoading(true);

    try 
    {
      // hits the .net backend to find the email associated with this user number
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/User/resolve-email/${form.userNumber}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) 
      {
        Alert.alert('Login Failed', 'User number not found.');
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      const resolvedEmail = data.email;

      // checks the found email and password against firebase (Firebase, 2026)
      await signInWithEmailAndPassword(auth, resolvedEmail, form.password);

       const uid = auth.currentUser?.uid;

       router.replace('/permissions' as any);

       if (uid) {
        InteractionManager.runAfterInteractions(() => {
          registerForPushNotificationsAsync(uid);
        });
       }
      
      if(auth.currentUser)
      {
        await registerForPushNotificationsAsync(auth.currentUser.uid); //push notification token given after user logs in
      }
      // if it passes, they are granted access to the app
      router.replace('/permissions' as any);
      
    } 
    catch (error: any) 
    {
      // wrong password or user number throws an alert
      Alert.alert('Login Failed', 'Invalid user number or password. Please try again.');
    } finally {
    setIsLoading(false); // Unlock button
  }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              alt="App Logo"
              resizeMode="contain"
              style={styles.headerImg}
              source={require('@/assets/images/parki-splash.png')}/>
          </View>
          <Text style={styles.title}>
            Sign in to <Text style={{ color: '#118091' }}>Parkitech</Text>
          </Text>

          <Text style={styles.subtitle}>
           Find your parking
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>User Number</Text>

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              keyboardType="email-address"
              onChangeText={userNumber => setForm({ ...form, userNumber })}
              placeholder="ST___________/LR___________"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={form.userNumber} />
          </View>

          <View style={styles.input}>
  <Text style={styles.inputLabel}>Password</Text>

  <View style={styles.passwordContainer}>
    <TextInput
      autoCorrect={false}
      clearButtonMode="while-editing"
      onChangeText={password => setForm({ ...form, password })}
      placeholder="********"
      placeholderTextColor="#6b7280"
      style={styles.passwordInput}
      secureTextEntry={!showPassword}
      value={form.password}
    />

    <TouchableOpacity
      onPressIn={() => setShowPassword(true)}
      onPressOut={() => setShowPassword(false)}
      style={styles.eyeButton}
    >
      <FeatherIcon
        name={showPassword ? 'eye' : 'eye-off'}
        size={22}
        color="#6b7280"
      />
    </TouchableOpacity>
  </View>
</View>

          <View style={styles.formAction}>
            <TouchableOpacity
            // routing through our new login function (Firebase, 2026)
              onPress={handleLogin}
              disabled={isLoading}
              >
              <View style={[styles.btn, isLoading && { opacity: 0.7 }]}>
                <Text style={styles.btnText}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/auth/forgot_password')}
            activeOpacity={0.7}
          >
            <Text style={styles.formLink}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => {
          // handle link
             router.push('/auth/sign_up');
        }}>
        <Text style={styles.formFooter}>
          Don't have an account?{' '}
          <Text style={{ textDecorationLine: 'underline', color: '#0c6064' }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    padding: 24,
    backgroundColor: Colors.light.background,

  },
  title: {
    fontSize: 31,
    fontWeight: '700',
    color: '#1D2A32',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
  },

  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 36,
  },
  headerImg: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    width: '60%',
    height: 200,
  
    marginLeft:10,
    borderRadius:30,
    overflow: 'hidden',
    
  },
  /** Form */
  form: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formAction: {
    marginTop: 4,
    marginBottom: 16,
  },
  formLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#09486e',
    textAlign: 'center',
  },
  formFooter: {
     marginBottom: 24,
    paddingVertical: 24,
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
 
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
  backgroundColor: '#0c4b64',
    borderColor: '#a8ddd4',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },

  passwordContainer: {
  height: 50,
  backgroundColor: '#fff',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#C9D3DB',
  flexDirection: 'row',
  alignItems: 'center',
},

passwordInput: {
  flex: 1,
  height: 50,
  paddingHorizontal: 16,
  fontSize: 15,
  fontWeight: '500',
  color: '#222',
},

eyeButton: {
  paddingHorizontal: 14,
  height: 50,
  alignItems: 'center',
  justifyContent: 'center',
},
});
/**
 * References
 * Firebase, 2026. Password Authentication. [source code]. Available: <https://firebase.google.com/docs/auth/web/password-auth> [Accessed 28 August 2026].
 * React Native, 2026. Alert. [source code]. Available: <https://reactnative.dev/docs/alert> [Accessed 28 August 2026].
 * Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
 */