/* eslint-disable @typescript-eslint/no-explicit-any */
import { CCTV } from '@/types';
import { app } from './init';
import { getFirestore, collection, getDocs, addDoc, query, where, orderBy, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';

const db = getFirestore(app);

async function getDocumentByField(collectionName: string, field: string, value: any) {
  try {
    const q = query(collection(db, collectionName), where(field, '==', value));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    return querySnapshot.docs[0];
  } catch (error) {
    console.error(`❌ Error fetching document in "${collectionName}" where ${field} == ${value}:`, error);
    return null;
  }
}

export async function getCCTV(cctvId: string) {
  const cctvDoc = await getDocumentByField('cctvs', 'cctv_id', cctvId);
  return cctvDoc?.exists() ? cctvDoc.data() : null;
}

export async function getCCTVs() {
  try {
    const q = query(collection(db, 'cctvs'), orderBy('cctv_name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Failed to fetch CCTV records:', error);
    throw new Error(`Failed to fetch CCTV records: ${error instanceof Error ? error.message : error}`);
  }
}

export async function storeCCTV(cctv: CCTV) {
  try {
    const docRef = await addDoc(collection(db, 'cctvs'), cctv);
    const updatedData = { ...cctv, cctv_id: docRef.id };
    await setDoc(docRef, updatedData);
    return { id: docRef.id, ...updatedData };
  } catch (error) {
    console.error('Error adding CCTV:', error);
    throw new Error('Failed to add CCTV');
  }
}

export async function deleteCCTV(cctvId: string) {
  try {
    const cctvDoc = await getDocumentByField('cctvs', 'cctv_id', cctvId);
    if (cctvDoc) {
      await deleteDoc(doc(db, 'cctvs', cctvDoc.id));
      console.log(`CCTV with id: ${cctvId} deleted successfully`);
    } else {
      console.warn(`No CCTV found with id: ${cctvId}`);
    }
  } catch (error) {
    console.error('Failed to delete CCTV:', error);
    throw new Error('Failed to delete CCTV');
  }
}

export async function updateCCTV(cctv: CCTV, cctvId: string) {
  try {
    const cctvDoc = await getDocumentByField('cctvs', 'cctv_id', cctvId);
    if (cctvDoc) {
      await updateDoc(doc(db, 'cctvs', cctvDoc.id), { ...cctv });
      console.log(`CCTV with id: ${cctvId} updated successfully`);
    } else {
      throw new Error(`No CCTV found with id: ${cctvId}`);
    }
  } catch (error) {
    console.error('Failed to update CCTV:', error);
    throw new Error(`Failed to update CCTV record: ${error instanceof Error ? error.message : error}`);
  }
}

export async function storeDataUser(user: any) {
  try {
    const existingUserDoc = await getDocumentByField('users', 'email', user.email);
    if (existingUserDoc) {
      return { id: existingUserDoc.id, ...existingUserDoc.data() };
    } else {
      const newUser = { ...user, role: 'user', createdAt: new Date().toISOString() };
      const addedUserRef = await addDoc(collection(db, 'users'), newUser);
      return { id: addedUserRef.id, ...newUser };
    }
  } catch (error) {
    console.error('Error storing user data:', error);
    throw new Error('Failed to store user data');
  }
}
