import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
});

// 启动时从 localStorage 读取 token
const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  localStorage.setItem('auth_token', token);
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('auth_token');
};

export const authAPI = {
  register: (email: string, username: string, password: string) =>
    api.post('/auth/register', { email, username, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const postsAPI = {
  getAll: () => api.get('/posts'),
  create: (content: string, imageUrl?: string) =>
    api.post('/posts', { content, imageUrl }),
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
  create: (name: string, description: string, category: string, location: string) =>
    api.post('/groups', { name, description, category, location }),
  join: (id: number) => api.post(`/groups/${id}/join`),
  getMessages: (id: number) => api.get(`/groups/${id}/messages`),
  sendMessage: (id: number, content: string) =>
    api.post(`/groups/${id}/messages`, { content }),
};