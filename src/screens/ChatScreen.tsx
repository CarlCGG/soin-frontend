import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { messagesAPI } from '../services/api';
import { useUser } from '../store';

export default function ChatScreen({ route }: any) {
  const { userId, username } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<any>(null);
  const user = useUser();

  const loadMessages = async () => {
    try {
      const res = await messagesAPI.getConversation(userId);
      setMessages(res.data);
    } catch (e) {
      console.log('无法加载消息');
    }
  };

  const handleSend = async () => {
    if (!content) return;
    setLoading(true);
    try {
      await messagesAPI.send(userId, content);
      setContent('');
      loadMessages();
    } catch (e) {
      console.log('发送失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>暂无消息，来打个招呼吧！</Text>
        }
        renderItem={({ item }) => {
          const isMe = item.sender.id === user?.id;
          return (
            <View style={[styles.messageRow, isMe && styles.myMessageRow]}>
              {!isMe && (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.sender.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={[styles.bubble, isMe && styles.myBubble]}>
                <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                  {item.content}
                </Text>
                <Text style={[styles.timeText, isMe && styles.myTimeText]}>
                  {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="发送消息..."
          value={content}
          onChangeText={setContent}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.sendButtonText}>发送</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  messageList: { flex: 1, padding: 12 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 32 },
  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  myMessageRow: { flexDirection: 'row-reverse' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  bubble: {
    backgroundColor: '#fff', borderRadius: 16, padding: 10,
    maxWidth: '70%', borderBottomLeftRadius: 4,
  },
  myBubble: {
    backgroundColor: '#6B21A8', borderBottomLeftRadius: 16, borderBottomRightRadius: 4,
  },
  messageText: { color: '#333', fontSize: 14 },
  myMessageText: { color: '#fff' },
  timeText: { color: '#aaa', fontSize: 10, marginTop: 4, textAlign: 'right' },
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
});