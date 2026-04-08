import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { eventsAPI, groupsAPI } from '../services/api';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  scrollContent: { padding: 16, paddingBottom: 60 },
  imageBox: {
    backgroundColor: '#fff', borderRadius: 16, height: 160,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
    borderWidth: 1, borderColor: '#eee', overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  imageUploadIcon: { fontSize: 36, color: '#F97316', marginBottom: 8 },
  imageUploadText: { color: '#888', fontSize: 14 },
  label: { color: '#555', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#eee',
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  recurringCard: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee',
    padding: 14, marginTop: 14,
  },
  recurringHeader: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 10 },
  radioRow: { flexDirection: 'row', gap: 24 },
  radioOption: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#aaa',
    alignItems: 'center', justifyContent: 'center',
  },
  radioCircleActive: { borderColor: '#6B21A8' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6B21A8' },
  radioText: { fontSize: 14, color: '#555' },
  groupPicker: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#eee', marginTop: 4, overflow: 'hidden',
  },
  groupOption: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  groupOptionSelected: { backgroundColor: '#f3f0f8' },
  groupOptionText: { fontSize: 14, color: '#333' },
  errorText: { color: '#e53e3e', fontSize: 13, marginTop: 12 },
  saveButton: {
    backgroundColor: '#F97316', borderRadius: 24, paddingVertical: 14,
    alignItems: 'center', marginTop: 28,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default function CreateEventScreen({ onBack, onCreated }: {
  onBack: () => void;
  onCreated: () => void;
}) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('1000');
  const [recurring, setRecurring] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [showGroupList, setShowGroupList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    groupsAPI.getMyGroups().then((res: any) => {
      setGroups(res.data || []);
    }).catch(() => {});
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { setErrorMsg('Event name is required.'); return; }
    if (!location.trim()) { setErrorMsg('Location is required.'); return; }
    if (!startDate.trim()) { setErrorMsg('Start date is required.'); return; }

    const dateTimeStr = `${startDate}T${startTime}:00`;
    const parsedDate = new Date(dateTimeStr);
    if (isNaN(parsedDate.getTime())) {
      setErrorMsg('Invalid date format. Use YYYY-MM-DD and HH:MM.');
      return;
    }
    const endDateTimeStr = `${startDate}T${endTime}:00`;
    const parsedEnd = new Date(endDateTimeStr);

    setErrorMsg('');
    setCreating(true);
    try {
      const res = await eventsAPI.create({
        title,
        description,
        location,
        date: parsedDate.toISOString(),
        endTime: parsedEnd.toISOString(),
        category: 'General',
        imageUrl: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : null,
        capacity: capacity ? parseInt(capacity) : 1000,
        recurring,
        groupId: selectedGroupId,
      });
      console.log('✅ Create success:', res.status);
      onCreated();  // ← 现在可以正确调用了
    } catch (e: any) {
      console.log('❌ Create error:', e?.message, e?.response?.status);
      setErrorMsg('Failed to create event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* 图片上传 */}
        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
          ) : (
            <>
              <Text style={styles.imageUploadIcon}>⬆️</Text>
              <Text style={styles.imageUploadText}>Choose image</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Location */}
        <Text style={styles.label}>Event Location (Full Address)</Text>
        <TextInput
          style={styles.input}
          placeholder="Start typing an address..."
          placeholderTextColor="#bbb"
          value={location}
          onChangeText={setLocation}
        />

        {/* Event Name */}
        <Text style={styles.label}>Event name</Text>
        <TextInput
          style={styles.input}
          placeholder="Event name"
          placeholderTextColor="#bbb"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          placeholderTextColor="#bbb"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Capacity */}
        <Text style={styles.label}>Maximum Capacity</Text>
        <TextInput
          style={styles.input}
          placeholder="1000"
          placeholderTextColor="#bbb"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
        />

        {/* Recurring */}
        <View style={styles.recurringCard}>
          <Text style={styles.recurringHeader}>Recurring</Text>
          <View style={styles.radioRow}>
            <TouchableOpacity style={styles.radioOption} onPress={() => setRecurring(true)}>
              <View style={[styles.radioCircle, recurring && styles.radioCircleActive]}>
                {recurring && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.radioOption} onPress={() => setRecurring(false)}>
              <View style={[styles.radioCircle, !recurring && styles.radioCircleActive]}>
                {!recurring && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Date */}
        <Text style={styles.label}>Start Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#bbb"
          value={startDate}
          onChangeText={setStartDate}
        />

        {/* Start / End Time */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Start Time</Text>
            <TextInput
              style={styles.input}
              placeholder="09:00"
              placeholderTextColor="#bbb"
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>End Time</Text>
            <TextInput
              style={styles.input}
              placeholder="10:00"
              placeholderTextColor="#bbb"
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>

        {/* Select Group */}
        <Text style={styles.label}>Select Group</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowGroupList(!showGroupList)}
        >
          <Text style={{ color: selectedGroup ? '#333' : '#bbb', fontSize: 14 }}>
            {selectedGroup ? selectedGroup.name : '-- Select Group --'}
          </Text>
        </TouchableOpacity>

        {showGroupList && (
          <View style={styles.groupPicker}>
            <TouchableOpacity
              style={styles.groupOption}
              onPress={() => { setSelectedGroupId(null); setShowGroupList(false); }}
            >
              <Text style={styles.groupOptionText}>-- None --</Text>
            </TouchableOpacity>
            {groups.map(g => (
              <TouchableOpacity
                key={g.id}
                style={[styles.groupOption, selectedGroupId === g.id && styles.groupOptionSelected]}
                onPress={() => { setSelectedGroupId(g.id); setShowGroupList(false); }}
              >
                <Text style={styles.groupOptionText}>{g.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={creating}>
          {creating
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.saveButtonText}>Save</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}