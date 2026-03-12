import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { groupsAPI } from '../services/api';
import { useUser } from '../store';

export default function GroupScreen({ route, navigation }: any) {
  const { groupId } = route.params;
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const flatListRef = useRef<any>(null);
  const user = useUser();

  const loadGroup = async () => {
    try {
      const res = await groupsAPI.getById(groupId);
      setGroup(res.data);
      const member = res.data.members?.some((m: any) => m.user.id === user?.id);
      setIsMember(member);
    } catch (e) {
      Alert.alert('错误', '无法加载群组');
    }
  };

  const loadMessages = async () => {
    try {
      const res = await groupsAPI.getMessages(groupId);
      setMessages(res.data);
    } catch (e) {
      console.log('无法加载消息');
    }
  };

  const handleJoin = async () => {
    try {
      const res = await groupsAPI.join(groupId);
      setIsMember(res.data.joined);
      loadGroup();
    } catch (e) {
      Alert.alert('错误', '操作失败');
    }
  };

  const handleSend = async () => {
    if (!content) return;
    setLoading(true);
    try {
      await groupsAPI.sendMessage(groupId, content);
      setContent('');
      loadMessages();
    } catch (e) {
      Alert.alert('错误', '发送失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
    loadMessages();
    
    // every 3s refresh
    const interval = setInterval(() => {
        loadMessages();
    }, 3000);

    return () => clearInterval(interval);
    }, []);

  if (!group) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

  return (
    <View style={styles.container}>
      {/* 群组头部 */}
      <View style={styles.groupHeader}>
        <View style={styles.groupAvatar}>
          <Text style={styles.groupAvatarText}>
            {group.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupCategory}>{group.category}</Text>
          <Text style={styles.groupLocation}>📍 {group.location}</Text>
          <Text style={styles.groupMembers}>👥 {group._count?.members || 0} 位成员</Text>
        </View>
        <TouchableOpacity
          style={[styles.joinButton, isMember && styles.leaveButton]}
          onPress={handleJoin}
        >
          <Text style={[styles.joinButtonText, isMember && styles.leaveButtonText]}>
            {isMember ? '退出' : '+ 加入'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 消息列表 */}
      {isMember ? (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            style={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>暂无消息，来发第一条消息吧！</Text>
            }
            renderItem={({ item }) => {
              const isMe = item.author.id === user?.id;
              return (
                <View style={[styles.messageRow, isMe && styles.myMessageRow]}>
                  {!isMe && (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {item.author.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.messageBubble, isMe && styles.myMessageBubble]}>
                    {!isMe && (
                      <Text style={styles.messageAuthor}>{item.author.username}</Text>
                    )}
                    <Text style={[styles.messageContent, isMe && styles.myMessageContent]}>
                      {item.content}
                    </Text>
                    <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              );
            }}
          />

          {/* 输入框 */}
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
        </>
      ) : (
        <View style={styles.joinPrompt}>
          <Text style={styles.joinPromptText}>加入群组后才能查看和发送消息</Text>
          <TouchableOpacity style={styles.joinPromptButton} onPress={handleJoin}>
            <Text style={styles.joinPromptButtonText}>+ 加入群组</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  groupHeader: {
    backgroundColor: '#fff', padding: 16, flexDirection: 'row',
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  groupAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#f3f0f8', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#6B21A8',
  },
  groupAvatarText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 22 },
  groupInfo: { flex: 1, marginLeft: 12 },
  groupName: { fontWeight: 'bold', color: '#333', fontSize: 16 },
  groupCategory: { color: '#F97316', fontSize: 12, marginTop: 2 },
  groupLocation: { color: '#888', fontSize: 12, marginTop: 2 },
  groupMembers: { color: '#6B21A8', fontSize: 12, marginTop: 2 },
  joinButton: {
    backgroundColor: '#f3f0f8', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#6B21A8',
  },
  leaveButton: { borderColor: '#ff4444', backgroundColor: '#fff0f0' },
  joinButtonText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 13 },
  leaveButtonText: { color: '#ff4444' },
  messageList: { flex: 1, padding: 12 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 32, fontSize: 14 },
  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  myMessageRow: { flexDirection: 'row-reverse' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  messageBubble: {
    backgroundColor: '#fff', borderRadius: 16, padding: 10,
    maxWidth: '70%', borderBottomLeftRadius: 4,
  },
  myMessageBubble: {
    backgroundColor: '#6B21A8', borderBottomLeftRadius: 16, borderBottomRightRadius: 4,
  },
  messageAuthor: { color: '#F97316', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  messageContent: { color: '#333', fontSize: 14 },
  myMessageContent: { color: '#fff' },
  messageTime: { color: '#aaa', fontSize: 10, marginTop: 4, textAlign: 'right' },
  myMessageTime: { color: '#ddd' },
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
  joinPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  joinPromptText: { color: '#888', fontSize: 15, marginBottom: 16 },
  joinPromptButton: {
    backgroundColor: '#6B21A8', borderRadius: 24,
    paddingVertical: 12, paddingHorizontal: 32,
  },
  joinPromptButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});