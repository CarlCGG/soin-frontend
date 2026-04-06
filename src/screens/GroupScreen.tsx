import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image, FlatList, Linking
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { groupsAPI } from '../services/api';
import { useUser } from '../store';

export default function GroupScreen({ route }: any) {
  const { groupId } = route.params;
  const [group, setGroup] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const user = useUser();

  const loadGroup = async () => {
    try {
      const res = await groupsAPI.getById(groupId);
      setGroup(res.data);
      setIsMember(res.data.members?.some((m: any) => m.user.id === user?.id));
    } catch (e) {
      Alert.alert('Error', 'Failed to load group');
    }
  };

  const loadPosts = async () => {
    try {
      const res = await groupsAPI.getPosts(groupId);
      setPosts(res.data);
    } catch (e) {}
  };

  const loadReviews = async () => {
    try {
      const res = await groupsAPI.getReviews(groupId);
      setReviews(res.data);
    } catch (e) {}
  };

  const handleJoin = async () => {
    try {
      const res = await groupsAPI.join(groupId);
      setIsMember(res.data.joined);
      loadGroup();
    } catch (e) {
      Alert.alert('Error', 'Action failed');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setPostImage(result.assets[0].uri);
  };

  const handleCreatePost = async () => {
    if (!postContent) return;
    setSubmittingPost(true);
    try {
      await groupsAPI.createPost(groupId, postContent, postImage || undefined);
      setPostContent('');
      setPostImage(null);
      loadPosts();
    } catch (e) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleCreateReview = async () => {
    if (reviewRating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    setSubmittingReview(true);
    try {
      await groupsAPI.createReview(groupId, reviewRating, reviewComment);
      setReviewRating(0);
      setReviewComment('');
      loadReviews();
      Alert.alert('Success', 'Review submitted!');
    } catch (e) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    loadGroup();
    loadPosts();
    loadReviews();
  }, []);

  if (!group) return <ActivityIndicator style={{ flex: 1 }} color="#6B21A8" />;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const tabs = ['info', 'posts', 'members', 'events', 'reviews', 'map'];
  const tabLabels: any = {
    info: 'Group Info', posts: 'Posts', members: 'Members',
    events: 'Events', reviews: 'Reviews', map: 'Map'
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.groupAvatar}>
          <Text style={styles.groupAvatarText}>{group.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupCategory}>{group.category} · {group._count?.members || 0} Members</Text>
        </View>
        <TouchableOpacity
          style={[styles.joinButton, isMember && styles.leaveButton]}
          onPress={handleJoin}
        >
          <Text style={[styles.joinButtonText, isMember && styles.leaveButtonText]}>
            {isMember ? 'Leave' : '+ Join'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rating Bar */}
      <View style={styles.ratingBar}>
        <Text style={styles.ratingStars}>
          {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
        </Text>
        <Text style={styles.ratingText}>({avgRating})</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <View style={styles.tabRow}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tabLabels[tab]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView style={styles.content}>
        {/* Group Info Tab */}
        {activeTab === 'info' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About</Text>
              <Text style={styles.cardSubtitle}>Created on {new Date(group.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              {group.creator?.id === user?.id ? (
                <View>
                  <TextInput
                    style={[styles.input, { minHeight: 60 }]}
                    value={group.description || ''}
                    onChangeText={(text) => setGroup({ ...group, description: text })}
                    placeholder="Add a group description..."
                    placeholderTextColor="#aaa"
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.postButton}
                    onPress={async () => {
                      try {
                        await groupsAPI.updateDescription(groupId, group.description || '');
                        Alert.alert('Success', 'Description updated!');
                      } catch (e) {
                        Alert.alert('Error', 'Failed to update description');
                      }
                    }}
                  >
                    <Text style={styles.postButtonText}>Save Description</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                group.description ? (
                  <Text style={styles.cardText}>{group.description}</Text>
                ) : (
                  <Text style={styles.emptyText}>No description available.</Text>
                )
              )}
              {!isMember && (
                <TouchableOpacity style={styles.joinCardButton} onPress={handleJoin}>
                  <Text style={styles.joinCardButtonText}>+ Join</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Activities (Last 30 days)</Text>
              <View style={styles.activityRow}>
                <Text style={styles.activityIcon}>👥</Text>
                <Text style={styles.activityText}>{group._count?.members || 0} Members</Text>
              </View>
              <View style={styles.activityRow}>
                <Text style={styles.activityIcon}>📝</Text>
                <Text style={styles.activityText}>{posts.length} Posts</Text>
              </View>
              <View style={styles.activityRow}>
                <Text style={styles.activityIcon}>⭐</Text>
                <Text style={styles.activityText}>{reviews.length} Reviews</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Community Assets</Text>
              <View style={styles.activityRow}>
                <Text style={styles.activityIcon}>🔧</Text>
                <Text style={styles.activityText}>0 Equipment & Tools</Text>
              </View>
              <View style={styles.activityRow}>
                <Text style={styles.activityIcon}>👤</Text>
                <Text style={styles.activityText}>0 Services</Text>
              </View>
              <View style={styles.activityRow}>
                <Text style={styles.activityIcon}>🏢</Text>
                <Text style={styles.activityText}>0 Space Capacity</Text>
              </View>
            </View>
          </View>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <View>
            {isMember ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Create Post</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Write something..."
                  placeholderTextColor="#aaa"
                  value={postContent}
                  onChangeText={setPostContent}
                  multiline
                />
                {postImage && (
                  <View style={{ position: 'relative', marginBottom: 8 }}>
                    <Image source={{ uri: postImage }} style={{ width: '100%', height: 150, borderRadius: 12 }} />
                    <TouchableOpacity
                      onPress={() => setPostImage(null)}
                      style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                    <Text style={styles.photoButtonText}>📷 Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postButton} onPress={handleCreatePost} disabled={submittingPost}>
                    {submittingPost ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postButtonText}>Post</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.joinPrompt}>
                <Text style={styles.joinPromptText}>Join this group to post</Text>
                <TouchableOpacity style={styles.joinPromptButton} onPress={handleJoin}>
                  <Text style={styles.joinPromptButtonText}>+ Join Group</Text>
                </TouchableOpacity>
              </View>
            )}

            {posts.map((post: any) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  {post.author.avatar ? (
                    <Image source={{ uri: post.author.avatar }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
                  ) : (
                    <View style={styles.postAvatar}>
                      <Text style={styles.postAvatarText}>{post.author.username.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postAuthor}>{post.author.username}</Text>
                    <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleString()}</Text>
                  </View>
                  {(post.author.id === user?.id || group.creator?.id === user?.id) && (
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          await groupsAPI.deletePost(groupId, post.id);
                          loadPosts();
                        } catch (e) {
                          Alert.alert('Error', 'Failed to delete post');
                        }
                      }}
                    >
                      <Text style={{ color: '#ff4444', fontSize: 12 }}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                {post.imageUrl && (
                  <Image source={{ uri: post.imageUrl }} style={{ width: '100%', height: 200, borderRadius: 12, marginTop: 8 }} resizeMode="cover" />
                )}
              </View>
            ))}
            {posts.length === 0 && <Text style={styles.emptyText}>No posts yet.</Text>}
          </View>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Members ({group._count?.members || 0})</Text>
            {group.members?.map((m: any) => (
              <View key={m.id} style={styles.memberRow}>
                {m.user.avatar ? (
                  <Image source={{ uri: m.user.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                ) : (
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{m.user.username.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <Text style={styles.memberName}>{m.user.username}</Text>
                {group.creator?.id === m.user.id && (
                  <View style={{ backgroundColor: '#F97316', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8, marginLeft: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Admin</Text>
                  </View>
                )}
              </View>
            ))}
            {!group.members?.length && <Text style={styles.emptyText}>No members yet.</Text>}
          </View>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Events</Text>
            <Text style={styles.emptyText}>No events yet.</Text>
          </View>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <View>
            {isMember && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Leave a Review</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                      <Text style={{ fontSize: 32, color: star <= reviewRating ? '#F97316' : '#ddd' }}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Write a comment (optional)..."
                  placeholderTextColor="#aaa"
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  multiline
                />
                <TouchableOpacity style={styles.postButton} onPress={handleCreateReview} disabled={submittingReview}>
                  {submittingReview ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postButtonText}>Submit Review</Text>}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Reviews ({reviews.length}) · Avg {avgRating}★</Text>
              {reviews.map((review: any) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.postHeader}>
                    {review.author.avatar ? (
                      <Image source={{ uri: review.author.avatar }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
                    ) : (
                      <View style={styles.postAvatar}>
                        <Text style={styles.postAvatarText}>{review.author.username.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.postAuthor}>{review.author.username}</Text>
                      <Text style={{ color: '#F97316', fontSize: 14 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
                    </View>
                  </View>
                  {review.comment && <Text style={styles.postContent}>{review.comment}</Text>}
                </View>
              ))}
              {reviews.length === 0 && <Text style={styles.emptyText}>No reviews yet.</Text>}
            </View>
          </View>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location</Text>
            <Text style={styles.cardText}>📍 {group.location}</Text>
            <TouchableOpacity
              style={[styles.postButton, { marginTop: 12 }]}
              onPress={() => Linking.openURL(`https://www.google.com/maps/search/${encodeURIComponent(group.location)}`)}
            >
              <Text style={styles.postButtonText}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  header: {
    backgroundColor: '#6B21A8', padding: 16, flexDirection: 'row', alignItems: 'center',
  },
  groupAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  groupAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 22 },
  groupInfo: { flex: 1, marginLeft: 12 },
  groupName: { fontWeight: 'bold', color: '#fff', fontSize: 16 },
  groupCategory: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  joinButton: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 16,
  },
  leaveButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: '#ff4444' },
  joinButtonText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 13 },
  leaveButtonText: { color: '#ff4444' },
  ratingBar: {
    backgroundColor: '#fff', padding: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  ratingStars: { fontSize: 20, color: '#F97316' },
  ratingText: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  tabScroll: { backgroundColor: '#fff', maxHeight: 50 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 4, paddingVertical: 8 },
  tab: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: '#f3f0f8',
  },
  activeTab: { backgroundColor: '#F97316' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 13 },
  activeTabText: { color: '#fff' },
  content: { flex: 1 },
  card: {
    backgroundColor: '#fff', margin: 12, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#aaa', marginBottom: 12 },
  cardText: { fontSize: 14, color: '#555', lineHeight: 20 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  activityIcon: { fontSize: 16, width: 24 },
  activityText: { color: '#6B21A8', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 16, fontSize: 14 },
  joinCardButton: {
    backgroundColor: '#F97316', borderRadius: 20, marginTop: 12,
    paddingVertical: 10, alignItems: 'center',
  },
  joinCardButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  input: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 12,
    padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top',
    marginBottom: 8, color: '#333',
  },
  photoButton: {
    backgroundColor: '#f3f0f8', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#6B21A8',
  },
  photoButtonText: { color: '#6B21A8', fontWeight: '600', fontSize: 13 },
  postButton: {
    flex: 1, backgroundColor: '#F97316', borderRadius: 20,
    paddingVertical: 10, alignItems: 'center',
  },
  postButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  postCard: {
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  postAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  postAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  postAuthor: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  postTime: { fontSize: 11, color: '#aaa' },
  postContent: { fontSize: 14, color: '#333', lineHeight: 20, marginTop: 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  memberAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  memberName: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  reviewCard: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  joinPrompt: { alignItems: 'center', padding: 32 },
  joinPromptText: { color: '#888', fontSize: 15, marginBottom: 16 },
  joinPromptButton: {
    backgroundColor: '#6B21A8', borderRadius: 24,
    paddingVertical: 12, paddingHorizontal: 32,
  },
  joinPromptButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});