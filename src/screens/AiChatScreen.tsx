import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { aiAPI } from '../services/api';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  header: {
    backgroundColor: '#6B21A8', padding: 16, alignItems: 'center',
  },
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
  welcomeText: { fontSize: 13, color: '#888', textAlign: 'center' },
});

export default function AiChatScreen() {
  const [messages, setMessages] = useState<{ role: string; content: string; time: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<any>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = {
      role: 'user',
      content: input.trim(),
      time: new Date().toLocaleTimeString(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(
        newMessages.map(m => ({ role: m.role, content: m.content }))
      );
      const aiMessage = {
        role: 'assistant',
        content: res.data.content,
        time: new Date().toLocaleTimeString(),
      };
      setMessages([...newMessages, aiMessage]);
    } catch (e) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        time: new Date().toLocaleTimeString(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
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
                Ask me anything! I can help you write posts, suggest comments, answer questions, and more.
              </Text>
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
              <View style={[styles.bubble, isMe && styles.myBubble]}>
                <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                  {item.content}
                </Text>
                <Text style={[styles.timeText, isMe && styles.myTimeText]}>
                  {item.time}
                </Text>
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
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}