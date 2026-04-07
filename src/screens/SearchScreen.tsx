import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert, Image } from 'react-native';
import { searchAPI, connectionsAPI } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../store';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  searchBox: {
    flexDirection: 'row', backgroundColor: '#fff', margin: 12,
    borderRadius: 12, paddingHorizontal: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#eee', gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  searchButton: {
    backgroundColor: '#6B21A8', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  searchButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  section: { marginHorizontal: 12, marginBottom: 16 },
  sectionTitle: {
    fontSize: 15, fontWeight: 'bold', color: '#6B21A8',
    marginBottom: 8, paddingBottom: 6,
    borderBottomWidth: 2, borderBottomColor: '#6B21A8',
  },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    marginBottom: 6, flexDirection: 'row', alignItems: 'center',
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardInfo: { flex: 1 },
  cardTitle: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  cardSub: { color: '#888', fontSize: 12, marginTop: 2 },
  cardAction: {
    backgroundColor: '#f3f0f8', borderRadius: 12,
    paddingVertical: 4, paddingHorizontal: 10,
    borderWidth: 1, borderColor: '#6B21A8',
  },
  cardActionText: { color: '#6B21A8', fontSize: 12, fontWeight: '600' },
  emptyText: { color: '#aaa', fontSize: 13, fontStyle: 'italic' },
  noResults: { textAlign: 'center', color: '#aaa', marginTop: 48, fontSize: 15 },
  hint: { textAlign: 'center', color: '#aaa', marginTop: 48, fontSize: 15 },
});

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<number>>(new Set());
  const navigation = useNavigation<any>();
  const user = useUser();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await searchAPI.search(query);
      setResults(res.data);
    } catch (e) {
      console.log('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (targetUser: any) => {
    try {
      await connectionsAPI.sendRequest(targetUser.id);
      setSentRequests(prev => new Set([...prev, targetUser.id]));
      Alert.alert('Sent', `Connection request sent to ${targetUser.username}`);
    } catch (e) {
      Alert.alert('Error', 'Could not send request');
    }
  };

  const getConnectButton = (targetUser: any) => {
    if (targetUser.id === user?.id) return null;
    if (targetUser.connectionStatus === 'accepted') {
      return (
        <View style={[styles.cardAction, { borderColor: '#22c55e' }]}>
          <Text style={[styles.cardActionText, { color: '#22c55e' }]}>✓ Connected</Text>
        </View>
      );
    }
    if (targetUser.connectionStatus === 'pending' || sentRequests.has(targetUser.id)) {
      return (
        <View style={[styles.cardAction, { borderColor: '#aaa' }]}>
          <Text style={[styles.cardActionText, { color: '#aaa' }]}>⏳ Pending</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity style={styles.cardAction} onPress={() => handleConnect(targetUser)}>
        <Text style={styles.cardActionText}>+ Connect</Text>
      </TouchableOpacity>
    );
  };

  const hasResults = results && (
    results.users?.length > 0 ||
    results.posts?.length > 0 ||
    results.groups?.length > 0 ||
    results.events?.length > 0
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users, posts, groups, events..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color="#6B21A8" style={{ marginTop: 32 }} />}

      {!loading && !results && (
        <Text style={styles.hint}>Type something to search...</Text>
      )}

      {!loading && results && !hasResults && (
        <Text style={styles.noResults}>No results found for "{query}"</Text>
      )}

      {!loading && results && (
        <ScrollView>
          {results.users?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Users ({results.users.length})</Text>
              {results.users.map((u: any) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('UserProfile', { userId: u.id })}
                >
                  {u.avatar ? (
                    <Image source={{ uri: u.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{u.username.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{u.username}</Text>
                    {u.bio ? <Text style={styles.cardSub}>{u.bio}</Text> : null}
                  </View>
                  {getConnectButton(u)}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {results.posts?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Posts ({results.posts.length})</Text>
              {results.posts.map((post: any) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('Comments', {
                    postId: post.id,
                    postContent: post.content,
                    postAuthor: post.author.username,
                  })}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{post.author.username.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{post.author.username}</Text>
                    <Text style={styles.cardSub} numberOfLines={2}>{post.content}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {results.groups?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👥 Groups ({results.groups.length})</Text>
              {results.groups.map((group: any) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('Group', { groupId: group.id })}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{group.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{group.name}</Text>
                    <Text style={styles.cardSub}>{group.category} • {group.location}</Text>
                    <Text style={styles.cardSub}>👥 {group._count?.members || 0} members</Text>
                  </View>
                  <View style={styles.cardAction}>
                    <Text style={styles.cardActionText}>View</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {results.events?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Events ({results.events.length})</Text>
              {results.events.map((event: any) => (
                <View key={event.id} style={styles.card}>
                  <View style={[styles.avatar, { backgroundColor: '#F97316' }]}>
                    <Text style={styles.avatarText}>📅</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{event.title}</Text>
                    <Text style={styles.cardSub}>📍 {event.location}</Text>
                    <Text style={styles.cardSub}>📅 {new Date(event.date).toLocaleDateString('en-GB')}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}