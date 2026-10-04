//git dont play
//(Expo Docs, 2026a)
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

//(Herrera, 2026)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

//(Expo Docs, 2026b)
export async function registerForPushNotificationsAsync(userID: string) {
  if (!Device.isDevice) {
    console.warn('Must use physical device for Push Notifications')
    return null;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  //Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const{ status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') 
  {
    console.warn('Failed to get push token for push notification!')
    return null;
}
//get project id from app.json
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      console.error('Project Id mot found in app.js')
      return null;
    }
    try {
  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

  //register token with backend API
  await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notification/register-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID, token: expoPushToken, platform: Platform.OS }),
  });

  return expoPushToken;
}
catch (error) {
  console.error('Error fetching Expo Push token:', error);
  return null;
}
}

/*References

Expo Docs, 2026a. Expo push notifications setup. (Version 10.0) [Source Code]. Available at: < https://docs.expo.dev/push-notifications/push-notifications-setup/ > [Accessed 25 September 2026]
Expo Docs, 2026b. Expo Notifications. (Version 10.0) [Source Code]. Available at: < https://docs.expo.dev/versions/latest/sdk/notifications/ > [Accessed 25 September 2026]
Herrera, F., 2026. Expo push notifications - 05/07 - usePushNotifications - custom hooks. [video online] (Version 10.0) [Source Code]. Available at: < https://youtu.be/fJTsWcNARFo?si=fht35T8CaQGztwxt > [Accessed 25 September 2026]



*/