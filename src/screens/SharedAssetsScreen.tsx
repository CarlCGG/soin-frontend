import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, Image } from 'react-native';
import { assetsAPI } from '../services/api';
import { useUser } from '../store';

const EQUIPMENT_CATEGORIES = ['Home appliances', 'Electronics', 'Sport equipments', 'Tools', 'Furniture', 'Other'];
const SERVICE_CATEGORIES = ['Cleaning', 'Repair', 'Tutoring', 'Transport', 'Catering', 'Other'];
const SPACE_CATEGORIES = ['Meeting room', 'Studio', 'Garden', 'Parking', 'Kitchen', 'Other'];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  topButtons: { flexDirection: 'row', gap: 8, margin: 12 },
  addButton: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', flexDirection: 'row',
    justifyContent: 'center', gap: 6,
  },
  addButtonText: { color: '#333', fontWeight: 'bold', fontSize: 13 },
  tabContainer: {
    backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12,
    flexDirection: 'row', padding: 4, marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#F97316' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 12 },
  activeTabText: { color: '#fff' },
  searchBox: {
    backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#eee',
  },
  grid: { paddingHorizontal: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    width: '30%',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    marginBottom: 4,
    },
  cardPostedBy: { fontSize: 11, color: '#aaa', padding: 10, paddingBottom: 2 },
  cardAuthor: { fontSize: 13, fontWeight: 'bold', color: '#333', paddingHorizontal: 10, marginBottom: 6 },
  cardImage: { width: '100%', aspectRatio: 4/3, backgroundColor: '#f3f0f8' },
  cardImagePlaceholder: { width: '100%', aspectRatio: 4/3, backgroundColor: '#f3f0f8', justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 10 },
  cardCategory: { color: '#888', fontSize: 11, marginBottom: 4 },
  cardTitle: { fontWeight: 'bold', color: '#333', fontSize: 13, marginBottom: 10 },
  viewButton: {
    backgroundColor: '#F97316', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  viewButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  deleteButton: {
    backgroundColor: '#fff0f0', borderRadius: 10,
    paddingVertical: 8, alignItems: 'center', marginTop: 6,
    borderWidth: 1, borderColor: '#ff4444',
  },
  deleteButtonText: { color: '#ff4444', fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 32, fontSize: 14, width: '100%' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', padding: 16,
  },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
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
  categoryChipActive: { backgroundColor: '#6B21A8', borderColor: '#6B21A8' },
  categoryChipText: { color: '#666', fontSize: 12 },
  categoryChipTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  modalSave: {
    flex: 1, backgroundColor: '#F97316', borderRadius: 12,
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

export default function SharedAssetsScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [assets, setAssets] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('equipment');
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const handlePickImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event: any) => {
        setImageUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const user = useUser();

  const loadAssets = async () => {
    try {
      if (activeTab === 'my') {
        const res = await assetsAPI.getMy();
        setAssets(res.data);
      } else {
        const type = activeTab === 'all' ? undefined : activeTab;
        const res = await assetsAPI.getAll(type);
        setAssets(res.data);
      }
    } catch (e) {
      console.log('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
    setCategory('');
    setTitle('');
    setDescription('');
    setImageUrl('');
    setErrorMsg('');
  };

  const handleCreate = async () => {
    if (!title || !category) {
      setErrorMsg('Please fill in title and select a category.');
      return;
    }
    setErrorMsg('');
    setCreating(true);
    try {
      await assetsAPI.create({ title, description, type: modalType, category, imageUrl });
      setShowModal(false);
      loadAssets();
    } catch (e) {
      setErrorMsg('Failed to create asset.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await assetsAPI.delete(id);
      loadAssets();
    } catch (e) {
      console.log('Failed to delete');
    }
  };

  useEffect(() => { loadAssets(); }, [activeTab]);

  const filtered = assets.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category?.toLowerCase().includes(search.toLowerCase())
  );

  const getCats = () => {
    if (modalType === 'equipment') return EQUIPMENT_CATEGORIES;
    if (modalType === 'service') return SERVICE_CATEGORIES;
    return SPACE_CATEGORIES;
  };

  const getModalTitle = () => {
    if (modalType === 'equipment') return '🔧 Add Equipment';
    if (modalType === 'service') return '👤 Add Service';
    return '🏢 Add Space';
  };

  return (
    <View style={styles.container}>
      <Modal visible={!!selectedAsset} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', maxWidth: 500, alignSelf: 'center', width: '100%' }}>
            {selectedAsset?.imageUrl && (
              <Image
                source={{ uri: selectedAsset.imageUrl }}
                style={{ width: '100%', height: 450 }}
                resizeMode="cover"
                />
            )}
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>{selectedAsset?.title}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>📂 Category: {selectedAsset?.category}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>🏷️ Type: {selectedAsset?.type}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>👤 Posted by: {selectedAsset?.author?.username}</Text>
              {selectedAsset?.description && (
                <Text style={{ color: '#555', fontSize: 14, marginTop: 8, lineHeight: 20 }}>{selectedAsset?.description}</Text>
              )}
              <TouchableOpacity
                style={{ backgroundColor: '#F97316', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 16 }}
                onPress={() => setSelectedAsset(null)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showModal} transparent animationType="slide">
        <ScrollView contentContainerStyle={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}
            <TextInput style={styles.modalInput} placeholder="Title *" value={title} onChangeText={setTitle} />
            <TextInput style={styles.modalInput} placeholder="Description (optional)" value={description} onChangeText={setDescription} multiline />
            <TouchableOpacity
              onPress={handlePickImage}
              style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center' }}
            >
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 150, borderRadius: 8 }} resizeMode="cover" />
              ) : (
                <Text style={{ color: '#888', fontSize: 14 }}>📷 Tap to select image (optional)</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.categoryLabel}>Category *</Text>
            <View style={styles.categoryRow}>
              {getCats().map(cat => (
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
                {creating ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalSaveText}>Add</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal('equipment')}>
          <Text>🔧</Text>
          <Text style={styles.addButtonText}>Add Equipment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal('service')}>
          <Text>👤</Text>
          <Text style={styles.addButtonText}>Add Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal('space')}>
          <Text>🏢</Text>
          <Text style={styles.addButtonText}>Add Space</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'all', label: 'Browse' },
          { key: 'equipment', label: 'Equipments & Tools' },
          { key: 'service', label: 'Services' },
          { key: 'space', label: 'Spaces' },
          { key: 'my', label: 'My Listings' },
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

      <TextInput
        style={styles.searchBox}
        placeholder="Search assets..."
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator color="#6B21A8" style={{ marginTop: 32 }} />
      ) : (
        <ScrollView>
          <View style={styles.grid}>
            {filtered.length === 0 && <Text style={styles.emptyText}>No assets found</Text>}
            {filtered.map((item) => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardPostedBy}>Posted By</Text>
                <Text style={styles.cardAuthor}>{item.author?.username}</Text>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={styles.cardImagePlaceholder}>
                    <Text style={{ fontSize: 40 }}>
                      {item.type === 'equipment' ? '🔧' : item.type === 'service' ? '👤' : '🏢'}
                    </Text>
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <TouchableOpacity style={styles.viewButton} onPress={() => setSelectedAsset(item)}>
                    <Text style={styles.viewButtonText}>View Asset</Text>
                  </TouchableOpacity>
                  {String(item.author?.id) === String(user?.id) && (
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                      <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}