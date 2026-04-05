import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { messagesAPI } from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  const loadData = async () => {
    try {
      const [convRes, usersRes] = await Promise.all([
        messagesAPI.getConversationList(),
        messagesAPI.getAllUsers(),
      ]);
      setConversations(convRes.data);
      setUsers(usersRes.data);
    } catch (e) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => { loadData(); }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Users</Text>
        <FlatList
          horizontal
          data={users}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => navigation.navigate('Chat', { userId: item.id, username: item.username })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <Text style={styles.sectionTitle2}>Recent Conversations</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.user.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No conversations yet. Tap a user above to start chatting!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => navigation.navigate('Chat', { userId: item.user.id, username: item.user.username })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.user.username.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.conversationInfo}>
              <Text style={styles.conversationName}>{item.user.username}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  sectionTitle2: { fontSize: 15, fontWeight: 'bold', color: '#333', margin: 16, marginBottom: 8 },
  userItem: { alignItems: 'center', marginRight: 16 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center',
    marginBottom: 6,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  username: { fontSize: 12, color: '#333', textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 32 },
  conversationItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 8, marginBottom: 6, borderRadius: 12, padding: 12,
  },
  conversationInfo: { flex: 1, marginLeft: 12 },
  conversationName: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  lastMessage: { color: '#aaa', fontSize: 13, marginTop: 2 },
  time: { color: '#aaa', fontSize: 11 },
});