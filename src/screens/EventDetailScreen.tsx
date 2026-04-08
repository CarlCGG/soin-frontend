import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Linking, Share, Alert,
} from 'react-native';
import { eventsAPI } from '../services/api';
import { useUser } from '../store';

export default function EventDetailScreen({ route, navigation }: any) {
  const { event } = route.params;
  const user = useUser();

  // ── 解析日期 ──────────────────────────────────────────────
  const eventDate = new Date(event.date);
  const day     = eventDate.toLocaleDateString('en-GB', { day: 'numeric' });
  const month   = eventDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
  const time    = eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const fullDate = eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // ── 初始状态 ──────────────────────────────────────────────
  const isAlreadyJoined = event.attendees?.some(
    (a: any) => String(a.userId) === String(user?.id)
  );
  const isAlreadyCheckedIn = event.attendees?.some(
    (a: any) => String(a.userId) === String(user?.id) && a.checkedIn === true
  );

  const [joined, setJoined]         = useState(isAlreadyJoined ?? false);
  const [checkedIn, setCheckedIn]   = useState(isAlreadyCheckedIn ?? false);
  const [joinCount, setJoinCount]   = useState(event._count?.attendees ?? event.attendees?.length ?? 0);
  const [checkInCount, setCheckInCount] = useState(
    event.attendees?.filter((a: any) => a.checkedIn).length ?? 0
  );
  const [activeTab, setActiveTab]   = useState('Overview');

  const tabs = ['Overview', 'Attendees', 'Discussion', 'Map'];

  // ── Join / Leave ──────────────────────────────────────────
  const handleJoin = async () => {
    try {
      await eventsAPI.attend(event.id);   // 你已有的 attend API（toggle）
      if (joined) {
        setJoined(false);
        setJoinCount((p: number) => p - 1);
        if (checkedIn) {
          setCheckedIn(false);
          setCheckInCount((p: number) => p - 1);
        }
      } else {
        setJoined(true);
        setJoinCount((p: number) => p + 1);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update attendance.');
    }
  };

  // ── Check-In ──────────────────────────────────────────────
  const handleCheckIn = async () => {
    if (!joined) {
      Alert.alert('Join first', 'You need to join the event before checking in.');
      return;
    }
    if (checkedIn) {
      Alert.alert('Already checked in', 'You have already checked in to this event.');
      return;
    }
    try {
      await eventsAPI.checkIn(event.id);   // 见下方 api 补充
      setCheckedIn(true);
      setCheckInCount((p: number) => p + 1);
    } catch (e) {
      Alert.alert('Error', 'Failed to check in.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Hero */}
      <View style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>{event.title}</Text>
        <Text style={styles.heroSub}>{event.category} · {event.location}</Text>
        <View style={styles.groupRow}>
          <View style={styles.groupAvatar}>
            <Text style={{ fontSize: 20 }}>⚽</Text>
          </View>
          <View>
            <Text style={styles.groupName}>{event.author?.username ?? 'Event'}</Text>
            <Text style={styles.groupMembers}>👥 {joinCount} Joined</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabRow}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {activeTab === 'Overview' && (
          <>
            {/* Date Card — 只有一个 date 字段 */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>DATE & TIME</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateBlock}>
                  <Text style={styles.dateNum}>{day}</Text>
                  <Text style={styles.dateMonth}>{month}</Text>
                  <Text style={styles.dateTime}>{time}</Text>
                  <Text style={styles.dateFull}>{fullDate}</Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Text style={{ color: '#6b4fbb', fontSize: 18 }}>📅</Text>
                </View>
                {/* 如果有 endDate 字段就显示，没有就显示 TBD */}
                <View style={[styles.dateBlock, { alignItems: 'flex-end' }]}>
                  {event.endDate ? (
                    <>
                      <Text style={[styles.dateNum, { color: ORANGE }]}>
                        {new Date(event.endDate).toLocaleDateString('en-GB', { day: 'numeric' })}
                      </Text>
                      <Text style={styles.dateMonth}>
                        {new Date(event.endDate).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                      </Text>
                      <Text style={styles.dateTime}>
                        {new Date(event.endDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.dateNum, { color: '#ccc', fontSize: 16 }]}>TBD</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>DESCRIPTION</Text>
              <Text style={styles.descText}>{event.description || 'No description provided.'}</Text>
            </View>

            {/* Stats — Joined + Check-In */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{joinCount}</Text>
                <Text style={styles.statLabel}>Joined</Text>
              </View>
              <TouchableOpacity
                style={[styles.statCard, styles.statCardOrange]}
                onPress={handleCheckIn}
                activeOpacity={checkedIn ? 1 : 0.7}
              >
                <Text style={[styles.statNum, { color: ORANGE }]}>{checkInCount}</Text>
                <Text style={styles.statLabel}>
                  {checkedIn ? '✓ Checked In' : 'Tap to Check In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Links */}
            <View style={styles.linkRow}>
              <TouchableOpacity style={styles.linkItem}>
                <View style={[styles.dot, { backgroundColor: ORANGE }]} />
                <Text style={styles.linkText}>Report Event</Text>
              </TouchableOpacity>
              {event.bookingUrl ? (
                <TouchableOpacity
                  style={styles.linkItem}
                  onPress={() => Linking.openURL(event.bookingUrl)}
                >
                  <View style={[styles.dot, { backgroundColor: PURPLE }]} />
                  <Text style={[styles.linkText, { color: PURPLE }]}>Book Event Now</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        )}

        {activeTab === 'Attendees' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>ATTENDEES ({joinCount})</Text>
            {event.attendees?.length === 0 || !event.attendees ? (
              <Text style={{ color: '#aaa', fontSize: 14 }}>No attendees yet.</Text>
            ) : (
              event.attendees.map((a: any) => (
                <View key={a.userId} style={styles.attendeeRow}>
                  <View style={styles.attendeeAvatar}>
                    <Text style={{ color: PURPLE, fontWeight: '700' }}>
                      {a.user?.username?.charAt(0).toUpperCase() ?? '?'}
                    </Text>
                  </View>
                  <Text style={styles.attendeeName}>{a.user?.username ?? 'Unknown'}</Text>
                  {a.checkedIn && (
                    <View style={styles.checkedBadge}>
                      <Text style={styles.checkedBadgeText}>✓ In</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'Discussion' && (
          <View style={styles.card}>
            <Text style={{ color: '#aaa', fontSize: 14 }}>Discussion coming soon.</Text>
          </View>
        )}

        {activeTab === 'Map' && (
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => Linking.openURL(
              `https://maps.google.com/?q=${encodeURIComponent(event.location)}`
            )}
          >
            <Text style={styles.mapBtnText}>📍 Open {event.location} in Maps</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, joined && styles.btnJoined]}
          onPress={handleJoin}
        >
          <Text style={styles.btnPrimaryText}>{joined ? '✓ Joined' : 'Join'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnGhost]}>
          <Text style={styles.btnGhostText}>Interested</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnOutline]}
          onPress={() => Share.share({
            message: `Check out this event on SOIN: ${event.title} on ${day} ${month} at ${event.location}`
          })}
        >
          <Text style={styles.btnOutlineText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const PURPLE = '#4a2d8f';
const ORANGE = '#e07b39';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ede8' },
  hero: { backgroundColor: PURPLE, padding: 20, paddingTop: 16, paddingBottom: 28 },
  backBtn: { marginBottom: 14 },
  backArrow: { fontSize: 28, color: 'white', lineHeight: 28 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: 'white' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  groupAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  groupName: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  groupMembers: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  tab: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999, backgroundColor: 'white', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)' },
  tabActive: { backgroundColor: PURPLE, borderColor: 'transparent' },
  tabText: { fontSize: 12, color: '#888' },
  tabTextActive: { color: 'white', fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' },
  cardLabel: { fontSize: 11, fontWeight: '600', color: '#aaa', letterSpacing: 0.8, marginBottom: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateBlock: { flex: 1 },
  dateNum: { fontSize: 32, fontWeight: '700', color: '#1a1a2e' },
  dateMonth: { fontSize: 12, color: '#888', marginTop: 2 },
  dateTime: { fontSize: 13, color: ORANGE, fontWeight: '600', marginTop: 4 },
  dateFull: { fontSize: 11, color: '#aaa', marginTop: 1 },
  arrowCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f0ff', alignItems: 'center', justifyContent: 'center' },
  descText: { fontSize: 14, color: '#444', lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: '#f8f6ff', borderRadius: 12, padding: 12, alignItems: 'center' },
  statCardOrange: { backgroundColor: '#fff4ed' },
  statNum: { fontSize: 22, fontWeight: '700', color: PURPLE },
  statLabel: { fontSize: 11, color: '#888', marginTop: 3 },
  linkRow: { flexDirection: 'row', gap: 20, paddingVertical: 4 },
  linkItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  linkText: { fontSize: 13, color: ORANGE, fontWeight: '500' },
  mapBtn: { backgroundColor: PURPLE, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  mapBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },
  actionsRow: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 24, backgroundColor: '#f0ede8' },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: PURPLE },
  btnJoined: { backgroundColor: '#2ecc71' },
  btnPrimaryText: { color: 'white', fontWeight: '700', fontSize: 14 },
  btnGhost: { backgroundColor: '#f5f0ff' },
  btnGhostText: { color: '#6b4fbb', fontWeight: '600', fontSize: 14 },
  btnOutline: { backgroundColor: 'white', borderWidth: 1.5, borderColor: PURPLE },
  btnOutlineText: { color: PURPLE, fontWeight: '600', fontSize: 14 },
  attendeeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  attendeeAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0edff', alignItems: 'center', justifyContent: 'center' },
  attendeeName: { flex: 1, fontSize: 14, color: '#333' },
  checkedBadge: { backgroundColor: '#e6f9ef', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  checkedBadgeText: { color: '#2ecc71', fontSize: 11, fontWeight: '700' },
});