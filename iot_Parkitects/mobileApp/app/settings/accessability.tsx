//(Withfra.me, 2022)
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useAccessibility } from '@/context/accessibilityContext';

// importing our custom auth setup
import { auth } from '../../config/firebaseConfig'
import {
  StyleSheet,
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { ThemedText } from '@/components/themed-text'

//THE API BASE URL- TO BE CHANGED (same as tickets one-natasha)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// export default function Example() {
//    const router = useRouter();
//   const [form, setForm] = useState({
//     customReminders: true,
//     motivationalMessages: true,
//     progressUpdates: true,
//     notifications: false,
//     microphone: false,
//   });

//(Cusick, 2025)
const textSizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

//(Schult, 2022)
export default function Example() {
    const router = useRouter();
    const {
    textSize, setTextSize,
    colorMode, setColorMode,
    reduceMotion, setReduceMotion,
    screenReader, setScreenReader,
    hapticFeedback, setHapticFeedback,
    theme,
    scale,
    loadFromServer,
    triggerHaptic,
    triggerScreenReader,
  } = useAccessibility();

    //(Spencer, 2024)
    useEffect(() => {
        const userAccessibility = async () => {
          //gets the current user that is logged on
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            try { //calling the backend API to save user preferences/changes
                const response = await fetch(`${API_BASE_URL}/api/Settings/user/${currentUser.uid}`);
                if (response.ok) {
                    loadFromServer(await response.json());
                }
            } catch (error) {
                Alert.alert('Error','Failed to load accessibility settings');
            }
        };

        userAccessibility();
    }, []);

    //linked the the save prefeences button the user clicks after they are done making changes
    const saveAccessibility = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            const existingRes = await fetch(`${API_BASE_URL}/api/Settings/user/${currentUser.uid}`);
            const existing = existingRes.ok ? await existingRes.json() : {};

            //(Fahim, 2026)
            await fetch(`${API_BASE_URL}/api/Settings/user/${currentUser.uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...existing, textSize, theme: colorMode, reduceMotion, screenReader, hapticFeedback, userID: currentUser.uid }),
            });
            triggerHaptic(); //activates the haptic feedback when the user saves it
            router.back(); //sends user back to the previous screen which is settings
        } catch (error) {
            Alert.alert('Please try again','Error occured while saving accessibility settings');
        }
    };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerAction}>
            <FeatherIcon color="#e2f1f3" name="arrow-left" size={24} />
          </TouchableOpacity>
        </View>

      <ThemedText type="title">Accessibility</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.muted }]}>
           Customize your app experience for better accessibility
        </ThemedText>
      </View>

      <ScrollView>
        {/* text size preview */}
          <ThemedText
              style={[
                styles.previewText,
                { color: theme.text }]}>
                      Preview Text Size
            </ThemedText>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.muted }]}>Text Size</ThemedText>
          <View style={styles.segmentRow}>
            {textSizes.map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => {
                  setTextSize(size);
                  triggerHaptic();
                  triggerScreenReader(`Text size set to ${size}`);
                }}
                style={[
                  styles.segmentBtn,
                  { borderColor: theme.muted },
                  textSize === size && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
              >
                <ThemedText
                  style={[
                    styles.segmentText,
                    { color: textSize === size ? '#fff' : theme.text },
                  ]}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* DISPLAY */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.muted }]}>Display</ThemedText>

          <View style={[styles.sectionItem, { backgroundColor: theme.surface, borderColor: theme.muted }]}>
            <View style={styles.sectionInfo}>
              <ThemedText style={[styles.sectionName, { color: theme.heading }]}>Colour Theme</ThemedText>
              <ThemedText style={[styles.sectionDescription, { color: theme.muted }]}>
                Switch between light and dark mode
              </ThemedText>
            </View>
            <Switch
              onValueChange={(isDark) => {
                setColorMode(isDark ? 'dark' : 'light');
                triggerHaptic();
                triggerScreenReader(isDark? 'Dark mode enabled' : 'Light mode enabled');
              }}
              trackColor={{ false: '#757575', true: theme.primary }}
              value={colorMode === 'dark'}
            />
          </View>

          <View style={[styles.sectionItem, { backgroundColor: theme.surface, borderColor: theme.muted }]}>
            <View style={styles.sectionInfo}>
              <ThemedText style={[styles.sectionName, { color: theme.heading }]}>Reduce Motion</ThemedText>
              <ThemedText style={[styles.sectionDescription, { color: theme.muted }]}>
                Minimize animations and transitions
              </ThemedText>
            </View>
            <Switch
              onValueChange={(v) => {
                setReduceMotion(v);
                triggerHaptic();
              }}
              trackColor={{ false: '#757575', true: theme.primary }}
              value={reduceMotion}
            />
          </View>
        </View>

        {/* ASSISTANCE */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.muted }]}>Features</ThemedText>

          <View style={[styles.sectionItem, { backgroundColor: theme.surface, borderColor: theme.muted }]}>
            <View style={styles.sectionInfo}>
              <ThemedText style={[styles.sectionName, { color: theme.heading }]}>Screen Reader</ThemedText>
              <ThemedText style={[styles.sectionDescription, { color: theme.muted }]}>
                Enable voice feedback for actions
              </ThemedText>
            </View>
            <Switch
              onValueChange={(v) => {
                setScreenReader(v);
                triggerHaptic();
                if(v) {
                  Speech.speak('Screen reader enabled.');
                }
              }}
              trackColor={{ false: '#757575', true: theme.primary }}
              value={screenReader}
            />
          </View>

          <View style={[styles.sectionItem, { backgroundColor: theme.surface, borderColor: theme.muted }]}>
            <View style={styles.sectionInfo}>
              <ThemedText style={[styles.sectionName, { color: theme.heading }]}>Haptic Feedback</ThemedText>
              <ThemedText style={[styles.sectionDescription, { color: theme.muted }]}>
                Vibrate on touch interactions
              </ThemedText>
            </View>
            <Switch
              onValueChange={(v) => setHapticFeedback(v)}
              trackColor={{ false: '#757575', true: theme.primary }}
              value={hapticFeedback}
            />
          </View>

        </View>
      </ScrollView>

      <View style={styles.formFooter}>
        <TouchableOpacity onPress={saveAccessibility}> 
          <View style={[styles.btn, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.btnText}>Save Preferences</ThemedText>
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
     marginBottom: 4 
    },
     
  subtitle: {
     fontSize: 15,
      lineHeight: 20,
       fontWeight: '500' 
      },

  formFooter: { 
    marginTop: 12,
     marginBottom: 24,
      paddingHorizontal: 24 
    },

  header: { 
    paddingHorizontal: 24,
     marginBottom: 28,
      marginTop: 28 
    },

  headerActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
     alignItems: 'center'
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
    paddingHorizontal: 24,
     marginBottom: 24 
    },

  sectionTitle: {
    fontSize: 13, 
    fontWeight: '600', 
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
     borderRadius: 12, 
     borderWidth: 2,
  },

  sectionInfo: { 
    flexGrow: 1, 
    flexShrink: 1, 
    flexBasis: 0,
     marginRight: 16 
    },
  
  sectionName: { 
    fontSize: 15, 
    lineHeight: 20,
     fontWeight: '600', 
     marginBottom: 4 
    },
 
  sectionDescription: { 
    fontSize: 13,
     lineHeight: 18
     },
  
  sectionFooter: { 
    fontSize: 13, 
    lineHeight: 18,
     marginTop: 4
     },
  
  segmentRow: { 
    flexDirection: 'row', 
    gap: 10
   },
  
  segmentBtn: {
    flex: 1, 
    paddingVertical: 12,
     borderRadius: 10, 
     borderWidth: 1.5,
    alignItems: 'center', 
    justifyContent: 'center',
  },

  segmentText: { 
    fontSize: 14, 
    fontWeight: '600'
   },

  btn: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderRadius: 8, 
    paddingVertical: 16, 
    paddingHorizontal: 24, 
    marginBottom: 24,
  },
  btnText: { 
    fontSize: 17, 
    lineHeight: 22,
     fontWeight: 'bold', 
     color: '#fff' 
    },

  previewText: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
});

/**
 * References
*  Cusick, J., 2025. Flexible typography in react. (Version 2.0) [Source Code] Available at: < https://joshcusick.substack.com/p/flexible-typography-in-react > [Accessed 4 September 2026]
*  Fahim, M., 2026. Mastering the Fetch API with real-life javascript examples. (Version 2.0) [Source Code] Available at: < https://dev.to/mdfahim18/mastering-the-fetch-api-with-real-life-javascript-examples-eke > [Accessed 3 September 2026]
*  Schult, J., 2022. Accessibility-Demo. (Version 2.0) [Source Code] Available at: < https://github.com/jonnyschult/accessibility-demo > [Accessed 3 September 2026]
 * Spencer,P., 2024. The Full stack (React & ASP.NET)- 12 - UseEffect.[video online] Available at: < https://youtu.be/tJxBtmg-92w?si=NYNfh-oL9nZO0EFb > [Accessed 30 August 2026]
 * Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
 */