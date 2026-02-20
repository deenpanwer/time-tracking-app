import React, { useEffect } from 'react';
import { auth, firestore } from '@/lib/firebase';
import { onAuthStateChanged } from '@react-native-firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from '@react-native-firebase/firestore';
import { useAuthStore } from '@/stores/use-auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setUserData, logout, setLoading } = useAuthStore();

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log("Auth State Changed. User UID:", user?.uid);
      
      if (user) {
        setAuth({
          id: user.uid,
          email: user.email || '',
          name: user.displayName || user.email?.split('@')[0] || 'User',
        }, 'firebase-token');

        if (unsubscribeUserDoc) unsubscribeUserDoc();

        const userRef = doc(firestore, 'users', user.uid);

        // 1. Check if user document exists, if not create a basic one
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            console.log("Creating new user document for:", user.uid);
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              role: 'Owner', // Default new mobile signups to Owner
              createdAt: new Date(),
              onboardingCompleted: false
            });
          }
        } catch (e: any) {
          console.error("Error checking/creating user doc:", e.message);
        }

        // 2. Listen to the User Document
        unsubscribeUserDoc = onSnapshot(userRef, (snap) => {
          if (snap && snap.exists()) {
            const data = snap.data();
            console.log("User Data Synced. OrgID:", data?.ownedOrgId || data?.orgId || 'None');
            setUserData(data);
          } else {
            setUserData({});
          }
        }, (error) => {
          console.warn("User Doc Sync Error:", error.message);
        });
      } else {
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        logout();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  return <>{children}</>;
}
