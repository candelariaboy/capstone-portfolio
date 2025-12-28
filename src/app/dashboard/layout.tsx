"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/types";
import toast from "react-hot-toast";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          toast.error("User not found");
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("Error loading user:", error);
        toast.error("Failed to load user");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">User Not Found</h1>
          <p className="mb-6 text-slate-300">Please create an account first</p>
          <a href="/" className="inline-block rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-white">PortfolioAI</span>
          </motion.div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-slate-300 hover:text-white text-sm">
                Dashboard
              </a>
              <a href="/dashboard/portfolio" className="text-slate-300 hover:text-white text-sm">
                Portfolio
              </a>
              <a href="/dashboard/recommendations" className="text-slate-300 hover:text-white text-sm">
                Recommendations
              </a>
              <a href="/dashboard/achievements" className="text-slate-300 hover:text-white text-sm">
                Achievements
              </a>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700">
              <span className="text-sm text-slate-300">Hello, {user.name.split(" ")[0]}</span>
              <span className="text-lg">👤</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-900"><div className="text-white">Loading...</div></div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
