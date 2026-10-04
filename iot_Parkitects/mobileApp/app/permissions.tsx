//(Withfra.me, 2022)
import React, { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Switch,
  Alert,
  AppState,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from '@expo/vector-icons/Feather';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '@/config/firebaseConfig';
import {
  getBleManager,
  hasBlePermissions,
  isBluetoothOn,
  requestBlePermissions,
  tryEnableBluetooth,
} from '@/utils/ble';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Permissions() {
  const router = useRouter();
//  (kumar.2023)
  // Settings opens this screen with ?from=settings so it doesn't auto-skip
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromSettings = from === 'settings';

  const [perms, setPerms] = useState({
    bluetooth: false,
    location: false,
    ruleAlerts: true, // app-level choice only, no OS permission involved
  });

  // Reads the phone's real state. Never shows a dialog.
  const refresh = useCallback(async () => {
    const bluetooth = (await hasBlePermissions()) && (await isBluetoothOn());
    const location = (await Location.getForegroundPermissionsAsync()).status === 'granted';
    setPerms(p => ({ ...p, bluetooth, location }));
  }, []);

  // On open: read state, then skip the screen for returning users who are ready.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await refresh();

      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const confirmedBefore = await AsyncStorage.getItem(`permsConfirmed:${uid}`);
      const bluetoothReady = (await hasBlePermissions()) && (await isBluetoothOn());

      if (!cancelled && confirmedBefore && bluetoothReady && !fromSettings) {
        router.replace('/(tabs)');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh, router, fromSettings]);

  // Rule alerts is an app-level choice, so it can't be read from the phone. Load the saved
  // value; a first-time user has no row yet (non-OK response) and keeps the default.
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/Permissions/user/${uid}`);
        if (!res.ok) return;

        const saved = await res.json();
        if (typeof saved.ruleAlerts === 'boolean') {
          setPerms(p => ({ ...p, ruleAlerts: saved.ruleAlerts }));
        }
      } catch (error) {
        console.warn('Could not load saved permissions', error);
      }
    })();
  }, []);

  // Keep the switches honest when Bluetooth is toggled or the user returns from Settings.
  useEffect(() => {
    const bluetoothSub = getBleManager().onStateChange(() => {
      refresh();
    });
    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });

    return () => {
      bluetoothSub.remove();
      appStateSub.remove();
    };
  }, [refresh]);

  // An app cannot revoke an OS permission, so turning a switch OFF sends the user to Settings.
  const toggleBluetooth = async (on: boolean) => {
    if (!on) {
      Linking.openSettings();
      return;
    }

    const result = await requestBlePermissions();
    if (result === 'blocked') {
      Linking.openSettings();
      return;
    }
    if (result === 'granted' && !(await isBluetoothOn())) {
      const enabled = await tryEnableBluetooth();
      if (!enabled) Linking.openSettings(); // iOS, or the user declined
    }
    refresh();
  };

  const toggleLocation = async (on: boolean) => {
    if (!on) {
      Linking.openSettings();
      return;
    }

    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted' && !canAskAgain) Linking.openSettings();
    refresh();
  };

  const handleConfirm = async () => {
    // Bluetooth is required: it's how we confirm which bay you parked in.
    if (!perms.bluetooth && !fromSettings) {
      Alert.alert(
        'Turn on Bluetooth',
        'Parkitech uses Bluetooth to confirm which bay you parked in. Turn it on to continue.'
      );
      return;
    }

    const uid = auth.currentUser?.uid;

    // Saves what the phone granted plus the rule-alerts choice. Same URL style as the
    // Settings and Preferences endpoints: the controller turns the Firebase UID into
    // User.userID (Permissions.userID is an INT foreign key).
    if (uid) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/Permissions/user/${uid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bluetooth: perms.bluetooth,
            location: perms.location,
            ruleAlerts: perms.ruleAlerts,
          }),
        });
        if (!res.ok) console.warn('Could not save permissions, status', res.status);
      } catch (error) {
        console.warn('Could not save permissions', error);
      }

      // Marks this user as having seen the screen, whether or not the save worked
      await AsyncStorage.setItem(`permsConfirmed:${uid}`, '1');
    }

    if (fromSettings) {
      router.back(); // opened from Settings: return there
    } else {
      // replace, not push, so Back doesn't return to this screen
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFB' }}>
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              if (fromSettings) router.back();
              else router.push('/auth/sign_in');
            }}
            style={styles.headerAction}>
            <FeatherIcon color="#e2f1f3" name="arrow-left" size={24} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Permissions</Text>

        <Text style={styles.subtitle}>Stay on track with Parkitech</Text>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>

          <View style={styles.sectionItem}>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionName}>Bluetooth</Text>

              <Text style={styles.sectionDescription}>
                Required. Confirms which bay you parked in.
              </Text>
            </View>

            <Switch
              onValueChange={toggleBluetooth}
              trackColor={{ false: '#757575', true: '#107c84' }}
              value={perms.bluetooth}
            />
          </View>

          <Text style={styles.sectionFooter}>
            These permissions help us provide a better parking experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Settings (optional)</Text>

          <View style={styles.sectionItem}>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionName}>Location</Text>

              <Text style={styles.sectionDescription}>
                Guides you across the lot when you use Find My Car.
              </Text>
            </View>

            <Switch
              onValueChange={toggleLocation}
              trackColor={{ false: '#757575', true: '#107c84' }}
              value={perms.location}
            />
          </View>

          <View style={styles.sectionItem}>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionName}>Rule alerts</Text>

              <Text style={styles.sectionDescription}>Receive daily parking rules.</Text>
            </View>

            <Switch
              onValueChange={ruleAlerts => setPerms(p => ({ ...p, ruleAlerts }))}
              trackColor={{ false: '#757575', true: '#107c84' }}
              value={perms.ruleAlerts}
            />
          </View>

          <Text style={styles.sectionFooter}>
            You can always change these settings later in your profile
          </Text>
        </View>
      </ScrollView>

      <View style={styles.formFooter}>
        <TouchableOpacity onPress={handleConfirm}>
          <View style={styles.btn}>
            <Text style={styles.btnText}>Confirm</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#181818',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#889797',
  },
  formFooter: {
    marginTop: 12,
    marginBottom: 24,
    paddingHorizontal: 24,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    color: '#9fa5af',
    textAlign: 'center',
  },
  /** Header */
  header: {
    paddingHorizontal: 24,
    marginBottom: 28,
    marginTop: 28,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#146564',
    marginBottom: 16,
    marginTop: 16,
  },
  section: {
    paddingVertical: 0,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#889797',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.19,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  sectionInfo: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    marginRight: 16,
  },
  sectionName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: '#1d2a32',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#889797',
  },
  sectionFooter: {
    fontSize: 13,
    lineHeight: 18,
    color: '#889797',
    marginTop: 4,
  },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    backgroundColor: '#075d5f',
    borderColor: '#0868f8',
    marginBottom: 24,
  },
  btnText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
});

/**
 * References
 * Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
   kumar.2023. React Native Expo App: Gateway to Connect & Communicate BLE. [online] Spritle software. Available at: < https://www.spritle.com/blog/react-native-expo-app-gateway-to-connect-and-communicate-with-ble-devices/ > [Accessed 3 October 2026].
*/