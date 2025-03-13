import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

export interface UserProfile {
  uid: string;
  username: string;
  bio: string;
  profilePicture: string;
  rating: number;
  wins: number;
  losses: number;
  createdAt: Date;
  updatedAt: Date;
}

export const createUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  const now = new Date();
  
  await setDoc(userRef, {
    uid,
    username: '',
    bio: '',
    profilePicture: '',
    rating: 1200, // Starting Glicko-2 rating
    wins: 0,
    losses: 0,
    createdAt: now,
    updatedAt: now,
    ...data,
  });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  return userSnap.data() as UserProfile;
}; 