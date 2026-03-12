import React from 'react';
import { useUser } from '../store';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen({ navigation }: any) {
    const user = useUser();
  return (
    <View style={styles.container}>
      {/* 顶部背景 */}
      <View style={styles.coverPhoto} />

      {/* 用户信息 */}
      <View style={styles.profileInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>U</Text>
        </View>
        <Text style={styles.name}>{user?.username || 'testuser'}</Text>
        <Text style={styles.username}>@{user?.username || 'testuser'}</Text>

        {/* 统计数字 */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Personal</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Group</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Business</Text>
          </View>
        </View>

        {/* 编辑按钮 */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>编辑个人资料</Text>
        </TouchableOpacity>
      </View>

      {/* 菜单列表 */}
      <View style={styles.menu}>
        {[
          { icon: '👤', label: 'Group Profile' },
          { icon: '📰', label: 'Feed' },
          { icon: '👥', label: 'Group Hub' },
          { icon: '🏢', label: 'Businesses' },
          { icon: '💬', label: 'Messages' },
          { icon: '📅', label: 'Events' },
          { icon: '📁', label: 'Shared Assets' },
          { icon: '📚', label: 'Resources' },
          { icon: '📊', label: 'Analytics' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  coverPhoto: { height: 120, backgroundColor: '#6B21A8' },
  profileInfo: { backgroundColor: '#fff', alignItems: 'center', paddingBottom: 20, marginBottom: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center',
    marginTop: -40, borderWidth: 4, borderColor: '#fff',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 32 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 8 },
  username: { fontSize: 14, color: '#888', marginBottom: 16 },
  stats: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statItem: { alignItems: 'center', paddingHorizontal: 24 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#6B21A8' },
  statLabel: { fontSize: 12, color: '#888' },
  statDivider: { width: 1, height: 30, backgroundColor: '#eee' },
  editButton: {
    backgroundColor: '#F97316', borderRadius: 20,
    paddingVertical: 10, paddingHorizontal: 32,
  },
  editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  menu: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 12, padding: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  menuIcon: { fontSize: 20, marginRight: 16 },
  menuLabel: { fontSize: 16, color: '#333' },
});