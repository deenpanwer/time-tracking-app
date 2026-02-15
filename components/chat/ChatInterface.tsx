import { Typography } from '@/components/ui/Typography';
import { useAuthStore } from '@/stores/use-auth-store';
import { Code, Megaphone, Palette, Search } from 'lucide-react-native';
import React, { useCallback, useState, useEffect } from 'react';
import { Keyboard, Pressable, TouchableOpacity, View } from 'react-native';
import { GiftedChat, IMessage, MessageProps } from 'react-native-gifted-chat';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { ChatInput } from './ChatInput';
import { MessageItem } from './MessageItem';
import { fetchProfiles, CandidateProfile, saveSearch, generateScannedCount, logInteraction, supabase } from '@/lib/supabase';
import { ProfileDrawer } from './ProfileDrawer';
import { useUIStore } from '@/stores/use-ui-store';

// Extend IMessage to include candidates and search metadata
interface ExtendedMessage extends IMessage {
  candidates?: CandidateProfile[];
  searchId?: string;
  totalScanned?: number;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const { user } = useAuthStore();
  const { isProfileOpen, selectedProfile, closeProfile, currentParentId, setCurrentParentId, activeSearchId, setActiveSearchId } = useUIStore();
  const [isTyping, setIsTyping] = useState(false);
  const insets = useSafeAreaInsets();
  const keyboardHeight = useSharedValue(0);

  useEffect(() => {
    if (activeSearchId === 'new') {
      setMessages([]);
      setCurrentParentId(null);
    } else if (activeSearchId && user?.email) {
      // Load history for this session
      supabase
        .from('user_searches')
        .select('*')
        .or(`id.eq.${activeSearchId},parent_id.eq.${activeSearchId}`)
        .order('created_at', { ascending: true })
        .then(async ({ data, error }) => {
          if (error) {
            console.error('Error loading session history:', error);
            return;
          }
          if (data) {
            const historyMessages: ExtendedMessage[] = [];
            for (const search of data) {
              // User message
              historyMessages.push({
                _id: `user_${search.id}`,
                text: search.original_query,
                createdAt: new Date(search.created_at),
                user: { _id: 1, name: user.name || 'Anonymous' },
              });

              // Assistant message
              // We need to fetch profiles for result_ids if they aren't stored fully
              // For now, let's assume we can reconstruct basic assistant message
              // In a real app, you might store more info in the DB or fetch profiles here
              let candidates: CandidateProfile[] = [];
              if (search.result_ids && search.result_ids.length > 0) {
                const { data: profileData } = await supabase
                  .from('profiles') // Assuming profiles table exists, or use RPC if needed
                  .select('*')
                  .in('id', search.result_ids);
                
                if (profileData) {
                  candidates = profileData.map(p => ({
                    ...p,
                    name: p.name || p.login || 'Unknown',
                    username: p.login || p.username || 'unknown',
                    skills: [], // You might need to parse these
                  }));
                }
              }

              historyMessages.push({
                _id: `assistant_${search.id}`,
                text: candidates.length > 0 
                  ? `I found ${candidates.length} profiles matching "${search.original_query}". Here are the top candidates:`
                  : `I couldn't find any specific profiles matching "${search.original_query}".`,
                createdAt: new Date(search.created_at),
                user: { _id: 2, name: 'Trac Assistant' },
                candidates,
                searchId: search.id,
                totalScanned: search.total_scanned,
              });
            }
            // GiftedChat expect messages in reverse order (newest first)
            setMessages(historyMessages.reverse());
          }
        });
    }
  }, [activeSearchId, user?.email]);

  /* 
    CRITICAL: Tracks keyboard height to sync the message list spacer.
  */
  useKeyboardHandler({
    onMove: (e) => {
      'worklet';
      keyboardHeight.value = e.height;
    },
    onEnd: (e) => {
      'worklet';
      keyboardHeight.value = e.height;
    },
  }, []);

  const animatedSpacerStyle = useAnimatedStyle(() => ({
    /* 
       Match ChatInput's padding + height exactly to set the baseline.
       Input height (~46) + Container padding (12 top + 20 bottom) + Buffer (12)
    */
    height: keyboardHeight.value > 0 
      ? keyboardHeight.value + 90 
      : Math.max(insets.bottom, 20) + 80,
  }));

  const pills = [
    { label: 'React Dev', icon: <Code size={18} color="#3B82F6" /> },
    { label: 'UI Designer', icon: <Palette size={18} color="#A855F7" /> },
    { label: 'Growth Hacker', icon: <Search size={18} color="#EAB308" /> },
    { label: 'Project Lead', icon: <Megaphone size={18} color="#10B981" /> },
  ];

  const handleSearch = async (queryText: string) => {
    setIsTyping(true);
    try {
      console.log('Searching for:', queryText);
      const candidates = await fetchProfiles(queryText);
      const scanned = generateScannedCount();
      
      let searchId = Math.random().toString(); // Fallback ID

      if (user?.email) {
        try {
          const resultIds = (candidates || []).map(c => c.id);
          const searchRecord = await saveSearch({
            user_email: user.email,
            original_query: queryText,
            custom_title: queryText,
            ai_plan: JSON.stringify({
              title: queryText,
              final_query: queryText
            }),
            result_ids: resultIds,
            interactions: [],
            total_scanned: scanned,
            parent_id: currentParentId || undefined,
          });
          
          searchId = searchRecord.id;
          
          // If this was the first search, set it as the parent for follow-ons
          if (!currentParentId) {
            setCurrentParentId(searchId);
          }

          // Log initial interaction (showing results)
          await logInteraction(searchId, {
            type: 'show_results',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            timestamp: new Date().toISOString()
          });
        } catch (dbError) {
          console.error('Failed to save search to DB:', dbError);
        }
      }

      const aiMsg: ExtendedMessage = {
        _id: Math.random().toString(),
        text: candidates && candidates.length > 0 
          ? `I found ${candidates.length} profiles matching "${queryText}". Here are the top candidates:`
          : `I couldn't find any specific profiles matching "${queryText}". Try different keywords.`,
        createdAt: new Date(),
        user: { _id: 2, name: 'Trac Assistant' },
        candidates: candidates || [],
        searchId: searchId,
        totalScanned: scanned,
      };

      setMessages((previousMessages) => GiftedChat.append(previousMessages, [aiMsg]));
    } catch (error) {
      console.error('Search failed:', error);
      const errorMsg: ExtendedMessage = {
        _id: Math.random().toString(),
        text: "I encountered an error searching for candidates. Please try again.",
        createdAt: new Date(),
        user: { _id: 2, name: 'Trac Assistant' },
      };
      setMessages((previousMessages) => GiftedChat.append(previousMessages, [errorMsg]));
    } finally {
      setIsTyping(false);
    }
  };

  const onSend = useCallback((newMessages: ExtendedMessage[] = [], searchQuery?: string) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    const text = searchQuery || newMessages[0].text;
    handleSearch(text);
  }, []);

  const handlePillClick = (label: string) => {
    onSend([{
      _id: Math.random().toString(),
      text: `I'm looking to hire a ${label}`,
      createdAt: new Date(),
      user: { _id: 1, name: user?.name || 'Anonymous' },
    }], label);
  };

  const renderMessage = (props: MessageProps<ExtendedMessage>) => {
    const { currentMessage } = props;
    if (!currentMessage) return <View />;
    
    /* 
       CRITICAL: DO NOT MODIFY index detection logic. 
       GiftedChat is inverted, so index 0 is the visual BOTTOM.
       This index is essential for calculating the floating baseline padding.
    */
    const index = messages.findIndex(m => m._id === currentMessage._id);
    
    return (
      <MessageItem 
        isBottom={index === 0}
        message={{
          id: currentMessage._id.toString(),
          role: currentMessage.user._id === 1 ? 'user' : 'assistant',
          content: currentMessage.text,
          senderEmail: currentMessage.user._id === 1 ? user?.email : undefined,
          candidates: currentMessage.candidates,
          searchId: currentMessage.searchId,
          totalScanned: currentMessage.totalScanned,
        }} 
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {messages.length === 0 ? (
          <Pressable 
            onPress={() => Keyboard.dismiss()}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}
          >
            <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: 'center', width: '100%' }}>
              <Typography variant="h2" className="text-center font-poppins text-3xl mb-10 leading-tight">
                wonna hire someone competent?
              </Typography>
              <View className="flex-row flex-wrap justify-center gap-3">
                {pills.map((pill, index) => (
                  <Animated.View key={index} entering={FadeInDown.delay(index * 100).springify()}>
                    <TouchableOpacity 
                      onPress={() => handlePillClick(pill.label)}
                      className="flex-row items-center bg-secondary/30 border border-border px-4 py-3 rounded-2xl"
                    >
                      <View className="mr-2">{pill.icon}</View>
                      <Typography className="font-montserrat-bold text-[13px]">{pill.label}</Typography>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
              <Animated.View entering={FadeInDown.delay(500).springify()} className="mt-10">
                <TouchableOpacity>
                  <Typography className="text-orange-500 font-montserrat-bold underline decoration-orange-500">
                    add employee
                  </Typography>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </Pressable>
        ) : (
          /* 
             CRITICAL: isKeyboardInternallyHandled MUST be false. 
             GiftedChat's internal keyboard handling conflicts with our external controller.
          */
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: 1, name: user?.name || 'Anonymous' }}
            renderMessage={renderMessage}
            renderInputToolbar={() => null} 
            minInputToolbarHeight={0}
            // @ts-ignore - Prop exists in library but type definition is missing or conflicting
            bottomOffset={0}
            messagesContainerStyle={{ 
              flex: 1,
              backgroundColor: 'transparent',
            }}
            renderChatEmpty={() => null}
            listProps={{ 
              onScrollBeginDrag: () => Keyboard.dismiss(),
              keyboardDismissMode: 'interactive',
              contentContainerStyle: { 
                flexGrow: 1,
              },
              showsVerticalScrollIndicator: false,
            }}
            isTyping={isTyping}
          />
        )}
      </View>
      <ChatInput onSend={(text) => onSend([{
        _id: Math.random().toString(),
        text,
        createdAt: new Date(),
        user: { _id: 1, name: user?.name || 'Anonymous' },
      }])} />
      
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={closeProfile} 
        profile={selectedProfile} 
      />
    </View>
  );
}