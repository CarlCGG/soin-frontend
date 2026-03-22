import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, ScrollView
} from 'react-native';
import { eventsAPI } from '../services/api';
import { useUser } from '../store';

const CATEGORIES = ['Sports & Leisure', 'Education & Training', 'Health & Wellbeing', 'Business & Finance', 'Arts & Culture', 'Technology'];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  createButton: {
    backgroundColor: '#F97316', margin: 12, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  eventCard: {
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  eventTitle: { fontWeight: 'bold', color: '#333', fontSize: 16, flex: 1 },
  eventCategory: {
    backgroundColor: '#f3f0f8', borderRadius: 12,
    paddingVertical: 4, paddingHorizontal: 10,
  },
  eventCategoryText: { color: '#6B21A8', fontSize: 11, fontWeight: '600' },
  eventDesc: { color: '#666', fontSize: 14, marginBottom: 10, lineHeight: 20 },
  eventMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  eventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventMetaText: { color: '#888', fontSize: 12 },
  eventFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10,
  },
  attendButton: {
    backgroundColor: '#6B21A8', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 20,
  },
  attendingButton: {
    backgroundColor: '#f3f0f8', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 20,
    borderWidth: 1, borderColor: '#6B21A8',
  },
  attendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  attendingButtonText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 13 },
  attendeesText: { color: '#888', fontSize: 13 },
  deleteText: { color: '#ff4444', fontSize: 13 },
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

export default function EventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const user = useUser();

  const loadEvents = async () => {
    try {
      const res = await eventsAPI.getAll();
      setEvents(res.data);
    } catch (e) {
      console.log('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title || !location || !date || !category) {
      setErrorMsg('Please fill in title, location, date and select a category.');
      return;
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      setErrorMsg('Invalid date. Please select a valid date and time.');
      return;
    }
    setErrorMsg('');
    setCreating(true);
    try {
      await eventsAPI.create({ title, description, location, date: parsedDate.toISOString(), category });
      setShowCreate(false);
      setTitle(''); setDescription(''); setLocation(''); setDate(''); setCategory('');
      loadEvents();
    } catch (e) {
      setErrorMsg('Failed to create event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleAttend = async (eventId: number) => {
    try {
      await eventsAPI.attend(eventId);
      loadEvents();
    } catch (e) {
      console.log('Failed to attend');
    }
  };

  const handleDelete = async (eventId: number) => {
    try {
      await eventsAPI.delete(eventId);
      loadEvents();
    } catch (e) {
      console.log('Failed to delete');
    }
  };

  const isAttending = (event: any) => {
    return event.attendees?.some((a: any) => String(a.userId) === String(user?.id));
  };

  useEffect(() => { loadEvents(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

  return (
    <View style={styles.container}>
      <Modal visible={showCreate} transparent animationType="slide">
        <ScrollView contentContainerStyle={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create New Event</Text>
            {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}
            <TextInput style={styles.modalInput} placeholder="Event title *" value={title} onChangeText={setTitle} />
            <TextInput style={styles.modalInput} placeholder="Description (optional)" value={description} onChangeText={setDescription} multiline />
            <TextInput style={styles.modalInput} placeholder="Location *" value={location} onChangeText={setLocation} />
            <input
              type="datetime-local"
              value={date}
              onChange={(e: any) => setDate(e.target.value)}
              style={{
                border: '1px solid #eee', borderRadius: 12,
                padding: 12, fontSize: 14, marginBottom: 10,
                width: '100%', boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
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

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <TouchableOpacity style={styles.createButton} onPress={() => setShowCreate(true)}>
            <Text style={styles.createButtonText}>+ Create Event</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No events yet. Create one!</Text>}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <View style={styles.eventCategory}>
                <Text style={styles.eventCategoryText}>{item.category}</Text>
              </View>
            </View>
            {item.description ? <Text style={styles.eventDesc}>{item.description}</Text> : null}
            <View style={styles.eventMeta}>
              <View style={styles.eventMetaItem}>
                <Text style={styles.eventMetaText}>📅 {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              </View>
              <View style={styles.eventMetaItem}>
                <Text style={styles.eventMetaText}>🕐 {new Date(item.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <View style={styles.eventMetaItem}>
                <Text style={styles.eventMetaText}>📍 {item.location}</Text>
              </View>
              <View style={styles.eventMetaItem}>
                <Text style={styles.eventMetaText}>👤 {item.author?.username}</Text>
              </View>
            </View>

            {/* 参与人列表 */}
            <TouchableOpacity onPress={() => setExpandedEvent(expandedEvent === item.id ? null : item.id)}>
              <Text style={styles.attendeesText}>
                👥 {item._count?.attendees || 0} attending {expandedEvent === item.id ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {expandedEvent === item.id && (
              <View style={{ marginTop: 6, marginBottom: 8 }}>
                {item.attendees?.length === 0
                  ? <Text style={{ color: '#aaa', fontSize: 12 }}>No attendees yet</Text>
                  : item.attendees?.map((a: any) => (
                    <Text key={a.user.id} style={{ color: '#555', fontSize: 13, marginTop: 2 }}>
                      • {a.user.username}
                    </Text>
                  ))
                }
              </View>
            )}

            {/* 操作按钮 */}
            <View style={styles.eventFooter}>
              <View />
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {String(item.author?.id) === String(user?.id) && (
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={isAttending(item) ? styles.attendingButton : styles.attendButton}
                  onPress={() => handleAttend(item.id)}
                >
                  <Text style={isAttending(item) ? styles.attendingButtonText : styles.attendButtonText}>
                    {isAttending(item) ? '✓ Attending' : 'Attend'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}