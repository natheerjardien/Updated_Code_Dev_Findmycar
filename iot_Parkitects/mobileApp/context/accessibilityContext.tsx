import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/theme';
import * as Speech from 'expo-speech';

//(Cusick, 2025)
//declaring the types of color and size options the user has
type TextSize = 'small' | 'medium' | 'large';
type ColorMode = 'light' | 'dark';

//(Mimo, 2026)
//text views are giving size already
const scaleMap: Record<TextSize, number> = {
  small: 0.9,
  medium: 1,
  large: 1.25,
};

//(Schult, 2022)
//interface decalres all the accessibility options they will have to be saved to the DB
interface AccessibilityState {
  textSize: TextSize;
  colorMode: ColorMode;
  reduceMotion: boolean;
  screenReader: boolean;
  hapticFeedback: boolean;
}

//(Schult, 2022)
interface AccessibilityContextValue extends AccessibilityState {
  scale: number;
  theme: typeof Colors.light;
  osReduceMotionEnabled: boolean;
  osScreenReaderEnabled: boolean;
  setTextSize: (v: TextSize) => void;
  setColorMode: (v: ColorMode) => void;
  setReduceMotion: (v: boolean) => void;
  setScreenReader: (v: boolean) => void;
  setHapticFeedback: (v: boolean) => void;
  loadFromServer: (settings: Partial<AccessibilityState>) => void;
  triggerScreenReader: (text: string) => void;
  triggerHaptic: (style?: Haptics.ImpactFeedbackStyle) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);
//(Senturk, 2026)
//pass elements as children, making the components acts as a wrapper
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();

  //(React Native, 2026)
  //AccessibilityInfo API is used to make the motion and screen reader work
  //we query the current state of the screen to be notified when it changes
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [colorMode, setColorMode] = useState<ColorMode>(systemScheme === 'dark' ? 'dark' : 'light');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  // OS-level state — read-only, can't be toggled by the app, only detected
  const [osReduceMotionEnabled, setOsReduceMotionEnabled] = useState(false);
  const [osScreenReaderEnabled, setOsScreenReaderEnabled] = useState(false);

    //(React Native, 2026)
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setOsReduceMotionEnabled);
    AccessibilityInfo.isScreenReaderEnabled().then(setOsScreenReaderEnabled);

    //activates when enabled by user
    const reduceMotionSub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setOsReduceMotionEnabled
    );

    //screen reading starts when enabled by user
    const screenReaderSub = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setOsScreenReaderEnabled
    );

      //(React Native, 2026)
    return () => {
      reduceMotionSub.remove();
      screenReaderSub.remove();
    };
  }, []);

  //(Patel, 2025)
  //calls the loadfromserver to load the settings that have been chosen by the user and saved otherwise default settings are left the same
  const loadFromServer = useCallback((settings: Partial<AccessibilityState>) => {
    if (settings.textSize) setTextSize(settings.textSize);
    if (settings.colorMode) setColorMode(settings.colorMode);
      //(Balasubramanian, 2023)
    if (settings.reduceMotion !== undefined) setReduceMotion(settings.reduceMotion);
    if (settings.screenReader !== undefined) setScreenReader(settings.screenReader);
    if (settings.hapticFeedback !== undefined) setHapticFeedback(settings.hapticFeedback);
  }, []);

  //(Balasubramanian, 2023)
  const triggerHaptic = useCallback(
    (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
      if (hapticFeedback) {
        Haptics.impactAsync(style);
      }
    },
    [hapticFeedback]
  );

  //(Balasubramanian, 2023)
  const triggerScreenReader = useCallback(
    (text: string) => {
      if (screenReader) {
        Speech.stop();
        Speech.speak(text);
      }
    },
    [screenReader]
  );

  const scale = scaleMap[textSize];
  const theme = Colors[colorMode];

  //(Senturk, 2026)
  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        colorMode,
        reduceMotion,
        screenReader,
        hapticFeedback,
        scale,
        theme,
        osReduceMotionEnabled,
        osScreenReaderEnabled,
        setTextSize,
        setColorMode,
        setReduceMotion,
        setScreenReader,
        setHapticFeedback,
        loadFromServer,
        triggerHaptic,
        triggerScreenReader,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

//(StackOverflow, 2025)
export function useAccessibility() {
  const message = useContext(AccessibilityContext);
  if (!message) {
    throw new Error('accessibility Error');
  }
  return message;
}

/* References

Balasubramanian, K., 2023. Haptics in React Native: Creating a useHaptic() Hook. (Version 2.0) [Source Code] Available at: < https://medium.com/timeless/implementing-haptic-feedback-in-react-native-writing-a-usehaptic-hook-6b8612675599 > [Accessed 3 September 2026]
Cusick, J., 2025. Flexible typography in react. (Version 2.0) [Source Code] Available at: < https://joshcusick.substack.com/p/flexible-typography-in-react > [Accessed 4 September 2026]
Mimo, 2026. Typescript record type: syntax, use cases, and examples. (Version 2.0) [Source Code] Available at: < https://mimo.org/glossary/typescript/record-type > [Accessed 4 September 2026]
React Native, 2026. AccessibilityInfo. (Version 2.0) [Source Code] Available at: < https://reactnative.dev/docs/accessibilityinfo > [Accessed 3 September 2026]
Patel, R., 2025. Utility types in typescript. (Version 2.0) [Source Code] Available at: < https://dev.to/rushi-patel/utility-types-in-typescript-a-detailed-explanation-2m9p > [Accessed 4 September 2026]
Senturk, A., 2026. AccessibilityProvider.tsx. (Version 2.0) [Source Code] Available at: < https://gitlab.opencode.de/bad-belzig/smart-village-app/-/blob/master/src/AccessibilityProvider.tsx?ref_type=heads  > [Accessed 3 September 2026]
Schult, J., 2022. Accessibility-Demo. (Version 2.0) [Source Code] Available at: < https://github.com/jonnyschult/accessibility-demo > [Accessed 3 September 2026]
StackOverflow, 2025. React useContext method. (Version 2.0) [Source Code] Available at: < https://stackoverflow.com/questions/79371800/react-usecontext-method > [Accessed 3 September 2026]
*/