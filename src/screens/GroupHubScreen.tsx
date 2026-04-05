import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, ScrollView
} from 'react-native';
import { groupsAPI, api } from '../services/api';
import { useUser } from '../store';
import { useNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6B21A8' },
  createButton: {
    backgroundColor: '#fff', margin: 12, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd',
  },
  createButtonText: { color: '#333', fontWeight: 'bold', fontSize: 15 },
  tabContainer: {
    backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12,
    flexDirection: 'row', padding: 4, marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#F97316' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 13 },
  activeTabText: { color: '#fff' },
  searchBox: {
    backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    marginBottom: 12,
  },
  groupCard: {
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8,
    borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center',
  },
  groupAvatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#f3f0f8', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#6B21A8',
  },
  groupAvatarText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 20 },
  groupInfo: { flex: 1, marginLeft: 12 },
  groupName: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  groupCategory: { color: '#F97316', fontSize: 12, marginTop: 2 },
  groupLocation: { color: '#aaa', fontSize: 11, marginTop: 2 },
  groupMembers: { color: '#888', fontSize: 11, marginTop: 2 },
  viewButton: {
    backgroundColor: '#6B21A8', borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  viewButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#fff', marginTop: 32, fontSize: 14 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 16,
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  errorText: { color: 'red', fontSize: 13, marginBottom: 10 },
  modalInput: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 12,
    padding: 12, fontSize: 14, marginBottom: 10,
  },
  categoryLabel: { color: '#888', fontSize: 13, marginBottom: 6 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  categoryChip: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: '#f3f0f8', borderWidth: 1, borderColor: '#ddd',
  },
  categoryChipActive: {
    backgroundColor: '#6B21A8', borderColor: '#6B21A8',
  },
  categoryChipText: { color: '#666', fontSize: 12 },
  categoryChipTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  modalSave: {
    flex: 1, backgroundColor: '#6B21A8', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  modalSaveText: { color: '#fff', fontWeight: 'bold' },
  modalCancel: {
    flex: 1, backgroundColor: '#f3f0f8', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd',
  },
  modalCancelText: { color: '#666', fontWeight: 'bold' },
});

const CATEGORIES = ['Sports & Leisure', 'Education & Training', 'Health & Wellbeing', 'Business & Finance', 'Arts & Culture', 'Technology'];

export default function GroupHubScreen() {
  const [activeTab, setActiveTab] = useState<'my' | 'suggested' | 'joined'>('my');
  const [groups, setGroups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigation = useNavigation<any>();

  const loadData = async () => {
    try {
      const res = await groupsAPI.getAll();
      setGroups(res.data);
    } catch (e) {
      console.log('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName || !newCategory || !newLocation) {
      setErrorMsg('Please fill in group name, location and select a category.');
      return;
    }
    setErrorMsg('');
    setCreating(true);
    try {
      await groupsAPI.create(newName, newDesc, newCategory, newLocation);
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      setNewCategory('');
      setNewLocation('');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreate(false);
    setErrorMsg('');
    setNewName('');
    setNewDesc('');
    setNewCategory('');
    setNewLocation('');
  };

  useEffect(() => { loadData(); }, []);

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.category?.toLowerCase().includes(search.toLowerCase()) ||
    g.location?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <ActivityIndicator style={{ flex: 1, backgroundColor: '#6B21A8' }} color="#fff" />;

  return (
    <View style={styles.container}>
      {/* 创建群组弹窗 */}
      <Modal visible={showCreate} transparent animationType="slide">
        <ScrollView contentContainerStyle={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create New Group</Text>
            {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}
            <TextInput
              style={styles.modalInput}
              placeholder="Group name *"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Description (optional)"
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Location (e.g. London, England) *"
              value={newLocation}
              onChangeText={setNewLocation}
            />
            <Text style={styles.categoryLabel}>Category *</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNewCategory(cat)}
                  style={[styles.categoryChip, newCategory === cat && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryChipText, newCategory === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSave} onPress={handleCreate} disabled={creating}>
                {creating
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalSaveText}>Create</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancel} onPress={handleCloseModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* 创建按钮 */}
      <TouchableOpacity style={styles.createButton} onPress={() => setShowCreate(true)}>
        <Text style={styles.createButtonText}>+ Create Group</Text>
      </TouchableOpacity>

      {/* 标签 */}
      <View style={styles.tabContainer}>
        {(['my', 'suggested', 'joined'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'my' ? 'My Groups' : tab === 'suggested' ? 'Suggested' : 'Joined'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 搜索 */}
      <TextInput
        style={styles.searchBox}
        placeholder="Search groups..."
        value={search}
        onChangeText={setSearch}
      />

      {/* 群组列表 */}
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No groups found</Text>}
        renderItem={({ item }) => (
          <View style={styles.groupCard}>
            <View style={styles.groupAvatar}>
              <Text style={styles.groupAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupCategory}>{item.category}</Text>
              <Text style={styles.groupLocation}>{item.location}</Text>
              <Text style={styles.groupMembers}>👥 {item._count?.members || 0} members</Text>
            </View>
             <View style={{ gap: 6 }}>
                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('Group', { groupId: item.id })}
                >
                    <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                {item._count?.members === 0 && (
                    <TouchableOpacity
                    style={{ backgroundColor: '#ff4444', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, alignItems: 'center' }}
                    onPress={async () => {
                        await groupsAPI.delete(item.id);
                        loadData();
                    }}
                    >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Delete</Text>
                    </TouchableOpacity>
                )}
                </View>
          </View>
        )}
      />
    </View>
  );
}