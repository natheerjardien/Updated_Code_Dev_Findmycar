//(Withfra.me, 2022)
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import FeatherIcon from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as Location from 'expo-location'; // GPS Module (Expo, 2026a)
import { Magnetometer } from 'expo-sensors'; // Compass Module (Expo, 2026b)
import AsyncStorage from '@react-native-async-storage/async-storage'; // (React Native, 2026)

const { width } = Dimensions.get('window');
const DIAGRAM_SIZE = width - 80;

// Uses Haversine Formula to calculate the distance in meters over the earths curve (Veness, 2026)
const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Earths radius in meters
  const toRad = (val: number) => (val * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Calculates the angle (bearing) between user and car (Veness, 2026)
const getBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (val: number) => (val * Math.PI) / 180;
  const toDeg = (val: number) => (val * 180) / Math.PI;
  
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360; // Normalizes to 0-360 degrees
};

function ParkingDiagram({ distance, arrowRotation }: { distance: number, arrowRotation: number }) {
  const progress = Math.max(0, Math.min(100, 100 - distance)); // Shrinks the circle as you get closer

  //Progress Bar (npm, 2024)
  return (
    <View style={styles.progressContainer}>
      <AnimatedCircularProgress
        size={DIAGRAM_SIZE}
        width={14}
        fill={progress}
        tintColor="#22C55E"
        backgroundColor="rgba(255, 255, 255, 0.15)"
        rotation={225}
        arcSweepAngle={270}
        lineCap="round"
        duration={1000}
      >
        {() => (
          <View style={styles.progressContent}>
            <FeatherIcon
              name="navigation"
              size={36}
              color="#FFFFFF"
              style={{ marginBottom: 8, transform: [{ rotate: `${arrowRotation}deg` }] }}
            />
            <Text style={styles.distanceText}>{distance > 0 ? distance : '--'}</Text>
            <Text style={styles.unitText}>meters away</Text>
            <View style={styles.accuracyBadge}>
              <Text style={styles.accuracyText}>Accuracy ±5m</Text>
            </View>
          </View>
        )}
      </AnimatedCircularProgress>
    </View>
  );
}

export default function FindCarScreen() {
  const router = useRouter();
  const [parkedLocation, setParkedLocation] = useState<string>("Locating...");
  const [targetCoords, setTargetCoords] = useState<{ lat: number, lon: number } | null>(null);
  
  const [distance, setDistance] = useState<number>(0);
  const [arrowRotation, setArrowRotation] = useState<number>(0);

  // Checks local device memory first and fallback to live API (React Native, 2026)
  useEffect(() => {
    const loadParkingData = async () => {
      try 
      {
        // Looks in the phones local storage first
        const savedLat = await AsyncStorage.getItem('parkedLat');
        const savedLon = await AsyncStorage.getItem('parkedLon');
        const savedLabel = await AsyncStorage.getItem('parkedLabel');

        if (savedLat && savedLon && savedLabel) 
        {
          // If its found on the device, it uses it immediately
          setTargetCoords({ lat: parseFloat(savedLat), lon: parseFloat(savedLon) });
          setParkedLocation(savedLabel);
        } 
        else 
        {
          setParkedLocation("No Parking Saved");
        }
      } 
      catch (error) 
      {
        console.error("Error loading location:", error);
        setParkedLocation("No Car Detected");
      }
    };
    
    loadParkingData();
  }, []);

  // Starts the GPS and compass tracking
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;
    let magSubscription: any;
    let currentHeading = 0; // Tracks which way phone is physically pointing

    const startTracking = async () => {
      // Checks the location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') 
      {
        Alert.alert("Permission Denied", "GPS access is required to find your car.");
        return;
      }

      // Compass listener (Expo, 2026b)
      Magnetometer.setUpdateInterval(100); 
      magSubscription = Magnetometer.addListener((data) => {
        let heading = Math.atan2(data.y, data.x) * (180 / Math.PI);
        if (heading < 0) heading += 360;
        currentHeading = heading;
      });

      // Live GPS listener (Expo, 2026a)
      locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 500, distanceInterval: 1 },
        (loc) => {
          if (targetCoords) 
          {
            const userLat = loc.coords.latitude;
            const userLon = loc.coords.longitude;

            // Updates the distance to the car
            const dist = getDistanceMeters(userLat, userLon, targetCoords.lat, targetCoords.lon);
            setDistance(dist);

            // Updates the rotation of the arrow
            const bearingToCar = getBearing(userLat, userLon, targetCoords.lat, targetCoords.lon);
            const rotation = bearingToCar - currentHeading;
            setArrowRotation(Math.round(rotation));
          }
        }
      );
    };

    if (targetCoords) startTracking();

    // Cleans up the memory when leaving screen
    return () => {
      if (locationSubscription) locationSubscription.remove();
      if (magSubscription) magSubscription.remove();
    };
  }, [targetCoords]);

  // Clears the storage when the user drives away
  const handleCheckout = async () => {
    await AsyncStorage.removeItem('parkedLat');
    await AsyncStorage.removeItem('parkedLon');
    await AsyncStorage.removeItem('parkedLabel');
    router.back();
  };

  return (
    <LinearGradient
      colors={['#0d5965', '#083f39', '#042214']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Top Header / Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FeatherIcon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Screen Info */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Find Your Car</Text>
            <Text style={styles.subtitle}>
              Follow the compass to navigate back to your parked vehicle.
            </Text>
          </View>

          <View style={styles.diagramContainer}>
            <ParkingDiagram distance={distance} arrowRotation={arrowRotation} />
          </View>

          <View style={styles.footer}>
            <View style={styles.locationCard}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>PARKED BAY</Text>
                {/* Display the location saved in memory */}
                <Text style={styles.locationValue}>{parkedLocation}</Text>
              </View>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  
  header: {
    paddingTop: 12,
    height: 48,
    justifyContent: 'center',
     marginTop:27,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
 
  },


  titleSection: {
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },

  /* Circular Progress Area */
  diagramContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationIcon: {
    marginBottom: 8,
    transform: [{ rotate: '45deg' }],
  },
  distanceText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 68,
  },
  unitText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  accuracyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accuracyText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },

  /* Footer Card */
  footer: {
    paddingBottom: 24,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom:23,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  doneButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  doneButtonText: {
    color: '#0D5265',
    fontSize: 14,
    fontWeight: '700',
  },
});

/* 
 * REFERENCES:
 * Expo, 2026a. Location - Expo Documentation. [Online] Available at: <https://docs.expo.dev/versions/latest/sdk/location/> [Accessed 26 September 2026].
 * Expo, 2026b. Magnetometer - Expo Documentation. [Online] Available at: <https://docs.expo.dev/versions/latest/sdk/magnetometer/> [Accessed 26 September 2026].
 * React Native, 2026. AsyncStorage. [Online] Available at: <https://react-native-async-storage.github.io/async-storage/docs/usage/> [Accessed 26 September 2026].
 * Veness, C., 2026. Calculate distance, bearing and more between Latitude/Longitude points. [Online] Available at: <https://www.movable-type.co.uk/scripts/latlong.html> [Accessed 26 September 2026].
 * Withfra.me, 2022. Social Media Landing Page. [Source code] Available at: <https://withfra.me/components/landing/static-welcome-page-with-customizable-photos-and-icons> [Accessed 26 September 2026].
 */