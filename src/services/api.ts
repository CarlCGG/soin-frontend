import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://172.20.10.5:3000';

export const api = axios.create({
  baseURL: API_URL,
});

// 启动时从 AsyncStorage 读取 token
AsyncStorage.getItem('auth_token').then(savedToken => {
  if (savedToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
  }
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  AsyncStorage.setItem('auth_token', token);
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  AsyncStorage.removeItem('auth_token');
};

export const authAPI = {
  register: (email: string, username: string, password: string) =>
    api.post('/auth/register', { email, username, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const postsAPI = {
  getAll: () => api.get('/posts'),
  create: (content: string, imageUrl?: string, visibility?: string) =>
    api.post('/posts', { content, imageUrl, visibility }),
  delete: (id: number) => api.delete(`/posts/${id}`),
  like: (id: number) => api.post(`/posts/${id}/like`),
};

export const messagesAPI = {
  send: (receiverId: number, content: string) =>
    api.post('/messages', { receiverId, content }),
  getConversation: (userId: number) => api.get(`/messages/${userId}`),
  getConversationList: () => api.get('/messages/conversations'),
  getAllUsers: () => api.get('/messages/users'),
};

export const commentsAPI = {
  get: (postId: number) => api.get(`/comments/${postId}`),
  create: (postId: number, content: string) =>
    api.post('/comments', { postId, content }),
  delete: (id: number) => api.delete(`/comments/${id}`),
};

export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getById: (id: number) => api.get(`/groups/${id}`),
  delete: (id: number) => api.delete(`/groups/${id}`),
  create: (name: string, description: string, category: string, location: string) =>
    api.post('/groups', { name, description, category, location }),
  join: (id: number) => api.post(`/groups/${id}/join`),
  getMessages: (id: number) => api.get(`/groups/${id}/messages`),
  sendMessage: (id: number, content: string) =>
    api.post(`/groups/${id}/messages`, { content }),
  getSuggested: () => api.get('/groups/suggested/for-me'),
  getPosts: (id: number) => api.get(`/groups/${id}/posts`),
  createPost: (id: number, content: string, imageUrl?: string) =>
  api.post(`/groups/${id}/posts`, { content, imageUrl }),
  getReviews: (id: number) => api.get(`/groups/${id}/reviews`),
  createReview: (id: number, rating: number, comment?: string) =>
    api.post(`/groups/${id}/reviews`, { rating, comment }),
  updateDescription: (id: number, description: string) =>
  api.put(`/groups/${id}/description`, { description }),
  deletePost: (groupId: number, postId: number) =>
    api.delete(`/groups/${groupId}/posts/${postId}`),
};

export const aiAPI = {
  generatePost: (prompt: string) =>
    api.post('/ai/generate-post', { prompt }),
  chat: (messages: { role: string; content: string }[], systemContext?: string) =>
  api.post('/ai/chat', { messages, systemContext }),
  suggestComment: (postContent: string) =>
    api.post('/ai/suggest-comment', { postContent }),
};


export const eventsAPI = {
  getAll: () => api.get('/events'),
  create: (data: any) => api.post('/events', data),
  attend: (id: number) => api.post(`/events/${id}/attend`),
  delete: (id: number) => api.delete(`/events/${id}`),
};

export const searchAPI = {
  search: (query: string) => api.get(`/search?q=${encodeURIComponent(query)}`),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.put('/notifications/mark-read'),
};

export const businessesAPI = {
  getAll: () => api.get('/businesses'),
  getMy: () => api.get('/businesses/my'),
  create: (data: any) => api.post('/businesses', data),
  follow: (id: number) => api.post(`/businesses/${id}/follow`),
  delete: (id: number) => api.delete(`/businesses/${id}`),
};

export const analyticsAPI = {
  get: () => api.get('/analytics'),
};

export const resourcesAPI = {
  getAll: (type?: string) => api.get(`/resources${type ? `?type=${type}` : ''}`),
  create: (data: any) => api.post('/resources', data),
  delete: (id: number) => api.delete(`/resources/${id}`),
};

export const assetsAPI = {
  getAll: (type?: string) => api.get(`/assets${type ? `?type=${type}` : ''}`),
  getMy: () => api.get('/assets/my'),
  create: (data: any) => api.post('/assets', data),
  delete: (id: number) => api.delete(`/assets/${id}`),
};

export const connectionsAPI = {
  sendRequest: (toUserId: number) => api.post(`/connections/request/${toUserId}`),
  respond: (connectionId: number, accept: boolean) => api.post(`/connections/respond/${connectionId}`, { accept }),
  getAll: () => api.get('/connections'),
  getPending: () => api.get('/connections/pending'),
  getStatus: (toUserId: number) => api.get(`/connections/status/${toUserId}`),
  remove: (otherUserId: number) => api.delete(`/connections/remove/${otherUserId}`),
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/users/change-password', { currentPassword, newPassword }),
  getSimilarUsers: () => api.get('/users/similar'),
};

