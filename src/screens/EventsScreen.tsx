import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { eventsAPI } from '../services/api';
import { useUser } from '../store';
import CreateEventScreen from './CreateEventScreen';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  subHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#6B21A8', paddingHorizontal: 16,
    paddingVertical: 12, gap: 12,
  },
  subHeaderBack: { color: '#fff', fontSize: 22 },
  subHeaderTitle: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  createButton: {
    backgroundColor: '#fff', margin: 12, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd',
  },
  createButtonText: { color: '#333', fontWeight: 'bold', fontSize: 15 },
  searchBox: {
    backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    marginBottom: 8, color: '#333',
  },
  eventCard: {
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  eventCardTop: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 16, paddingBottom: 10,
  },
  dateBox: {
    backgroundColor: '#6B21A8', borderRadius: 10, padding: 8,
    alignItems: 'center', minWidth: 48, marginRight: 12,
  },
  dateBoxDay: { color: '#fff', fontWeight: 'bold', fontSize: 20, lineHeight: 24 },
  dateBoxMonth: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  eventInfo: { flex: 1 },
  eventTitle: { fontWeight: 'bold', color: '#333', fontSize: 15, marginBottom: 4 },
  eventCategory: {
    alignSelf: 'flex-start', backgroundColor: '#f3f0f8', borderRadius: 10,
    paddingVertical: 2, paddingHorizontal: 8, marginBottom: 6,
  },
  eventCategoryText: { color: '#6B21A8', fontSize: 11, fontWeight: '600' },
  eventMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  eventMetaText: { color: '#888', fontSize: 12 },
  eventDesc: { color: '#666', fontSize: 13, paddingHorizontal: 16, marginBottom: 8, lineHeight: 18 },
  attendeesRow: { paddingHorizontal: 16, paddingBottom: 8 },
  attendeesText: { color: '#888', fontSize: 13 },
  eventFooter: {
    flexDirection: 'row', gap: 8, padding: 12, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  joinButton: {
    flex: 1, backgroundColor: '#F97316', borderRadius: 20,
    paddingVertical: 8, alignItems: 'center',
  },
  joinButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  attendingButton: {
    flex: 1, backgroundColor: '#f3f0f8', borderRadius: 20,
    paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#6B21A8',
  },
  attendingButtonText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 13 },
  interestedButton: {
    flex: 1, backgroundColor: '#333', borderRadius: 20,
    paddingVertical: 8, alignItems: 'center',
  },
  interestedButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  shareButton: {
    flex: 1, backgroundColor: '#f3f0f8', borderRadius: 20,
    paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd',
  },
  shareButtonText: { color: '#555', fontWeight: '600', fontSize: 13 },
  deleteText: { color: '#ff4444', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 32, fontSize: 14 },
});

type TabType = 'all' | 'future' | 'past' | 'my' | 'joined';

export default function EventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const user = useUser();
  const navigation = useNavigation<any>();   // ← 新增

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getAll();
      setEvents(res.data);
    } catch (e) {
      console.log('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleAttend = async (eventId: number) => {
    try {
      await eventsAPI.attend(eventId);
      loadEvents();
    } catch (e) {}
  };

  const handleDelete = async (eventId: number) => {
    try {
      await eventsAPI.delete(eventId);
      loadEvents();
    } catch (e) {}
  };

  const isAttending = (event: any) =>
    event.attendees?.some((a: any) => String(a.userId) === String(user?.id));

  const getFilteredEvents = () => {
    const now = new Date();
    let filtered = events;
    if (activeTab === 'future') filtered = events.filter(e => new Date(e.date) > now);
    else if (activeTab === 'past') filtered = events.filter(e => new Date(e.date) <= now);
    else if (activeTab === 'my') filtered = events.filter(e => String(e.author?.id) === String(user?.id));
    else if (activeTab === 'joined') filtered = events.filter(e => isAttending(e));
    if (search) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  };

  useEffect(() => { loadEvents(); }, []);

  if (showCreate) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f3f0f8' }}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setShowCreate(false)}>
            <Text style={styles.subHeaderBack}>←</Text>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Create Event</Text>
        </View>
        <CreateEventScreen
          onBack={() => setShowCreate(false)}
          onCreated={() => {
            setLoading(true);
            setShowCreate(false);
            loadEvents();
          }}
        />
      </View>
    );
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

  const filteredEvents = getFilteredEvents();
  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'future', label: 'Future' },
    { key: 'past', label: 'Past' },
    { key: 'my', label: 'My Events' },
    { key: 'joined', label: 'Joined' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View>
            <TouchableOpacity style={styles.createButton} onPress={() => setShowCreate(true)}>
              <Text style={styles.createButtonText}>+ Create Event</Text>
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: 12, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {tabs.map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={{
                      paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
                      backgroundColor: activeTab === t.key ? '#F97316' : '#fff',
                    }}
                    onPress={() => setActiveTab(t.key)}
                  >
                    <Text style={{ color: activeTab === t.key ? '#fff' : '#888', fontWeight: '600', fontSize: 13 }}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TextInput
              style={styles.searchBox}
              placeholder="Search events..."
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No events found.</Text>}
        renderItem={({ item }) => {
          const eventDate = new Date(item.date);
          const day = eventDate.toLocaleDateString('en-GB', { day: 'numeric' });
          const month = eventDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
          const time = eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

          return (
            // ← 整张卡片可点击跳转
            <TouchableOpacity
              style={styles.eventCard}
              activeOpacity={0.95}
              onPress={() => navigation.navigate('EventDetail', { event: item })}
            >
              <View style={styles.eventCardTop}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateBoxDay}>{day}</Text>
                  <Text style={styles.dateBoxMonth}>{month}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <View style={styles.eventCategory}>
                    <Text style={styles.eventCategoryText}>{item.category}</Text>
                  </View>
                  <View style={styles.eventMeta}>
                    <Text style={styles.eventMetaText}>🕐 {time}</Text>
                    <Text style={styles.eventMetaText}>📍 {item.location}</Text>
                    <Text style={styles.eventMetaText}>👤 {item.author?.username}</Text>
                  </View>
                </View>
              </View>

              {item.description ? (
                <Text style={styles.eventDesc}>{item.description}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.attendeesRow}
                onPress={(e) => {
                  e.stopPropagation?.();   // 阻止冒泡到外层跳转
                  setExpandedEvent(expandedEvent === item.id ? null : item.id);
                }}
              >
                <Text style={styles.attendeesText}>
                  👥 {item._count?.attendees || 0} attending {expandedEvent === item.id ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {expandedEvent === item.id && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                  {item.attendees?.length === 0
                    ? <Text style={{ color: '#aaa', fontSize: 12 }}>No attendees yet</Text>
                    : item.attendees?.map((a: any) => (
                      <Text key={a.user?.id} style={{ color: '#555', fontSize: 13, marginTop: 2 }}>
                        • {a.user?.username}
                      </Text>
                    ))
                  }
                </View>
              )}

              <View style={styles.eventFooter}>
                <TouchableOpacity
                  style={isAttending(item) ? styles.attendingButton : styles.joinButton}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    handleAttend(item.id);
                  }}
                >
                  <Text style={isAttending(item) ? styles.attendingButtonText : styles.joinButtonText}>
                    {isAttending(item) ? '✓ Attending' : 'Join'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.interestedButton}
                  onPress={(e) => e.stopPropagation?.()}
                >
                  <Text style={styles.interestedButtonText}>Interested</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    Share.share({
                      message: `Check out this event on SOIN: ${item.title} on ${day} ${month} at ${item.location}`
                    });
                  }}
                >
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>

                {String(item.author?.id) === String(user?.id) && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handleDelete(item.id);
                    }}
                  >
                    <Text style={styles.deleteText}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}