import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './supabase';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'agriconnection-auth', partialize: ['user', 'isAuthenticated'] }
  )
);

// Map Store
interface MapState {
  center: [number, number];
  zoom: number;
  filters: { role: string; onlineOnly: boolean };
  showLocationPrompt: boolean;
  hasLocationPermission: boolean;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setFilters: (filters: MapState['filters']) => void;
  setShowLocationPrompt: (show: boolean) => void;
  setHasLocationPermission: (granted: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: [-1.2921, 36.8219],
  zoom: 8,
  filters: { role: 'all', onlineOnly: false },
  showLocationPrompt: true,
  hasLocationPermission: false,
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setFilters: (filters) => set({ filters }),
  setShowLocationPrompt: (showLocationPrompt) => set({ showLocationPrompt }),
  setHasLocationPermission: (hasLocationPermission) => set({ hasLocationPermission }),
}));

// Chat Store
interface ChatState {
  activeChatId: number | null;
  activeChatType: 'direct' | 'group' | null;
  typingUsers: Set<number>;
  onlineUsers: Set<number>;
  setActiveChat: (id: number | null, type: 'direct' | 'group' | null) => void;
  setTyping: (userId: number, isTyping: boolean) => void;
  setOnline: (userId: number, isOnline: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeChatId: null,
  activeChatType: null,
  typingUsers: new Set(),
  onlineUsers: new Set(),
  setActiveChat: (id, type) => set({ activeChatId: id, activeChatType: type }),
  setTyping: (userId, isTyping) => {
    const typingUsers = new Set(get().typingUsers);
    if (isTyping) typingUsers.add(userId);
    else typingUsers.delete(userId);
    set({ typingUsers });
  },
  setOnline: (userId, isOnline) => {
    const onlineUsers = new Set(get().onlineUsers);
    if (isOnline) onlineUsers.add(userId);
    else onlineUsers.delete(userId);
    set({ onlineUsers });
  },
}));

// OTP Store
interface OTPState {
  email: string;
  otpType: 'signup' | 'login' | 'reset_password';
  cooldown: number;
  attempts: number;
  setEmail: (email: string) => void;
  setOtpType: (type: OTPState['otpType']) => void;
  setCooldown: (seconds: number) => void;
  setAttempts: (count: number) => void;
}

export const useOTPStore = create<OTPState>((set) => ({
  email: '',
  otpType: 'signup',
  cooldown: 0,
  attempts: 0,
  setEmail: (email) => set({ email }),
  setOtpType: (otpType) => set({ otpType }),
  setCooldown: (cooldown) => set({ cooldown }),
  setAttempts: (attempts) => set({ attempts }),
}));

// UI Store for loading states
interface UIState {
  globalLoading: boolean;
  loadingMessage: string;
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  globalLoading: false,
  loadingMessage: '',
  setGlobalLoading: (globalLoading, loadingMessage = '') => set({ globalLoading, loadingMessage }),
}));
