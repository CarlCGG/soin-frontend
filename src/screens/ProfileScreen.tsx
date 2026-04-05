import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Alert, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api, postsAPI, usersAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../store';
import { useNavigation } from '@react-navigation/native';

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
  changePhotoButton: {
    backgroundColor: '#F97316', borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 14, marginTop: 8,
  },
  changePhotoText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  username: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 10 },
  handle: { fontSize: 14, color: '#888', marginTop: 2 },
  bio: { fontSize: 14, color: '#555', marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 14 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#6B21A8' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  editButton: {
    backgroundColor: '#F97316', borderRadius: 24,
    paddingVertical: 10, paddingHorizontal: 32, marginTop: 14,
  },
  editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  completionCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  completionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  completionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  completionItems: { flex: 1, gap: 8 },
  completionItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  completionItemText: { fontSize: 13, color: '#555' },
  completionDone: { color: '#22c55e' },
  completionPending: { color: '#aaa' },
  progressCircle: { alignItems: 'center', justifyContent: 'center', width: 80, height: 80 },
  progressText: { fontSize: 20, fontWeight: 'bold', color: '#F97316' },
  progressLabel: { fontSize: 11, color: '#888' },
  tabContainer: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16,
    flexDirection: 'row', padding: 4, marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#F97316' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 12 },
  activeTabText: { color: '#fff' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#333', fontWeight: '600', width: 120 },
  infoValue: { fontSize: 14, color: '#555', flex: 1 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 16, fontSize: 14 },
  editBox: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16 },
  editTabRow: { flexDirection: 'row', marginBottom: 16, gap: 6 },
  editTab: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12,
    backgroundColor: '#f3f0f8', borderWidth: 1, borderColor: '#ddd',
  },
  editTabActive: { backgroundColor: '#F97316', borderColor: '#F97316' },
  editTabText: { color: '#666', fontWeight: '600', fontSize: 12 },
  editTabTextActive: { color: '#fff' },
  editTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: '#666', marginBottom: 4, fontWeight: '600' },
  editInput: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 12,
    padding: 12, fontSize: 14, marginBottom: 12,
  },
  editInputMulti: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 12,
    padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 12,
  },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveButton: {
    flex: 1, backgroundColor: '#F97316', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: {
    flex: 1, backgroundColor: '#f3f0f8', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd',
  },
  cancelButtonText: { color: '#666', fontWeight: 'bold' },
  post: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 8,
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
  logoutButton: {
    backgroundColor: '#fff', borderRadius: 12, margin: 16,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#ff4444',
  },
  logoutButtonText: { color: '#ff4444', fontWeight: 'bold', fontSize: 15 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: '#f3f0f8', borderWidth: 1, borderColor: '#ddd',
  },
  chipActive: { backgroundColor: '#6B21A8', borderColor: '#6B21A8' },
  chipText: { color: '#666', fontSize: 13 },
  chipTextActive: { color: '#fff' },
});

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTab, setEditTab] = useState('personal');
  const [activeTab, setActiveTab] = useState('about');
  const user = useUser();
  const navigation = useNavigation<any>();

  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editBirthYear, setEditBirthYear] = useState('');
  const [editEthnicity, setEditEthnicity] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');

  const [editPhone, setEditPhone] = useState('');
  const [editWebsite, setEditWebsite] = useState('');

  const loadProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data);
      setEditBio(res.data.bio || '');
      setEditUsername(res.data.username || '');
      setEditGender(res.data.gender || '');
      setEditLocation(res.data.location || '');
      setEditBirthYear(res.data.birthYear || '');
      setEditEthnicity(res.data.ethnicity || '');
      setEditPhone(res.data.phone || '');
      setEditWebsite(res.data.website || '');
      setAvatarUri(res.data.avatar || null);
    } catch (e: any) {
      console.log('Profile error:', e?.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      try {
        await usersAPI.updateProfile({ avatar: uri });
        loadProfile();
        Alert.alert('Success', 'Profile photo updated!');
      } catch (e) {
        Alert.alert('Error', 'Failed to update photo');
      }
    }
  };

 const handleSavePersonal = async () => {
  try {
    const payload = {
      bio: editBio, username: editUsername, gender: editGender,
      location: editLocation, birthYear: editBirthYear, ethnicity: editEthnicity,
    };
    console.log('Saving:', payload);
    await usersAPI.updateProfile(payload);
      setEditing(false);
      loadProfile();
      Alert.alert('Success', 'Profile updated!');
    } catch (e) {
      Alert.alert('Error', 'Update failed');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== verifyPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    try {
      await usersAPI.changePassword(currentPassword, newPassword);
      setEditing(false);
      setCurrentPassword('');
      setNewPassword('');
      setVerifyPassword('');
      Alert.alert('Success', 'Password changed!');
    } catch (e) {
      Alert.alert('Error', 'Current password is incorrect');
    }
  };

  const handleSaveContact = async () => {
    try {
      await usersAPI.updateProfile({ phone: editPhone, website: editWebsite });
      setEditing(false);
      loadProfile();
      Alert.alert('Success', 'Contact info updated!');
    } catch (e) {
      Alert.alert('Error', 'Update failed');
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await postsAPI.delete(postId);
      loadProfile();
    } catch (e) {
      Alert.alert('Error', 'Delete failed');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('auth_token');
    navigation.replace('Login');
  };

  useEffect(() => {
    const timer = setTimeout(() => { loadProfile(); }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

  const hasBio = !!profile?.bio;
  const hasAvatar = !!profile?.avatar;
  const completionPercent = Math.round(([hasBio, hasAvatar].filter(Boolean).length / 3) * 100);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cover} />

      <View style={styles.avatarContainer}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickAvatar}>
          <Text style={styles.changePhotoText}>📷 Change Photo</Text>
        </TouchableOpacity>
        <Text style={styles.username}>{profile?.username}</Text>
        <Text style={styles.handle}>@{profile?.username}</Text>
        <Text style={styles.bio}>{profile?.bio || 'No bio yet. Click Edit Profile to add one!'}</Text>
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
        <TouchableOpacity style={styles.editButton} onPress={() => { setEditing(!editing); setEditTab('personal'); }}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Completion */}
      <View style={styles.completionCard}>
        <Text style={styles.completionTitle}>Profile Completion</Text>
        <View style={styles.completionRow}>
          <View style={styles.completionItems}>
            <View style={styles.completionItem}>
              <Text style={hasAvatar ? styles.completionDone : styles.completionPending}>{hasAvatar ? '✅' : '☐'}</Text>
              <Text style={styles.completionItemText}>Picture</Text>
            </View>
            <View style={styles.completionItem}>
              <Text style={styles.completionPending}>☐</Text>
              <Text style={styles.completionItemText}>SMART Goals</Text>
            </View>
            <View style={styles.completionItem}>
              <Text style={hasBio ? styles.completionDone : styles.completionPending}>{hasBio ? '✅' : '☐'}</Text>
              <Text style={styles.completionItemText}>About</Text>
            </View>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{completionPercent}%</Text>
            <Text style={styles.progressLabel}>Progress</Text>
          </View>
        </View>
      </View>

      {/* Edit Box */}
      {editing && (
        <View style={styles.editBox}>
          <View style={styles.editTabRow}>
            {[
              { key: 'personal', label: 'Personal Info' },
              { key: 'password', label: 'Change Password' },
              { key: 'contact', label: 'Manage Contact' },
            ].map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.editTab, editTab === t.key && styles.editTabActive]}
                onPress={() => setEditTab(t.key)}
              >
                <Text style={[styles.editTabText, editTab === t.key && styles.editTabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {editTab === 'personal' && (
            <View>
              <Text style={styles.editTitle}>Personal Information</Text>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput style={styles.editInput} value={editUsername} onChangeText={setEditUsername} placeholder="Username" />
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.chipRow}>
                {['Male', 'Female', 'Non-binary', 'Other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.chip, editGender === g && styles.chipActive]}
                    onPress={() => setEditGender(g)}
                  >
                    <Text style={[styles.chipText, editGender === g && styles.chipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Location (City/District)</Text>
              <TextInput style={styles.editInput} value={editLocation} onChangeText={setEditLocation} placeholder="e.g. Liverpool, United Kingdom" />
              <Text style={styles.fieldLabel}>Birth month & year</Text>
              <TextInput style={styles.editInput} value={editBirthYear} onChangeText={setEditBirthYear} placeholder="e.g. July 2003" />
              <Text style={styles.fieldLabel}>Ethnicity</Text>
              <View style={styles.chipRow}>
                {['Asian', 'Black', 'Mixed', 'White', 'Other'].map(e => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.chip, editEthnicity === e && styles.chipActive]}
                    onPress={() => setEditEthnicity(e)}
                  >
                    <Text style={[styles.chipText, editEthnicity === e && styles.chipTextActive]}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>About me</Text>
              <TextInput style={styles.editInputMulti} value={editBio} onChangeText={setEditBio} placeholder="Tell people about yourself..." multiline />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSavePersonal}>
                  <Text style={styles.saveButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {editTab === 'password' && (
            <View>
              <Text style={styles.editTitle}>Change Password</Text>
              <Text style={styles.fieldLabel}>Current Password</Text>
              <TextInput style={styles.editInput} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Current password" />
              <Text style={styles.fieldLabel}>New Password</Text>
              <TextInput style={styles.editInput} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="New password" />
              <Text style={styles.fieldLabel}>Verify Password</Text>
              <TextInput style={styles.editInput} value={verifyPassword} onChangeText={setVerifyPassword} secureTextEntry placeholder="Verify new password" />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                  <Text style={styles.saveButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {editTab === 'contact' && (
            <View>
              <Text style={styles.editTitle}>Manage Contact</Text>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput style={styles.editInput} value={editPhone} onChangeText={setEditPhone} placeholder="Phone number" keyboardType="phone-pad" />
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput value={profile?.email} editable={false} style={[styles.editInput, { backgroundColor: '#f3f0f8', color: '#aaa' }]} />
              <Text style={styles.fieldLabel}>Website URL</Text>
              <TextInput style={styles.editInput} value={editWebsite} onChangeText={setEditWebsite} placeholder="https://..." />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveContact}>
                  <Text style={styles.saveButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'about', label: 'About' },
          { key: 'smart', label: 'SMART Goal' },
          { key: 'hubs', label: 'Hubs' },
          { key: 'connections', label: 'Connections' },
          { key: 'posts', label: 'My Posts' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'about' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{profile?.email || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bio:</Text>
            <Text style={styles.infoValue}>{profile?.bio || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender:</Text>
            <Text style={styles.infoValue}>{profile?.gender || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{profile?.location || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Birth year:</Text>
            <Text style={styles.infoValue}>{profile?.birthYear || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ethnicity:</Text>
            <Text style={styles.infoValue}>{profile?.ethnicity || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{profile?.phone || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Website:</Text>
            <Text style={styles.infoValue}>{profile?.website || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Joined:</Text>
            <Text style={styles.infoValue}>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</Text>
          </View>
        </View>
      )}

      {activeTab === 'smart' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SMART Goals</Text>
          <Text style={styles.emptyText}>No SMART goals set yet.</Text>
        </View>
      )}

      {activeTab === 'hubs' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hubs</Text>
          {profile?.groups?.length > 0 ? (
            profile.groups.map((g: any) => (
              <Text key={g.id} style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>• {g.group?.name}</Text>
            ))
          ) : (
            <Text style={styles.emptyText}>No hubs found.</Text>
          )}
        </View>
      )}

      {activeTab === 'connections' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Connections ({profile?.connections?.length || 0})</Text>
          {profile?.connections?.length > 0 ? (
            profile.connections.map((conn: any) => {
              const other = conn.fromUserId === profile.id ? conn.toUser : conn.fromUser;
              return (
                <TouchableOpacity key={conn.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }} onPress={() => navigation.navigate('UserProfile', { userId: other.id })}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{other.username.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 14 }}>{other.username}</Text>
                    {other.bio ? <Text style={{ color: '#888', fontSize: 12 }}>{other.bio}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No connections yet.</Text>
          )}
        </View>
      )}

      {activeTab === 'posts' && (
        <View>
          {profile?.posts?.length === 0 && (
            <Text style={[styles.emptyText, { marginHorizontal: 16 }]}>No posts yet.</Text>
          )}
          {profile?.posts?.map((post: any) => (
            <View key={post.id} style={styles.post}>
              <Text style={styles.postContent}>{post.content}</Text>
              {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />}
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
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}