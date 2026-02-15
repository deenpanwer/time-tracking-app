import React from 'react';
import { View, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { Typography } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';
import { Sparkles, MapPin, Star, Briefcase } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { CandidateCard, CandidateStat } from './CandidateCard';
import { CandidateProfile } from '@/lib/supabase';
import { useUIStore } from '@/stores/use-ui-store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  senderEmail?: string;
  candidates?: CandidateProfile[];
  searchId?: string;
  totalScanned?: number;
}

export function MessageItem({ message, isBottom }: { message: Message; isBottom?: boolean }) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const openProfile = useUIStore(s => s.openProfile);
  const isDark = colorScheme === 'dark';
  const isUser = message.role === 'user';
  const hasCandidates = message.candidates && message.candidates.length > 0;

  const avatarSeed = message.senderEmail || 'anonymous';
  const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(avatarSeed)}`;

  return (
    <Animated.View 
      entering={(isUser ? FadeInDown : FadeInUp).duration(400).springify()}
      style={{ 
        /* 
           CRITICAL: DO NOT REMOVE OR MODIFY THIS MARGIN.
           This marginBottom creates the scrollable baseline above the floating capsule.
           It MUST remain responsive to insets.bottom to ensure perfect UI alignment.
        */
        marginBottom: isBottom ? Math.max(insets.bottom, 20) + 85 : 24 
      }}
      className="w-full"
    >
      <View className={cn(
        "flex-row w-full px-4 items-end", 
        isUser ? "justify-end" : "justify-start"
      )}>
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2 mb-1 shadow-sm shadow-primary/20">
            <Sparkles size={14} color="white" />
          </View>
        )}
        
        <View className={cn(
          "max-w-[78%] px-4 py-3 shadow-sm",
          isUser 
            ? "bg-primary rounded-3xl rounded-br-none shadow-primary/10" 
            : "bg-card border border-border/40 rounded-3xl rounded-bl-none shadow-black/5"
        )}>
          <Typography 
            className={cn(
              "text-[15px] leading-[22px] font-montserrat",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {message.content}
          </Typography>
        </View>

        {isUser && (
          <View className="w-8 h-8 rounded-xl bg-secondary items-center justify-center ml-2 mb-1 overflow-hidden border border-border/50 shadow-sm shadow-black/5">
            <Image 
              source={avatarUrl} 
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
          </View>
        )}
      </View>

      {hasCandidates && (
        <>
          {message.totalScanned && (
            <Animated.View entering={FadeInDown.delay(200)} className="px-6 mt-2">
              <Typography className="text-[10px] font-montserrat-bold text-muted-foreground uppercase tracking-widest">
                {message.totalScanned.toLocaleString()} profiles scanned
              </Typography>
            </Animated.View>
          )}
          <ScrollView 
            horizontal 
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          decelerationRate="fast"
          snapToInterval={290 + 16} // Card width (290) + margin-right (16)
          snapToAlignment="start"
          disableIntervalMomentum={true}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}
          className="w-full mt-2"
        >
          {message.candidates?.map((candidate) => {
             // Parse skills from the technical_topics or top_languages strings
             let skills: string[] = [];
             try {
               const topics = typeof candidate.technical_topics === 'string' 
                 ? JSON.parse(candidate.technical_topics) 
                 : candidate.technical_topics;
               const languages = typeof candidate.top_languages === 'string'
                 ? JSON.parse(candidate.top_languages)
                 : candidate.top_languages;
               
               skills = [...(Array.isArray(topics) ? topics : []), ...(Array.isArray(languages) ? languages : [])];
             } catch (e) {
               skills = [];
             }

             // If no skills found, use source_keyword as a fallback badge
             if (skills.length === 0 && candidate.source_keyword) {
               skills = [candidate.source_keyword];
             }

             const stats: CandidateStat[] = [
                { label: 'Stars', value: candidate.total_stars || 0, icon: Star },
                { label: 'Repos', value: candidate.public_repos || 0, icon: Briefcase },
                { label: 'Location', value: candidate.location || 'Remote', icon: MapPin },
             ];

             return (
               <CandidateCard
                 key={candidate.id}
                 name={candidate.name || candidate.username}
                 username={candidate.username}
                 avatarUrl={candidate.avatar_url}
                 bio={candidate.bio}
                 email={candidate.email}
                 skills={skills}
                 stats={stats}
                 onHire={() => console.log('Hire', candidate.id)}
                 onViewProfile={() => openProfile(candidate)}
                 searchId={message.searchId}
               />
             );
          })}
        </ScrollView>
      </>
      )}
    </Animated.View>
  );
}
