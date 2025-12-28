"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Badge, User } from "@/lib/types";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { BADGE_INFO } from "@/hooks/useGamification";
import { useRealtimeUsers } from "@/hooks/useRealtimeUpdates";

export default function AchievementsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use realtime leaderboard hook for live updates
  const { users: realtimeLeaderboard, isLoading: leaderboardLoading } = useRealtimeUsers();

  useEffect(() => {
    const loadUserBadges = async () => {
      try {
        // Load user badges
        if (userId) {
          const { data: badgesData } = await supabase()
            .from("badges")
            .select("*")
            .eq("user_id", userId)
            .order("earned_at", { ascending: false });

          setUserBadges(badgesData || []);
        }
      } catch (error) {
        console.error("Error loading achievements data:", error);
        toast.error("Failed to load achievements");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserBadges();
  }, [userId]);

  const allBadges = Object.entries(BADGE_INFO);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">Achievements</h1>
        <p className="text-slate-400">View your badges and see how you rank on the leaderboard</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Your Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="mb-4 text-2xl font-bold text-white">Your Badges</h2>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {allBadges.map(([badgeType, badgeInfo], index) => {
                const earned = userBadges.some(
                  (b) => b.badge_type === badgeType
                );
                return (
                  <motion.div
                    key={badgeType}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`p-6 text-center transition-all ${
                        earned
                          ? "border-yellow-500 bg-slate-800"
                          : "border-slate-700 bg-slate-800 opacity-50"
                      }`}
                    >
                      <div className={`mb-2 text-4xl ${earned ? "" : "grayscale"}`}>
                        {badgeInfo.icon}
                      </div>
                      <h4 className="font-semibold text-white">
                        {badgeInfo.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {badgeInfo.description}
                      </p>
                      {earned && (
                        <p className="mt-2 text-xs font-bold text-yellow-400">
                          ✓ Earned
                        </p>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-4 text-2xl font-bold text-white">Leaderboard</h2>
            <Card className="border-slate-700 bg-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-700 bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                        Major
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                        Level
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-white">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {realtimeLeaderboard.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={
                          userId === user.id
                            ? "bg-blue-900/20"
                            : "hover:bg-slate-700/50"
                        }
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-white">
                          {index + 1 === 1
                            ? "🥇"
                            : index + 1 === 2
                            ? "🥈"
                            : index + 1 === 3
                            ? "🥉"
                            : index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {user.student_id.slice(0, 3)}****
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {user.major}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          ⭐ {user.level}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-yellow-400">
                          {user.points}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
