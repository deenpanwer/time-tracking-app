import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { OwnerCockpit } from './OwnerCockpit';
import { IntelligenceUnit } from './IntelligenceUnit';
import { ApplicationUsage } from './ApplicationUsage';
import { EliteWorkforce } from './EliteWorkforce';
import { WorkQualityFlow } from './WorkQualityFlow';
import { GlobalPresence } from './GlobalPresence';
import { WorkforceRegistry } from './WorkforceRegistry';
import { EmptyState } from './EmptyState';
import { PerformanceHorizon } from './PerformanceHorizon';
import { useTeam } from '@/providers/TeamProvider';
import { format } from 'date-fns';

export function DashboardView() {
  const { employees, owner, orgData, stats, loading } = useTeam();
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  // --- SINGLE-PASS DATA ENGINE ---
  const processedData = useMemo(() => {
    if (employees.length === 0) return { workforce: [], performance: [], sankey: { nodes: [], links: [] } };

    const now = new Date();
    const currentHour = now.getHours();
    const displayOrgName = (orgData?.name || owner?.orgName || "ORGANIZATION").toUpperCase();

    const hourlyBuckets = Array.from({ length: 24 }, (_, i) => ({
        date: `${i.toString().padStart(2, '0')}:00`,
        actualHours: 0,
        projectedHours: null as number | null
    }));

    const sankeyNodes: any[] = [{ id: 'source', name: displayOrgName, color: "#3b82f6" }];
    const sankeyLinks: any[] = [];
    const appNodeIndices: Record<string, number> = {};

    const workforce = employees.map(emp => {
        const shifts = emp.workShifts || [];
        let todaySeconds = 0;
        let totalSeconds = 0;
        const empAppMap: Record<string, number> = {};
        const sparklineActivity: number[] = [];

        shifts.forEach((shift: any) => {
            const shiftTotalSeconds = shift.liveMetrics?.totalSeconds || 0;
            totalSeconds += shiftTotalSeconds;

            if (shift.id.startsWith(todayStr)) {
                todaySeconds += shiftTotalSeconds;

                if (shift.liveBreakdown) {
                    Object.entries(shift.liveBreakdown).forEach(([appName, secs]) => {
                        const s = secs as number;
                        empAppMap[appName] = (empAppMap[appName] || 0) + s;
                    });
                }

                if (shift.hourlyPulse) {
                    Object.entries(shift.hourlyPulse).forEach(([hourKey, metrics]: [string, any]) => {
                        const hourIdx = parseInt(hourKey);
                        if (hourIdx >= 0 && hourIdx < 24) {
                            hourlyBuckets[hourIdx].actualHours += (metrics.seconds || 0) / 3600;
                        }
                        sparklineActivity.push((metrics.keystrokes || 0) + ((metrics.mouseClicks || 0) * 2));
                    });
                }
            }
        });

        const empTotalHoursToday = todaySeconds / 3600;
        if (empTotalHoursToday > 0.01) {
            const empIdx = sankeyNodes.length;
            sankeyNodes.push({ id: emp.id, name: emp.name.toUpperCase(), color: "#8b5cf6" });
            sankeyLinks.push({ source: 'source', target: emp.id, value: empTotalHoursToday });

            Object.entries(empAppMap).forEach(([appName, seconds]) => {
                const appHours = seconds / 3600;
                if (appHours > 0.01) {
                    const formattedAppName = appName.replace(/_/g, ' ').toUpperCase();
                    if (!appNodeIndices[formattedAppName]) {
                        appNodeIndices[formattedAppName] = sankeyNodes.length;
                        sankeyNodes.push({ id: `app-${formattedAppName}`, name: formattedAppName, color: "#10b981" });
                    }
                    sankeyLinks.push({ source: emp.id, target: `app-${formattedAppName}`, value: appHours });
                }
            });
        }

        return {
            ...emp,
            location: emp.lastLoginLocation?.city || "Remote",
            hoursToday: (todaySeconds / 3600).toFixed(1),
            totalHours: (totalSeconds / 3600).toFixed(1),
            prevHours: sparklineActivity.slice(-10)
        };
    });

    const totalHoursSoFar = hourlyBuckets.slice(0, currentHour + 1).reduce((acc, b) => acc + b.actualHours, 0);
    const avgHourlyRate = totalHoursSoFar > 0 ? totalHoursSoFar / (currentHour + 1) : 0;

    const performance = hourlyBuckets.map((b, i) => {
        const isPast = i <= currentHour;
        return {
            ...b,
            actualHours: isPast ? b.actualHours : null,
            projectedHours: i >= currentHour ? (i === currentHour ? b.actualHours : avgHourlyRate) : null
        };
    });

    return { 
        workforce, 
        performance, 
        sankey: { nodes: sankeyNodes, links: sankeyLinks } 
    };
  }, [employees, todayStr, owner, orgData]);

  if (loading) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingTop: 80 }}>
        <OwnerCockpit isLoading={true} />
        <IntelligenceUnit isLoading={true} />
      </ScrollView>
    );
  }

  if (employees.length === 0) {
    return (
      <ScrollView 
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 20, paddingTop: 80, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <EmptyState 
          orgName={orgData?.name || owner?.orgName || "Your Organization"}
          inviteCode={orgData?.inviteCode || owner?.inviteCode || "------"}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: 80, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <OwnerCockpit 
        orgName={orgData?.name || owner?.orgName || "Your Organization"} 
        ownerData={owner} 
        stats={stats} 
      />
      
      <IntelligenceUnit 
        velocity={stats?.velocity} 
        topApp={stats?.topApps?.[0]?.name}
        activeCount={stats?.activeEmployees}
        totalHoursToday={stats?.totalHoursToday}
      />

      <PerformanceHorizon data={processedData.performance} />

      <ApplicationUsage apps={stats?.topApps} />

      <EliteWorkforce employees={processedData.workforce} />

      <WorkQualityFlow data={processedData.sankey} />

      <GlobalPresence employees={employees} />

      <WorkforceRegistry employees={employees} />
    </ScrollView>
  );
}
