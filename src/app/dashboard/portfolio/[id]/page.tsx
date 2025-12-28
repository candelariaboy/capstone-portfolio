"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { PortfolioItem } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export default function PortfolioDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const { data } = await supabase
          .from("portfolio_items")
          .select("*")
          .eq("id", params.id)
          .single();

        if (data) {
          setItem(data);
        } else {
          toast.error("Portfolio item not found");
        }
      } catch (error) {
        console.error("Error loading portfolio item:", error);
        toast.error("Failed to load portfolio item");
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </motion.div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-white">Not Found</h1>
        <a href="/dashboard/portfolio" className="text-blue-400 hover:text-blue-300">
          ← Back to Portfolio
        </a>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <a href="/dashboard/portfolio" className="mb-4 inline-block text-blue-400 hover:text-blue-300">
          ← Back to Portfolio
        </a>
        <h1 className="text-3xl font-bold text-white">{item.title}</h1>
      </div>

      <Card className="border-slate-700 bg-slate-800 p-6">
        <div className="space-y-6">
          {/* Description */}
          {item.description && (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-white">Description</h2>
              <p className="text-slate-300">{item.description}</p>
            </div>
          )}

          {/* Technologies */}
          {item.technologies && item.technologies.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {item.technologies.map((tech, idx) => (
                  <Badge key={idx} className="bg-blue-600">
                    {typeof tech === "object" && "name" in tech
                      ? tech.name
                      : String(tech)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Skills */}
          {item.skills_extracted && item.skills_extracted.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">
                AI-Extracted Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {item.skills_extracted.map((skill, idx) => (
                  <Badge key={idx} className="bg-green-600">
                    {typeof skill === "object" && "name" in skill
                      ? skill.name
                      : String(skill)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* File Info */}
          <div className="border-t border-slate-700 pt-4">
            <h2 className="mb-2 text-sm font-medium text-slate-400">File Information</h2>
            <p className="text-sm text-slate-300">
              {item.file_size && `Size: ${(item.file_size / 1024 / 1024).toFixed(2)} MB`}
            </p>
            <p className="text-sm text-slate-300">
              Status: <span className="text-green-400">{item.status}</span>
            </p>
            {item.file_url && (
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Download File →
              </a>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
