import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, ScrollView
} from 'react-native';
import { businessesAPI } from '../services/api';
import { useUser } from '../store';

const CATEGORIES = ['Sports & Leisure', 'Education & Training', 'Health & Wellbeing', 'Business & Finance', 'Arts & Culture', 'Technology', 'Food & Drink', 'Entertainment'];

const COLORS = ['#6B21A8', '#F97316', '#0ea5e9', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4'];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
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
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, marginBottom: 12,
  },
  grid: { paddingHorizontal: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardCover: { height: 100, justifyContent: 'center', alignItems: 'center' },
  cardCoverText: { color: '#fff', fontWeight: 'bold', fontSize: 32 },
  cardBody: { padding: 12 },
  cardName: { fontWeight: 'bold', color: '#333', fontSize: 15, marginBottom: 2 },
  cardCategory: { color: '#F97316', fontSize: 12, marginBottom: 4 },
  cardLocation: { color: '#888', fontSize: 11, marginBottom: 4 },
  cardFollowers: { color: '#888', fontSize: 11, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', gap: 8 },
  followButton: {
    flex: 1, backgroundColor: '#6B21A8', borderRadius: 10,
    paddingVertical: 8, alignItems: 'center',
  },
  followingButton: {
    flex: 1, backgroundColor: '#f3f0f8', borderRadius: 10,
    paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#6B21A8',
  },
  followButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  followingButtonText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 13 },
  deleteButton: {
    backgroundColor: '#fff0f0', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#ff4444',
  },
  deleteButtonText: { color: '#ff4444', fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 32, fontSize: 14 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', padding: 16,
  },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  errorText: { color: 'red', fontSize: 13, marginBottom: 10 },
  modalInput: {
  borderWidth: 1, borderColor: '#eee', borderRadius: 12,
  padding: 12, fontSize: 14, marginBottom: 10, color: '#333',
},
  categoryLabel: { color: '#888', fontSize: 13, marginBottom: 6 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  categoryChip: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: '#f3f0f8', borderWidth: 1, borderColor: '#ddd',
  },
  categoryChipActive: { backgroundColor: '#6B21A8', borderColor: '#6B21A8' },
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

export default function BusinessesScreen() {
  const [activeTab, setActiveTab] = useState<'discover' | 'my'>('discover');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [myBusinesses, setMyBusinesses] = useState<any[]>([]);
  const [expandedBusiness, setExpandedBusiness] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const user = useUser();

  const loadData = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        businessesAPI.getAll(),
        businessesAPI.getMy(),
      ]);
      setBusinesses(allRes.data);
      setMyBusinesses(myRes.data);
    } catch (e) {
      console.log('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name || !category || !location) {
      setErrorMsg('Please fill in name, location and select a category.');
      return;
    }
    setErrorMsg('');
    setCreating(true);
    try {
      await businessesAPI.create({ name, description, category, location, website, phone, email });
      setShowCreate(false);
      setName(''); setDescription(''); setCategory(''); setLocation('');
      setWebsite(''); setPhone(''); setEmail('');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to create business.');
    } finally {
      setCreating(false);
    }
  };

  const handleFollow = async (id: number) => {
    try {
      await businessesAPI.follow(id);
      loadData();
    } catch (e) {
      console.log('Failed to follow');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await businessesAPI.delete(id);
      loadData();
    } catch (e) {
      console.log('Failed to delete');
    }
  };

  const getColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

  useEffect(() => { loadData(); }, []);

  const displayList = activeTab === 'discover'
    ? businesses.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.category?.toLowerCase().includes(search.toLowerCase())
      )
    : myBusinesses;

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

  return (
    <View style={styles.container}>
      <Modal visible={showCreate} transparent animationType="slide">
        <ScrollView contentContainerStyle={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create Business</Text>
            {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}
            <TextInput style={styles.modalInput} placeholder="Business name *" placeholderTextColor="#aaa" value={name} onChangeText={setName} />
            <TextInput style={styles.modalInput} placeholder="Description" placeholderTextColor="#aaa" value={description} onChangeText={setDescription} multiline />
            <TextInput style={styles.modalInput} placeholder="Location *" placeholderTextColor="#aaa" value={location} onChangeText={setLocation} />
            <TextInput style={styles.modalInput} placeholder="Website (optional)" placeholderTextColor="#aaa" value={website} onChangeText={setWebsite} />
            <TextInput style={styles.modalInput} placeholder="Phone (optional)" placeholderTextColor="#aaa" value={phone} onChangeText={setPhone} />
            <TextInput style={styles.modalInput} placeholder="Email (optional)" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} />
            <Text style={styles.categoryLabel}>Category *</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSave} onPress={handleCreate} disabled={creating}>
                {creating ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalSaveText}>Create</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowCreate(false); setErrorMsg(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      <TouchableOpacity style={styles.createButton} onPress={() => setShowCreate(true)}>
        <Text style={styles.createButtonText}>+ Create a Business</Text>
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'discover' && styles.activeTab]} onPress={() => setActiveTab('discover')}>
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'my' && styles.activeTab]} onPress={() => setActiveTab('my')}>
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>My Businesses</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'discover' && (
        <TextInput
          style={styles.searchBox}
          placeholder="Search businesses..."
          value={search}
          onChangeText={setSearch}
        />
      )}

      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={<Text style={styles.emptyText}>No businesses found</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.cardCover, { backgroundColor: getColor(item.name) }]}>
              <Text style={styles.cardCoverText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
              <Text style={styles.cardLocation}>📍 {item.location}</Text>
              {item.description ? <Text style={styles.cardLocation} numberOfLines={2}>{item.description}</Text> : null}
              <TouchableOpacity onPress={() => setExpandedBusiness(expandedBusiness === item.id ? null : item.id)}>
                <Text style={styles.cardFollowers}>
                    👥 {item._count?.followers || 0} followers {expandedBusiness === item.id ? '▲' : '▼'}
                </Text>
                </TouchableOpacity>
                {expandedBusiness === item.id && (
                <View style={{ marginBottom: 8 }}>
                    {item.followers?.length === 0
                    ? <Text style={{ color: '#aaa', fontSize: 12 }}>No followers yet</Text>
                    : item.followers?.map((f: any, i: number) => (
                        <Text key={i} style={{ color: '#555', fontSize: 13, marginTop: 2 }}>
                            • {f.user?.username || 'User'}
                        </Text>
                        ))
                    }
                </View>
                )}
              {item.website ? <Text style={styles.cardLocation}>🌐 {item.website}</Text> : null}
              {item.phone ? <Text style={styles.cardLocation}>📞 {item.phone}</Text> : null}
              {item.email ? <Text style={styles.cardLocation}>✉️ {item.email}</Text> : null}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                style={item.followers?.some((f: any) => String(f.userId) === String(user?.id))
                    ? styles.followingButton
                    : styles.followButton
                }
                onPress={() => handleFollow(item.id)}
                >
                <Text style={item.followers?.some((f: any) => String(f.userId) === String(user?.id))
                    ? styles.followingButtonText
                    : styles.followButtonText
                }>
                    {item.followers?.some((f: any) => String(f.userId) === String(user?.id)) ? '✓ Following' : 'Follow'}
                </Text>
                </TouchableOpacity>
                {String(item.owner?.id) === String(user?.id) && (
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}