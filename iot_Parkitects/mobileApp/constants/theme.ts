/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    //Emeris colors 
    primary: '#0B5D6B',
    primaryDark: '#083F4A',
    secondary: '#A9D76B',
    accent: '#2CB67D',
//Background
background: '#F7FAFB',
surface: '#FFFFFF',
//Text
    heading: '#102A43',
    text: '#4A5568',
    muted: '#8A94A6',
//Status
success: '#22C55E',
warning: '#F59E0B',
error: '#EF4444',

//Parking states
parkingAvailable: '#22C55E',
parkingOccupied: '#EF4444',
parkingReserved: '#F59E0B',
parkingSelected: '#2CB67D',
parkingDisabled: '#CBD5E1',

//Navigation
    tint: '#0B5D6B',
    icon: '#615da1',
    tabIconDefault: '#615da1',
    tabIconSelected: '#0B5D6B',
  },
  dark: {
     //Emeris colors 
    primary: '#0B5D6B',
    primaryDark: '#083F4A',
    secondary: '#A9D76B',
    accent: '#2CB67D',
//Background
background: '#0F172A',
surface: '#1E293B',
//Text
    heading: '#F8FAFC',
    text: '#E2E8F0',
    muted: '#94A3B8',
//Status
success: '#22C55E',
warning: '#F59E0B',
error: '#EF4444',

//Parking states
parkingAvailable: '#22C55E',
parkingOccupied: '#EF4444',
parkingReserved: '#F59E0B',
parkingSelected: '#2CB67D',
parkingDisabled: '#64748B',

//Navigation
    tint: '#A9D76B',
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected:'#A9D76B',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
