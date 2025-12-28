// API configuration - all services routed through API Gateway during development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3000';
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || API_URL;
const CONTENT_SERVICE_URL = import.meta.env.VITE_CONTENT_SERVICE_URL || API_URL;

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

  async request(url, options = {}) {
    const config = {
      ...options,
      credentials: 'include',
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage = typeof data === 'object' ? (data.error || data.message) : data;
        throw new Error(errorMessage || `HTTP error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods - using Auth Service directly
  auth = {
    register: async (email, password, username) => {
      const data = await this.request(`${AUTH_SERVICE_URL}/register`, {
        method: 'POST',
        body: JSON.stringify({ email, password, passwordConfirm: password, username }),
      });
      this.setToken(data.token);
      return data.user;
    },

    login: async (email, password) => {
      const data = await this.request(`${AUTH_SERVICE_URL}/login`, {
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

      const data = await this.request(`${AUTH_SERVICE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        }
      });

      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    },

    logout: () => {
      this.setToken(null);
      window.location.href = '/';
    },

    redirectToLogin: (returnUrl = '/browse') => {
      window.location.href = `/Login?return=${encodeURIComponent(returnUrl)}`;
    },
  };

  // Content methods - using Content Service directly
  entities = {
    content: {
      list: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.content_type) params.append('content_type', filters.content_type);
        if (filters.year) params.append('year', filters.year);
        if (filters.genre) params.append('genre', filters.genre);

        const queryString = params.toString();
        const url = `${CONTENT_SERVICE_URL}/list${queryString ? '?' + queryString : ''}`;
        const response = await this.request(url);
        // Unwrap items from response envelope
        return response.items || response;
      },

      search: async (query) => {
        const url = `${CONTENT_SERVICE_URL}/search?q=${encodeURIComponent(query)}`;
        return await this.request(url);
      },

      findById: async (id) => {
        return await this.request(`${CONTENT_SERVICE_URL}/${id}`);
      },

      create: async (data) => {
        return await this.request(`${CONTENT_SERVICE_URL}`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },

      update: async (id, data) => {
        return await this.request(`${CONTENT_SERVICE_URL}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      },

      delete: async (id) => {
        return await this.request(`${CONTENT_SERVICE_URL}/${id}`, {
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
          const checkoutData = await this.request(`${GATEWAY_URL}/stripe/create-checkout-session`, {
            method: 'POST',
            body: JSON.stringify(params),
          });
          return { data: checkoutData };

        case 'createPortalSession':
          const portalData = await this.request(`${GATEWAY_URL}/stripe/create-portal-session`, {
            method: 'POST',
          });
          return { data: portalData };

        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    },
  };

  // User methods (My List, etc.) - placeholder for Users Service
  user = {
    getMyList: async () => {
      return await this.request(`${GATEWAY_URL}/user/my-list`);
    },

    addToMyList: async (contentId) => {
      return await this.request(`${GATEWAY_URL}/user/my-list/${contentId}`, {
        method: 'POST',
      });
    },

    removeFromMyList: async (contentId) => {
      return await this.request(`${GATEWAY_URL}/user/my-list/${contentId}`, {
        method: 'DELETE',
      });
    },

    addToWatchHistory: async (contentId) => {
      return await this.request(`${GATEWAY_URL}/user/watch-history/${contentId}`, {
        method: 'POST',
      });
    },
  };
}

export const apiClient = new APIClient();
