/**
 * Global Zustand store for Portfolio + Gamification state
 * Single source of truth for dashboard data
 */

import { create } from "zustand";
import { User, PortfolioItem, Badge, Recommendation, ActivityLog } from "@/types";

export interface PortfolioStoreState {
  // User Data
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  clearCurrentUser: () => void;

  // Portfolio Items
  portfolioItems: PortfolioItem[];
  setPortfolioItems: (items: PortfolioItem[]) => void;
  addPortfolioItem: (item: PortfolioItem) => void;
  updatePortfolioItem: (id: string, item: Partial<PortfolioItem>) => void;
  deletePortfolioItem: (id: string) => void;

  // Gamification State
  totalPoints: number;
  currentLevel: number;
  badges: Badge[];
  setTotalPoints: (points: number) => void;
  setCurrentLevel: (level: number) => void;
  setBadges: (badges: Badge[]) => void;
  addBadge: (badge: Badge) => void;
  awardPoints: (points: number) => void;

  // Recommendations
  recommendations: Recommendation[];
  setRecommendations: (recommendations: Recommendation[]) => void;
  addRecommendation: (recommendation: Recommendation) => void;
  acceptRecommendation: (id: string) => void;

  // Activity Log
  recentActivities: ActivityLog[];
  setRecentActivities: (activities: ActivityLog[]) => void;
  addActivity: (activity: ActivityLog) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Reset store
  reset: () => void;
}

export const usePortfolioStore = create<PortfolioStoreState>((set) => ({
  // User Data
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  clearCurrentUser: () => set({ currentUser: null }),

  // Portfolio Items
  portfolioItems: [],
  setPortfolioItems: (items) => set({ portfolioItems: items }),
  addPortfolioItem: (item) =>
    set((state) => ({
      portfolioItems: [...state.portfolioItems, item],
    })),
  updatePortfolioItem: (id, updatedItem) =>
    set((state) => ({
      portfolioItems: state.portfolioItems.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item
      ),
    })),
  deletePortfolioItem: (id) =>
    set((state) => ({
      portfolioItems: state.portfolioItems.filter((item) => item.id !== id),
    })),

  // Gamification State
  totalPoints: 0,
  currentLevel: 1,
  badges: [],
  setTotalPoints: (points) => set({ totalPoints: points }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  setBadges: (badges) => set({ badges }),
  addBadge: (badge) =>
    set((state) => ({
      badges: [...state.badges.filter((b) => b.id !== badge.id), badge],
    })),
  awardPoints: (points) =>
    set((state) => {
      const newPoints = state.totalPoints + points;
      const newLevel = Math.floor(newPoints / 500) + 1; // Level up every 500 points

      return {
        totalPoints: newPoints,
        currentLevel: newLevel,
      };
    }),

  // Recommendations
  recommendations: [],
  setRecommendations: (recommendations) => set({ recommendations }),
  addRecommendation: (recommendation) =>
    set((state) => ({
      recommendations: [...state.recommendations, recommendation],
    })),
  acceptRecommendation: (id) =>
    set((state) => ({
      recommendations: state.recommendations.map((rec) =>
        rec.id === id ? { ...rec, accepted: true } : rec
      ),
    })),

  // Activity Log
  recentActivities: [],
  setRecentActivities: (activities) => set({ recentActivities: activities }),
  addActivity: (activity) =>
    set((state) => ({
      recentActivities: [activity, ...state.recentActivities].slice(0, 20),
    })),

  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),

  // Reset store
  reset: () =>
    set({
      currentUser: null,
      portfolioItems: [],
      totalPoints: 0,
      currentLevel: 1,
      badges: [],
      recommendations: [],
      recentActivities: [],
      isLoading: false,
      error: null,
    }),
}));

/**
 * Custom hooks for accessing specific store slices
 * Helps with performance by subscribing to specific parts of state
 */

export const useCurrentUser = () =>
  usePortfolioStore((state) => ({
    user: state.currentUser,
    setUser: state.setCurrentUser,
    clearUser: state.clearCurrentUser,
  }));

export const usePortfolioItems = () =>
  usePortfolioStore((state) => ({
    items: state.portfolioItems,
    setItems: state.setPortfolioItems,
    add: state.addPortfolioItem,
    update: state.updatePortfolioItem,
    delete: state.deletePortfolioItem,
  }));

export const useGamification = () =>
  usePortfolioStore((state) => ({
    points: state.totalPoints,
    level: state.currentLevel,
    badges: state.badges,
    setPoints: state.setTotalPoints,
    setLevel: state.setCurrentLevel,
    setBadges: state.setBadges,
    addBadge: state.addBadge,
    awardPoints: state.awardPoints,
  }));

export const useRecommendations = () =>
  usePortfolioStore((state) => ({
    recommendations: state.recommendations,
    setRecommendations: state.setRecommendations,
    add: state.addRecommendation,
    accept: state.acceptRecommendation,
  }));

export const useActivityLog = () =>
  usePortfolioStore((state) => ({
    activities: state.recentActivities,
    setActivities: state.setRecentActivities,
    addActivity: state.addActivity,
  }));

export const useStoreUI = () =>
  usePortfolioStore((state) => ({
    isLoading: state.isLoading,
    error: state.error,
    setIsLoading: state.setIsLoading,
    setError: state.setError,
  }));
