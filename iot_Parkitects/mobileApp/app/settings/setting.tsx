// UI Component base layout adapted from WithFrame library (Withfra.me, 2022)
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router'; // Routing via Expo Router (Expo Documentation, 2026)
import { useEffect } from 'react';
import * as Location from 'expo-location' // Accessing device location via Expo Location (Expo Documentation, 2026)
import { useFocusEffect } from '@react-navigation/native'; // React Navigation focus lifecycle hook (React Navigation, 2026)
import { useCallback } from 'react';
import { useLanguage } from '../../context/languageContext';
// importing our custom auth setup
import { auth } from '../../config/firebaseConfig';
import { signOut } from 'firebase/auth'; // Firebase authentication sign out function (Firebase, 2026)
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import RBSheet from 'react-native-raw-bottom-sheet';
import { ThemedText } from '@/components/themed-text'
import { useAccessibility } from '@/context/accessibilityContext';

//THE API BASE URL- TO BE CHANGED (same as tickets one-natasha)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const options = [
  { name: 'Terrible', icon: '😩' },
  { name: 'Bad', icon: '🙁' },
  { name: 'OK', icon: '😐' },
  { name: 'Good', icon: '🙂' },
  { name: 'Great', icon: '😃' },
];

const OPTION_SIZE = 52;

export default function SettingsScreen() {
  const [value, setValue] = useState(4);
  const sheet = useRef<any>(null);
  const languageSheet = useRef<any>(null);
  const router = useRouter(); // Initialize navigation controller (Expo Documentation, 2026)
  const { language, setLanguage, t } = useLanguage();
  const[locationDisplay, setLocationDisplay] = useState('');

  const [profileName, setProfileName] = useState('');
  const [profileUserNumber, setProfileUserNumber] = useState('');

  const { theme } = useAccessibility();

  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
  });

  // Updates application language state and closes selection modal (React Docs, 2026)
  const handleLanguageChange = async (newLanguage: 'en' | 'af' | 'xh') => {
  await setLanguage(newLanguage);
  languageSheet.current?.close();
};

// Fetches current user profile from backend database using RESTful fetch API (Fahim, 2026)
  const loadUserProfile = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return;
  }

  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/User/profile/${currentUser.uid}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user profile.');
    }

    const data = await response.json();

    setProfileName(data.name || 'User');
    setProfileUserNumber(data.userNumber || '');
  } catch (error) {
    console.error('Profile loading error:', error);
    Alert.alert(
      'Error',
      'Unable to load your account details.'
    );
  }
};

  // Automatically fetches and updates physical location when screen gains active focus (Kumaar, 2025)
  useFocusEffect( 
    useCallback(() => {
      const currentLocation = async () => {
        const currentUser = auth.currentUser;
        if(!currentUser) {
          return;
        }
          // Check for device location permission grant (Singh, 2024)
        const {status} = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          return; //does not reprompt the user- is be linked to the permissions screen 
        }
        

        try {
          //(Expo,2026)
          //gets the current position
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          // Convert geographic coordinates to human-readable address location (Singh, 2024)
          const geocode = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          const place = geocode[0];
          const locationLabel = place ? `${place.city ?? place.subregion ?? ''}, ${place.region ?? ''}`.trim() : null;

          if(locationLabel) {
            const existingPreference = await fetch (`${API_BASE_URL}/api/Preferences/user/${currentUser.uid}`);
            const existing = existingPreference.ok ? await existingPreference.json() : {};

            // Save user location preference via HTTP PUT request (Fahim, 2026)
            await fetch(`${API_BASE_URL}/api/Preferences/user/${currentUser.uid}`, {
              method: 'PUT',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({...existing, location: locationLabel, userID: currentUser.uid}),
            });

            setForm((prev) => ({ ...prev }))

            setLocationDisplay(locationLabel) //location gets stored locally, it refreshes when user goes to settings screen only not always syncing in the background
          }
        } catch (error) { }
      };
      currentLocation();
    }, [])
  );

  // Refresh user account profile each time settings screen opens (Kumaar, 2025)
  useFocusEffect(
  useCallback(() => {
    loadUserProfile();
  }, [])
);

    // Loads default user settings preferences on initial component render (Spencer, 2024)
    useEffect(() => {
        const fetchSettings = async () => {
            const currentUser = auth.currentUser // Identify authenticated user context (Firebase, 2026)
            if (!currentUser) {
                return;
            }

            try {

                const response = await fetch(`${API_BASE_URL}/api/Settings/user/${currentUser.uid}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch settings Screen');
                }

                const settings = await response.json();
                setForm({
                    emailNotifications: settings.emailNotification,
                    pushNotifications: settings.pushNotification,
                });
            } catch (error) {
                Alert.alert('Error', 'Error fetching your app settings preferences. Please try again.');
            }
        };
        fetchSettings();
    }, []);

    // Saves updated user notification preferences to backend server (Syed, 2023)
    const savePreferences = async (updated: Partial<typeof form>) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Merge existing setting state with updated values using object spread operator (Holeczek, 2023)
        const merged = { ...form, ...updated };
        setForm(merged);

        try {
            const existingPreferences = await fetch(`${API_BASE_URL}/api/Preferences/user/${currentUser.uid}`);
            const existing = existingPreferences.ok ? await existingPreferences.json() : {};

            // Send merged preferences payload to server endpoint (Fahim, 2026)
            await fetch(`${API_BASE_URL}/api/Settings/user/${currentUser.uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...existing, ...merged, userID: currentUser.uid }),
            });
        } catch (error) {
            Alert.alert('Errór', 'Failed to save your preferences.Please try again');
        }
    };

  const handleOpenSheet = () => {
    sheet.current?.open();
  };

  // Submits user experience feedback rating to API endpoint (Fahim, 2026)
    const handleCloseSheet = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                await fetch(`${API_BASE_URL}/api/Ratings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userID: currentUser.uid,
                        value,
                        label: options[value].name,
                    }),
                });
                sheet.current?.close();
                Alert.alert('Thank you!', 'Feedback submitted successfully.');
            } catch (error) {
                Alert.alert('Error','Failed to submit rating. Please try again');
            }
        } else{
    sheet.current?.close();
        }
  };

  // Handles user sign out via Firebase auth session termination and screen redirection (Firebase, 2026)
  const handleLogout = async () => {
  try {
    await signOut(auth);

    router.replace('/auth/sign_in' as any); // Redirect user to authentication screen (Expo Documentation, 2026)
  } catch (error) {
    console.error('Logout error:', error);

    Alert.alert(
      'Logout Failed',
      'Unable to log out. Please try again.'
    );
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => router.push('/(tabs)')}
        >
          <FeatherIcon color="#0F172A" name="arrow-left" size={22} />
        </TouchableOpacity>

        <ThemedText numberOfLines={1} style={styles.headerTitle}>
          Settings
        </ThemedText>

        <TouchableOpacity style={styles.headerAction}>
          <FeatherIcon color="#0F172A" name="more-vertical" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.headerSubtitle}>
          Manage your personal details and security preferences below.
        </ThemedText>

        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('account')}
          </ThemedText>
          <View style={styles.sectionBody}>
            <TouchableOpacity
              onPress={() => router.push('/settings/profie')}
              style={styles.profile}
              activeOpacity={0.7}
            >
              <View style={styles.profileBody}>
                <ThemedText style={styles.profileName}>
                    {profileName || 'Loading...'}
                  </ThemedText>

                  <ThemedText style={styles.profileHandle}>
                    {profileUserNumber || 'Loading...'}
                  </ThemedText>
              </View>
              <FeatherIcon color="#94A3B8" name="chevron-right" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* PREFERENCES SECTION */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('preferences')}
          </ThemedText>
          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => languageSheet.current?.open()}
              >
    <ThemedText style={styles.rowLabel}>
      {t('language')}
    </ThemedText>

    <View style={styles.rowSpacer} />

    <ThemedText style={styles.rowValue}>
      {language === 'en'
        ? 'English'
        : language === 'af'
        ? 'Afrikaans'
        : 'isiXhosa'}
    </ThemedText>

    <FeatherIcon
      color="#94A3B8"
      name="chevron-right"
      size={18}
    />
  </TouchableOpacity>
</View>

                        <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={() => router.push('/permissions')}
                style={styles.row}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.rowLabel}>Permissions</ThemedText>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#94A3B8" name="chevron-right" size={18} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity style={styles.row} activeOpacity={0.7}>
                <ThemedText style={styles.rowLabel}>Location</ThemedText>
                <View style={styles.rowSpacer} />
                <ThemedText style={styles.rowValue}>{locationDisplay || 'Port Elizabeth, SA'}</ThemedText>
                <FeatherIcon color="#94A3B8" name="chevron-right" size={18} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <ThemedText style={styles.rowLabel}>Email Notifications</ThemedText>
                              <View style={styles.rowSpacer} />
             {/* Notifications depends on savePreference method that user can change*/}
                <Switch
                  onValueChange={(emailNotifications) =>
                    savePreferences({emailNotifications })
                  }
                  trackColor={{ false: '#E2E8F0', true: '#0D5265' }}
                  value={form.emailNotifications}
                />
              </View>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <View style={styles.row}>
                <ThemedText style={styles.rowLabel}>Push Notifications</ThemedText>
                              <View style={styles.rowSpacer} />
           {/* Notifications depends on savePreference method that user can change*/}
                <Switch
                  onValueChange={(pushNotifications) =>
                    savePreferences({pushNotifications })
                  }
                  trackColor={{ false: '#E2E8F0', true: '#0D5265' }}
                  value={form.pushNotifications}
                />
              </View>
            </View>
          </View>
        </View>

        {/* RESOURCES SECTION */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Resources</ThemedText>
          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity
                onPress={() => router.push('/settings/accessability')}
                style={styles.row}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.rowLabel}>Accessibility</ThemedText>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#94A3B8" name="chevron-right" size={18} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={() => {
                  console.log('REPORT BUG PRESSED');
                  router.push('/settings/reportBug' as any);
                }}
                style={styles.row}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.rowLabel}>Report Bug</ThemedText>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#94A3B8" name="chevron-right" size={18} />
              </TouchableOpacity>
            </View>

            {/* RATE APP TRIGGER */}
            <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={handleOpenSheet}
                style={styles.row}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.rowLabel}>Rate Parkitech</ThemedText>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#94A3B8" name="chevron-right" size={18} />
              </TouchableOpacity>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <TouchableOpacity onPress={() => router.push('/settings/rules')}style={styles.row} activeOpacity={0.7}>
                <ThemedText style={styles.rowLabel}>Campus Parking Rules</ThemedText>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#94A3B8" name="chevron-right" size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
  style={styles.logoutBtn}
  activeOpacity={0.8}
  onPress={handleLogout}
>
  <ThemedText style={styles.logoutText}>Log Out</ThemedText>
</TouchableOpacity>
      </ScrollView>

      {/* BOTTOM SHEET */}
      <RBSheet
        ref={sheet}
        height={380}
        openDuration={250}
        customStyles={{
          container: styles.sheetContainer,
          wrapper: { backgroundColor: 'rgba(15, 23, 42, 0.4)' },
        }}
      >
        <View style={styles.sheetHeader}>
          <ThemedText style={styles.sheetHeaderTitle}>Rate Your Experience</ThemedText>
          <ThemedText style={styles.sheetHeaderSubtitle}>
            How is your experience using Parkitech?
          </ThemedText>
        </View>

        <View style={styles.sheetBody}>
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{options[value].name}</ThemedText>
          </View>

          <View style={styles.options}>
            {options.map((item, index) => {
              const isActive = value === index;
              return (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.option,
                    isActive && styles.optionActive,
                  ]}
                  onPress={() => setValue(index)}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.optionText}>{item.icon}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.btn}
            onPress={handleCloseSheet}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.btnText}>Submit Rating</ThemedText>
          </TouchableOpacity>
        </View>
      </RBSheet>
      <RBSheet
  ref={languageSheet}
  height={250}
  openDuration={250}
  customStyles={{
    container: styles.sheetContainer,
    wrapper: {
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
    },
  }}
>
  <View style={styles.sheetHeader}>
    <ThemedText style={styles.sheetHeaderTitle}>
      {t('selectLanguage')}
    </ThemedText>

    <ThemedText style={styles.sheetHeaderSubtitle}>
      {t('chooseLanguage')}
    </ThemedText>
  </View>

  <View style={{ padding: 24 }}>
    <TouchableOpacity
      style={styles.languageOption}
      onPress={() => handleLanguageChange('en')}
    >
      <ThemedText style={styles.languageOptionText}>
        English
      </ThemedText>

      {language === 'en' && (
        <FeatherIcon
          name="check"
          size={20}
          color="#0D5265"
        />
      )}
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.languageOption}
      onPress={() => handleLanguageChange('af')}
    >
      <ThemedText style={styles.languageOptionText}>
        Afrikaans
      </ThemedText>

      {language === 'af' && (
        <FeatherIcon
          name="check"
          size={20}
          color="#0D5265"
        />
      )}
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.languageOption}
      onPress={() => handleLanguageChange('xh')}
    >
      <ThemedText style={styles.languageOptionText}>
        isiXhosa
      </ThemedText>

      {language === 'xh' && (
        <FeatherIcon
          name="check"
          size={20}
          color="#0D5265"
        />
      )}
    </TouchableOpacity>
  </View>
</RBSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 50,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  section: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionBody: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },

  profile: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileBody: {
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileHandle: {
    fontSize: 14,
    color: '#94A3B8',
  },

  row: {
    height: 44,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 12,
  },
  rowWrapper: {
    paddingLeft: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
  rowFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  rowLabel: {
    fontSize: 16,
    letterSpacing: 0.24,
    color: '#000',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ababab',
    marginRight: 4,
  },
  rowLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  logoutBtn: {
    marginTop: 24,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },

  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  sheetHeader: {
    paddingTop: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sheetHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sheetHeaderSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  sheetBody: {
    padding: 24,
  },

  badge: {
    alignSelf: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D5265',
    textTransform: 'uppercase',
  },

  options: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 28,
  },
  option: {
    width: OPTION_SIZE,
    height: OPTION_SIZE,
    borderRadius: OPTION_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: {
    borderColor: '#0D5265',
    backgroundColor: '#E0F2FE',
  },
  optionText: {
    fontSize: 26,
  },

  btn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0D5265',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  languageOption: {
  height: 50,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#F1F5F9',
},

languageOptionText: {
  fontSize: 16,
  color: '#0F172A',
},
});
/*
*
* References
* 
* CoddyKit, 2026. Reading GPS Location with expo location. (Version 10.0) [Source Code] Available at: < https://www.coddykit.com/courses/learn_react_native/reading-gps-location-with-expo-location-10687394 > [Accessed 2 Septemeber 2026]
* Expo Documentation, 2026. Expo Location. (Version 10.0) [Source Code] Available at:< https://docs.expo.dev/versions/latest/sdk/location/ > [Accessed 2 September 2026]
* Fahim, M., 2026. Mastering the Fetch API with real-life javascript examples. (Version 2.0) [Source Code] Available at: < https://dev.to/mdfahim18/mastering-the-fetch-api-with-real-life-javascript-examples-eke > [Accessed 3 September 2026]
* Firebase, 2026. Manage Users in Firebase Authentication. [Documentation] Available at: < https://firebase.google.com/docs/auth/web/manage-users > [Accessed 2 September 2026]
* Holeczek, K., 2023. Mastering the spread operator ('...') in react.js. (Version 2.0) [Source Code] Available at: < https://coreui.io/blog/draft-how-to-replace-all-occurrences-of-a-string-in-javascript/ > [Accessed 3 September 2026] 
* Kumaar, A., 2025. When to use useEffect and UseFocusEffect in React or React Native: A deep dive. (Version 10.0) [Source Code] Available at: < https://blog.stackademic.com/when-to-use-useeffect-and-usefocuseffect-in-react-or-react-native-a-deep-dive-a02f8df7131c > [Accessed 2 September 2026]
* React Docs, 2026. Managing State. [Documentation] Available at: < https://react.dev/learn/managing-state > [Accessed 2 September 2026]
* React Navigation, 2026. useFocusEffect. [Documentation] Available at: < https://reactnavigation.org/docs/use-focus-effect/ > [Accessed 2 September 2026]
* Singh, A., 2024. Expo Location: How to get the location in adnroid and ios using reverse Geo location. (Version 10.0) [Source Code] Available at: < https://medium.com/@ashu6530/expo-location-how-to-get-the-location-in-android-and-ios-using-reverse-geo-location-5f40a3b19e3b > [Accessed 2 September 2026]
* Spencer,P., 2024. The Full stack (React & ASP.NET)- 12 - UseEffect.[video online] (Version 10.0) [Source Code] Available at: < https://youtu.be/tJxBtmg-92w?si=NYNfh-oL9nZO0EFb > [Accessed 30 August 2026]
* Syed, A.B., 2023. Using built-in utility types in typescript. (Version 2.0) [Source Code] Available at: < https://blog.logrocket.com/using-built-in-utility-types-typescript/ > [Accessed 4 September 2026]
* Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
*/