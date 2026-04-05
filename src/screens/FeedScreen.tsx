import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
  Image, Modal, Dimensions, Share
} from 'react-native';
import { postsAPI, groupsAPI } from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../store';
import { useNavigation } from '@react-navigation/native';
import { aiAPI } from '../services/api';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  quoteCard: {
    backgroundColor: '#fff8f0', margin: 12, borderRadius: 16,
    padding: 16, borderLeftWidth: 4, borderLeftColor: '#F97316',
  },
  quoteTitle: { fontSize: 14, fontWeight: 'bold', color: '#F97316', marginBottom: 8 },
  quoteText: { fontSize: 14, color: '#555', fontStyle: 'italic', marginBottom: 6 },
  quoteAuthor: { fontSize: 12, color: '#888', textAlign: 'right' },
  postBox: {
    backgroundColor: '#fff', margin: 12, borderRadius: 16,
    padding: 16, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 8, elevation: 2,
  },
  postBoxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postBoxName: { fontSize: 15, fontWeight: '600', color: '#333', marginLeft: 10 },
  input: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 12,
    padding: 12, fontSize: 15, minHeight: 80, color: '#333',
    textAlignVertical: 'top',
  },
  postBoxFooter: { flexDirection: 'row', marginTop: 12, gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  mediaButton: {
    backgroundColor: '#f3f0f8', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 10,
  },
  mediaButtonText: { color: '#6B21A8', fontSize: 13, fontWeight: '600' },
  pollButton: {
    backgroundColor: '#f3f0f8', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 10,
  },
  pollButtonText: { color: '#6B21A8', fontSize: 13, fontWeight: '600' },
  postButton: {
    backgroundColor: '#F97316', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 16,
  },
  postButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  post: {
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  username: { fontWeight: 'bold', color: '#333', fontSize: 15, marginLeft: 10 },
  time: { fontSize: 12, color: '#aaa', marginLeft: 10 },
  postContent: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 12 },
  postActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, gap: 8 },
  actionButton: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  actionText: { color: '#888', fontSize: 13 },
  likedText: { color: '#F97316', fontWeight: 'bold' },
  suggestedGroups: {
    backgroundColor: '#fff', margin: 12, borderRadius: 16,
    padding: 16, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 8, elevation: 2,
  },
  suggestedTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  groupItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  groupAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#f3f0f8', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#6B21A8',
  },
  groupAvatarText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 18 },
  groupInfo: { flex: 1, marginLeft: 10 },
  groupName: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  groupCategory: { color: '#F97316', fontSize: 12, marginTop: 2 },
  groupLocation: { color: '#aaa', fontSize: 11, marginTop: 2 },
  joinButton: {
    backgroundColor: '#f3f0f8', borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#6B21A8',
  },
  joinButtonText: { color: '#6B21A8', fontWeight: 'bold', fontSize: 13 },
  imagePreview: { position: 'relative', marginTop: 8, marginBottom: 8 },
  previewImage: { width: '100%', height: 200, borderRadius: 12 },
  removeImage: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12,
    width: 24, height: 24, justifyContent: 'center', alignItems: 'center',
  },
  removeImageText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  postImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  tapToView: { textAlign: 'center', color: '#888', fontSize: 12, marginTop: 4 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  closeButton: {
    position: 'absolute', top: 50, right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16,
  },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  aiBox: { flexDirection: 'row', marginBottom: 8, gap: 8, alignItems: 'center' },
  aiInput: {
    flex: 1, borderWidth: 1, borderColor: '#6B21A8', borderRadius: 12,
    padding: 10, fontSize: 14,
  },
  aiGenerateButton: {
    backgroundColor: '#6B21A8', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  aiGenerateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  aiButton: {
    backgroundColor: '#f3f0f8', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#6B21A8',
  },
  aiButtonText: { color: '#6B21A8', fontSize: 13, fontWeight: '600' },
});

export default function FeedScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [visibility, setVisibility] = useState('everyone');
  const [showVisibility, setShowVisibility] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const user = useUser();
  const navigation = useNavigation<any>();

  const loadPosts = async () => {
    try {
      const res = await postsAPI.getAll();
      setPosts(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load posts');
    }
  };

  const loadGroups = async () => {
    try {
      const res = await groupsAPI.getAll();
      setGroups(res.data);
    } catch (e) {
      console.log('Failed to load groups');
    }
  };

  const handlePost = async () => {
    if (!content && !selectedImage) return;
    setLoading(true);
    try {
      await postsAPI.create(content, selectedImage || undefined, visibility);
      setContent('');
      setSelectedImage(null);
      loadPosts();
    } catch (e) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setAiLoading(true);
    try {
      const res = await aiAPI.generatePost(aiPrompt);
      setContent(res.data.content);
      setShowAiInput(false);
      setAiPrompt('');
    } catch (e) {
      Alert.alert('Error', 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await postsAPI.like(postId);
      await loadPosts();
    } catch (e: any) {
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  useEffect(() => {
  loadPosts();
  loadGroups();
  const interval = setInterval(() => {
    loadPosts();
    loadGroups();
  }, 5000);
  return () => clearInterval(interval);
}, []);

  const isLiked = (post: any) => {
    return post.likes?.some((like: any) => like.userId === user?.id);
  };

  return (
    <View style={{ flex: 1 }}>
      <Modal visible={!!previewImage} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setPreviewImage(null)}>
          <Image source={{ uri: previewImage || '' }} style={styles.modalImage} resizeMode="contain" />
          <TouchableOpacity style={styles.closeButton} onPress={() => setPreviewImage(null)}>
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <FlatList
        style={styles.container}
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View>
            <View style={styles.suggestedGroups}>
              <Text style={styles.suggestedTitle}>Suggested Groups</Text>
              {groups.slice(0, 4).map((group) => (
                <View key={group.id} style={styles.groupItem}>
                  <View style={styles.groupAvatar}>
                    <Text style={styles.groupAvatarText}>{group.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupCategory}>{group.category}</Text>
                    <Text style={styles.groupLocation}>{group.location}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.joinButton, group.members?.some((m: any) => m.userId === user?.id) && { borderColor: '#22c55e' }]}
                    onPress={() => navigation.navigate('Group', { groupId: group.id })}
                  >
                    <Text style={[styles.joinButtonText, group.members?.some((m: any) => m.userId === user?.id) && { color: '#22c55e' }]}>
                      {group.members?.some((m: any) => m.userId === user?.id) ? '✓ Joined' : '+ Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.quoteCard}>
              <Text style={styles.quoteTitle}>Quote of the Day ✨</Text>
              <Text style={styles.quoteText}>
                "Only put off until tomorrow what you are willing to die having left undone."
              </Text>
              <Text style={styles.quoteAuthor}>— Pablo Picasso</Text>
            </View>

            <View style={styles.postBox}>
              <View style={styles.postBoxHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
                </View>
                <Text style={styles.postBoxName}>{user?.username || 'User'}</Text>
              </View>
              {showAiInput && (
                <View style={styles.aiBox}>
                  <TextInput
                    style={styles.aiInput}
                    placeholder="Describe what you want to post, AI will write it..."
                    value={aiPrompt}
                    onChangeText={setAiPrompt}
                  />
                  <TouchableOpacity style={styles.aiGenerateButton} onPress={handleAiGenerate} disabled={aiLoading}>
                    {aiLoading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.aiGenerateButtonText}>Generate</Text>
                    }
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                style={styles.input}
                placeholder="Write and Share Your Post With Your Connections..."
                placeholderTextColor="#aaa"
                value={content}
                onChangeText={setContent}
                multiline
              />
              {selectedImage && (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeImage} onPress={() => setSelectedImage(null)}>
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              {showVisibility && (
                <View style={{ backgroundColor: '#f3f0f8', borderRadius: 12, padding: 8, marginBottom: 8 }}>
                  {[
                    { key: 'everyone', label: '🌍 Everyone' },
                    { key: 'connections', label: '👥 Connections' },
                    { key: 'only_me', label: '🔒 Only Me' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.key}
                      onPress={() => { setVisibility(opt.key); setShowVisibility(false); }}
                      style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8,
                        backgroundColor: visibility === opt.key ? '#6B21A8' : 'transparent' }}
                    >
                      <Text style={{ color: visibility === opt.key ? '#fff' : '#333', fontWeight: '600' }}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={styles.postBoxFooter}>
                <TouchableOpacity style={styles.mediaButton} onPress={handlePickImage}>
                  <Text style={styles.mediaButtonText}>📷 Photos/Videos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.aiButton} onPress={() => setShowAiInput(!showAiInput)}>
                  <Text style={styles.aiButtonText}>🤖 AI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pollButton} onPress={() => setShowVisibility(!showVisibility)}>
                  <Text style={styles.pollButtonText}>📊 Polls</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postButtonText}>Post</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.post}>
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.author.username.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.username}>{item.author.username}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.postContent}>{item.content}</Text>
            {item.imageUrl && (
              <TouchableOpacity onPress={() => setPreviewImage(item.imageUrl)}>
                <Image source={{ uri: item.imageUrl }} style={styles.postImage} resizeMode="cover" />
                <Text style={styles.tapToView}>Tap to view full image</Text>
              </TouchableOpacity>
            )}
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
                <Text style={[styles.actionText, isLiked(item) && styles.likedText]}>
                  👍 {item.likes?.length || 0} Likes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Comments', {
                  postId: item.id,
                  postContent: item.content,
                  postAuthor: item.author.username,
                })}
              >
                <Text style={styles.actionText}>💬 {item._count?.comments || 0} Comments</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Share.share({
                    message: `Check out this post on SOIN:\n\n"${item.content}"`,
                    title: 'Share Post',
                  });
                }}
              >
                <Text style={styles.actionText}>↗️ Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}