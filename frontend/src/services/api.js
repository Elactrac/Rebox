import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚫 401 Unauthorized:', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.response?.data?.message
      });
      
      // Don't redirect if we're on the OAuth callback page
      const isOAuthCallback = window.location.pathname.includes('/oauth/callback');
      const isLoginPage = window.location.pathname === '/login';
      
      if (!isOAuthCallback && !isLoginPage) {
        console.log('🔄 Redirecting to login due to 401');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// OAuth API
export const oauthAPI = {
  getConfig: () => api.get('/oauth/config'),
  getGoogleUrl: (redirectUri) => api.get('/oauth/google/url', { params: { redirect_uri: redirectUri } }),
  googleToken: (idToken, role) => api.post('/oauth/google/token', { idToken, role }),
  googleCode: (code, state, redirectUri, role) => 
    api.post('/oauth/google/code', { code, state, redirect_uri: redirectUri, role }),
  linkGoogle: (idToken) => api.post('/oauth/link/google', { idToken }),
  unlinkOAuth: () => api.post('/oauth/unlink'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
  getRecyclers: (params) => api.get('/users/recyclers', { params }),
};

// Package API
export const packageAPI = {
  create: (data) => api.post('/packages', data),
  getAll: (params) => api.get('/packages', { params }),
  getById: (id) => api.get(`/packages/${id}`),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
  getStats: () => api.get('/packages/stats/summary'),
  search: (query, params = {}) => api.get('/packages/search', { params: { q: query, ...params } }),
  getFilterOptions: () => api.get('/packages/filters/options'),
};

// Pickup API
export const pickupAPI = {
  create: (data) => api.post('/pickups', data),
  getAll: (params) => api.get('/pickups', { params }),
  getById: (id) => api.get(`/pickups/${id}`),
  track: (trackingCode) => api.get(`/pickups/track/${trackingCode}`),
  accept: (id) => api.put(`/pickups/${id}/accept`),
  updateStatus: (id, status) => api.put(`/pickups/${id}/status`, { status }),
  cancel: (id) => api.put(`/pickups/${id}/cancel`),
  getAvailableSlots: (date) => api.get('/pickups/slots/available', { params: { date } }),
};

// Rewards API
export const rewardsAPI = {
  get: () => api.get('/rewards'),
  getTransactions: (params) => api.get('/rewards/transactions', { params }),
  redeem: (data) => api.post('/rewards/redeem', data),
  getLeaderboard: (limit) => api.get('/rewards/leaderboard', { params: { limit } }),
  getLevels: () => api.get('/rewards/levels'),
};

// Impact API
export const impactAPI = {
  get: () => api.get('/impact'),
  getHistory: (period) => api.get('/impact/history', { params: { period } }),
  getGlobal: () => api.get('/impact/global'),
  getReports: () => api.get('/impact/reports'),
  getCertificate: () => api.get('/impact/certificate'),
};

// Notifications API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Buyback API
export const buybackAPI = {
  createOffer: (data) => api.post('/buyback/offers', data),
  getOffers: (params) => api.get('/buyback/offers', { params }),
  acceptOffer: (id) => api.put(`/buyback/offers/${id}/accept`),
  rejectOffer: (id) => api.put(`/buyback/offers/${id}/reject`),
  cancelOffer: (id) => api.delete(`/buyback/offers/${id}`),
  getMarketplace: (params) => api.get('/buyback/marketplace', { params }),
};

// Upload API
export const uploadAPI = {
  uploadPackageImages: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post('/upload/packages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteFile: (type, filename) => api.delete(`/upload/${type}/${filename}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getAnalyticsTimeline: (period) => api.get('/admin/analytics/timeline', { params: { period } }),
  getPickups: (params) => api.get('/admin/pickups', { params }),
  sendBroadcast: (data) => api.post('/admin/broadcast', data),
  getCacheStats: () => api.get('/admin/cache/stats'),
  clearCache: () => api.post('/admin/cache/clear'),
};

// QR Code API
export const qrAPI = {
  getPickupQR: (trackingCode, format = 'dataurl') => 
    api.get(`/qr/pickup/${trackingCode}`, { params: { format } }),
  getPackageQR: (id, format = 'dataurl') => 
    api.get(`/qr/package/${id}`, { params: { format } }),
  getBatchQR: (trackingCodes) => 
    api.post('/qr/batch', { trackingCodes }),
  getShippingLabel: (trackingCode) => 
    api.get(`/qr/label/${trackingCode}`),
};

// Export API
export const exportAPI = {
  packagesCSV: (params) => 
    api.get('/export/packages/csv', { params, responseType: 'blob' }),
  pickupsCSV: (params) => 
    api.get('/export/pickups/csv', { params, responseType: 'blob' }),
  transactionsCSV: (params) => 
    api.get('/export/transactions/csv', { params, responseType: 'blob' }),
  impactCSV: () => 
    api.get('/export/impact/csv', { responseType: 'blob' }),
  userDataJSON: () => 
    api.get('/export/user-data/json', { responseType: 'blob' }),
  adminReport: (params) => 
    api.get('/export/admin/report', { params, responseType: 'blob' }),
};

export default api;
