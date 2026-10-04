import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { push } from 'expo-router/build/global-state/routing';
import { router } from 'expo-router';

export default function Success() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFB' }}>
      <View style={styles.container}>
        <View style={styles.alert}>
          <View style={styles.alertIcon}>
            <FeatherIcon
              color="#fff"
              name="check-circle"
              size={42} />
          </View>

          <Text style={styles.alertTitle}>Thank You</Text>

          <Text style={styles.alertMessage}>
            Your ticket has been sent to security
            {'\n'}
            and will be reviewed as soon as possible
          </Text>

          <TouchableOpacity
            onPress={() => {
              // handle onPress
              router.push('/(tabs)')
            }}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>Continue</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  /** Alert */
  alert: {
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'stretch',
    
  },
  alertIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 114,
    backgroundColor: '#29c294',
  },
  alertTitle: {
    marginBottom: 16,
    fontSize: 32,
    fontWeight: '700',
    color: '#343e54',
    textAlign: 'center',
  },
  alertMessage: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#9a9a9a',
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: '#0c5464',
    borderColor: '#0a7b8f',
    marginTop:300,
  },
  btnText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: '#fff',
  },
});

/**
 * References
 * Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
 */