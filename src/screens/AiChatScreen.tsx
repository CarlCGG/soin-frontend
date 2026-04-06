import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { aiAPI, usersAPI, connectionsAPI, api } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const QUICK_ACTIONS = [
  { id: '1', label: '👥 Find people with similar interests', type: 'similar_users' },
  { id: '2', label: '✍️ Help me write a post', type: 'chat', text: 'Help me write an engaging post for my social network.' },
  { id: '3', label: '💡 Suggest topics to talk about', type: 'chat', text: 'Based on my interests and profile, suggest some interesting topics I can post about.' },
  { id: '4', label: '🎯 How to grow my connections?', type: 'chat', text: 'Give me tips on how to grow my connections on a social network.' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  header: { backgroundColor: '#6B21A8', padding: 16, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#ddd', fontSize: 12, marginTop: 4 },
  messageList: { flex: 1, padding: 12 },
  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  myMessageRow: { flexDirection: 'row-reverse' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center',
    marginRight: 8,
  },
  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  bubble: {
    backgroundColor: '#fff', borderRadius: 16, padding: 12,
    maxWidth: '75%', borderBottomLeftRadius: 4,
  },
  myBubble: {
    backgroundColor: '#6B21A8', borderBottomLeftRadius: 16, borderBottomRightRadius: 4,
  },
  messageText: { color: '#333', fontSize: 14, lineHeight: 20 },
  myMessageText: { color: '#fff' },
  timeText: { color: '#aaa', fontSize: 10, marginTop: 4 },
  myTimeText: { color: '#ddd' },
  inputBox: {
    flexDirection: 'row', padding: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center', gap: 8,
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#F97316', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 16,
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  welcomeBox: {
    backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0',
  },
  welcomeEmoji: { fontSize: 40, marginBottom: 8 },
  welcomeTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  welcomeText: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 16 },
  quickActionsRow: { width: '100%', gap: 8 },
  quickAction: {
    backgroundColor: '#f3f0f8', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#ddd',
  },
  quickActionText: { color: '#333', fontSize: 13, fontWeight: '600' },
  userCard: {
    backgroundColor: '#f3f0f8', borderRadius: 12, padding: 10,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
  },
  userCardAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  userCardAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  userCardInfo: { flex: 1 },
  userCardName: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  userCardTags: { color: '#888', fontSize: 11, marginTop: 2 },
});

type Message = {
  role: string;
  content: string;
  time: string;
  users?: any[];
  showActions?: boolean;
};

export default function AiChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const flatListRef = useRef<any>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    api.get('/users/profile').then(res => setUserProfile(res.data)).catch(() => {});
  }, []);

  const getSystemContext = () => {
    if (!userProfile) return 'You are a helpful AI assistant for SOIN social platform. Always respond in English in a friendly and helpful manner.';
    return `You are a helpful AI assistant for SOIN social platform. The user's name is ${userProfile.username}${userProfile.bio ? `, their bio is: ${userProfile.bio}` : ''}${userProfile.tags ? `, their interests are: ${userProfile.tags}` : ''}${userProfile.location ? `, they are based in ${userProfile.location}` : ''}. Use this information to personalize your responses. Always respond in English in a friendly and helpful manner.`;
  };

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text) return;
    const userMessage: Message = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        getSystemContext()
      );
      setMessages([...newMessages, {
        role: 'assistant',
        content: res.data.content,
        time: new Date().toLocaleTimeString(),
        showActions: true,
      }]);
    } catch (e) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        time: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const handleSimilarUsers = async () => {
    const userMessage: Message = {
      role: 'user',
      content: '👥 Find people with similar interests',
      time: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await usersAPI.getSimilarUsers();
      if (!res.data.hasTags) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "You haven't added any interests yet! Go to your profile → Edit Profile → My Interests to add some tags, then I can find people with similar interests for you! 🎯",
          time: new Date().toLocaleTimeString(),
          showActions: true,
        }]);
      } else if (res.data.users.length === 0) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I couldn't find anyone with similar interests yet. Try adding more interests in your profile, or invite friends to join SOIN! 🌟",
          time: new Date().toLocaleTimeString(),
          showActions: true,
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I found ${res.data.users.length} people with similar interests to you! Here they are:`,
          time: new Date().toLocaleTimeString(),
          users: res.data.users.slice(0, 5),
          showActions: true,
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        time: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const handleQuickAction = async (action: any) => {
    if (action.type === 'similar_users') {
      handleSimilarUsers();
    } else {
      if (!userProfile) {
        try {
          const res = await api.get('/users/profile');
          setUserProfile(res.data);
        } catch (e) {}
      }
      handleSend(action.text);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 SOIN AI Assistant</Text>
        <Text style={styles.headerSubtitle}>Powered by Gemini AI</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        style={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListHeaderComponent={
          messages.length === 0 ? (
            <View style={styles.welcomeBox}>
              <Text style={styles.welcomeEmoji}>🤖</Text>
              <Text style={styles.welcomeTitle}>Hello! I'm your SOIN AI Assistant</Text>
              <Text style={styles.welcomeText}>
                Ask me anything or choose a quick action below!
              </Text>
              <View style={styles.quickActionsRow}>
                {QUICK_ACTIONS.map(action => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.quickAction}
                    onPress={() => handleQuickAction(action)}
                  >
                    <Text style={styles.quickActionText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const isMe = item.role === 'user';
          return (
            <View style={[styles.messageRow, isMe && styles.myMessageRow]}>
              {!isMe && (
                <View style={styles.aiAvatar}>
                  <Text style={styles.avatarText}>AI</Text>
                </View>
              )}
              <View style={{ maxWidth: '75%' }}>
                <View style={[styles.bubble, isMe && styles.myBubble]}>
                  <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.timeText, isMe && styles.myTimeText]}>
                    {item.time}
                  </Text>
                </View>
                {item.users && item.users.map((u: any) => (
                  <TouchableOpacity
                    key={u.id}
                    style={styles.userCard}
                    onPress={() => navigation.navigate('UserProfile', { userId: u.id })}
                  >
                    {u.avatar ? (
                      <Image source={{ uri: u.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                    ) : (
                      <View style={styles.userCardAvatar}>
                        <Text style={styles.userCardAvatarText}>{u.username.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={styles.userCardInfo}>
                      <Text style={styles.userCardName}>{u.username}</Text>
                      {u.tags && <Text style={styles.userCardTags}>🏷️ {u.tags}</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
                {item.showActions && (
                  <View style={{ marginTop: 8, gap: 6 }}>
                    {QUICK_ACTIONS.map(action => (
                      <TouchableOpacity
                        key={action.id}
                        style={[styles.quickAction, { backgroundColor: '#fff' }]}
                        onPress={() => handleQuickAction(action)}
                      >
                        <Text style={styles.quickActionText}>{action.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      {loading && (
        <View style={{ padding: 12, alignItems: 'flex-start' }}>
          <View style={styles.bubble}>
            <ActivityIndicator color="#6B21A8" size="small" />
          </View>
        </View>
      )}

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()} disabled={loading}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}