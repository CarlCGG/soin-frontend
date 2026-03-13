import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Alert, Image
} from 'react-native';
import { api, postsAPI } from '../services/api';
import { useUser } from '../store';
import { useNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  cover: { height: 120, backgroundColor: '#6B21A8' },
  avatarContainer: { alignItems: 'center', marginTop: -40 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 32 },
  username: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 8 },
  handle: { fontSize: 14, color: '#888', marginTop: 2 },
  bio: { fontSize: 14, color: '#555', marginTop: 8, textAlign: 'center', paddingHorizontal: 32 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 16 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#6B21A8' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  editButton: {
    backgroundColor: '#F97316', borderRadius: 24,
    paddingVertical: 10, paddingHorizontal: 32, marginTop: 16,
  },
  editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  editBox: {
    backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16,
  },
  editTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  editInput: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 12,
    padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top',
  },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  saveButton: {
    flex: 1, backgroundColor: '#6B21A8', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: {
    flex: 1, backgroundColor: '#f3f0f8', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd',
  },
  cancelButtonText: { color: '#666', fontWeight: 'bold' },
  postsSection: { margin: 16 },
  postsSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  post: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  postContent: { fontSize: 14, color: '#333', lineHeight: 20 },
  postImage: { width: '100%', height: 150, borderRadius: 12, marginTop: 8 },
  postActions: {
    flexDirection: 'row', marginTop: 10,
    borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8, gap: 16,
  },
  postActionText: { color: '#888', fontSize: 12 },
  postTime: { fontSize: 11, color: '#aaa', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 16 },
  logoutButton: {
    backgroundColor: '#fff', borderRadius: 12, margin: 16,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#ff4444',
  },
  logoutButtonText: { color: '#ff4444', fontWeight: 'bold', fontSize: 15 },
});

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const user = useUser();
  const navigation = useNavigation<any>();

 const loadProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Token:', token);
      const res = await api.get('/users/profile');
      console.log('Profile data:', res.data);
      setProfile(res.data);
      setBio(res.data.bio || '');
    } catch (e: any) {
      console.log('Profile error:', e?.response?.status, e?.response?.data, e?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/users/profile', { bio });
      setEditing(false);
      loadProfile();
      Alert.alert('成功', '个人资料已更新！');
    } catch (e) {
      Alert.alert('错误', '更新失败');
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await postsAPI.delete(postId);
      loadProfile();
    } catch (e) {
      Alert.alert('错误', '删除失败');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

  return (
    <ScrollView style={styles.container}>
      {/* 封面 */}
      <View style={styles.cover} />

      {/* 头像 */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.username?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.username}>{profile?.username}</Text>
        <Text style={styles.handle}>@{profile?.username}</Text>
        <Text style={styles.bio}>
          {profile?.bio || 'No bio yet. Click Edit Profile to add one!'}
        </Text>

        {/* 统计数据 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?._count?.posts || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?.groupCount || 0}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Business</Text>
          </View>
        </View>

        {/* 编辑按钮 */}
        <TouchableOpacity style={styles.editButton} onPress={() => setEditing(!editing)}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* 编辑框 */}
      {editing && (
        <View style={styles.editBox}>
          <Text style={styles.editTitle}>Edit Bio</Text>
          <TextInput
            style={styles.editInput}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about yourself..."
            multiline
          />
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 帖子列表 */}
      <View style={styles.postsSection}>
        <Text style={styles.postsSectionTitle}>My Posts ({profile?._count?.posts || 0})</Text>
        {profile?.posts?.length === 0 && (
          <Text style={styles.emptyText}>No posts yet. Share something!</Text>
        )}
        {profile?.posts?.map((post: any) => (
          <View key={post.id} style={styles.post}>
            <Text style={styles.postContent}>{post.content}</Text>
            {post.imageUrl && (
              <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
            )}
            <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleString()}</Text>
            <View style={styles.postActions}>
              <Text style={styles.postActionText}>👍 {post.likes?.length || 0}</Text>
              <Text style={styles.postActionText}>💬 {post._count?.comments || 0}</Text>
              <TouchableOpacity onPress={() => handleDelete(post.id)}>
                <Text style={[styles.postActionText, { color: '#ff4444' }]}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* 退出登录 */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}