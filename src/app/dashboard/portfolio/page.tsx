"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { PortfolioItem, User } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export default function PortfolioPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadPortfolio();
  }, [userId]);

  const loadPortfolio = async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setPortfolio(data || []);
    } catch (error) {
      console.error("Error loading portfolio:", error);
      toast.error("Failed to load portfolio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!file || !title) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check file size (200MB limit)
    if (file.size > 200 * 1024 * 1024) {
      toast.error("File size exceeds 200MB limit");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      const timestamp = Date.now();
      const filePath = `${userId}/${timestamp}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolios")
        .upload(filePath, file);

      if (uploadError) {
        toast.error("Failed to upload file");
        return;
      }

      setUploadProgress(50);

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolios").getPublicUrl(filePath);

      // Create portfolio item in database
      const { data: portfolioItem, error: dbError } = await supabase
        .from("portfolio_items")
        .insert({
          user_id: userId,
          title,
          description,
          file_url: publicUrl,
          file_size: file.size,
          technologies: [],
          skills_extracted: [],
          status: "active",
        })
        .select()
        .single();

      if (dbError) {
        toast.error("Failed to save portfolio item");
        return;
      }

      setUploadProgress(75);

      // Trigger NLP analysis (if applicable)
      if (file.type.includes("text") || file.type.includes("pdf")) {
        try {
          await fetch("/api/analyze-portfolio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              portfolio_item_id: portfolioItem.id,
              file_url: publicUrl,
              title,
              description,
              user_id: userId,
            }),
          });
        } catch (error) {
          console.error("Error analyzing portfolio:", error);
        }
      }

      setUploadProgress(100);
      toast.success("✨ Portfolio item uploaded successfully!");

      // Award points and badges
      try {
        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (user) {
          // Award 25 points
          await supabase
            .from("users")
            .update({ points: user.points + 25 })
            .eq("id", userId);

          // Check if 3 items milestone reached
          if (portfolio.length + 1 === 3) {
            await supabase.from("badges").insert({
              user_id: userId,
              badge_type: "builder_ii",
            });
            toast.success('🏢 Earned "Builder II" badge!');
          } else if (portfolio.length === 0) {
            await supabase.from("badges").insert({
              user_id: userId,
              badge_type: "builder_i",
            });
            toast.success('🏗️ Earned "Builder I" badge!');
          }
        }
      } catch (error) {
        console.error("Error updating gamification:", error);
      }

      // Reset form and reload
      e.currentTarget.reset();
      setTimeout(() => {
        loadPortfolio();
      }, 500);
    } catch (error) {
      console.error("Error uploading portfolio:", error);
      toast.error("An error occurred during upload");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">My Portfolio</h1>
        <p className="text-slate-400">Showcase your projects and get AI-powered skill recommendations</p>
      </div>

      {/* Upload Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Upload Project</h2>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., E-commerce Platform"
                  className="w-full rounded-md border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 disabled:opacity-50"
                  disabled={isUploading}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  File (Max 200MB) *
                </label>
                <input
                  type="file"
                  name="file"
                  className="w-full rounded-md border border-slate-600 bg-slate-700 px-4 py-2 text-slate-400 disabled:opacity-50"
                  disabled={isUploading}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Describe your project, technologies used, and your role..."
                className="w-full rounded-md border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 disabled:opacity-50"
                rows={4}
                disabled={isUploading}
              />
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-blue-500"
                  />
                </div>
                <p className="text-xs text-slate-400">{uploadProgress}% uploading...</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload Project"}
            </button>
          </form>
        </Card>
      </motion.div>

      {/* Portfolio Grid */}
      {isLoading ? (
        <div className="flex justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </motion.div>
        </div>
      ) : portfolio.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-600 p-12 text-center">
          <p className="mb-4 text-lg text-slate-400">No portfolio items yet</p>
          <p className="text-sm text-slate-500">Upload your first project to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <a href={`/dashboard/portfolio/${item.id}`}>
                <Card className="border-slate-700 bg-slate-800 p-6 hover:border-blue-500 transition-all cursor-pointer">
                  <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mb-4 line-clamp-2 text-sm text-slate-300">{item.description}</p>

                  {item.skills_extracted && item.skills_extracted.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {item.skills_extracted.slice(0, 3).map((skill, idx) => (
                        <Badge
                          key={idx}
                          className="bg-green-600 text-xs"
                        >
                          {typeof skill === "object" && "name" in skill
                            ? skill.name
                            : String(skill)}
                        </Badge>
                      ))}
                      {item.skills_extracted.length > 3 && (
                        <Badge className="bg-slate-600 text-xs">
                          +{item.skills_extracted.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-400">
                    {item.file_size && `${(item.file_size / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
