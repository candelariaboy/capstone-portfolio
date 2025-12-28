"use client";

import { useCallback } from "react";
import { toast } from "react-hot-toast";

export type BadgeType =
  | "new_student"
  | "builder_i"
  | "builder_ii"
  | "ai_follower"
  | "junior_developer"
  | "pathfinder";

export const BADGE_INFO: Record<
  BadgeType,
  { name: string; description: string; icon: string }
> = {
  new_student: {
    name: "New Student",
    description: "Joined the platform",
    icon: "🎓",
  },
  builder_i: {
    name: "Builder I",
    description: "Uploaded first portfolio item",
    icon: "🏗️",
  },
  builder_ii: {
    name: "Builder II",
    description: "Uploaded 3 portfolio items",
    icon: "🏢",
  },
  ai_follower: {
    name: "AI Follower",
    description: "Accepted AI recommendation",
    icon: "🤖",
  },
  junior_developer: {
    name: "Junior Developer",
    description: "Reached Level 2",
    icon: "💻",
  },
  pathfinder: {
    name: "Pathfinder",
    description: "Completed learning path",
    icon: "🧭",
  },
};

export function useGamification() {
  const calculateLevel = useCallback((points: number): number => {
    if (points < 100) return 1;
    if (points < 250) return 2;
    if (points < 500) return 3;
    if (points < 1000) return 4;
    return 5;
  }, []);

  const awardBadge = useCallback((badgeType: BadgeType, userId: string) => {
    const badgeInfo = BADGE_INFO[badgeType];
    toast.success(`🎉 Earned "${badgeInfo.name}" badge!`, {
      duration: 4000,
      style: {
        background: "#1f2937",
        color: "#fff",
        fontSize: "14px",
      },
    });
  }, []);

  const awardPoints = useCallback(
    (points: number, reason: string, userId: string) => {
      toast.success(`+${points} points ${reason}`, {
        duration: 3000,
        style: {
          background: "#1f2937",
          color: "#fff",
          fontSize: "14px",
        },
      });
    },
    []
  );

  const getNextLevelThreshold = useCallback((currentLevel: number): number => {
    const thresholds = [0, 100, 250, 500, 1000];
    return thresholds[Math.min(currentLevel, thresholds.length - 1)];
  }, []);

  const getProgressToNextLevel = useCallback(
    (points: number, level: number): number => {
      const currentThreshold = [0, 100, 250, 500, 1000][level - 1] || 0;
      const nextThreshold = [100, 250, 500, 1000, 2000][level - 1] || 2000;
      return ((points - currentThreshold) / (nextThreshold - currentThreshold)) *
        100 > 100
        ? 100
        : ((points - currentThreshold) / (nextThreshold - currentThreshold)) *
            100;
    },
    []
  );

  return {
    calculateLevel,
    awardBadge,
    awardPoints,
    getNextLevelThreshold,
    getProgressToNextLevel,
  };
}
