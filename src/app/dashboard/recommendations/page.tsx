"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Recommendation } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export default function RecommendationsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from("recommendations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setRecommendations(data || []);
    } catch (error) {
      console.error("Error loading recommendations:", error);
      toast.error("Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRecommendation = async (recId: string) => {
    try {
      // Mark as accepted
      await supabase
        .from("recommendations")
        .update({ accepted: true })
        .eq("id", recId);

      // Award 50 points
      if (userId) {
        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (user) {
          await supabase
            .from("users")
            .update({ points: user.points + 50 })
            .eq("id", userId);

          // Award badge if applicable
          await supabase.from("badges").insert({
            user_id: userId,
            badge_type: "ai_follower",
          });
        }
      }

      toast.success("✅ Recommendation accepted! +50 points");
      loadRecommendations();
    } catch (error) {
      console.error("Error accepting recommendation:", error);
      toast.error("Failed to accept recommendation");
    }
  };

  const sampleRecommendations: Recommendation[] = [
    {
      id: "1",
      user_id: userId || "",
      suggestion_type: "skill",
      content: {
        title: "Learn Next.js Advanced Patterns",
        description:
          "Based on your React experience, master Next.js App Router, server actions, and streaming for better performance.",
        reason:
          "Complements your existing React knowledge and is highly in-demand",
      },
      ai_model_used: "huggingface-phi-3",
      accepted: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      user_id: userId || "",
      suggestion_type: "course",
      content: {
        title: "AWS for Developers",
        description:
          "Learn cloud deployment, databases, and scalability on AWS platform.",
        reason: "Essential for full-stack developers in 2025",
      },
      ai_model_used: "huggingface-phi-3",
      accepted: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      user_id: userId || "",
      suggestion_type: "project",
      content: {
        title: "Build a Real-time Chat Application",
        description:
          "Create a WebSocket-based chat app using Next.js, Supabase, and Tailwind CSS to practice real-time features.",
        reason: "Practical project to demonstrate advanced web skills",
      },
      ai_model_used: "huggingface-phi-3",
      accepted: false,
      created_at: new Date().toISOString(),
    },
  ];

  const displayRecommendations =
    recommendations.length > 0 ? recommendations : sampleRecommendations;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">
          AI-Powered Learning Paths
        </h1>
        <p className="text-slate-400">
          Personalized recommendations based on your skills and interests
        </p>
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
      ) : displayRecommendations.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-600 p-12 text-center">
          <p className="mb-4 text-lg text-slate-400">
            No recommendations yet
          </p>
          <p className="text-sm text-slate-500">
            Upload your portfolio to get personalized AI recommendations!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {displayRecommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-slate-700 bg-slate-800 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {rec.content?.title}
                      </h3>
                      <Badge
                        className={
                          rec.suggestion_type === "skill"
                            ? "bg-blue-600"
                            : rec.suggestion_type === "course"
                            ? "bg-purple-600"
                            : "bg-green-600"
                        }
                      >
                        {rec.suggestion_type === "skill"
                          ? "📚 Skill"
                          : rec.suggestion_type === "course"
                          ? "🎓 Course"
                          : "💡 Project"}
                      </Badge>
                    </div>
                    <p className="text-slate-300">
                      {rec.content?.description}
                    </p>
                    {rec.content?.reason && (
                      <p className="mt-3 text-xs text-slate-400">
                        💡 {rec.content.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  {rec.accepted ? (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <span>✓ You accepted this recommendation</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcceptRecommendation(rec.id)}
                      className="w-full rounded-md bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700"
                    >
                      Accept Recommendation (+50 pts)
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Learning Path Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border border-slate-700 bg-slate-800/50 p-6"
      >
        <h2 className="mb-3 text-lg font-semibold text-white">
          How AI Recommendations Work
        </h2>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2">
            <span>1️⃣</span>
            <span>
              We analyze your portfolio items and extracted skills
            </span>
          </li>
          <li className="flex gap-2">
            <span>2️⃣</span>
            <span>
              Our AI suggests relevant skills, courses, and projects
            </span>
          </li>
          <li className="flex gap-2">
            <span>3️⃣</span>
            <span>
              Accept recommendations to earn points and track your progress
            </span>
          </li>
          <li className="flex gap-2">
            <span>4️⃣</span>
            <span>
              Share your completed work to unlock new recommendations
            </span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
