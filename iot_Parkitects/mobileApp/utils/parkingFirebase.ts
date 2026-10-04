//for the main
import { getApp } from 'firebase/app';
import { getDatabase, ref, get, runTransaction } from 'firebase/database';

const DB_URL = 'https://wil-smartparking-default-rtdb.firebaseio.com';
const db = () => getDatabase(getApp(), DB_URL);

export type LiveBay = {
  bayId: string;            // "Bay1"
  status: string;           // "Occupied" | "Available"
  distanceCm: number;
  occupiedByUserId: string; // "Anonymous" | "None" | a user uid
};

export async function getBaysForNode(nodeKey: string): Promise<LiveBay[]> {
  const snap = await get(ref(db(), `/ParkingLots/Lot_A/nodes/${nodeKey}/bays`));
  if (!snap.exists()) return [];
  return Object.entries(snap.val() as Record<string, any>).map(([bayId, b]) => ({
    bayId,
    status: b.status,
    distanceCm: b.distanceCm,
    occupiedByUserId: b.occupiedByUserId,
  }));
}

export async function claimBay(nodeKey: string, bayId: string, uid: string): Promise<boolean> {
  const bayRef = ref(db(), `/ParkingLots/Lot_A/nodes/${nodeKey}/bays/${bayId}`);

  const result = await runTransaction(bayRef, (bay) => {
    // First pass is often null (nothing cached). Returning it lets Firebase
    // compare with the server and call this function again with the real data.
    if (bay === null) return bay;

    if (bay.status === 'Occupied' && bay.occupiedByUserId === 'Anonymous') {
      bay.occupiedByUserId = uid;
      return bay;
    }
    return; // abort: free, or already claimed
  });

  console.log('[claim]', bayId, 'committed:', result.committed, 'data:', result.snapshot.val());
  return result.committed;
}