import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LinkedInCredentials {
  username: string;
  password: string;
  isStored: boolean;
}

interface PostData {
  id: string;
  content: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  scheduledAt?: string;
}

interface LinkedInState {
  credentials: LinkedInCredentials | null;
  posts: PostData[];
  isLoggedIn: boolean;
  isLoading: boolean;
  batchProgress: {
    total: number;
    completed: number;
    failed: number;
  } | null;
  storeCredentials: (credentials: Omit<LinkedInCredentials, 'isStored'>) => void;
  clearCredentials: () => void;
  setLoggedIn: (status: boolean) => void;
  addPost: (post: PostData) => void;
  updatePostStatus: (id: string, status: PostData['status']) => void;
  setBatchProgress: (progress: LinkedInState['batchProgress']) => void;
  setLoading: (loading: boolean) => void;
}

export const useLinkedInStore = create<LinkedInState>()(
  persist(
    (set, get) => ({
      credentials: null,
      posts: [],
      isLoggedIn: false,
      isLoading: false,
      batchProgress: null,
      storeCredentials: (credentials) =>
        set({ credentials: { ...credentials, isStored: true } }),
      clearCredentials: () => set({ credentials: null, isLoggedIn: false }),
      setLoggedIn: (status) => set({ isLoggedIn: status }),
      addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
      updatePostStatus: (id, status) =>
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === id ? { ...post, status } : post
          ),
        })),
      setBatchProgress: (progress) => set({ batchProgress: progress }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'linkedin-storage',
      partialize: (state) => ({
        credentials: state.credentials,
        posts: state.posts,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);