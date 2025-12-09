const API_URL = import.meta.env.VITE_API_URL || '/api';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

class APIClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  auth = {
    register: async (email, password, full_name) => {
      const data = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name }),
      });
      this.setToken(data.token);
      return data.user;
    },

    login: async (email, password) => {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(data.token);
      return data.user;
    },

    me: async () => {
      const cacheKey = 'auth:me';
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Not authenticated');
      const data = await response.json();

      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    },

    updateMe: async (updates) => {
      // Invalidate cache for auth.me after update
      cache.delete('auth:me');
      return await this.request('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    logout: () => {
      this.setToken(null);
      window.location.href = '/';
    },

    redirectToLogin: (returnUrl = '/browse') => {
      window.location.href = `/Login?return=${encodeURIComponent(returnUrl)}`;
    },
  };

  // Content (entities) methods
  entities = {
    Content: {
      findMany: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.genre) params.append('genre', filters.genre);
        if (filters.featured) params.append('featured', 'true');
        if (filters.search) params.append('search', filters.search);

        const queryString = params.toString();
        return await this.request(`/content${queryString ? '?' + queryString : ''}`);
      },

      findById: async (id) => {
        return await this.request(`/content/${id}`);
      },

      create: async (data) => {
        return await this.request('/content', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },

      update: async (id, data) => {
        return await this.request(`/content/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      },

      delete: async (id) => {
        return await this.request(`/content/${id}`, {
          method: 'DELETE',
        });
      },
    },
  };

  // Functions (Stripe, etc.)
  functions = {
    invoke: async (functionName, params = {}) => {
      switch (functionName) {
        case 'createCheckoutSession':
          const checkoutData = await this.request('/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify(params),
          });
          return { data: checkoutData };

        case 'createPortalSession':
          const portalData = await this.request('/stripe/create-portal-session', {
            method: 'POST',
          });
          return { data: portalData };

        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    },
  };

  // User methods (My List, etc.)
  user = {
    getMyList: async () => {
      return await this.request('/user/my-list');
    },

    addToMyList: async (contentId) => {
      return await this.request(`/user/my-list/${contentId}`, {
        method: 'POST',
      });
    },

    removeFromMyList: async (contentId) => {
      return await this.request(`/user/my-list/${contentId}`, {
        method: 'DELETE',
      });
    },

    addToWatchHistory: async (contentId) => {
      return await this.request(`/user/watch-history/${contentId}`, {
        method: 'POST',
      });
    },
  };
}

export const apiClient = new APIClient();