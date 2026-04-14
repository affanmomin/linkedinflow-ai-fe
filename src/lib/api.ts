import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const AUTH_TOKEN_KEY = 'auth_token';
const LEGACY_AUTH_TOKEN_KEY = 'authToken';

const getStoredAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    window.localStorage.getItem(AUTH_TOKEN_KEY) ??
    window.localStorage.getItem(LEGACY_AUTH_TOKEN_KEY)
  );
};

const setStoredAuthToken = (token: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(LEGACY_AUTH_TOKEN_KEY, token);
};

const clearStoredAuthToken = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
};

const extractAuthToken = (payload: any): string | null => {
  if (!payload) return null;

  if (typeof payload === 'string') return payload;

  const directToken =
    payload.token ?? payload.accessToken ?? payload.access_token ?? payload.jwt;
  if (typeof directToken === 'string' && directToken.length > 0) return directToken;

  const sessionToken =
    payload.session?.token ??
    payload.session?.accessToken ??
    payload.session?.access_token ??
    payload.session?.jwt;

  if (typeof sessionToken === 'string' && sessionToken.length > 0) return sessionToken;

  return null;
};

const persistAuthTokenFromPayload = (payload: any) => {
  const token = extractAuthToken(payload);
  if (token) setStoredAuthToken(token);
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getStoredAuthToken();

  if (token) {
    config.headers = config.headers ?? {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Log the full backend error body in development so we can diagnose issues
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    const body = error.response?.data;
    // Suppress expected 401 on /api/me (unauthenticated user on mount)
    if (url === '/api/me' && status === 401) return Promise.reject(error);
    console.error(`[API ${status}] ${error.config?.method?.toUpperCase()} ${url}`, body);
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/signin', { email, password });
    persistAuthTokenFromPayload(response.data);
    return response.data; // { user, session }
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/api/signup', { email, name, password });
    persistAuthTokenFromPayload(response.data);
    return response.data; // { user, session }
  },

  logout: async () => {
    const response = await api.post('/api/signout', {});
    clearStoredAuthToken();
    return response.data;
  },

  me: async () => {
    const response = await api.get('/api/me');
    persistAuthTokenFromPayload(response.data);
    return response.data; // { user: { id, name, email, emailVerified, image }, session }
  },
};

// ── LinkedIn OAuth ────────────────────────────────────────────────────────────

export const linkedInAPI = {
  /**
   * Step 1 of OAuth flow.
   * POST /linkedin/connect { userId } → { url, state }
   * Redirect the browser to the returned url.
   */
  connect: async (userId: string) => {
    const response = await api.post('/linkedin/connect', { userId });
    return response.data; // { url: string, state: string }
  },

  /**
   * Step 2 of OAuth flow (called by the callback page).
   * POST /linkedin/finish { code, state }
   * → { success: true, message, data: { vanityName, userId, tokenId, expiresAt } }
   * → { success: false, message, error }
   */
  finish: async (code: string, state: string, userId?: string) => {
    const response = await api.post('/linkedin/finish', { code, state, ...(userId ? { userId } : {}) });
    return response.data;
  },

  /**
   * Check if a user has a LinkedIn token stored.
   * GET /linkedin/token/:userId
   */
  getToken: async (userId: string) => {
    const response = await api.get(`/linkedin/token/${userId}`);
    return response.data; // { success, data: { id, expires_at, person_urn, vanity_name, ... } }
  },

  /** Delete the stored LinkedIn token for a user */
  disconnect: async (userId: string) => {
    const response = await api.delete(`/linkedin/token/${userId}`);
    return response.data;
  },
};

// ── Posts ─────────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  user_id: string;
  content: string;
  post_type: 'text' | 'image' | 'link' | 'video';
  link_url?: string;
  image_url?: string;
  image_base64?: string;
  image_type?: string;
  has_image?: boolean;
  has_video?: boolean;
  video_url?: string;
  linkedin_post_id?: string;
  status: 'draft' | 'published' | 'failed' | 'scheduled';
  failure_reason?: string;
  error_message?: string;
  error?: string;
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export const postsAPI = {
  createPost: async (postData: {
    content: string;
    post_type?: 'text' | 'image' | 'link' | 'video';
    link_url?: string;
    video_url?: string;
    video_base64?: string;
    publish_now?: boolean;
    scheduled_at?: string; // ISO string — schedule for future
    image_base64?: string;
    image_type?: string;
    /** Pass the raw File when uploading a local image — sent as multipart/form-data */
    image_file?: File;
    /** Pass the raw File when uploading a local video — sent as multipart/form-data */
    video_file?: File;
  }) => {
    // File upload path — use multipart/form-data for binary media.
    if (postData.image_file || postData.video_file) {
      const form = new FormData();
      form.append('content', postData.content);
      form.append('post_type', postData.post_type ?? (postData.video_file ? 'video' : 'image'));
      form.append('publish_now', String(postData.publish_now ?? false));
      if (postData.scheduled_at) form.append('scheduled_at', postData.scheduled_at);
      if (postData.link_url) form.append('link_url', postData.link_url);
      if (postData.video_url) form.append('video_url', postData.video_url);
      if (postData.image_file) form.append('image', postData.image_file, postData.image_file.name);
      if (postData.video_file) form.append('video', postData.video_file, postData.video_file.name);

      const response = await api.post('/posts', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300_000, // 5 min — allow time for large uploads
      });
      return response.data as { success: boolean; post: Post };
    }

    // All other post types — JSON body
    const response = await api.post('/posts', {
      content: postData.content,
      post_type: postData.post_type ?? 'text',
      link_url: postData.link_url,
      video_url: postData.video_url,
      video_base64: postData.video_base64,
      publish_now: postData.publish_now ?? false,
      scheduled_at: postData.scheduled_at,
      ...(postData.image_base64 ? {
        image_base64: postData.image_base64,
        image_type: postData.image_type,
      } : {}),
    });
    return response.data; // { success: true, post: Post }
  },

  getPosts: async () => {
    const response = await api.get('/posts');
    return response.data; // { posts: Post[] }
  },

  getPost: async (id: string) => {
    const response = await api.get(`/posts/${id}`);
    return response.data; // { post: Post }
  },

  deletePost: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data; // { success: true }
  },

  publishPost: async (id: string) => {
    const response = await api.patch(`/posts/${id}/publish`);
    return response.data; // { success: true, post: Post }
  },

  /**
   * PATCH /posts/:id
   * Update content, link_url, post_type, or scheduled_at of a draft/scheduled post.
   * Pass scheduled_at: null to clear the schedule (converts back to draft).
   */
  updatePost: async (
    id: string,
    updates: {
      content?: string;
      link_url?: string | null;
      post_type?: 'text' | 'image' | 'link' | 'video';
      scheduled_at?: string | null;
    }
  ) => {
    const response = await api.patch(`/posts/${id}`, updates);
    return response.data as { success: boolean; post: Post };
  },

  /**
   * GET /posts/import/template
   * Downloads the Excel template file and triggers a browser download.
   */
  downloadTemplate: async () => {
    const response = await api.get('/posts/import/template', {
      responseType: 'blob',
    });
    const cd = response.headers['content-disposition'] as string | undefined;
    const match = cd?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const filename = match ? match[1].replace(/['"]/g, '') : 'posts_template.xlsx';
    const url = URL.createObjectURL(response.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  /**
   * POST /posts/import (multipart)
   * FormData: file=<spreadsheet>, filename=<optional>
   */
  importPosts: async (file: File, filename?: string) => {
    const form = new FormData();
    form.append('file', file, filename ?? file.name);
    if (filename) form.append('filename', filename);

    const response = await api.post('/posts/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000,
    });
    return response.data as {
      imported: number;
      failed: number;
      total: number;
      posts?: Post[];
      warnings?: { row?: number; message: string }[];
      errors?: { row?: number; message: string }[];
    };
  },

  /**
   * POST /posts/import (JSON base64 fallback)
   */
  importPostsBase64: async (filename: string, base64: string) => {
    const response = await api.post('/posts/import', { filename, file: base64 }, { timeout: 120_000 });
    return response.data as {
      imported: number;
      failed: number;
      total: number;
      posts?: Post[];
      warnings?: { row?: number; message: string }[];
      errors?: { row?: number; message: string }[];
    };
  },

  /**
   * POST /posts/upload-video
   * Supports multipart video upload; returns a persisted video URL.
   */
  uploadVideo: async (video: File) => {
    const form = new FormData();
    form.append('video', video, video.name);

    const response = await api.post('/posts/upload-video', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300_000,
    });

    return response.data as {
      success?: boolean;
      video_url: string;
      storage_path?: string;
      message?: string;
      error?: string;
    };
  },
};

// ── Google Sheets (legacy — endpoints not yet in backend spec) ────────────────

export const sheetsAPI = {
  testConnection: async (sheetData: { spreadsheetId: string; sheetName: string }) => {
    const response = await api.post('/stagehand/testGoogleSheetsFlow', sheetData);
    return response.data;
  },
  uploadAndProcessExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/stagehand/uploadAndProcessExcel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default api;
