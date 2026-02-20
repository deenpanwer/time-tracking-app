import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, collection } from '@react-native-firebase/firestore';
import { getCrashlytics } from '@react-native-firebase/crashlytics';
import { getAnalytics } from '@react-native-firebase/analytics';

// In React Native Firebase, the default app is automatically initialized 
// via the native google-services.json/plist. 
// Calling these without arguments uses the default app.

const auth = getAuth();
const firestore = getFirestore();
const crashlytics = getCrashlytics();
const analytics = getAnalytics();

export { auth, firestore, crashlytics, analytics };

// Firestore Helper for EMS Data (Modular Style)
export const collections = {
  organizations: collection(firestore, 'organizations'),
  employees: collection(firestore, 'employees'),
  shifts: collection(firestore, 'work_shifts'),
};
