//(Withfra.me, 2022)
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

import FeatherIcon from '@expo/vector-icons/Feather';
import { Colors } from '@/constants/theme';

// Firebase password reset
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        'Missing Email',
        'Please enter the email address associated with your account.'
      );
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());

      Alert.alert(
        'Reset Email Sent',
        'A password reset link has been sent to your email address. Please check your inbox and follow the instructions.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/sign_in'),
          },
        ]
      );
            } catch (error: any) {
        console.log('PASSWORD RESET ERROR CODE:', error?.code);
        console.log('PASSWORD RESET ERROR MESSAGE:', error?.message);
        console.log('FULL PASSWORD RESET ERROR:', error);

        Alert.alert(
            'Reset Failed',
            `${error?.code || 'Unknown error'}\n\n${error?.message || 'No error message'}`
        );
        } finally {
        setIsLoading(false);
        }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>

        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <FeatherIcon
            name="arrow-left"
            size={22}
            color="#0F172A"
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              alt="App Logo"
              resizeMode="contain"
              style={styles.headerImg}
              source={require('@/assets/images/parki-splash.png')}
            />
          </View>

          <Text style={styles.title}>
            Forgot your{' '}
            <Text style={{ color: '#118091' }}>password?</Text>
          </Text>

          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Email Address</Text>

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="Enter your email"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.formAction}>
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.btn,
                  isLoading && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.btnText}>
                  {isLoading
                    ? 'Sending...'
                    : 'Send Reset Link'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* RETURN TO LOGIN */}
          <TouchableOpacity
            onPress={() => router.replace('/auth/sign_in')}
            activeOpacity={0.7}
          >
            <Text style={styles.formLink}>
              Back to Sign in
            </Text>
          </TouchableOpacity>

        </View>
      </View>
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

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  backText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },

  logoContainer: {
    width: '45%',
    height: 150,
    marginLeft: 10,
    borderRadius: 30,
    overflow: 'hidden',
  },

  headerImg: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1D2A32',
    marginBottom: 10,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  form: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },

  input: {
    marginBottom: 20,
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
  },

  formAction: {
    marginTop: 4,
    marginBottom: 20,
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

  formLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#09486e',
    textAlign: 'center',
  },
});
