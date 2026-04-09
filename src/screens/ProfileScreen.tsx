import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Alert, Image, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api, postsAPI, usersAPI, smartGoalsAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser, setUser } from '../store';
import { useNavigation } from '@react-navigation/native';


const HUBS = ['Sports & Leisure', 'Education & Training', 'Health & Wellbeing', 'Business & Finance', 'Arts & Culture', 'Technology'];
const DURATION_UNITS = ['Week', 'Month', 'Year'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];


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
    padding: 12, fontSize: 14, marginBottom: 12, color: '#333',
  },
  editInputMulti: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 12,
    padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 12, color: '#333',
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
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    backgroundColor: '#f3f0f8', borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#6B21A8',
  },
  tagText: { color: '#6B21A8', fontSize: 12 },
  goalCard: {
    backgroundColor: '#f3f0f8', borderRadius: 12, padding: 12,
    marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#6B21A8',
  },
  goalDesc: { fontWeight: 'bold', color: '#333', fontSize: 14, marginBottom: 4 },
  goalMeta: { color: '#888', fontSize: 12 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', padding: 16,
  },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
});

export default function ProfileScreen() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showGoalReport, setShowGoalReport] = useState(false);
  const [showGoalDatePicker, setShowGoalDatePicker] = useState(false);
  const [goalSelectedDate, setGoalSelectedDate] = useState(new Date());
  const [showEditGoalDatePicker, setShowEditGoalDatePicker] = useState(false);
  const [editGoalSelectedDate, setEditGoalSelectedDate] = useState(new Date());
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTab, setEditTab] = useState('personal');
  const [activeTab, setActiveTab] = useState('about');
  const [smartGoals, setSmartGoals] = useState<any[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalDesc, setGoalDesc] = useState('');
  const [goalMeasurable, setGoalMeasurable] = useState(false);
  const [goalHub, setGoalHub] = useState('');
  const [goalStartDate, setGoalStartDate] = useState('');
  const [goalDuration, setGoalDuration] = useState('');
  const [goalDurationUnit, setGoalDurationUnit] = useState('Month');
  const [savingGoal, setSavingGoal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInGoalId, setCheckInGoalId] = useState<number | null>(null);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [editGoalDesc, setEditGoalDesc] = useState('');
  const [editGoalHub, setEditGoalHub] = useState('');
  const [editGoalMeasurable, setEditGoalMeasurable] = useState(false);
  const [editGoalStartDate, setEditGoalStartDate] = useState('');
  const [editGoalDuration, setEditGoalDuration] = useState('');
  const [editGoalDurationUnit, setEditGoalDurationUnit] = useState('Month');
  const user = useUser();
  const navigation = useNavigation<any>();

  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editTags, setEditTags] = useState('');
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
      setEditTags(res.data.tags || '');
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

  const loadSmartGoals = async () => {
    try {
      const res = await smartGoalsAPI.getAll();
      setSmartGoals(Array.isArray(res.data) ? res.data : []);
    } catch (e) {}
  };

  const handleSaveGoal = async () => {
    if (!goalDesc) {
      Alert.alert('Error', 'Please enter a goal description');
      return;
    }
    setSavingGoal(true);
    try {
      await smartGoalsAPI.create({
        description: goalDesc,
        measurable: goalMeasurable,
        hub: goalHub || null,
        startDate: goalStartDate || null,
        duration: goalDuration || null,
        durationUnit: goalDurationUnit,
      });
      setShowGoalModal(false);
      setGoalDesc('');
      setGoalMeasurable(false);
      setGoalHub('');
      setGoalStartDate('');
      setGoalDuration('');
      setGoalDurationUnit('Month');
      loadSmartGoals();
      Alert.alert('Success', 'SMART Goal saved!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save goal');
    } finally {
      setSavingGoal(false);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await smartGoalsAPI.delete(id);
      loadSmartGoals();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete goal');
    }
  };

  const handleTogglePause = async (id: number) => {
  try {
    await smartGoalsAPI.togglePause(id);
    loadSmartGoals();
  } catch (e) {
    Alert.alert('Error', 'Failed to update goal');
  }
};

const handleCheckIn = async () => {
  if (!checkInGoalId) return;
  try {
    await smartGoalsAPI.checkIn(checkInGoalId);
    setShowCheckInModal(false);
    setCheckInGoalId(null);
    loadSmartGoals();
    Alert.alert(' Great job!', 'Check-in recorded!');
  } catch (e) {
    Alert.alert('Error', 'Failed to check in');
  }
};

const openEditGoal = (goal: any) => {
  setEditingGoal(goal);
  setEditGoalDesc(goal.description || '');
  setEditGoalHub(goal.hub || '');
  setEditGoalMeasurable(goal.measurable || false);
  setEditGoalStartDate(goal.startDate || '');
  setEditGoalDuration(goal.duration || '');
  setEditGoalDurationUnit(goal.durationUnit || 'Month');
  setShowEditGoalModal(true);
};

const handleUpdateGoal = async () => {
  if (!editingGoal) return;
  try {
    await smartGoalsAPI.update(editingGoal.id, {
      description: editGoalDesc,
      measurable: editGoalMeasurable,
      hub: editGoalHub || null,
      startDate: editGoalStartDate || null,
      duration: editGoalDuration || null,
      durationUnit: editGoalDurationUnit,
    });
    setShowEditGoalModal(false);
    setEditingGoal(null);
    loadSmartGoals();
    Alert.alert('Success', 'Goal updated!');
  } catch (e) {
    Alert.alert('Error', 'Failed to update goal');
  }
};

  const formatGoalDate = (goal: any) => {
    if (!goal.startDate) return null;
    const start = new Date(goal.startDate);
    const end = new Date(goal.startDate);
    const dur = parseInt(goal.duration || '0');
    const unit = goal.durationUnit || 'Month';
    if (unit === 'Week') end.setDate(end.getDate() + dur * 7);
    else if (unit === 'Month') end.setMonth(end.getMonth() + dur);
    else if (unit === 'Year') end.setFullYear(end.getFullYear() + dur);
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    return `${fmt(start)} - ${fmt(end)}`;
  };
  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const base64 = `data:image/jpeg;base64,${asset.base64}`;
      setAvatarUri(base64);
      try {
        await usersAPI.updateProfile({ avatar: base64 });
        setUser({ ...user, avatar: base64 });
        loadProfile();
        Alert.alert('Success', 'Profile photo updated!');
      } catch (e) {
        Alert.alert('Error', 'Failed to update photo');
      }
    }
  };

  const handleSavePersonal = async () => {
    if (!editUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    try {
      await usersAPI.updateProfile({
        bio: editBio, username: editUsername, gender: editGender,
        location: editLocation, birthYear: editBirthYear, ethnicity: editEthnicity,
        tags: editTags,
      });
      setEditing(false);
      loadProfile();
      Alert.alert('Success', 'Profile updated!');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Update failed';
      if (msg.toLowerCase().includes('username') || msg.toLowerCase().includes('taken')) {
        Alert.alert('Username Taken', 'This username is already taken. Please choose another one.');
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== verifyPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword)) {
      Alert.alert('Error', 'Password must contain at least one letter');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      Alert.alert('Error', 'Password must contain at least one number');
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
    Alert.alert('Success', 'Post deleted');
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || 'Delete failed';
    Alert.alert('Error', msg);
  }
};

  const handleLogout = async () => {
    await AsyncStorage.removeItem('auth_token');
    navigation.replace('Login');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
      loadSmartGoals();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

  const hasBio = !!profile?.bio;
  const hasAvatar = !!profile?.avatar;
  const hasGoals = smartGoals.length > 0;
  const completionPercent = Math.round(([hasBio, hasAvatar, hasGoals].filter(Boolean).length / 3) * 100);

  return (
    <ScrollView style={styles.container}>
      {/* SMART Goal Modal */}
      <Modal visible={showGoalModal} transparent animationType="slide">
        <ScrollView contentContainerStyle={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add SMART Goal</Text>
            <Text style={styles.fieldLabel}>What is your SMART goal? *</Text>
            <TextInput
              style={styles.editInput}
              value={goalDesc}
              onChangeText={setGoalDesc}
              placeholder="Goal description (max 50 chars)"
              placeholderTextColor="#aaa"
              maxLength={50}
            />
            <Text style={styles.fieldLabel}>Can goal be measured?</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              {[true, false].map(val => (
                <TouchableOpacity
                  key={String(val)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  onPress={() => setGoalMeasurable(val)}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#6B21A8', justifyContent: 'center', alignItems: 'center' }}>
                    {goalMeasurable === val && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#6B21A8' }} />}
                  </View>
                  <Text style={{ color: '#333', fontSize: 14 }}>{val ? 'Yes' : 'No'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Hub (Optional)</Text>
            <View style={styles.chipRow}>
              {HUBS.map(h => (
                <TouchableOpacity
                  key={h}
                  style={[styles.chip, goalHub === h && styles.chipActive]}
                  onPress={() => setGoalHub(goalHub === h ? '' : h)}
                >
                  <Text style={[styles.chipText, goalHub === h && styles.chipTextActive]}>{h}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Start Date (Optional)</Text>
              <TouchableOpacity style={styles.editInput} onPress={() => setShowGoalDatePicker(!showGoalDatePicker)}>
                <Text style={{ color: goalStartDate ? '#333' : '#aaa', fontSize: 14 }}>
                  {goalStartDate || 'Select start date'}
                </Text>
              </TouchableOpacity>
              {showGoalDatePicker && (
                <View style={{ backgroundColor: '#f9f9f9', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, textAlign: 'center' }}>Month</Text>
                      <ScrollView style={{ height: 140 }} nestedScrollEnabled>
                        {MONTHS.map((m, i) => (
                          <TouchableOpacity key={m} style={{ padding: 8, backgroundColor: goalSelectedDate.getMonth() === i ? '#6B21A8' : '#fff', borderRadius: 6, margin: 1 }}
                            onPress={() => { const d = new Date(goalSelectedDate); d.setMonth(i); setGoalSelectedDate(d); }}>
                            <Text style={{ color: goalSelectedDate.getMonth() === i ? '#fff' : '#333', fontSize: 11, textAlign: 'center' }}>{m}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, textAlign: 'center' }}>Day</Text>
                      <ScrollView style={{ height: 140 }} nestedScrollEnabled>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <TouchableOpacity key={day} style={{ padding: 8, backgroundColor: goalSelectedDate.getDate() === day ? '#6B21A8' : '#fff', borderRadius: 6, margin: 1 }}
                            onPress={() => { const d = new Date(goalSelectedDate); d.setDate(day); setGoalSelectedDate(d); }}>
                            <Text style={{ color: goalSelectedDate.getDate() === day ? '#fff' : '#333', fontSize: 11, textAlign: 'center' }}>{day}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, textAlign: 'center' }}>Year</Text>
                      <ScrollView style={{ height: 140 }} nestedScrollEnabled>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <TouchableOpacity key={year} style={{ padding: 8, backgroundColor: goalSelectedDate.getFullYear() === year ? '#6B21A8' : '#fff', borderRadius: 6, margin: 1 }}
                            onPress={() => { const d = new Date(goalSelectedDate); d.setFullYear(year); setGoalSelectedDate(d); }}>
                            <Text style={{ color: goalSelectedDate.getFullYear() === year ? '#fff' : '#333', fontSize: 11, textAlign: 'center' }}>{year}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                  <TouchableOpacity style={{ backgroundColor: '#6B21A8', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 }}
                    onPress={() => {
                      const d = goalSelectedDate;
                      setGoalStartDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
                      setShowGoalDatePicker(false);
                    }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
<Text style={styles.fieldLabel}>Time Duration (Optional)</Text>
            <Text style={styles.fieldLabel}>Time Duration (Optional)</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              {DURATION_UNITS.map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  onPress={() => setGoalDurationUnit(unit)}
                >
                  <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#6B21A8', justifyContent: 'center', alignItems: 'center' }}>
                    {goalDurationUnit === unit && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6B21A8' }} />}
                  </View>
                  <Text style={{ color: '#333', fontSize: 13 }}>{unit}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.editInput}
              value={goalDuration}
              onChangeText={setGoalDuration}
              placeholder="e.g. 3"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoal} disabled={savingGoal}>
                {savingGoal ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveButtonText}>Save Goal</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowGoalModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

<Modal visible={showGoalReport} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={[styles.modalBox, { maxHeight: '80%' }]}>
      <Text style={styles.modalTitle}>SMART Goal Report for {profile?.username}</Text>
      <ScrollView>
        {/* Completed */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Text style={{ fontSize: 18 }}>✅</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#333' }}>
              Completed Goals ({smartGoals.filter(g => g.status === 'completed').length})
            </Text>
          </View>
          {smartGoals.filter(g => g.status === 'completed').length === 0
            ? <Text style={{ color: '#aaa', fontSize: 13 }}>No completed goals yet.</Text>
            : smartGoals.filter(g => g.status === 'completed').map(g => (
              <View key={g.id} style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#bbf7d0' }}>
                <Text style={{ fontWeight: 'bold', color: '#333' }}>{g.description}</Text>
                {g.hub && <Text style={{ color: '#888', fontSize: 12 }}>{g.hub}</Text>}
              </View>
            ))
          }
        </View>

        <View style={{ height: 1, backgroundColor: '#eee', marginBottom: 16 }} />

        {/* Ongoing */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Text style={{ fontSize: 18 }}>🔄</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#333' }}>
              Ongoing Goals ({smartGoals.filter(g => g.status !== 'completed' && g.status !== 'paused').length})
            </Text>
          </View>
          {smartGoals.filter(g => g.status !== 'completed' && g.status !== 'paused').length === 0
            ? <Text style={{ color: '#aaa', fontSize: 13 }}>No ongoing goals.</Text>
            : smartGoals.filter(g => g.status !== 'completed' && g.status !== 'paused').map(g => (
              <View key={g.id} style={{ backgroundColor: '#fafafa', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: 'bold', color: '#333' }}>{g.description}</Text>
                  {g.hub && <Text style={{ color: '#6B21A8', fontSize: 12 }}>{g.hub}</Text>}
                </View>
                <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                  {g.duration ? `Timeline: ${g.duration} ${g.durationUnit}` : ''}
                  {g.startDate ? ` | Started: ${new Date(g.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                </Text>
              </View>
            ))
          }
        </View>

        <View style={{ height: 1, backgroundColor: '#eee', marginBottom: 16 }} />

        {/* Paused */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Text style={{ fontSize: 18 }}>⏸️</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#333' }}>
              Paused Goals ({smartGoals.filter(g => g.status === 'paused').length})
            </Text>
          </View>
          {smartGoals.filter(g => g.status === 'paused').length === 0
            ? <Text style={{ color: '#aaa', fontSize: 13 }}>No paused goals.</Text>
            : smartGoals.filter(g => g.status === 'paused').map(g => (
              <View key={g.id} style={{ backgroundColor: '#fefce8', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#fde68a' }}>
                <Text style={{ fontWeight: 'bold', color: '#333' }}>{g.description}</Text>
                {g.hub && <Text style={{ color: '#888', fontSize: 12 }}>{g.hub}</Text>}
              </View>
            ))
          }
        </View>
      </ScrollView>

      <TouchableOpacity
        style={{ backgroundColor: '#F97316', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 }}
        onPress={() => setShowGoalReport(false)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      {/* Check-In Modal */}
<Modal visible={showCheckInModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={[styles.modalBox, { alignItems: 'center' }]}>
      <Text style={{ fontSize: 48, marginBottom: 8 }}>🎯</Text>
      <Text style={[styles.modalTitle, { textAlign: 'center' }]}>Check-In</Text>
      <Text style={{ color: '#555', fontSize: 15, textAlign: 'center', marginBottom: 24 }}>
        Have you made progress on this goal?
      </Text>
      <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
        <TouchableOpacity
          style={[styles.saveButton, { flex: 1, backgroundColor: '#22c55e' }]}
          onPress={handleCheckIn}
        >
          <Text style={styles.saveButtonText}> Yes, I did!</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cancelButton, { flex: 1 }]}
          onPress={() => { setShowCheckInModal(false); setCheckInGoalId(null); }}
        >
          <Text style={styles.cancelButtonText}>Not yet</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


<Modal visible={showEditGoalModal} transparent animationType="slide">
  <ScrollView contentContainerStyle={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Text style={styles.modalTitle}>Edit SMART Goal</Text>
      <Text style={styles.fieldLabel}>Goal Description *</Text>
      <TextInput
        style={styles.editInput}
        value={editGoalDesc}
        onChangeText={setEditGoalDesc}
        placeholder="Goal description"
        placeholderTextColor="#aaa"
        maxLength={50}
      />
      <Text style={styles.fieldLabel}>Can goal be measured?</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        {[true, false].map(val => (
          <TouchableOpacity
            key={String(val)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            onPress={() => setEditGoalMeasurable(val)}
          >
            <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#6B21A8', justifyContent: 'center', alignItems: 'center' }}>
              {editGoalMeasurable === val && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#6B21A8' }} />}
            </View>
            <Text style={{ color: '#333', fontSize: 14 }}>{val ? 'Yes' : 'No'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.fieldLabel}>Hub (Optional)</Text>
      <View style={styles.chipRow}>
        {HUBS.map(h => (
          <TouchableOpacity
            key={h}
            style={[styles.chip, editGoalHub === h && styles.chipActive]}
            onPress={() => setEditGoalHub(editGoalHub === h ? '' : h)}
          >
            <Text style={[styles.chipText, editGoalHub === h && styles.chipTextActive]}>{h}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.fieldLabel}>Start Date (Optional)</Text>
      <TextInput
        style={styles.editInput}
        value={editGoalStartDate}
        onChangeText={setEditGoalStartDate}
        placeholder="e.g. 2026-04-07"
        placeholderTextColor="#aaa"
      />
      <Text style={styles.fieldLabel}>Duration Unit</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {DURATION_UNITS.map(unit => (
          <TouchableOpacity
            key={unit}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            onPress={() => setEditGoalDurationUnit(unit)}
          >
            <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#6B21A8', justifyContent: 'center', alignItems: 'center' }}>
              {editGoalDurationUnit === unit && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6B21A8' }} />}
            </View>
            <Text style={{ color: '#333', fontSize: 13 }}>{unit}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.editInput}
        value={editGoalDuration}
        onChangeText={setEditGoalDuration}
        placeholder="e.g. 3"
        placeholderTextColor="#aaa"
        keyboardType="number-pad"
      />
      <View style={styles.editActions}>
        <TouchableOpacity style={styles.saveButton} onPress={handleUpdateGoal}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditGoalModal(false)}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
</Modal>

      <View style={styles.cover} />
      <View style={styles.avatarContainer}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.username?.charAt(0).toUpperCase() || 'U'}</Text>
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

      <View style={styles.completionCard}>
        <Text style={styles.completionTitle}>Profile Completion</Text>
        <View style={styles.completionRow}>
          <View style={styles.completionItems}>
            <View style={styles.completionItem}>
              <Text style={hasAvatar ? styles.completionDone : styles.completionPending}>{hasAvatar ? '✅' : '☐'}</Text>
              <Text style={styles.completionItemText}>Picture</Text>
            </View>
            <View style={styles.completionItem}>
              <Text style={hasGoals ? styles.completionDone : styles.completionPending}>{hasGoals ? '✅' : '☐'}</Text>
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
              <TextInput style={styles.editInput} value={editUsername} onChangeText={setEditUsername} placeholder="Username" placeholderTextColor="#aaa" />
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.chipRow}>
                {['Male', 'Female', 'Non-binary', 'Other'].map(g => (
                  <TouchableOpacity key={g} style={[styles.chip, editGender === g && styles.chipActive]} onPress={() => setEditGender(g)}>
                    <Text style={[styles.chipText, editGender === g && styles.chipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Location (City/District)</Text>
              <TextInput style={styles.editInput} value={editLocation} onChangeText={setEditLocation} placeholder="e.g. Liverpool, United Kingdom" placeholderTextColor="#aaa" />
              <Text style={styles.fieldLabel}>Birth month & year</Text>
                <TouchableOpacity
                  style={styles.editInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: editBirthYear ? '#333' : '#aaa', fontSize: 14 }}>
                    {editBirthYear || 'Select birth month & year'}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <View style={{ backgroundColor: '#f9f9f9', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, textAlign: 'center' }}>Month</Text>
                        <ScrollView style={{ height: 140 }} nestedScrollEnabled>
                          {MONTHS.map((m, i) => (
                            <TouchableOpacity key={m} style={{ padding: 8, backgroundColor: selectedDate.getMonth() === i ? '#6B21A8' : '#fff', borderRadius: 6, margin: 1 }}
                              onPress={() => { const d = new Date(selectedDate); d.setMonth(i); setSelectedDate(d); }}>
                              <Text style={{ color: selectedDate.getMonth() === i ? '#fff' : '#333', fontSize: 11, textAlign: 'center' }}>{m}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, textAlign: 'center' }}>Year</Text>
                        <ScrollView style={{ height: 140 }} nestedScrollEnabled>
                          {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <TouchableOpacity key={year} style={{ padding: 8, backgroundColor: selectedDate.getFullYear() === year ? '#6B21A8' : '#fff', borderRadius: 6, margin: 1 }}
                              onPress={() => { const d = new Date(selectedDate); d.setFullYear(year); setSelectedDate(d); }}>
                              <Text style={{ color: selectedDate.getFullYear() === year ? '#fff' : '#333', fontSize: 11, textAlign: 'center' }}>{year}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                    <TouchableOpacity style={{ backgroundColor: '#6B21A8', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 }}
                      onPress={() => { setEditBirthYear(`${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`); setShowDatePicker(false); }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                )}
              <Text style={styles.fieldLabel}>Ethnicity</Text>
              <View style={styles.chipRow}>
                {['Asian', 'Black', 'Mixed', 'White', 'Other'].map(e => (
                  <TouchableOpacity key={e} style={[styles.chip, editEthnicity === e && styles.chipActive]} onPress={() => setEditEthnicity(e)}>
                    <Text style={[styles.chipText, editEthnicity === e && styles.chipTextActive]}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>About me</Text>
              <TextInput style={styles.editInputMulti} value={editBio} onChangeText={setEditBio} placeholder="Tell people about yourself..." placeholderTextColor="#aaa" multiline />
              <Text style={styles.fieldLabel}>My Interests (comma separated)</Text>
              <TextInput style={styles.editInput} value={editTags} onChangeText={setEditTags} placeholder="e.g. football, technology, music" placeholderTextColor="#aaa" />
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
              <TextInput style={styles.editInput} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Current password" placeholderTextColor="#aaa" />
              <Text style={styles.fieldLabel}>New Password</Text>
              <TextInput style={styles.editInput} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="New password" placeholderTextColor="#aaa" />
              <Text style={styles.fieldLabel}>Verify Password</Text>
              <TextInput style={styles.editInput} value={verifyPassword} onChangeText={setVerifyPassword} secureTextEntry placeholder="Verify new password" placeholderTextColor="#aaa" />
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
              <TextInput style={styles.editInput} value={editPhone} onChangeText={setEditPhone} placeholder="Phone number" placeholderTextColor="#aaa" keyboardType="phone-pad" />
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput value={profile?.email} editable={false} style={[styles.editInput, { backgroundColor: '#f3f0f8', color: '#aaa' }]} />
              <Text style={styles.fieldLabel}>Website URL</Text>
              <TextInput style={styles.editInput} value={editWebsite} onChangeText={setEditWebsite} placeholder="https://..." placeholderTextColor="#aaa" />
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
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Email:</Text><Text style={styles.infoValue}>{profile?.email || '-'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Bio:</Text><Text style={styles.infoValue}>{profile?.bio || '-'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Gender:</Text><Text style={styles.infoValue}>{profile?.gender || '-'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Location:</Text><Text style={styles.infoValue}>{profile?.location || '-'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Birth year:</Text><Text style={styles.infoValue}>{profile?.birthYear || '-'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Ethnicity:</Text><Text style={styles.infoValue}>{profile?.ethnicity || '-'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone:</Text><Text style={styles.infoValue}>{profile?.phone || '-'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Website:</Text><Text style={styles.infoValue}>{profile?.website || '-'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Joined:</Text><Text style={styles.infoValue}>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</Text></View>
          {profile?.tags && (
            <View>
              <Text style={[styles.infoLabel, { marginTop: 8, marginBottom: 6 }]}>Interests:</Text>
              <View style={styles.tagRow}>
                {profile.tags.split(/[,，]/).map((tag: string, i: number) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {activeTab === 'smart' && (
  <View style={styles.card}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <TouchableOpacity
        style={{ backgroundColor: '#F97316', borderRadius: 24, paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        onPress={() => setShowGoalModal(true)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>⊕ Add SMART Goal</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ borderRadius: 24, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: '#6B21A8', flexDirection: 'row', alignItems: 'center', gap: 6 }}
        onPress={() => setShowGoalReport(true)}
      >
        <Text style={{ color: '#6B21A8', fontWeight: 'bold', fontSize: 13 }}>📊 Goal Details</Text>
      </TouchableOpacity>
    </View>

    {smartGoals.length === 0 ? (
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>⊗</Text>
        <Text style={{ color: '#888', fontSize: 15 }}>No SMART goals found</Text>
      </View>
    ) : (
      smartGoals.map((goal: any) => (
        <View key={goal.id} style={{
          backgroundColor: '#fff', borderRadius: 16, padding: 16,
          marginBottom: 12, borderWidth: 1, borderColor: '#eee',
          shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
          opacity: goal.status === 'paused' ? 0.6 : 1,
        }}>
          {/* Top action buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => openEditGoal(goal)}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTogglePause(goal.id)}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#eab308', justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 16 }}>{goal.status === 'paused' ? '▶️' : '⏸️'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteGoal(goal.id)}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </TouchableOpacity>
          </View>

          {/* Goal title */}
          <Text style={{ color: '#F97316', fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 4 }}>
            {goal.description}
          </Text>

          {/* Hub */}
          {goal.hub && (
            <Text style={{ color: '#555', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
              {goal.hub}
            </Text>
          )}

          {/* Status badge */}
          {goal.status === 'paused' && (
            <View style={{ alignSelf: 'center', backgroundColor: '#fef9c3', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 }}>
              <Text style={{ color: '#ca8a04', fontSize: 12, fontWeight: '600' }}>⏸ Paused</Text>
            </View>
          )}

          {/* Check-In button */}
          {goal.status !== 'paused' && (
            <TouchableOpacity
              style={{ backgroundColor: '#F97316', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 32, alignSelf: 'center', marginBottom: 12 }}
              onPress={() => { setCheckInGoalId(goal.id); setShowCheckInModal(true); }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Check-In</Text>
            </TouchableOpacity>
          )}

          {/* Check-in count */}
          {(goal.checkIns ?? 0) > 0 && (
            <Text style={{ textAlign: 'center', color: '#22c55e', fontSize: 12, marginBottom: 8 }}>
               {goal.checkIns} check-in{goal.checkIns > 1 ? 's' : ''} completed
            </Text>
          )}

          {/* Date range */}
          {formatGoalDate(goal) && (
            <Text style={{ textAlign: 'center', color: '#aaa', fontSize: 12 }}>
              {formatGoalDate(goal)}
            </Text>
          )}
        </View>
      ))
    )}
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
          {profile?.posts?.length === 0 && <Text style={[styles.emptyText, { marginHorizontal: 16 }]}>No posts yet.</Text>}
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