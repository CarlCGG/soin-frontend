import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, Image, Switch, Dimensions, Alert } from 'react-native';
import { assetsAPI } from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../store';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const EQUIPMENT_CATEGORIES = ['Home appliances', 'Electronics', 'Sport equipments', 'Tools', 'Furniture', 'Other'];
const SERVICE_CATEGORIES = ['Cleaning', 'Repair', 'Tutoring', 'Transport', 'Catering', 'Other'];
const SPACE_CATEGORIES = ['Meeting room', 'Studio', 'Garden', 'Parking', 'Kitchen', 'Other'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  topButtons: { flexDirection: 'row', gap: 8, margin: 12 },
  addButton: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#ccc', flexDirection: 'row',
    justifyContent: 'center', gap: 6,
  },
  addButtonText: { color: '#111', fontWeight: 'bold', fontSize: 13 },
  tabContainer: {
    backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12,
    flexDirection: 'row', padding: 4, marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#F97316' },
  tabText: { color: '#666', fontWeight: '600', fontSize: 11 },
  activeTabText: { color: '#fff' },
  searchBox: {
    backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#bbb', color: '#000'
  },
  grid: { paddingHorizontal: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    width: '48%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    marginBottom: 12,
  },
  cardPostedBy: { fontSize: 10, color: '#777', padding: 8, paddingBottom: 2 },
  cardAuthor: { fontSize: 12, fontWeight: 'bold', color: '#111', paddingHorizontal: 8, marginBottom: 6 },
  cardImage: { width: '100%', aspectRatio: 4/3, backgroundColor: '#f3f0f8' },
  cardImagePlaceholder: { width: '100%', aspectRatio: 4/3, backgroundColor: '#f3f0f8', justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 8 },
  cardCategory: { color: '#555', fontSize: 10, marginBottom: 2 },
  cardTitle: { fontWeight: 'bold', color: '#111', fontSize: 13, marginBottom: 8 },
  viewButton: { backgroundColor: '#F97316', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  viewButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  deleteButton: {
    backgroundColor: '#fff', borderRadius: 8, paddingVertical: 6, alignItems: 'center', 
    marginTop: 6, borderWidth: 1, borderColor: '#ff4444',
  },
  deleteButtonText: { color: '#ff4444', fontWeight: 'bold', fontSize: 11 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 32, fontSize: 14, width: '100%' },
  modalOverlay: { backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 20, paddingHorizontal: 16 },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 16 },
  errorText: { color: '#D32F2F', fontSize: 13, marginBottom: 10, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 6, marginTop: 8 },
  modalInput: {
    borderWidth: 1.5, borderColor: '#999', borderRadius: 12,
    padding: 12, fontSize: 15, marginBottom: 12, color: '#000', backgroundColor: '#fff'
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  categoryChip: {
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ccc',
  },
  categoryChipActive: { backgroundColor: '#F97316', borderColor: '#F97316' },
  categoryChipText: { color: '#333', fontSize: 12, fontWeight: '600' },
  categoryChipTextActive: { color: '#fff' },
  dayChip: {
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#bbb', marginBottom: 6, marginRight: 6
  },
  dayChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  dayChipText: { fontSize: 12, color: '#111', fontWeight: '600' },
  dayChipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: 10 },
  inputGroup: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalSave: { flex: 1, backgroundColor: '#F97316', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalSaveText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalCancel: { flex: 1, backgroundColor: '#eee', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#bbb' },
  modalCancelText: { color: '#111', fontWeight: 'bold', fontSize: 15 },
});

export default function SharedAssetsScreen() {
  const navigation = useNavigation<any>();
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
  const [location, setLocation] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  
  const [quantity, setQuantity] = useState('1');
  const [amount, setAmount] = useState('0');
  const [peopleCount, setPeopleCount] = useState('1');
  const [hourlyRate, setHourlyRate] = useState('0');
  const [capacity, setCapacity] = useState('1');
  const [dailyRate, setDailyRate] = useState('0');

  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  // 新增：记录当前用户在此会话中预约过的资产 ID
  const [hasBookedCurrent, setHasBookedCurrent] = useState<{[key: number]: boolean}>({});
  
  const user = useUser();

  const loadAssets = async () => {
    try {
      setLoading(true);
      const res = (activeTab === 'my') 
        ? await assetsAPI.getMy() 
        : await assetsAPI.getAll(activeTab === 'all' ? undefined : activeTab);
      setAssets(res.data);
    } catch (e) { console.log('Failed to load assets'); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadAssets(); }, [activeTab]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImageUrl(result.assets[0].uri);
  };

  const openModal = (type: string) => {
    setModalType(type);
    setTitle(''); setDescription(''); setCategory(''); setImageUrl(''); setLocation('');
    setAvailableFrom(''); setAvailableUntil(''); setSelectedDays([]); setIsAvailable(true);
    setQuantity('1'); setAmount('0'); setPeopleCount('1'); setHourlyRate('0'); setCapacity('1'); setDailyRate('0');
    setErrorMsg(''); setShowModal(true);
  };

  const handleCreate = async () => {
    if (!title || !category) { setErrorMsg('Please fill in required fields (*)'); return; }
    setCreating(true);
    try {
      const payload = {
        title, description, type: modalType, category, imageUrl, location,
        isAvailable, availableFrom, availableUntil,
        daysAvailable: selectedDays.join(','),
        quantity, amount, peopleCount, hourlyRate, capacity, dailyRate
      };
      await assetsAPI.create(payload);
      setShowModal(false);
      loadAssets();
    } catch (e) { setErrorMsg('Failed to create asset.'); } 
    finally { setCreating(false); }
  };

  const handleDelete = async (id: number) => {
    try { await assetsAPI.delete(id); loadAssets(); } 
    catch (e) { console.log('Failed to delete'); }
  };

  const handleEnquire = () => {
    const targetUserId = selectedAsset?.author?.id;
    const targetUserName = selectedAsset?.author?.username;
    if (!targetUserId) return;
    setSelectedAsset(null); 
    navigation.navigate('Chat', { userId: Number(targetUserId), username: targetUserName || "User" });
  };

  const handleBookNow = async () => {
    if (!selectedAsset) return;
    try {
      const currentQty = typeof selectedAsset.quantity === 'string' ? parseInt(selectedAsset.quantity) : (selectedAsset.quantity || 0);
      if (currentQty <= 0) {
        Alert.alert("Sold Out", "This item is no longer available.");
        return;
      }
      const newQty = currentQty - 1;
      await assetsAPI.update(selectedAsset.id, { quantity: newQty, isAvailable: newQty > 0 });
      
      // 标记当前用户已预约此项
      setHasBookedCurrent(prev => ({ ...prev, [selectedAsset.id]: true }));
      
      Alert.alert("Success!", "Booking successful.", [{ text: "OK", onPress: () => { setSelectedAsset(null); loadAssets(); } }]);
    } catch (error) {
      Alert.alert("Error", "Booking failed.");
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedAsset) return;
    
    // 安全检查：如果没预约过，不执行逻辑
    if (!hasBookedCurrent[selectedAsset.id]) {
      Alert.alert("Notice", "You haven't booked this item yet.");
      return;
    }

    try {
      const currentQty = typeof selectedAsset.quantity === 'string' ? parseInt(selectedAsset.quantity) : (selectedAsset.quantity || 0);
      await assetsAPI.update(selectedAsset.id, { quantity: currentQty + 1, isAvailable: true });
      
      // 取消成功后清除预约标记
      setHasBookedCurrent(prev => ({ ...prev, [selectedAsset.id]: false }));
      
      Alert.alert("Success", "Booking cancelled.", [{ text: "OK", onPress: () => { setSelectedAsset(null); loadAssets(); } }]);
    } catch (error) {
      Alert.alert("Error", "Failed to cancel.");
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const getCats = () => {
    if (modalType === 'equipment') return EQUIPMENT_CATEGORIES;
    if (modalType === 'service') return SERVICE_CATEGORIES;
    return SPACE_CATEGORIES;
  };

  const filtered = assets.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Asset Detail Modal */}
      <Modal visible={!!selectedAsset} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: 750, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text style={{ fontSize: 16, fontWeight: '700' }}>Asset Details</Text>
              <TouchableOpacity onPress={() => setSelectedAsset(null)}><Text style={{ fontSize: 20, color: '#aaa' }}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <View style={{ flex: 1, minWidth: 250, paddingRight: 15 }}>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: '#1a202c', marginBottom: 15 }}>{selectedAsset?.title}</Text>
                  
                  <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#a0aec0', fontSize: 10, fontWeight: '700' }}>CATEGORY</Text>
                      <Text style={{ color: '#4a5568', fontSize: 14 }}>{selectedAsset?.category || 'N/A'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#a0aec0', fontSize: 10, fontWeight: '700' }}>PRICE</Text>
                      <Text style={{ color: '#4a5568', fontSize: 14 }}>${selectedAsset?.amount || selectedAsset?.hourlyRate || selectedAsset?.dailyRate || '0'}</Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 15 }}>
                    <Text style={{ color: '#a0aec0', fontSize: 10, fontWeight: '700' }}>STOCK / CAPACITY</Text>
                    <Text style={{ color: '#4a5568', fontSize: 14 }}>{selectedAsset?.quantity ?? selectedAsset?.capacity ?? 0} left</Text>
                  </View>

                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: '#a0aec0', fontSize: 10, fontWeight: '700', marginBottom: 5 }}>STATUS</Text>
                    <View style={{ backgroundColor: (selectedAsset?.quantity ?? 0) > 0 ? '#2f855a' : '#e53e3e', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{(selectedAsset?.quantity ?? 0) > 0 ? 'Available' : 'Sold Out'}</Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 14, color: '#4a5568', lineHeight: 20, marginBottom: 20 }}>{selectedAsset?.description}</Text>
                </View>

                <View style={{ width: '100%', maxWidth: 220, height: 220 }}>
                  <Image source={{ uri: selectedAsset?.imageUrl || 'https://via.placeholder.com/220' }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                <TouchableOpacity onPress={handleEnquire} style={{ flex: 1, backgroundColor: '#ed8936', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>💬 Enquire</Text>
                </TouchableOpacity>

                {(selectedAsset?.quantity ?? 0) > 0 ? (
                  <TouchableOpacity onPress={handleBookNow} style={{ flex: 1, backgroundColor: '#38a169', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>📅 Book Now</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ flex: 1, backgroundColor: '#cbd5e0', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>🚫 Sold Out</Text>
                  </View>
                )}
              </View>

              {/* 仅当该资产在当前会话被用户点击预约过，才显示取消按钮 */}
              {hasBookedCurrent[selectedAsset?.id] && (
                <TouchableOpacity onPress={handleCancelBooking} style={{ marginTop: 15, alignSelf: 'center' }}>
                  <Text style={{ color: '#e53e3e', fontSize: 12, textDecorationLine: 'underline' }}>Cancel My Booking</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Asset Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <ScrollView contentContainerStyle={styles.modalOverlay} keyboardShouldPersistTaps="handled">
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>ADD {modalType.toUpperCase()}</Text>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
            
            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.modalInput} value={title} onChangeText={setTitle} placeholder="Enter name" />
            
            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.modalInput, { height: 70 }]} value={description} onChangeText={setDescription} multiline placeholder="Enter description" />
            
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryRow}>
              {getCats().map(cat => (
                <TouchableOpacity key={cat} onPress={() => setCategory(cat)} style={[styles.categoryChip, category === cat && styles.categoryChipActive]}>
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {modalType === 'equipment' && (
              <View style={styles.row}>
                <View style={styles.inputGroup}><Text style={styles.label}>Quantity *</Text><TextInput style={styles.modalInput} value={quantity} onChangeText={setQuantity} keyboardType="numeric" /></View>
                <View style={styles.inputGroup}><Text style={styles.label}>Amount ($) *</Text><TextInput style={styles.modalInput} value={amount} onChangeText={setAmount} keyboardType="numeric" /></View>
              </View>
            )}

            {modalType === 'service' && (
              <View style={styles.row}>
                <View style={styles.inputGroup}><Text style={styles.label}>People *</Text><TextInput style={styles.modalInput} value={peopleCount} onChangeText={setPeopleCount} keyboardType="numeric" /></View>
                <View style={styles.inputGroup}><Text style={styles.label}>Rate ($/hr) *</Text><TextInput style={styles.modalInput} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" /></View>
              </View>
            )}

            {modalType === 'space' && (
              <View style={styles.row}>
                <View style={styles.inputGroup}><Text style={styles.label}>Capacity *</Text><TextInput style={styles.modalInput} value={capacity} onChangeText={setCapacity} keyboardType="numeric" /></View>
                <View style={styles.inputGroup}><Text style={styles.label}>Rate ($/day) *</Text><TextInput style={styles.modalInput} value={dailyRate} onChangeText={setDailyRate} keyboardType="numeric" /></View>
              </View>
            )}

            <Text style={styles.label}>Image</Text>
            <TouchableOpacity onPress={handlePickImage} style={[styles.modalInput, { alignItems: 'center', justifyContent: 'center', height: 100, borderStyle: 'dashed' }]}>
              {imageUrl ? <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 8 }} /> : <Text>+ Select Image</Text>}
            </TouchableOpacity>

            <Text style={styles.label}>Location *</Text>
            <TextInput style={styles.modalInput} value={location} onChangeText={setLocation} placeholder="Enter address" />

            <View style={styles.row}>
              <View style={styles.inputGroup}><Text style={styles.label}>From</Text><TextInput style={styles.modalInput} value={availableFrom} onChangeText={setAvailableFrom} placeholder="YYYY-MM-DD" /></View>
              <View style={styles.inputGroup}><Text style={styles.label}>Until</Text><TextInput style={styles.modalInput} value={availableUntil} onChangeText={setAvailableUntil} placeholder="YYYY-MM-DD" /></View>
            </View>

            <Text style={styles.label}>Days Available</Text>
            <View style={styles.categoryRow}>
              {DAYS.map(day => (
                <TouchableOpacity key={day} onPress={() => toggleDay(day)} style={[styles.dayChip, selectedDays.includes(day) && styles.dayChipActive]}>
                  <Text style={[styles.dayChipText, selectedDays.includes(day) && styles.dayChipTextActive]}>{day.substring(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.row, { alignItems: 'center', marginTop: 10 }]}>
              <Switch value={isAvailable} onValueChange={setIsAvailable} trackColor={{ false: "#ccc", true: "#4ADE80" }} />
              <Text style={{ marginLeft: 8, fontWeight: 'bold' }}>Mark as available</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowModal(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleCreate} disabled={creating}><Text style={styles.modalSaveText}>{creating ? 'Creating...' : 'Create Now'}</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Main UI List */}
      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal('equipment')}><Text>🔧</Text><Text style={styles.addButtonText}>Equipment</Text></TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal('service')}><Text>👤</Text><Text style={styles.addButtonText}>Service</Text></TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal('space')}><Text>🏢</Text><Text style={styles.addButtonText}>Space</Text></TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {[{ key: 'all', label: 'Browse' }, { key: 'equipment', label: 'Equips' }, { key: 'service', label: 'Services' }, { key: 'space', label: 'Spaces' }, { key: 'my', label: 'Mine' }].map(tab => (
          <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.activeTab]} onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.searchBox} placeholder="Search assets..." value={search} onChangeText={setSearch} />

      {loading ? <ActivityIndicator color="#F97316" size="large" style={{ marginTop: 40 }} /> : (
        <ScrollView><View style={styles.grid}>
          {filtered.length === 0 && <Text style={styles.emptyText}>No listings found</Text>}
          {filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardPostedBy}>Posted By</Text>
              <Text style={styles.cardAuthor} numberOfLines={1}>{item.author?.username}</Text>
              {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.cardImage} /> : <View style={styles.cardImagePlaceholder}><Text style={{ fontSize: 24 }}>📦</Text></View>}
              <View style={styles.cardBody}>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                
                <View style={{ backgroundColor: (item.quantity ?? 0) > 0 ? '#C6F6D5' : '#FED7D7', alignSelf: 'flex-start', paddingHorizontal: 6, borderRadius: 4, marginBottom: 8 }}>
                   <Text style={{ fontSize: 10, color: (item.quantity ?? 0) > 0 ? '#22543D' : '#822727' }}>
                     {(item.quantity ?? 0) > 0 ? `In Stock: ${item.quantity}` : 'Sold Out'}
                   </Text>
                </View>

                <TouchableOpacity style={styles.viewButton} onPress={() => setSelectedAsset(item)}><Text style={styles.viewButtonText}>View</Text></TouchableOpacity>
                {String(item.author?.id) === String(user?.id) && <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}><Text style={styles.deleteButtonText}>Delete</Text></TouchableOpacity>}
              </View>
            </View>
          ))}
        </View></ScrollView>
      )}
    </View>
  );
}