 /**
 * (Ankara, 2025),
 * Requires: npx expo install react-native-ble-plx   (dev build only, not Expo Go)
 */
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, State } from 'react-native-ble-plx';

//(Ble-plx Documentation, 2025)
const BEACON_PREFIX = 'Parkitects Beacon';

//(OneClick IT Consultancy, 2023)
const MIN_RSSI = -90;

//A single, lazily created BleManager
//need this in the main
//(Ankara, 2025)
let manager: BleManager | null = null;

export function getBleManager(): BleManager {
  if (!manager) manager = new BleManager();
  return manager;
}


//Permission checks (silent) and permission requests (shows the system dialog)

//(Ble-plx Documentation, 2025)
const androidPermissionGroups = () => {
  const P = PermissionsAndroid.PERMISSIONS;
  return Number(Platform.Version) >= 31
    ? [[P.BLUETOOTH_SCAN, P.BLUETOOTH_CONNECT], [P.ACCESS_FINE_LOCATION]]
    : [[P.ACCESS_FINE_LOCATION]];
};

const androidPermissions = () => androidPermissionGroups().flat();




/**
 * Silent check: never shows a dialog. Used  to decide what the UI should show.
 * iOS has no separate runtime check here; the Bluetooth *state* tells us
 * whether it's authorised (see isBluetoothOn).
 */
export async function hasBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const checks = await Promise.all(
    androidPermissions().map(permission => PermissionsAndroid.check(permission))
  );
  return checks.every(Boolean);
}

export type PermissionResult = 'granted' | 'denied' | 'blocked';

/**
 * Shows the system dialog when needed.
 *  - 'granted' : good to go
 *  - 'denied'  : user said no this time, we can ask again later
 *  - 'blocked' : user chose "don't ask again", the only way forward is system settings
 */
//(Ble-plx Documentation, 2025)
export async function requestBlePermissions(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') return 'granted';

  for (const group of androidPermissionGroups()) {
    const results = await PermissionsAndroid.requestMultiple(group);

    console.log('[BLE] Android', Platform.Version, 'permission results:', results);

    const values = Object.values(results);
    if (values.includes(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) return 'blocked';
    if (!values.every(v => v === PermissionsAndroid.RESULTS.GRANTED)) return 'denied';
  }
  return 'granted';
}


//Bluetooth on/off state

export async function isBluetoothOn(): Promise<boolean> {
  return (await getBleManager().state()) === State.PoweredOn;
}

/**
 * Android can ask the system to switch Bluetooth on (shows a small dialog).
 * iOS cannot, so this returns false there and the caller should open Settings.
 */
export async function tryEnableBluetooth(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    await getBleManager().enable();
    return true;
  } catch {
    return false;
  }
}

//Scanning for parking beacons 
export type NearbyNode = {
  name: string;
  nodeKey: string;
  label: string;
  rssi: number;
};

//A short "scan and average" that returns the nearest parking beacons
//(Ankara, 2025)
const beaconNumber = (name: string) => name.match(/(\d+)\s*$/)?.[1] ?? '0';

export const toFirebaseNodeKey = (name: string) =>
  `Node_${beaconNumber(name).padStart(2, '0')}`;

export const toNodeLabel = (name: string) => `Node ${Number(beaconNumber(name))}`;

export function stopScan() {
  getBleManager().stopDeviceScan();
}

/**
 * (Ble-plx Documentation, 2025)
 * Scans for `durationMs`, collects every RSSI reading per beacon, averages them,
 * and returns the beacons sorted strongest (closest) first.
 * Call stopScan() if the screen closes early.
 */

//
//(OneClick IT Consultancy, 2023)
export function scanNearbyNodes(durationMs = 4000): Promise<NearbyNode[]> {
  const readings = new Map<string, number[]>();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      stopScan();
      const nodes = [...readings.entries()]
        .map(([name, values]) => ({
          name,
          nodeKey: toFirebaseNodeKey(name),
          label: toNodeLabel(name),
          rssi: values.reduce((sum, v) => sum + v, 0) / values.length,
        }))
        .filter(node => node.rssi >= MIN_RSSI)
        .sort((a, b) => b.rssi - a.rssi);
      resolve(nodes);
    }, durationMs);

    //(Ble-plx Documentation, 2025)
    getBleManager().startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
      if (error) {
        clearTimeout(timer);
        stopScan();
        reject(error);
        return;
      }

      const name = device?.localName ?? device?.name;
      if (!name || !name.startsWith(BEACON_PREFIX) || device?.rssi == null) return;

      const list = readings.get(name);
      if (list) list.push(device.rssi);
      else readings.set(name, [device.rssi]);
    });
  });
}

/*References
Ankara, A.E., 2025. How to Build a High Performance BLE & iBeacon Manager Using the Singleton Pattern in HarmonyOS NEXT. [online] Medium. Available at: <https://medium.com/huawei-developers/designing-a-singleton-based-blemanager-for-ibeacon-scanning-in-harmonyos-next-19db8595bd4a> [Accessed 3 October 2026]
Ble-plx Documentation, 2025. react-native-ble-plx 3.3.0 Documentation. [online] Available at: <https://dotintent.github.io/react-native-ble-plx/> [Accessed 3 October 2026]
OneClick IT Consultancy, 2023. Measuring Distance Between Beacon & Device. [online] Available at: <https://www.oneclickitsolution.com/blog/measuring-distance-between-beacon-device> [Accessed 3 October 2026]
*/