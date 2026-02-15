import React, { useState } from 'react';
import { View, TouchableOpacity, Linking, Dimensions, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import { Image } from 'expo-image';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { 
  Briefcase, MapPin, Star, Layers, Clock, 
  ExternalLink, ChevronRight, Github, Twitter, Linkedin, 
  Users, X, User 
} from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { cn } from '@/lib/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export function ProfileDrawer({ isOpen, onClose, profile }: ProfileDrawerProps) {
  const insets = useSafeAreaInsets();
  const [showAllTopics, setShowAllTopics] = useState(false);

  if (!profile) return null;

  // Normalization logic
  const isFlat = profile && !profile.user;
  const user = isFlat ? profile : (profile?.user || {});
  const repos = isFlat ? (profile?.full_repos || []) : (profile?.repos || []);
  let readme = isFlat ? (profile?.readme_text || "") : (profile?.readme || "");
  const meta = isFlat ? { 
    source_keyword: profile?.source_keyword, 
    crawled_at: profile?.scraped_at 
  } : (profile?.meta || {});

  const handle = user.username || user.login || "user";
  const displayName = user.name || handle;
  const avatarUri = user.avatar_url || `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(handle)}`;

  // Pre-process README (Simplified for native)
  if (readme && handle !== "user") {
    const rawBase = `https://raw.githubusercontent.com/${handle}/${handle}/master`;
    readme = readme.replace(/!\[([^\]]*)\]\((?!(?:https?|data):|\/)([^)]+)\)/g, (match: string, alt: string, src: string) => {
      return `![${alt}](${rawBase}/${src})`;
    });
  }

  const totalStars = isFlat ? (profile?.total_stars || 0) : repos.reduce((acc: number, r: any) => acc + (r.stargazers_count || 0), 0);
  const languages = isFlat 
    ? (profile?.top_languages && profile.top_languages.length > 0 ? profile.top_languages : (meta.source_keyword ? [meta.source_keyword] : []))
    : Array.from(new Set(repos.map((r: any) => r.language).filter(Boolean))).slice(0, 5);
  const topics = isFlat ? (profile?.technical_topics || []) : Array.from(new Set(repos.flatMap((r: any) => r.topics || []).filter(Boolean))).slice(0, 10);
  const createdDate = isFlat ? profile?.gh_created_at : user.created_at;
  const yearsOfExperience = createdDate ? new Date().getFullYear() - new Date(createdDate).getFullYear() : 0;

  const socials = [
    profile?.linkedin_url && { provider: 'linkedin', url: profile.linkedin_url },
    profile?.twitter_url && { provider: 'twitter', url: profile.twitter_url },
    profile?.portfolio_url && { provider: 'portfolio', url: profile.portfolio_url },
  ].filter(Boolean);

  const getSocialIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "linkedin": return <Linkedin size={18} color="#64748b" />;
      case "twitter": return <Twitter size={18} color="#64748b" />;
      case "github": return <Github size={18} color="#64748b" />;
      default: return <ExternalLink size={18} color="#64748b" />;
    }
  };

  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={onClose}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      style={{ margin: 0 }}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View 
          style={{ width: SCREEN_WIDTH * 0.9, height: '100%', marginLeft: SCREEN_WIDTH * 0.1, paddingTop: insets.top }}
          className="bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800"
        >
          {/* Header Area */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 z-10">
            <Typography variant="h4" className="text-lg font-black uppercase tracking-tight">Technical Artifact</Typography>
            <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-900">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            scrollEventThrottle={16}
            bounces={true}
            overScrollMode="always"
            alwaysBounceVertical={true}
          >
            {/* Hero Section */}
            <View className="p-8 items-center bg-slate-50/30 dark:bg-slate-900/20">
                <View className="relative mb-6">
                <View className="h-32 w-32 rounded-[3rem] shadow-2xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 items-center justify-center overflow-hidden">
                  <Image 
                    source={avatarUri} 
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={300}
                  />
                </View>
              </View>
              
              <View className="items-center">
                <Typography className="text-2xl font-black tracking-tight text-center mb-1">{displayName}</Typography>
                <Typography className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-[0.15em] text-[11px] text-center mb-4">
                  @{handle}
                </Typography>
                
                <Typography className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-5 text-center px-4">
                  {user.bio || "Technical profile active in ecosystem development and professional open-source artifact maintenance."}
                </Typography>

                <View className="flex-row flex-wrap justify-center gap-5 mt-6">
                  {user.location && (
                    <View className="flex-row items-center gap-1.5">
                      <MapPin size={14} color="#94a3b8" />
                      <Typography className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{user.location}</Typography>
                    </View>
                  )}
                  {user.company && (
                    <View className="flex-row items-center gap-1.5">
                      <Briefcase size={14} color="#94a3b8" />
                      <Typography className="text-xs font-bold text-slate-400 uppercase tracking-tighter" numberOfLines={1}>{user.company}</Typography>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View className="p-6 space-y-12">
              {/* STATS SECTION */}
              <View>
                <Typography className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">Technical Impact</Typography>
                <View className="flex-row flex-wrap gap-3">
                  {[
                    { label: "Stars", value: totalStars, icon: Star, color: "#eab308" },
                    { label: "Repos", value: user.public_repos, icon: Layers, color: "#a855f7" },
                    { label: "Followers", value: user.followers, icon: Users, color: "#3b82f6" },
                    { label: "Experience", value: `${yearsOfExperience}y`, icon: Clock, color: "#06b6d4" },
                  ].map((stat, i) => (
                    <View key={i} className="p-4 rounded-3xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 items-center justify-center grow basis-[45%] shadow-sm">
                      <stat.icon size={20} color={stat.color} />
                      <Typography className="text-xl font-black mt-2 text-slate-900 dark:text-white">{stat.value?.toLocaleString() || 0}</Typography>
                      <Typography className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{stat.label}</Typography>
                    </View>
                  ))}
                </View>
              </View>

              {/* CORE STACK */}
              <View>
                <Typography className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">Core Stack</Typography>
                <View className="flex-row flex-wrap gap-2">
                  {languages.map((lang: any, i: number) => (
                    <Badge key={i} label={String(lang)} className="bg-slate-900 dark:bg-white px-3 py-1.5 rounded-xl" textClassName="text-white dark:text-slate-950" />
                  ))}
                </View>
                <View className="flex-row flex-wrap gap-2 mt-4">
                  {(showAllTopics ? topics : topics.slice(0, 10)).map((topic: any, i: number) => (
                    <View key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                      <Typography className="text-slate-500 dark:text-slate-400 font-bold text-[9px] uppercase">#{String(topic)}</Typography>
                    </View>
                  ))}
                  {topics.length > 10 && (
                    <TouchableOpacity onPress={() => setShowAllTopics(!showAllTopics)}>
                      <Typography className="text-blue-500 font-black text-[10px] pt-1">
                        {showAllTopics ? "Show less" : `+${topics.length - 10} more`}
                      </Typography>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* PROJECT SPOTLIGHT */}
              <View>
                <Typography className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">Project Spotlight</Typography>
                <View className="space-y-4">
                  {repos
                    .sort((a: any, b: any) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
                    .slice(0, 3)
                    .map((repo: any) => (
                      <TouchableOpacity 
                        key={repo.id} 
                        onPress={() => repo.html_url && Linking.openURL(repo.html_url)}
                        className="p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm"
                      >
                        <View className="flex-row justify-between items-start mb-2">
                          <Typography className="text-base font-black text-blue-500 flex-1 mr-2" numberOfLines={1}>
                            {repo.name}
                          </Typography>
                          <View className="flex-row items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full">
                            <Star size={10} color="#eab308" fill="#eab308" />
                            <Typography className="text-yellow-700 dark:text-yellow-400 font-black text-[10px]">{repo.stargazers_count}</Typography>
                          </View>
                        </View>
                        <Typography className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-4 mb-4" numberOfLines={3}>
                          {repo.description || "No project description provided."}
                        </Typography>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row gap-2">
                            {repo.language && (
                              <Badge variant="outline" label={repo.language} className="px-2 py-0.5 rounded-lg border-slate-200 dark:border-slate-800" textClassName="text-[8px] text-slate-500" />
                            )}
                          </View>
                          <Typography className="text-[8px] font-bold text-slate-400 uppercase">
                            Push: {new Date(repo.pushed_at).toLocaleDateString()}
                          </Typography>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>

              {/* README SECTION */}
              {readme ? (
                <View>
                  <Typography className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">Artifact Breakdown</Typography>
                  <View className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <Markdown
                      rules={{
                        image: (node, children, parent, styles) => {
                          const { src, alt } = node.attributes;
                          return (
                            <Image
                              key={node.key}
                              source={{ uri: src }}
                              style={{ width: '100%', height: 200, borderRadius: 12, marginVertical: 10 }}
                              contentFit="contain"
                            />
                          );
                        },
                      }}
                      style={{
                        body: { color: '#64748b', fontSize: 13, lineHeight: 20 },
                        heading1: { color: '#0f172a', fontWeight: '900', fontSize: 20, marginBottom: 12 },
                        heading2: { color: '#0f172a', fontWeight: '800', fontSize: 18, marginTop: 16, marginBottom: 10 },
                        link: { color: '#3b82f6', fontWeight: 'bold' },
                        code_inline: { backgroundColor: '#f1f5f9', paddingHorizontal: 4, borderRadius: 4, color: '#e11d48' },
                        fence: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginVertical: 12, borderWidth: 1, borderColor: '#f1f5f9' },
                        image: { borderRadius: 12, marginVertical: 10 },
                      }}
                    >
                      {readme}
                    </Markdown>
                  </View>
                </View>
              ) : null}

              {/* SOCIALS */}
              {socials.length > 0 && (
                <View className="mb-10">
                  <Typography className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">External Links</Typography>
                  <View className="flex-row flex-wrap gap-3">
                    {socials.map((social: any, i: number) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => Linking.openURL(social.url)}
                        className="flex-row items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 grow basis-[45%]"
                      >
                        {getSocialIcon(social.provider)}
                        <Typography className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300">{social.provider}</Typography>
                        <View className="flex-1 items-end">
                          <ChevronRight size={14} color="#cbd5e1" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}