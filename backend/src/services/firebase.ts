import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

const USE_MOCK = process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_PROJECT_ID;

if (!USE_MOCK) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (err) {
    console.warn('Firebase connection failed, using mock mode.', err);
  }
}

const db = !USE_MOCK ? admin.firestore() : null;

export const saveResult = async (clientId: string, prize: any) => {
  if (USE_MOCK) {
    console.log(`[MOCK DB] Gravando: ${clientId} ganhou ${prize.label}`);
    return true;
  }
  
  const docRef = db!.collection('winners').doc(clientId);
  const doc = await docRef.get();
  
  if (doc.exists) {
    throw new Error('Você já girou a roleta!');
  }

  await docRef.set({
    prize: prize.label,
    coupon: prize.coupon,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    redeemed: false,
  });

  return true;
};

export const listWinners = async () => {
  if (USE_MOCK) return [];
  const snapshot = await db!.collection('winners').orderBy('timestamp', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};