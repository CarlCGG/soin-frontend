import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { notificationsAPI, connectionsAPI } from '../services/api';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  markReadButton: { color: '#6B21A8', fontSize: 13, fontWeight: '600' },
  notification: {
    backgroundColor: '#fff', marginHorizontal: 12, marginTop: 8,
    borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center',
  },
  unread: { borderLeftWidth: 3, borderLeftColor: '#6B21A8' },
  iconBox: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  icon: { fontSize: 20 },
  notifInfo: { flex: 1 },
  message: { color: '#333', fontSize: 14, lineHeight: 20 },
  time: { color: '#aaa', fontSize: 11, marginTop: 4 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#6B21A8', marginLeft: 8,
  },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 48, fontSize: 15 },
});

const getIcon = (type: string) => {
  switch (type) {
    case 'like': return { icon: '👍', bg: '#fff8f0' };
    case 'comment': return { icon: '💬', bg: '#f0f8ff' };
    case 'group_join': return { icon: '👥', bg: '#f3f0f8' };
    default: return { icon: '🔔', bg: '#f3f0f8' };
  }
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const loadNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data);
    } catch (e) {
      console.log('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadPending = async () => {
  try {
    const res = await connectionsAPI.getPending();
    setPendingRequests(res.data);
  } catch (e) {}
};

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      loadNotifications();
    } catch (e) {
      console.log('Failed to mark read');
    }
  };

useEffect(() => { loadNotifications(); loadPending(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

  return (
    <View style={styles.container}>
      {pendingRequests.length > 0 && (
      <View style={{ backgroundColor: '#fff', marginHorizontal: 12, marginTop: 8, borderRadius: 12, padding: 14 }}>
        <Text style={{ fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
          👥 Connection Requests ({pendingRequests.length})
        </Text>
        {pendingRequests.map((req: any) => (
          <View key={req.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{req.fromUser.username.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={{ flex: 1, color: '#333', fontSize: 14 }}>{req.fromUser.username} wants to connect</Text>
            <TouchableOpacity
              onPress={async () => { await connectionsAPI.respond(req.id, true); loadPending(); }}
              style={{ backgroundColor: '#6B21A8', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, marginRight: 6 }}
            >
              <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => { await connectionsAPI.respond(req.id, false); loadPending(); }}
              style={{ backgroundColor: '#f3f0f8', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ddd' }}
            >
              <Text style={{ color: '#888', fontSize: 12 }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          🔔 Notifications ({notifications.filter(n => !n.read).length} unread)
        </Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markReadButton}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications yet</Text>}
        renderItem={({ item }) => {
          const { icon, bg } = getIcon(item.type);
          return (
            <View style={[styles.notification, !item.read && styles.unread]}>
              <View style={[styles.iconBox, { backgroundColor: bg }]}>
                <Text style={styles.icon}>{icon}</Text>
              </View>
              <View style={styles.notifInfo}>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
          );
        }}
      />
    </View>
  );
}