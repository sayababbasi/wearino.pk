/**
 * API Client Module
 * 
 * Provides a centralized HTTP client for making API requests to the backend.
 * Handles authentication, error handling, and response transformation.
 * 
 * Features:
 * - Automatic JWT token injection from localStorage
 * - Consistent error handling
 * - Type-safe API responses
 * - Base URL configuration via environment variables
 * 
 * @module lib/api
 */

/**
 * API Base URL
 * 
 * Determines the backend API endpoint URL.
 * Priority:
 * 1. NEXT_PUBLIC_API_URL environment variable (for production/staging)
 * 2. Default: http://localhost:5001/api (for local development)
 * 
 * Set NEXT_PUBLIC_API_URL in .env.local for custom backend URLs.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api';

/**
 * API Response Interface
 * 
 * Defines the structure of API responses from the backend.
 * All API methods return this consistent format.
 * 
 * @template T - The type of data returned in the response
 */
interface ApiResponse<T = any> {
  /** Response data (present on success) */
  data?: T;
  /** Error message (present on error) */
  error?: string;
  /** Additional message from backend */
  message?: string;
}

/**
 * API Client Class
 * 
 * A wrapper around the native fetch API that provides:
 * - Automatic authentication header injection
 * - Consistent error handling
 * - Type-safe request/response handling
 * - Base URL management
 * 
 * Usage:
 * ```typescript
 * const client = new ApiClient('http://localhost:5001/api');
 * const response = await client.get('/product');
 * if (response.data) {
 *   console.log(response.data);
 * } else {
 *   console.error(response.error);
 * }
 * ```
 */
class ApiClient {
  /** Base URL for all API requests */
  private baseURL: string;

  /**
   * Constructor
   * 
   * @param baseURL - The base URL for all API requests
   */
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Internal Request Method
   * 
   * Handles all HTTP requests with authentication and error handling.
   * This is the core method that all other HTTP methods (get, post, etc.) use.
   * 
   * @template T - The expected response data type
   * @param endpoint - API endpoint path (e.g., '/product' or '/order')
   * @param options - Fetch API options (method, body, headers, etc.)
   * @returns Promise resolving to ApiResponse with data or error
   * 
   * Authentication:
   * - Automatically retrieves JWT token from localStorage
   * - Adds 'Authorization: Bearer <token>' header if token exists
   * - Works for both authenticated and unauthenticated requests
   * 
   * Error Handling:
   * - Network errors are caught and returned as error response
   * - HTTP errors (4xx, 5xx) are returned with error message
   * - All errors are logged to console for debugging
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Construct full URL by combining base URL and endpoint
      const url = `${this.baseURL}${endpoint}`;

      /**
       * Build Request Configuration
       * 
       * Merges provided options with default headers.
       * Always sets Content-Type to application/json for JSON requests.
       */
      /**
       * Build Request Configuration
       * 
       * Merges provided options with default headers.
       * Sets Content-Type to application/json ONLY if body is not FormData.
       */
      const config: RequestInit = {
        ...options,
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // We use Bearer tokens, not cookies
        headers: {
          ...options.headers,
        },
      };

      // Set default Content-Type to application/json unless it's FormData (browser sets boundary)
      // or if Content-Type is explicitly deleted/overridden
      if (!(options.body instanceof FormData) &&
        !Object.keys(config.headers as Record<string, string>).some(h => h.toLowerCase() === 'content-type')) {
        config.headers = {
          ...config.headers,
          'Content-Type': 'application/json',
        };
      }

      /**
       * Add Authentication Token
       * 
       * Retrieves JWT token from localStorage (set during login).
       * If token exists, adds it to Authorization header.
       * If no token, request proceeds without authentication (for public endpoints).
       */
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`, // JWT token format
        };
      }

      // Execute the HTTP request
      const response = await fetch(url, config);

      // Extract response body based on content type
      let data: any = {};
      const contentType = response.headers.get('content-type');

      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // If not JSON, get as text to show in error
          const text = await response.text();
          console.log('Non-JSON response body:', text.substring(0, 500)); // Log first 500 chars
          data = { message: text || response.statusText };
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        data = { message: 'Response parsing failed' };
      }

      /**
       * Handle HTTP Errors
       * 
       * If response status is not OK (200-299), treat as error.
       */
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
        }

        // Try to get error message from parsed data, or fallback to status text
        const errorMessage = data.error || data.message || `Error ${response.status}: ${response.statusText}`;

        return {
          error: typeof errorMessage === 'string' ? errorMessage : 'Something went wrong',
          message: typeof errorMessage === 'string' ? errorMessage : 'Something went wrong',
        };
      }

      // Return successful response with data
      return { data };
    } catch (error) {
      /**
       * Handle Network/Request Errors
       * 
       * Catches errors like:
       * - Network failures (no internet, server down)
       * - CORS errors
       * - Invalid JSON responses
       * - Timeout errors
       */
      console.error('API request error:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * GET Request
   * 
   * Performs a GET request to fetch data from the API.
   * 
   * @template T - The expected response data type
   * @param endpoint - API endpoint path
   * @returns Promise resolving to ApiResponse
   * 
   * @example
   * const response = await client.get<Product[]>('/product');
   * if (response.data) {
   *   console.log(response.data); // Array of products
   * }
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST Request
   * 
   * Performs a POST request to create or submit data to the API.
   * 
   * @template T - The expected response data type
   * @param endpoint - API endpoint path
   * @param body - Data to send in request body (will be JSON stringified)
   * @returns Promise resolving to ApiResponse
   * 
   * @example
   * const response = await client.post<Order>('/order', {
   *   items: [...],
   *   shippingAddress: {...}
   * });
   */
  async post<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  /**
   * PUT Request
   * 
   * Performs a PUT request to update data in the API.
   * 
   * @template T - The expected response data type
   * @param endpoint - API endpoint path
   * @param body - Data to send in request body (will be JSON stringified)
   * @returns Promise resolving to ApiResponse
   * 
   * @example
   * const response = await client.put<Product>('/product/1', {
   *   price: 39.99
   * });
   */
  async put<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  async patch<T>(endpoint: string, body: any = {}, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  /**
   * DELETE Request
   * 
   * Performs a DELETE request to remove data from the API.
   * 
   * @template T - The expected response data type
   * @param endpoint - API endpoint path
   * @returns Promise resolving to ApiResponse
   * 
   * @example
   * const response = await client.delete('/product/1');
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Get Image URL
   * 
   * Constructs a full URL for an image path.
   * Handles local paths (uploads/...) and absolute URLs (https://...).
   */
  getImageUrl(path: string | undefined): string {
    if (!path) return 'https://via.placeholder.com/400x400?text=No+Image';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) return path;

    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Use the baseURL's origin (e.g., http://localhost:5001) + path
    // We assume this.baseURL ends with /api, so we need to strip it or just use the origin
    // A safer way is to use the NEXT_PUBLIC_API_URL or fallback, but stripped of /api

    // Simple heuristic: if baseURL ends in /api, strip it. 
    // If baseURL is http://localhost:5001/api -> http://localhost:5001/
    const baseUrlOrigin = this.baseURL.endsWith('/api')
      ? this.baseURL.slice(0, -4)
      : this.baseURL;

    // Ensure baseUrlOrigin ends with /
    const origin = baseUrlOrigin.endsWith('/') ? baseUrlOrigin : `${baseUrlOrigin}/`;

    return `${origin}${cleanPath.replace(/\\/g, '/')}`;
  }
}

/**
 * API Client Instance
 * 
 * Singleton instance of ApiClient configured with the base URL.
 * Use this for direct API calls, or use the convenience methods below.
 */
export const apiClient = new ApiClient(API_BASE_URL);

/**
 * API Convenience Methods
 * 
 * Provides type-safe, easy-to-use methods for common API operations.
 * These methods handle data transformation and provide a consistent interface
 * for frontend components.
 * 
 * All methods:
 * - Handle authentication automatically
 * - Transform backend data to frontend format
 * - Provide consistent error handling
 * - Return properly typed responses
 */
export const api = {
  /**
   * Get Products
   * 
   * Fetches products from the backend with optional filtering.
   * Transforms backend product format to frontend Product type.
   * 
   * @param params - Optional filtering parameters
   * @param params.tag - Filter by tag (e.g., "Sale", "New", "Trending")
   * @param params.category - Filter by category ID
   * @param params.department - Filter by department name (e.g., "Women", "Men")
   * @param params.subcategory - Filter by subcategory name (e.g., "Tops", "Dresses")
   * 
   * @returns Promise resolving to array of Product objects
   * 
   * @example
   * // Get all products
   * const products = await api.getProducts();
   * 
   * // Get products with "Sale" tag
   * const saleProducts = await api.getProducts({ tag: "Sale" });
   * 
   * // Get products in "Women" department
   * const womenProducts = await api.getProducts({ department: "Women" });
   * 
   * // Combine filters
   * const filtered = await api.getProducts({ tag: "Sale", department: "Women" });
   * 
   * Data Transformation:
   * - Backend: { id, image, categoryId, category: { name } }
   * - Frontend: { product_id, images, category_id, category_name }
   * - Handles both single image and images array formats
   */
  getProducts: async (params?: { tag?: string; category?: string; department?: string; subcategory?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.tag) queryParams.append('tag', params.tag);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.subcategory) queryParams.append('subcategory', params.subcategory);

    const queryString = queryParams.toString();
    const endpoint = `/product${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(endpoint);
    if (response.error) throw new Error(response.error);

    const products = (response.data as any)?.products || [];
    return products.map((p: any) => ({
      product_id: p.id?.toString() || p.product_id,
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image || (p.images && p.images[0]) || '',
      images: p.images || [p.image].filter(Boolean),
      category_id: p.categoryId?.toString() || p.category_id,
      category_name: p.category?.name || p.category_name || 'Uncategorized',
      rating: p.rating || 4.5,
      tags: p.tags || [],
      stock: p.stock || 0,
      discount: p.discount,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      variants: p.variants || [],
      sizes: p.sizes || [],
      colors: p.colors || [],
    }));
  },

  getProduct: async (id: string) => {
    const response = await apiClient.get(`/product/${id}`);
    if (response.error) throw new Error(response.error);
    const product = (response.data as any)?.product;
    if (!product) return null;

    return {
      product_id: product.id?.toString() || product.product_id,
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image || (product.images && product.images[0]) || '',
      images: product.images || [product.image].filter(Boolean),
      category_id: product.categoryId?.toString() || product.category_id,
      category_name: product.category?.name || product.category_name || 'Uncategorized',
      rating: product.rating || 4.5,
      tags: product.tags || [],
      stock: product.stock || 0,
      discount: product.discount,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      variants: product.variants || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
    };
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/product/${id}`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  // Helpers
  getImageUrl: (path: string | undefined) => apiClient.getImageUrl(path),

  // Cart
  getCart: async () => {
    const response = await apiClient.get('/cart');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  addToCart: async (productId: string, quantity: number = 1) => {
    const response = await apiClient.post('/cart', { productId, quantity });
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  updateCartItem: async (cartItemId: string, quantity: number) => {
    const response = await apiClient.put(`/cart/item/${cartItemId}`, { quantity });
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  removeFromCart: async (cartItemId: string) => {
    const response = await apiClient.delete(`/cart/item/${cartItemId}`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  clearCart: async () => {
    const response = await apiClient.delete('/cart');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  // Orders
  createOrder: async (orderData: { shippingAddress: any; paymentMethod: string; items?: any[] }) => {
    const response = await apiClient.post('/order', orderData);
    if (response.error) throw new Error(response.error);
    return response;
  },

  getOrders: async () => {
    const response = await apiClient.get('/order');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await apiClient.get(`/order/${id}`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string, options: any = {}) => {
    const response = await apiClient.put(`/order/${id}/status`, { status, ...options });
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  cancelOrderItem: async (orderId: string, itemId: string) => {
    const response = await apiClient.delete(`/order/${orderId}/items/${itemId}`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  updateOrderPaymentStatus: async (id: string, status: 'pending' | 'paid' | 'failed' | 'refunded') => {
    const response = await apiClient.put(`/order/${id}/payment-status`, { status });
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  // Auth
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.error) throw new Error(response.error);
    return response;
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const response = await apiClient.post('/auth/register', data);
    if (response.error) throw new Error(response.error);
    return response;
  },

  getDashboardStats: async () => {
    return api.getAdminStats();
  },

  getUserStats: async () => {
    return api.getAdminStats();
  },

  getAdminStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getMonthlyUserStats: async () => {
    const response = await apiClient.get('/admin/dashboard/charts/users');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getMonthlyProductStats: async () => {
    const response = await apiClient.get('/admin/dashboard/charts/products');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getLatestUsers: async () => {
    const response = await apiClient.get('/admin/dashboard/latest/users');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getLatestInquiries: async () => {
    const response = await apiClient.get('/admin/dashboard/latest/inquiries');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getLowStockProducts: async () => {
    const response = await apiClient.get('/admin/dashboard/products/low-stock');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getMostWishlisted: async () => {
    const response = await apiClient.get('/admin/dashboard/products/most-wishlisted');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await apiClient.get('/category');
    if (response.error) throw new Error(response.error);
    const data = response.data as any;
    if (Array.isArray(data)) return data;
    return data?.categories || [];
  },

  createCategory: async (categoryData: any) => {
    const response = await apiClient.post('/category', categoryData);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  updateCategory: async (categoryId: string, categoryData: any) => {
    const response = await apiClient.put(`/category/${categoryId}`, categoryData);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  deleteCategory: async (categoryId: string) => {
    const response = await apiClient.delete(`/category/${categoryId}`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getMonthlyStats: async (range: string = 'year') => {
    const response = await apiClient.get(`/order/stats/monthly?range=${range}`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  // Analytics
  getTopSellingProducts: async () => {
    const response = await apiClient.get('/product/top');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getTopViewedProducts: async () => {
    const response = await apiClient.get('/analytics/top-viewed');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getAnalyticsCounts: async () => {
    const response = await apiClient.get('/analytics/counts');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getRevenueAnalytics: async (range: string = 'year') => {
    const response = await apiClient.get(`/analytics/revenue?range=${range}`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  // User Management (Admin)
  getAllUsers: async () => {
    const response = await apiClient.get('/auth/users');
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const response = await apiClient.put(`/auth/users/${userId}/role`, { role });
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/auth/users/${userId}`);
    if (response.error) throw new Error(response.error);
    return response;
  },

  createUser: async (userData: any) => {
    const response = await apiClient.post('/auth/users', userData);
    if (response.error) throw new Error(response.error);
    return response;
  },

  // Contact/Inquiry
  submitInquiry: async (inquiryData: { name: string; email: string; message: string; subject?: string; productId?: number }) => {
    const response = await apiClient.post('/inquiry', inquiryData);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  // Content Management
  getContent: async (type?: string, position?: string, all?: boolean) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (position) params.append('position', position);
    if (all) params.append('all', 'true');

    const response = await apiClient.get<any>(`/content?${params.toString()}`);
    if (response.error) throw new Error(response.error);
    return response.data?.content || [];
  },

  createContent: async (contentData: any) => {
    const response = await apiClient.post('/content', contentData);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  updateContent: async (id: string, contentData: any) => {
    const response = await apiClient.put(`/content/${id}`, contentData);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  deleteContent: async (id: string) => {
    const response = await apiClient.delete(`/content/${id}`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  // Reviews
  deleteReview: async (id: string) => {
    const response = await apiClient.delete(`/admin/reviews/${id}`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  toggleReviewStatus: async (id: string) => {
    const response = await apiClient.patch<any>(`/admin/reviews/${id}/toggle-approval`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  // Generic HTTP methods
  get: async <T = any>(endpoint: string) => {
    const response = await apiClient.get<T>(endpoint);
    if (response.error) throw new Error(response.error);
    return response;
  },

  post: async <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const response = await apiClient.post<T>(endpoint, body, options);
    if (response.error) throw new Error(response.error);
    return response;
  },

  put: async <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const response = await apiClient.put<T>(endpoint, body, options);
    if (response.error) throw new Error(response.error);
    return response;
  },

  delete: async <T = any>(endpoint: string) => {
    const response = await apiClient.delete<T>(endpoint);
    if (response.error) throw new Error(response.error);
    return response;
  },
};