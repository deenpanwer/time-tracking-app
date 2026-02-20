import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MoreHorizontal, Settings } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { useColorScheme } from 'nativewind';
import { EmployeeHeader } from '@/components/dashboard/EmployeeHeader';
import { AttendanceLedger } from '@/components/dashboard/AttendanceLedger';
import { ActivityMatrix } from '@/components/dashboard/ActivityMatrix';
import { CognitiveHub } from '@/components/dashboard/CognitiveHub';
import { YieldCalculator } from '@/components/dashboard/YieldCalculator';
import { WorkHistory } from '@/components/dashboard/WorkHistory';
import { firestore } from '@/lib/firebase';
import { onSnapshot, doc, collection, query, orderBy, limit } from '@react-native-firebase/firestore';
import { useTeam } from '@/providers/TeamProvider';
import { format, subDays, startOfDay } from 'date-fns';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function EmployeePage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { employees, owner } = useTeam();

  const [employeeDoc, setEmployeeDoc] = useState<any>(null);
  const [workShifts, setWorkShifts] = useState<any[]>([]);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- PAGINATION STATES ---
  const [historyLimit, setHistoryLimit] = useState(5);
  const [shiftsLimit, setShiftsLimit] = useState(30);
  const [screenshotDays, setScreenshotDays] = useState(1);

  const liveEmployee = useMemo(() => {
    if (owner?.id === id) return owner;
    return employees.find(e => e.id === id);
  }, [employees, owner, id]);

  const employee = useMemo(() => {
    if (!employeeDoc && !liveEmployee) return null;
    return { ...employeeDoc, ...liveEmployee };
  }, [employeeDoc, liveEmployee]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    // 1. Profile Document
    const unsubProfile = onSnapshot(doc(firestore, 'users', id as string), (snapshot) => {
      if (snapshot && snapshot.exists()) setEmployeeDoc(snapshot.data());
      else setLoading(false);
    });

    // 2. Shift History (Limited for Ledger preview)
    const unsubShifts = onSnapshot(
      query(
        collection(firestore, 'users', id as string, 'workShifts'),
        orderBy("startTime", "desc"),
        limit(shiftsLimit)
      ),
      (snapshot) => {
        if (snapshot) setWorkShifts(snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() })));
      }
    );

    // 3. Time Entries (Paginated Engagement Log)
    const unsubTime = onSnapshot(
      query(
        collection(firestore, 'users', id as string, 'timeEntries'),
        orderBy("startTime", "desc"),
        limit(historyLimit)
      ),
      (snapshot) => {
        if (snapshot) setTimeEntries(snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() })));
      }
    );

    // 4. Visual Evidence (Snapshot per day)
    const today = new Date();
    const dates = Array.from({ length: screenshotDays }, (_, i) => 
        format(subDays(today, i), "yyyy-MM-dd")
    );

    const unsubscribers: (() => void)[] = [];
    const allScreenshots: Record<string, any[]> = {};

    dates.forEach(dateStr => {
        const unsub = onSnapshot(
          query(
            collection(firestore, 'users', id as string, 'screenshots', dateStr, 'images'),
            orderBy("timestamp", "desc"),
            limit(60)
          ),
          (snapshot) => {
            if (snapshot) {
              allScreenshots[dateStr] = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
              const merged = Object.values(allScreenshots).flat().sort((a, b) => {
                  const tA = a.timestamp?.seconds || 0;
                  const tB = b.timestamp?.seconds || 0;
                  return tB - tA;
              });
              setScreenshots(merged);
              setLoading(false);
            }
          }, () => setLoading(false)); 
        unsubscribers.push(unsub);
    });

    return () => {
      unsubProfile();
      unsubShifts();
      unsubTime();
      unsubscribers.forEach(u => u());
    };
  }, [id, historyLimit, shiftsLimit, screenshotDays]);

  const handleLoadMore = () => {
    setHistoryLimit(prev => prev + 5);
    if (historyLimit >= shiftsLimit - 5) setShiftsLimit(prev => prev + 30);
    if (screenshotDays < 3) setScreenshotDays(prev => prev + 1);
  };

  const { currentShiftHours, todayTotalHours, topApp } = useMemo(() => {
    const shiftsToProcess = (liveEmployee?.workShifts?.length > 0) ? liveEmployee.workShifts : workShifts;
    if (shiftsToProcess.length === 0) return { currentShiftHours: "0.0", todayTotalHours: "0.0", topApp: "---" };

    const todayStr = format(new Date(), "yyyy-MM-dd");
    let activeShiftSeconds = 0;
    let todayTotalSeconds = 0;
    const todayAppBreakdown: Record<string, number> = {};

    shiftsToProcess.forEach((shift: any) => {
      if (shift.id.startsWith(todayStr)) {
        const shiftDuration = shift.liveMetrics?.totalSeconds || 0;
        todayTotalSeconds += shiftDuration;
        if (shift.status === 'active') activeShiftSeconds = shiftDuration;
        if (shift.liveBreakdown) {
          Object.entries(shift.liveBreakdown).forEach(([appName, secs]) => {
            todayAppBreakdown[appName] = (todayAppBreakdown[appName] || 0) + (secs as number);
          });
        }
      }
    });

    const top = Object.entries(todayAppBreakdown)
      .sort(([, a], [, b]) => b - a)
      .find(([name]) => name !== "Idle")?.[0] || "---";

    return {
      currentShiftHours: (activeShiftSeconds / 3600).toFixed(1),
      todayTotalHours: (todayTotalSeconds / 3600).toFixed(1),
      topApp: top.replace(/_/g, ' ').toUpperCase(),
    };
  }, [liveEmployee, workShifts]);

  const { intensity, aiBrief } = useMemo(() => {
    const shifts = (liveEmployee?.workShifts?.length > 0) ? liveEmployee.workShifts : workShifts;
    if (shifts.length === 0) return { intensity: 0, aiBrief: null };

    const recent = [...shifts].sort((a, b) => (b.startTime?.seconds || 0) - (a.startTime?.seconds || 0))[0];
    if (!recent?.cognitiveReport) return { intensity: employee?.heartbeat?.isCurrentlyRunning ? 0.1 : 0, aiBrief: null };

    const { focusScore = 0, productivityScore = 0, velocity = 0, aiBrief: brief } = recent.cognitiveReport;
    const composite = (focusScore + productivityScore + velocity) / 3;
    return {
      intensity: Math.min(Math.max(composite / 70, 0.1), 1.5),
      aiBrief: brief
    };
  }, [employee, liveEmployee, workShifts]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center px-6 py-4 border-b border-border/40 justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center bg-secondary/50 rounded-xl mr-4"
          >
            <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
          <View>
            <Typography variant="h3" className="font-black uppercase tracking-tighter">{employee?.name || 'Loading...'}</Typography>
            <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Personnel Intelligence
            </Typography>
          </View>
        </View>
        <TouchableOpacity className="w-10 h-10 items-center justify-center bg-secondary/30 rounded-xl">
          <MoreHorizontal size={20} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <EmployeeHeader 
          employee={employee} 
          isLoading={loading} 
          hoursToday={currentShiftHours}
          totalHours={todayTotalHours}
          topApp={topApp}
        />

        <AttendanceLedger 
          employee={employee} 
          workShifts={workShifts} 
          isLoading={loading} 
        />

        <ActivityMatrix 
          workShifts={workShifts} 
          isLoading={loading} 
        />

        <CognitiveHub 
          employee={employee} 
          intensity={intensity} 
          aiBrief={aiBrief} 
          isLoading={loading} 
        />

        <YieldCalculator 
          employeeId={id as string} 
          employeeName={employee?.name || ""} 
          workShifts={workShifts} 
          screenshots={screenshots} 
          joinedDate={employee?.attachedAt?.toDate ? employee.attachedAt.toDate() : null}
          isLoading={loading} 
        />

        <WorkHistory 
          timeEntries={timeEntries} 
          screenshots={screenshots} 
          onLoadMore={handleLoadMore}
          isLoading={loading} 
        />
      </ScrollView>
    </SafeAreaView>
  );
}
