import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { notificationsAPI } from '../services/api';

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

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      loadNotifications();
    } catch (e) {
      console.log('Failed to mark read');
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

  return (
    <View style={styles.container}>
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