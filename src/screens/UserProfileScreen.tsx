import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { api, connectionsAPI } from '../services/api';
import { useRoute } from '@react-navigation/native';
import { useUser } from '../store';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  cover: { height: 140, backgroundColor: '#6B21A8' },
  avatarContainer: { alignItems: 'center', marginTop: -48 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  avatarImage: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#fff' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 36 },
  username: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 10 },
  handle: { fontSize: 14, color: '#888', marginTop: 2 },
  bio: { fontSize: 14, color: '#555', marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 14 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#6B21A8' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  connectButton: {
    borderRadius: 24, paddingVertical: 10, paddingHorizontal: 32, marginTop: 14,
  },
  connectButtonText: { fontWeight: 'bold', fontSize: 15 },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16,
    marginBottom: 12, marginTop: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#333', fontWeight: '600', width: 120 },
  infoValue: { fontSize: 14, color: '#555', flex: 1 },
  post: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  postContent: { fontSize: 14, color: '#333', lineHeight: 20 },
  postImage: { width: '100%', height: 150, borderRadius: 12, marginTop: 8 },
  postTime: { fontSize: 11, color: '#aaa', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 16, fontSize: 14 },
});

export default function UserProfileScreen() {
  const route = useRoute<any>();
  const { userId } = route.params;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connStatus, setConnStatus] = useState('none');
  const currentUser = useUser();

  const loadProfile = async () => {
    try {
      const res = await api.get(`/users/profile/${userId}`);
      setProfile(res.data);
    } catch (e) {
      console.log('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

 const loadConnStatus = async () => {
  try {
    const res = await connectionsAPI.getStatus(userId);
    setConnStatus(typeof res.data === 'string' ? res.data : res.data.status || 'none');
  } catch (e) {}
};

  const handleConnect = async () => {
    try {
      await connectionsAPI.sendRequest(userId);
      setConnStatus('pending');
      Alert.alert('Sent', 'Connection request sent!');
    } catch (e) {
      Alert.alert('Error', 'Could not send request');
    }
  };

  useEffect(() => {
    loadProfile();
    loadConnStatus();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

    const handleRemove = async () => {
    Alert.alert('Remove Connection', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
        text: 'Remove', style: 'destructive', onPress: async () => {
            try {
            await connectionsAPI.remove(userId);
            setConnStatus('none');
            } catch (e) {
            Alert.alert('Error', 'Failed to remove connection');
            }
        }
        }
    ]);
    };

    const getConnButton = () => {
    if (connStatus === 'accepted') return { label: '+ Connect', bg: '#F97316', disabled: false };
    if (connStatus === 'pending') return { label: '⏳ Pending', bg: '#888', disabled: true };
    return { label: '+ Connect', bg: '#F97316', disabled: false };
    };

    const btn = getConnButton();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cover} />
      <View style={styles.avatarContainer}>
        {profile?.avatar ? (
          <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.username?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
        )}
        <Text style={styles.username}>{profile?.username}</Text>
        <Text style={styles.handle}>@{profile?.username}</Text>
        {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?._count?.posts || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?.groupCount || 0}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
        </View>
        {String(userId) !== String(currentUser?.id) && (
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <TouchableOpacity
        style={[styles.connectButton, { backgroundColor: btn.bg }]}
        onPress={handleConnect}
        disabled={btn.disabled}
        >
        <Text style={[styles.connectButtonText, { color: '#fff' }]}>{btn.label}</Text>
        </TouchableOpacity>
        {connStatus === 'accepted' && (
        <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: '#ff4444' }]}
            onPress={handleRemove}
        >
            <Text style={[styles.connectButtonText, { color: '#fff' }]}>Remove</Text>
        </TouchableOpacity>
        )}
    </View>
    )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue}>{profile?.location || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gender:</Text>
          <Text style={styles.infoValue}>{profile?.gender || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Joined:</Text>
          <Text style={styles.infoValue}>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</Text>
        </View>
      </View>

      <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>
          Posts ({profile?._count?.posts || 0})
        </Text>
        {profile?.posts?.length === 0 && <Text style={styles.emptyText}>No posts yet.</Text>}
        {profile?.posts?.map((post: any) => (
          <View key={post.id} style={styles.post}>
            <Text style={styles.postContent}>{post.content}</Text>
            {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />}
            <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}