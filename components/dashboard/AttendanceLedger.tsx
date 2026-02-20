import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Info
} from 'lucide-react-native';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isAfter, 
  isBefore, 
  addMonths, 
  subMonths,
  startOfDay
} from 'date-fns';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import Animated, { 
  FadeInUp, 
  FadeIn,
  ScaleInCenter,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';

interface AttendanceLedgerProps {
  employee: any;
  workShifts?: any[];
  joinedDate?: Date | null;
  isLoading?: boolean;
}

export function AttendanceLedger({ employee, workShifts = [], joinedDate, isLoading }: AttendanceLedgerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ day: Date; label: string; status: string } | null>(null);
  const { width } = useWindowDimensions();

  // Helper to extract JS Date safely
  const getDate = (ts: any) => {
    if (!ts) return new Date(0);
    if (ts.toDate) return ts.toDate();
    if (ts instanceof Date) return ts;
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return new Date(ts);
  };

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const attendanceMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!workShifts) return map;

    const actualJoinedDate = joinedDate ? startOfDay(joinedDate) : new Date(0);

    workShifts.forEach(shift => {
      const shiftStartDate = getDate(shift.startTime);
      if (shiftStartDate < actualJoinedDate) return; 

      if (shiftStartDate.getTime() > 0) {
        const dateKey = format(shiftStartDate, 'yyyy-MM-dd');
        map[dateKey] = (map[dateKey] || 0) + (shift.liveMetrics?.totalSeconds || 0);
      }
    });
    return map;
  }, [workShifts, joinedDate]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const safeJoinedDate = joinedDate ? startOfDay(joinedDate) : new Date(0);

  if (isLoading || !employee) {
    return (
      <Card variant="glass" className="p-8 mb-8">
        <View className="h-8 w-64 bg-secondary/50 rounded-xl mb-10" />
        <View className="flex-row gap-2 justify-between">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-12 rounded-full" />
          ))}
        </View>
      </Card>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(600).delay(200)}>
      <Card variant="glass" className="p-8 mb-8 relative overflow-hidden">
        <View className="flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <View className="space-y-1">
            <View className="flex-row items-center space-x-3">
              <CalendarIcon size={20} className="text-primary" />
              <Typography variant="h3" className="font-black uppercase tracking-tight">Attendance Ledger</Typography>
            </View>
            <Typography variant="small" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Daily Activity Log</Typography>
          </View>

          <View className="flex-row items-center bg-secondary/30 rounded-2xl p-1 border border-border/40 self-start md:self-auto">
            <TouchableOpacity onPress={prevMonth} className="p-2">
              <ChevronLeft size={18} className="text-muted-foreground" />
            </TouchableOpacity>
            <View className="px-6 min-w-[140px] items-center">
              <Typography className="text-xs font-black uppercase tracking-[0.2em]">
                {format(currentMonth, 'MMMM yyyy')}
              </Typography>
            </View>
            <TouchableOpacity onPress={nextMonth} className="p-2">
              <ChevronRight size={18} className="text-muted-foreground" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row flex-wrap items-end justify-between">
          {days.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const duration = attendanceMap[dateKey] || 0;
            const hours = (duration / 3600).toFixed(1);
            const isToday = isSameDay(day, new Date());
            const isFuture = isAfter(startOfDay(day), startOfDay(new Date()));
            const isBeforeJoining = isBefore(startOfDay(day), safeJoinedDate);
            const isPresent = duration > 0;
            const isAbsent = !isPresent && !isFuture && !isBeforeJoining && !isToday;

            let bgColor = "bg-secondary/20";
            let statusLabel = "No Activity";
            let status = "none";

            if (isBeforeJoining) {
              bgColor = "bg-secondary/10 opacity-30";
              statusLabel = "Not joined yet";
              status = "before";
            } else if (isFuture) {
              bgColor = "bg-secondary/5 border border-dashed border-border/40";
              statusLabel = "Future Date";
              status = "future";
            } else if (isPresent) {
              bgColor = "bg-emerald-500 shadow-sm shadow-emerald-500/50";
              statusLabel = `${hours}h Produced`;
              status = "present";
            } else if (isAbsent) {
              bgColor = "bg-rose-500 shadow-sm shadow-rose-500/50";
              statusLabel = "Absent / No Pulse";
              status = "absent";
            } else if (isToday) {
              bgColor = "bg-primary/20 border-2 border-primary";
              statusLabel = "Awaiting Yield";
              status = "today";
            }

            return (
              <TouchableOpacity
                key={dateKey}
                activeOpacity={0.7}
                onPress={() => setSelectedDay({ day, label: statusLabel, status })}
                style={{ 
                  flex: 1, 
                  minWidth: width > 600 ? 12 : 8, 
                  marginHorizontal: 1,
                  height: width > 600 ? 64 : 48,
                }}
                className={`rounded-full ${bgColor}`}
              />
            );
          })}
        </View>

        {/* Selected Day Info (Mobile Tooltip replacement) */}
        <View className="h-16 mt-6 justify-center">
          {selectedDay ? (
            <Animated.View entering={FadeIn.duration(300)} className="flex-row items-center space-x-3 bg-secondary/20 p-3 rounded-2xl border border-border/40">
              <View className="flex-1">
                <Typography variant="small" className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  {format(selectedDay.day, 'EEEE, MMM do')}
                </Typography>
                <View className="flex-row items-center mt-0.5">
                  {selectedDay.status === 'present' ? <CheckCircle2 size={12} className="text-emerald-500 mr-2" /> : 
                   selectedDay.status === 'absent' ? <XCircle size={12} className="text-rose-500 mr-2" /> : 
                   <Clock size={12} className="text-muted-foreground mr-2" />}
                  <Typography className="text-xs font-black uppercase tracking-tight">{selectedDay.label}</Typography>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedDay(null)}>
                <XCircle size={16} className="text-muted-foreground" />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View className="flex-row items-center justify-center space-x-2">
              <Info size={14} className="text-muted-foreground/30" />
              <Typography variant="small" className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">
                Tap a bar to audit daily pulse
              </Typography>
            </View>
          )}
        </View>

        <View className="mt-8 pt-6 border-t border-border/20 flex-row flex-wrap gap-x-6 gap-y-4 justify-start">
          <LegendItem color="bg-emerald-500" label="Present" />
          <LegendItem color="bg-rose-500" label="Absent" />
          <LegendItem color="bg-secondary opacity-30" label="Not Joined" />
          <LegendItem color="bg-secondary/5 border border-dashed border-border/40" label="Future" />
        </View>
      </Card>
    </Animated.View>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <View className="flex-row items-center space-x-2">
      <View className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</Typography>
    </View>
  );
}
