import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, Image, Linking
} from 'react-native';
import { resourcesAPI } from '../services/api';
import { useUser } from '../store';

const TABS = [
  { key: 'all', label: 'Browse' },
  { key: 'wellbeing', label: 'Wellbeing' },
  { key: 'image', label: 'Images' },
  { key: 'podcast', label: 'Podcasts' },
  { key: 'video', label: 'Videos' },
];

const TYPES = [
  { key: 'video', label: '🎥 Video' },
  { key: 'image', label: '🖼️ Image' },
  { key: 'podcast', label: '🎙️ Podcast' },
  { key: 'article', label: '📄 Article' },
  { key: 'wellbeing', label: '💚 Wellbeing' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  uploadButton: {
    backgroundColor: '#fff', margin: 12, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd',
  },
  uploadButtonText: { color: '#333', fontWeight: 'bold', fontSize: 15 },
  tabScroll: { maxHeight: 50 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, paddingBottom: 8 },
  tab: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
  },
  activeTab: { backgroundColor: '#F97316', borderColor: '#F97316' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 13 },
  activeTabText: { color: '#fff' },
  searchBox: {
    backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#eee',
  },
  grid: { paddingHorizontal: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    width: '47%',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    marginBottom: 0,
  },
  cardThumbnail: { width: '100%', aspectRatio: 16/9, backgroundColor: '#f3f0f8', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  cardThumbnailText: { fontSize: 40 },
  cardBody: { padding: 10 },
  cardTitle: { fontWeight: 'bold', color: '#333', fontSize: 13, marginBottom: 4 },
  cardDesc: { color: '#888', fontSize: 11, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardAuthor: { color: '#aaa', fontSize: 10 },
  cardActions: { flexDirection: 'row', gap: 6 },
  openButton: {
    backgroundColor: '#6B21A8', borderRadius: 8,
    paddingVertical: 4, paddingHorizontal: 8,
  },
  openButtonText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  deleteButton: {
    backgroundColor: '#fff0f0', borderRadius: 8,
    paddingVertical: 4, paddingHorizontal: 8,
    borderWidth: 1, borderColor: '#ff4444',
  },
  deleteButtonText: { color: '#ff4444', fontSize: 11 },
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
    padding: 12, fontSize: 14, marginBottom: 10, color: '#333',
  },
  typeLabel: { color: '#888', fontSize: 13, marginBottom: 6 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  typeChip: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: '#f3f0f8', borderWidth: 1, borderColor: '#ddd',
  },
  typeChipActive: { backgroundColor: '#6B21A8', borderColor: '#6B21A8' },
  typeChipText: { color: '#666', fontSize: 12 },
  typeChipTextActive: { color: '#fff' },
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

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

const getTypeEmoji = (type: string) => {
  switch (type) {
    case 'video': return '🎥';
    case 'image': return '🖼️';
    case 'podcast': return '🎙️';
    case 'article': return '📄';
    case 'wellbeing': return '💚';
    default: return '📎';
  }
};

const detectType = (url: string): string | null => {
  if (/youtube\.com|youtu\.be/.test(url)) return 'video';
  if (/spotify\.com/.test(url)) return 'podcast';
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url)) return 'image';
  return null;
};

const validateType = (url: string, selectedType: string): boolean => {
  if (/youtube\.com|youtu\.be/.test(url) && selectedType !== 'video') return false;
  if (/spotify\.com/.test(url) && selectedType !== 'podcast') return false;
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) && selectedType !== 'image') return false;
  return true;
};

export default function ResourcesScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [resources, setResources] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('');
  const user = useUser();

  const loadResources = async () => {
    try {
      const res = await resourcesAPI.getAll(activeTab === 'all' ? undefined : activeTab);
      setResources(res.data);
    } catch (e) {
      console.log('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!title || !url || !type) {
      setErrorMsg('Please fill in title, URL and select a type.');
      return;
    }
    if (!validateType(url, type)) {
      setErrorMsg('URL and type do not match! YouTube → Video, Spotify → Podcast, image file → Image.');
      return;
    }
    setErrorMsg('');
    setUploading(true);
    try {
      await resourcesAPI.create({ title, description, url, type });
      setShowUpload(false);
      setTitle(''); setDescription(''); setUrl(''); setType('');
      loadResources();
    } catch (e) {
      setErrorMsg('Failed to upload resource.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await resourcesAPI.delete(id);
      loadResources();
    } catch (e) {
      console.log('Failed to delete');
    }
  };

  useEffect(() => { loadResources(); }, [activeTab]);

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const renderCard = (item: any) => {
    const ytId = getYouTubeId(item.url);
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardThumbnail}>
          {item.type === 'video' && ytId ? (
            <Image
              source={{ uri: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : item.type === 'image' ? (
            <Image
              source={{ uri: item.url }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.cardThumbnailText}>{getTypeEmoji(item.type)}</Text>
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          {item.description ? <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text> : null}
          <View style={styles.cardFooter}>
            <Text style={styles.cardAuthor}>👤 {item.author?.username}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.openButton} onPress={() => Linking.openURL(item.url)}>
                <Text style={styles.openButtonText}>{item.type === 'video' ? '▶' : 'Open'}</Text>
              </TouchableOpacity>
              {String(item.author?.id) === String(user?.id) && (
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Modal visible={showUpload} transparent animationType="slide">
        <ScrollView contentContainerStyle={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Upload Resource</Text>
            {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}
            <TextInput style={styles.modalInput} placeholder="Title *" placeholderTextColor="#aaa" value={title} onChangeText={setTitle} />
            <TextInput style={styles.modalInput} placeholder="Description (optional)" placeholderTextColor="#aaa" value={description} onChangeText={setDescription} multiline />
            <TextInput
              style={styles.modalInput}
              placeholder="URL *"
              placeholderTextColor="#aaa"
              value={url}
              onChangeText={(text) => {
                setUrl(text);
                const detected = detectType(text);
                if (detected) setType(detected);
              }}
            />
            <Text style={styles.typeLabel}>Type *</Text>
            <View style={styles.typeRow}>
              {TYPES.map(t => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setType(t.key)}
                  style={[styles.typeChip, type === t.key && styles.typeChipActive]}
                >
                  <Text style={[styles.typeChipText, type === t.key && styles.typeChipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSave} onPress={handleUpload} disabled={uploading}>
                {uploading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalSaveText}>Upload</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowUpload(false); setErrorMsg(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      <TouchableOpacity style={styles.uploadButton} onPress={() => setShowUpload(true)}>
        <Text style={styles.uploadButtonText}>⬆️ Upload</Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <View style={styles.tabContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TextInput
        style={styles.searchBox}
        placeholder="Search resources..."
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator color="#6B21A8" style={{ marginTop: 32 }} />
      ) : (
        <ScrollView>
          <View style={styles.grid}>
            {filtered.length === 0 && (
              <Text style={styles.emptyText}>No resources found</Text>
            )}
            {filtered.map((item) => renderCard(item))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}