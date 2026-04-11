import { create } from 'zustand';
import type { Post } from '@/lib/api';

interface LinkedInStatusData {
  vanityName: string;
  personUrn: string;
  profile: object;
  expiresAt: string;
  connectedAt: string;
}

interface LinkedInStatus {
  isConnected: boolean;
  isExpired: boolean;
  data?: LinkedInStatusData;
}

interface LinkedInState {
  linkedInStatus: LinkedInStatus | null;
  posts: Post[];
  isLoading: boolean;
  // LinkedIn status
  setLinkedInStatus: (status: LinkedInStatus) => void;
  clearLinkedInStatus: () => void;
  // Posts
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  removePost: (id: string) => void;
  // Loading
  setLoading: (loading: boolean) => void;
}

export const useLinkedInStore = create<LinkedInState>((set) => ({
  linkedInStatus: null,
  posts: [],
  isLoading: false,

  setLinkedInStatus: (status) => set({ linkedInStatus: status }),
  clearLinkedInStatus: () => set({ linkedInStatus: null }),

  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  removePost: (id) => set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),

  setLoading: (loading) => set({ isLoading: loading }),
}));
