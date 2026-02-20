import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { firestore } from '@/lib/firebase';
import { onSnapshot, query, where, collection, doc, orderBy, startAt, endAt } from '@react-native-firebase/firestore';
import { useAuthStore } from '@/stores/use-auth-store';
import { format } from 'date-fns';

interface TeamContextType {
  employees: any[];
  owner: any | null;
  orgData: any | null;
  stats: any | null;
  loading: boolean;
}

const TeamContext = createContext<TeamContextType>({
  employees: [],
  owner: null,
  orgData: null,
  stats: null,
  loading: true,
});

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user, userData, isLoading: authLoading } = useAuthStore();
  const [personnelData, setPersonnelData] = useState<Record<string, any>>({});
  const [orgData, setOrgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const listenersRef = useRef<Record<string, (() => void)[]>>({});

  const clearListeners = useCallback(() => {
    Object.values(listenersRef.current).forEach(unsubs => unsubs.forEach(unsub => unsub()));
    listenersRef.current = {};
  }, []);

  useEffect(() => {
    const targetOrgId = userData?.ownedOrgId || userData?.orgId;
    
    console.log("TeamProvider Effect Run. OrgID:", targetOrgId, "AuthLoading:", authLoading);

    if (authLoading) return;
    if (!targetOrgId) {
      clearListeners();
      setPersonnelData({});
      setOrgData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // --- STEP 1: SYNC ORGANIZATION DOC ---
    const unsubOrg = onSnapshot(doc(firestore, 'organizations', targetOrgId), (snap) => {
      if (snap && snap.exists()) {
        console.log("Org Data Synced:", snap.data()?.name);
        setOrgData(snap.data());
      }
    }, (err) => console.warn("Org Sync Error:", err.message));

    // --- STEP 2: SYNC PERSONNEL LIST ---
    const usersRef = collection(firestore, 'users');
    
    // Listen for employees (who have orgId)
    const qEmployees = query(usersRef, where("orgId", "==", targetOrgId));
    // Listen for owners (who have ownedOrgId)
    const qOwners = query(usersRef, where("ownedOrgId", "==", targetOrgId));

    const syncUser = (snap: any) => {
      if (!snap) {
        setLoading(false);
        return;
      }
      
      const todayStr = format(new Date(), "yyyy-MM-dd");
      
      if (snap.docs.length === 0) {
        setLoading(false);
      }

      snap.docs.forEach((d: any) => {
        const p = { id: d.id, ...d.data() };
        
        // Update personnel state
        setPersonnelData(prev => ({
          ...prev,
          [p.id]: { workShifts: [], heartbeat: null, ...prev[p.id], ...p }
        }));

        // Attach high-fidelity listeners for each user
        if (listenersRef.current[p.id]) return;

        const userUnsubs: (() => void)[] = [];

        // Live Heartbeat
        const unsubHb = onSnapshot(doc(firestore, 'users', p.id, 'live', 'heartbeat'), (hSnap) => {
          if (!hSnap) return;
          setPersonnelData(prev => ({
            ...prev,
            [p.id]: { ...prev[p.id], heartbeat: hSnap.exists() ? hSnap.data() : null }
          }));
        }, (err) => console.warn(`Heartbeat Sync Error for ${p.id}:`, err.message));
        userUnsubs.push(unsubHb);

        // Today's Shifts
        const unsubShifts = onSnapshot(
          query(
            collection(firestore, 'users', p.id, 'workShifts'),
            orderBy('__name__'),
            startAt(todayStr),
            endAt(todayStr + "\uf8ff")
          ),
          (sSnap) => {
            if (!sSnap) return;
            const shifts = sSnap.docs.map((sd: any) => ({ id: sd.id, ...sd.data() }));
            setPersonnelData(prev => ({
              ...prev,
              [p.id]: { ...prev[p.id], workShifts: shifts }
            }));
          },
          (err) => console.warn(`Shifts Sync Error for ${p.id}:`, err.message)
        );
        userUnsubs.push(unsubShifts);

        listenersRef.current[p.id] = userUnsubs;
      });
      setLoading(false);
    };

    const unsubEmployees = onSnapshot(qEmployees, syncUser, (err) => console.warn("Employees Sync Error:", err.message));
    const unsubOwners = onSnapshot(qOwners, syncUser, (err) => console.warn("Owners Sync Error:", err.message));

    return () => {
      unsubOrg();
      unsubEmployees();
      unsubOwners();
    };
  }, [userData?.ownedOrgId, userData?.orgId, authLoading, clearListeners]);

  // Derive final lists
  // Employees are people who belong to the org but aren't the current user
  const employees = Object.values(personnelData).filter(p => p.id !== user?.id && p.active !== false);
  
  // Owner is either the current user (if synced) or the fallback userData
  const owner = personnelData[user?.id || ''] || userData;

  const stats = (() => {
    let totalSecondsToday = 0;
    let totalSecondsAllTime = 0;
    const orgAppMap: Record<string, number> = {};
    let activeCount = 0;
    let totalVelocity = 0;
    let velocityCount = 0;

    Object.values(personnelData).forEach(p => {
      if (p.heartbeat?.isCurrentlyRunning) activeCount++;
      totalSecondsAllTime += (p.totalSeconds || 0);

      p.workShifts?.forEach((s: any) => {
        totalSecondsToday += (s.liveMetrics?.totalSeconds || 0);
        if (s.liveBreakdown) {
          Object.entries(s.liveBreakdown).forEach(([app, secs]) => {
            orgAppMap[app] = (orgAppMap[app] || 0) + (secs as number);
          });
        }
        if (s.cognitiveReport?.velocity) {
          totalVelocity += s.cognitiveReport.velocity;
          velocityCount++;
        }
      });
    });

    const topApps = Object.entries(orgAppMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, secs]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        hours: (secs / 3600).toFixed(1),
        percentage: Math.round((secs / (totalSecondsToday || 1)) * 100)
      }));

    return {
      totalHoursToday: (totalSecondsToday / 3600).toFixed(1),
      totalOrgHours: (totalSecondsAllTime / 3600).toFixed(1),
      activeEmployees: activeCount,
      velocity: velocityCount > 0 ? Math.round(totalVelocity / velocityCount) : 100,
      topApps,
      totalStaff: employees.length,
    };
  })();

  return (
    <TeamContext.Provider value={{ employees, owner, orgData, stats, loading }}>
      {children}
    </TeamContext.Provider>
  );
}

export const useTeam = () => useContext(TeamContext);
