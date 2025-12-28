"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { User, Badge, Recommendation, PortfolioItem } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import { BADGE_INFO } from "@/hooks/useGamification";
import { SkillsProgressChart } from "@/components/SkillsProgressChart";
import { useRealtimePoints } from "@/hooks/useRealtimeUpdates";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) return;

      try {
        // Load user
        const { data: userData } = await supabase()
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (userData) {
          setUser(userData);
        }

        // Load badges
        const { data: badgesData } = await supabase()
          .from("badges")
          .select("*")
          .eq("user_id", userId);

        if (badgesData) {
          setBadges(badgesData);
        }

        // Load recommendations
        const { data: recsData } = await supabase()
          .from("recommendations")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (recsData) {
          setRecommendations(recsData);
        }

        // Load portfolio count
        const { count } = await supabase()
          .from("portfolio_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        setPortfolioCount(count || 0);
      } catch (error) {
        console.error("Error loading dashboard:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [userId]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </motion.div>
      </div>
    );
  }

  const progressToNextLevel =
    ((user.points - (user.level === 1 ? 0 : user.level === 2 ? 100 : user.level === 3 ? 250 : 500)) /
      (user.level === 1 ? 100 : user.level === 2 ? 150 : user.level === 3 ? 250 : 500)) *
    100;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white"
      >
        <h1 className="mb-2 text-3xl font-bold">Welcome back, {user.name}! 👋</h1>
        <p className="text-blue-100">
          {user.major} - Year {user.year_level} | Student ID: {user.student_id}
        </p>
      </motion.div>

      {/* Gamification Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-3"
      >
        {/* Points & Level Card */}
        <Card className="border-slate-700 bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Level & Points</h3>
            <span className="text-3xl">⭐</span>
          </div>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-blue-400">{user.level}</span>
            <span className="text-sm text-slate-400">/ 5</span>
          </div>
          <p className="mb-3 text-sm text-slate-300">
            {user.points} / {user.level === 1 ? 100 : user.level === 2 ? 250 : user.level === 3 ? 500 : 1000} points
          </p>
          <Progress
            value={Math.min(progressToNextLevel, 100)}
            className="h-2 bg-slate-700"
          />
        </Card>

        {/* Portfolio Card */}
        <Card className="border-slate-700 bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Portfolio</h3>
            <span className="text-3xl">📂</span>
          </div>
          <p className="mb-2 text-2xl font-bold text-green-400">{portfolioCount}</p>
          <p className="text-sm text-slate-400">projects uploaded</p>
          <a
            href="/dashboard/portfolio"
            className="mt-4 inline-block rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
          >
            View Portfolio →
          </a>
        </Card>

        {/* Badges Card */}
        <Card className="border-slate-700 bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Badges</h3>
            <span className="text-3xl">🏆</span>
          </div>
          <p className="mb-2 text-2xl font-bold text-yellow-400">{badges.length}</p>
          <p className="text-sm text-slate-400">achievements earned</p>
          <a
            href="/dashboard/achievements"
            className="mt-4 inline-block rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700"
          >
            View Badges →
          </a>
        </Card>
      </motion.div>

      {/* Recent Badges */}
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-white">Recent Badges</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {badges.slice(0, 4).map((badge, index) => {
              const badgeInfo = BADGE_INFO[badge.badge_type as keyof typeof BADGE_INFO];
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-slate-700 bg-slate-800 p-4 text-center">
                    <div className="mb-2 text-4xl">{badgeInfo?.icon}</div>
                    <h4 className="font-semibold text-white">{badgeInfo?.name}</h4>
                    <p className="text-xs text-slate-400">{badgeInfo?.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-white">AI Recommendations</h2>
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-slate-700 bg-slate-800 p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {rec.content?.title}
                        </h3>
                        <UIBadge className="bg-purple-600">
                          {rec.suggestion_type}
                        </UIBadge>
                      </div>
                      <p className="text-slate-300">{rec.content?.description}</p>
                    </div>
                  </div>
                  <button className="mt-3 rounded bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">
                    Learn More
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Skills Progress Chart */}
      {user && user.skills && user.skills.length > 0 && (
        <SkillsProgressChart 
          skills={user.skills}
          portfolioCount={portfolioCount}
        />
      )}

      {/* Empty States */}
      {badges.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border-2 border-dashed border-slate-600 p-12 text-center"
        >
          <p className="text-lg text-slate-400">Start earning badges by uploading your portfolio!</p>
          <a
            href="/dashboard/portfolio"
            className="mt-4 inline-block rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Upload Portfolio
          </a>
        </motion.div>
      )}
    </div>
  );
}
