import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator
} from 'react-native';
import { analyticsAPI } from '../services/api';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6B21A8' },
  header: { padding: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
  },
  statLabel: { fontSize: 13, color: '#888', marginBottom: 6 },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  wideCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10,
  },
  wideCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  wideCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '33%', alignItems: 'center', marginBottom: 16 },
  gridNumber: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  gridLabel: { fontSize: 12, color: '#888', marginTop: 2, textAlign: 'center' },
  myPostsCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10,
  },
  myPostsTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  myPostsRow: { flexDirection: 'row', gap: 10 },
  myPostsStat: { flex: 1, alignItems: 'center', backgroundColor: '#f3f0f8', borderRadius: 12, padding: 12 },
  myPostsNumber: { fontSize: 24, fontWeight: 'bold', color: '#6B21A8' },
  myPostsLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  groupCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
  },
  groupAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  groupAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  groupName: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  groupMembers: { color: '#888', fontSize: 12, marginTop: 2 },
  emptyCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 10,
  },
  emptyTitle: { fontWeight: 'bold', color: '#333', fontSize: 14, marginBottom: 4 },
  emptyDesc: { color: '#aaa', fontSize: 12, textAlign: 'center' },
  adminCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10,
  },
  adminTitle: { fontWeight: 'bold', color: '#333', fontSize: 16 },
  adminSubtitle: { color: '#888', fontSize: 12, marginBottom: 16 },
  adminRow: { flexDirection: 'row', justifyContent: 'space-around' },
  adminStat: { alignItems: 'center' },
  adminNumber: { fontSize: 24, fontWeight: 'bold', color: '#F97316' },
  adminLabel: { fontSize: 12, color: '#888', marginTop: 2 },
});

export default function AnalyticsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.get()
      .then(res => setData(res.data))
      .catch(e => console.log('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1, backgroundColor: '#6B21A8' }} color="#fff" />;

  return (
    <ScrollView style={styles.container}>
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Analytics</Text>
      </View>

      {/* 顶部三个卡片 */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Group Users</Text>
            <Text style={styles.statNumber}>{data?.totalUsers || 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Groups</Text>
            <Text style={styles.statNumber}>{data?.totalGroups || 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Businesses</Text>
            <Text style={styles.statNumber}>{data?.totalBusinesses || 0}</Text>
          </View>
        </View>
      </View>

      {/* Events Stats */}
      <View style={styles.section}>
        <View style={styles.wideCard}>
          <View style={styles.wideCardHeader}>
            <Text style={styles.wideCardTitle}>Events Stats</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridNumber}>{data?.userEvents || 0}</Text>
              <Text style={styles.gridLabel}>Joined Events</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridNumber}>0</Text>
              <Text style={styles.gridLabel}>Booked Users</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridNumber}>0</Text>
              <Text style={styles.gridLabel}>Checked-In Users</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridNumber}>{data?.missedEvents || 0}</Text>
              <Text style={styles.gridLabel}>Events Missed</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridNumber}>{data?.upcomingEvents || 0}</Text>
              <Text style={styles.gridLabel}>Upcoming Events</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridNumber}>{data?.totalEvents || 0}</Text>
              <Text style={styles.gridLabel}>Total Events</Text>
            </View>
          </View>
        </View>
      </View>

      {/* My Posts Stats */}
      <View style={styles.section}>
        <View style={styles.myPostsCard}>
          <Text style={styles.myPostsTitle}>My Posts Analytics</Text>
          <View style={styles.myPostsRow}>
            <View style={styles.myPostsStat}>
              <Text style={styles.myPostsNumber}>{data?.userPosts || 0}</Text>
              <Text style={styles.myPostsLabel}>Total Posts</Text>
            </View>
            <View style={styles.myPostsStat}>
              <Text style={styles.myPostsNumber}>{data?.totalLikes || 0}</Text>
              <Text style={styles.myPostsLabel}>Total Likes</Text>
            </View>
            <View style={styles.myPostsStat}>
              <Text style={styles.myPostsNumber}>{data?.totalComments || 0}</Text>
              <Text style={styles.myPostsLabel}>Total Comments</Text>
            </View>
          </View>
        </View>
      </View>

      {/* My Groups Analytics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Groups Analytics</Text>
        {data?.userGroups?.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Group</Text>
            <Text style={styles.emptyDesc}>This slot will be filled when you join or create a group.</Text>
          </View>
        ) : (
          data?.userGroups?.map((g: any) => (
            <View key={g.id} style={styles.groupCard}>
              <View style={styles.groupAvatar}>
                <Text style={styles.groupAvatarText}>{g.group.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.groupName}>{g.group.name}</Text>
                <Text style={styles.groupMembers}>👥 {g.group._count?.members || 0} members</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Admin Dashboard */}
      <View style={styles.section}>
        <View style={styles.adminCard}>
          <Text style={styles.adminTitle}>Admin Dashboard</Text>
          <Text style={styles.adminSubtitle}>Group Management Overview</Text>
          <View style={styles.adminRow}>
            <View style={styles.adminStat}>
              <Text style={styles.adminNumber}>{data?.totalGroups || 0}</Text>
              <Text style={styles.adminLabel}>Total Groups</Text>
            </View>
            <View style={styles.adminStat}>
              <Text style={[styles.adminNumber, { color: '#333' }]}>{data?.totalUsers || 0}</Text>
              <Text style={styles.adminLabel}>Total Members</Text>
            </View>
            <View style={styles.adminStat}>
              <Text style={[styles.adminNumber, { color: '#0ea5e9' }]}>{data?.totalBusinesses || 0}</Text>
              <Text style={styles.adminLabel}>Businesses</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}