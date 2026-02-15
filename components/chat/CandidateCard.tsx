import React, { useState } from 'react';
import { View, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Image } from 'expo-image';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { LucideIcon, User } from 'lucide-react-native';
import { logInteraction } from '@/lib/supabase';

export interface CandidateStat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}

export interface CandidateCardProps {
  name: string;
  username: string;
  avatarUrl: string;
  bio?: string;
  email?: string;
  skills?: string[];
  stats?: CandidateStat[];
  className?: string;
  onHire?: () => void;
  onViewProfile?: () => void;
  searchId?: string;
}

export function CandidateCard({
  name,
  username,
  avatarUrl,
  bio,
  email,
  skills = [],
  stats = [],
  className,
  onHire,
  onViewProfile,
  searchId,
}: CandidateCardProps) {
  const [showEmail, setShowEmail] = useState(false);

  const handleHireClick = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowEmail(true);
    if (searchId) {
      logInteraction(searchId, {
        type: 'hire',
        candidateId: username, // Using username as ID since it's unique enough for this log
        candidateName: name,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        timestamp: new Date().toISOString()
      });
    }
    if (onHire) onHire();
  };

  const handleViewProfile = () => {
    if (searchId) {
      logInteraction(searchId, {
        type: 'view_profile',
        candidateId: username,
        candidateName: name,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        timestamp: new Date().toISOString()
      });
    }
    if (onViewProfile) onViewProfile();
  };

  const avatarSource = avatarUrl || `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(username)}`;

  return (
    <View className={cn(
      "p-6 rounded-[2.5rem] border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col w-[290px] mr-4",
      className
    )}>
      {/* Background Accent */}
      <View className="absolute top-0 right-0 w-48 h-48 bg-slate-50 dark:bg-slate-900 rounded-full -mr-24 -mt-24" />
      
      {/* Profile Header */}
      <View className="relative flex-row items-center gap-4 mb-5">
         <View className="shrink-0 relative">
            <View className="w-16 h-16 rounded-2xl border-2 border-slate-50 dark:border-slate-900 bg-slate-100 items-center justify-center overflow-hidden">
               <Image 
                 source={avatarSource}
                 style={{ width: '100%', height: '100%' }}
                 contentFit="cover"
                 transition={200}
               />
            </View>
            {/* Permanent Pro Badge */}
            <View className="absolute -bottom-1 -right-1 bg-[#FFD21E] px-1.5 py-0.5 rounded-md border border-white dark:border-slate-950 shadow-sm">
              <Typography className="text-slate-900 text-[7px] font-black uppercase tracking-widest">
                Pro
              </Typography>
            </View>
         </View>
         
         <View className="flex-1 min-w-0">
            <Typography variant="h4" className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100" numberOfLines={1}>
              {name}
            </Typography>
            <Typography className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest" numberOfLines={1}>
               @{username}
            </Typography>
         </View>
      </View>

      <View className="mb-4">
        {showEmail && (
          <View className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
            <Typography className="text-[8px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-0.5">
              {email ? "Direct Contact" : "Contact Initiated"}
            </Typography>
            <Typography className="text-[11px] font-bold text-slate-900 dark:text-slate-100" numberOfLines={1}>
              {email || "We'll reach out for you!"}
            </Typography>
          </View>
        )}

        <View className="flex-row flex-wrap gap-1 mb-3">
           {skills.slice(0, 3).map((skill) => (
             <Badge 
               key={skill} 
               label={skill} 
               variant="secondary"
               className="bg-slate-100 dark:bg-slate-800 rounded-md border-none px-1.5"
               textClassName="text-slate-500 dark:text-slate-400 text-[7px] font-black uppercase"
             />
           ))}
           {skills.length > 3 && (
             <Typography className="text-[7px] font-bold text-slate-400 pt-0.5">
               +{skills.length - 3}
             </Typography>
           )}
        </View>

        <Typography className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-4 italic h-[40px]" numberOfLines={3}>
          {bio || "Technical profile active in ecosystem development and artifact maintenance."}
        </Typography>
      </View>

      {/* Flexible Stats Grid */}
      <View className="flex-row gap-2 mb-4">
         {stats.map((stat, idx) => (
           <View 
             key={idx} 
             className={cn(
               "bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100/50 dark:border-slate-800 items-center justify-center flex-1",
               stat.label === 'Location' && 'flex-[1.5]'
             )}
           >
             <View className="flex-row items-center gap-1 mb-0.5 justify-center w-full">
               {stat.icon && <stat.icon size={10} color="#94a3b8" />}
               <Typography className="text-[10px] font-black text-slate-900 dark:text-slate-100" numberOfLines={1}>
                 {stat.value}
               </Typography>
             </View>
             <Typography className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter" numberOfLines={1}>
               {stat.label}
             </Typography>
           </View>
         ))}
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2 pt-4 border-t border-slate-50 dark:border-slate-900 mt-2">
         <Button 
           variant="outline" 
           onPress={handleViewProfile}
           className="flex-1 rounded-xl h-12 border-slate-200 dark:border-slate-800"
           textClassName="font-black text-[10px] uppercase tracking-widest text-center"
           title="Profile"
         />
         <Button 
           onPress={handleHireClick}
           className="flex-1 rounded-xl bg-slate-950 dark:bg-white h-12 shadow-sm"
           textClassName="text-white dark:text-slate-950 font-black text-[10px] uppercase tracking-widest text-center"
           title="Hire"
         />
      </View>
    </View>
  );
}