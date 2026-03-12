import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { commentsAPI } from '../services/api';
import { useUser } from '../store';

export default function CommentsScreen({ route }: any) {
  const { postId, postContent, postAuthor } = route.params;
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useUser();

  const loadComments = async () => {
    try {
      const res = await commentsAPI.get(postId);
      setComments(res.data);
    } catch (e) {
      Alert.alert('错误', '无法加载评论');
    }
  };

  const handleComment = async () => {
    if (!content) return;
    setLoading(true);
    try {
      await commentsAPI.create(postId, content);
      setContent('');
      loadComments();
    } catch (e) {
      Alert.alert('错误', '评论失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComments(); }, []);

  return (
    <View style={styles.container}>
      {/* 原帖内容 */}
      <View style={styles.originalPost}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {postAuthor?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.postAuthor}>{postAuthor}</Text>
        </View>
        <Text style={styles.postContent}>{postContent}</Text>
      </View>

      {/* 评论列表 */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        style={styles.commentList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>暂无评论，来发表第一条评论吧！</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <View style={styles.commentHeader}>
              <View style={styles.smallAvatar}>
                <Text style={styles.smallAvatarText}>
                  {item.author.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.commentAuthor}>{item.author.username}</Text>
                <Text style={styles.commentTime}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              {item.author.id === user?.id && (
                <TouchableOpacity onPress={async () => {
                  await commentsAPI.delete(item.id);
                  loadComments();
                }}>
                  <Text style={styles.deleteText}>删除</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.commentContent}>{item.content}</Text>
          </View>
        )}
      />

      {/* 评论输入框 */}
      <View style={styles.inputBox}>
        <View style={styles.smallAvatar}>
          <Text style={styles.smallAvatarText}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="写下你的评论..."
          value={content}
          onChangeText={setContent}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleComment} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.sendButtonText}>发送</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f8' },
  originalPost: {
    backgroundColor: '#fff', padding: 16, marginBottom: 8,
    borderBottomWidth: 2, borderBottomColor: '#f0f0f0',
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  postAuthor: { fontWeight: 'bold', color: '#333', fontSize: 15, marginLeft: 10 },
  postContent: { fontSize: 15, color: '#333', lineHeight: 22 },
  commentList: { flex: 1 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 32, fontSize: 14 },
  comment: {
    backgroundColor: '#fff', marginHorizontal: 8, marginBottom: 6,
    borderRadius: 12, padding: 12,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  smallAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#6B21A8', justifyContent: 'center', alignItems: 'center',
  },
  smallAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  commentAuthor: { fontWeight: 'bold', color: '#333', fontSize: 14, marginLeft: 8 },
  commentTime: { fontSize: 11, color: '#aaa', marginLeft: 8 },
  deleteText: { color: '#ff4444', fontSize: 12 },
  commentContent: { fontSize: 14, color: '#333', marginLeft: 40 },
  inputBox: {
    flexDirection: 'row', padding: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center', gap: 8,
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#F97316', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 16,
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});