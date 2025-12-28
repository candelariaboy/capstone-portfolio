"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountCreationForm } from "@/components/forms/AccountCreationForm";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-white">PortfolioAI</span>
          </motion.div>
          <div className="hidden gap-4 md:flex">
            <a href="#features" className="text-sm text-slate-300 hover:text-white">
              Features
            </a>
            <a href="#about" className="text-sm text-slate-300 hover:text-white">
              About
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto grid gap-12 px-4 py-20 lg:grid-cols-2 lg:gap-12 lg:py-32">
        {/* Left side - Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col justify-center"
        >
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white lg:text-5xl">
            AI-Enhanced Portfolio Platform for Students
          </h1>
          <p className="mb-4 text-lg text-slate-300">
            Showcase your projects, get personalized learning recommendations, and gamify your growth with AI-powered insights.
          </p>
          <div className="mb-8 space-y-2 text-slate-300">
            <p className="flex items-center gap-2">
              <span className="text-xl">✨</span> AI-Powered Skill Extraction
            </p>
            <p className="flex items-center gap-2">
              <span className="text-xl">🎮</span> Gamification & Badges
            </p>
            <p className="flex items-center gap-2">
              <span className="text-xl">📚</span> Personalized Learning Paths
            </p>
            <p className="flex items-center gap-2">
              <span className="text-xl">📈</span> Progress Tracking & Analytics
            </p>
          </div>
        </motion.div>

        {/* Right side - Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-xl"></div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 backdrop-blur">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Create Your Profile
            </h2>
            <AccountCreationForm />
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section id="features" className="border-t border-slate-700 bg-slate-800/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            Platform Features
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: "📤",
                title: "Portfolio Upload",
                description:
                  "Upload up to 200MB of projects and documents for AI analysis",
              },
              {
                icon: "🤖",
                title: "AI Recommendations",
                description:
                  "Get personalized learning suggestions based on your skills",
              },
              {
                icon: "🏆",
                title: "Gamification",
                description:
                  "Earn badges, points, and level up as you grow your skills",
              },
              {
                icon: "📊",
                title: "Progress Analytics",
                description: "Track your learning journey with detailed insights",
              },
              {
                icon: "👥",
                title: "Leaderboard",
                description: "Compare your progress with peers anonymously",
              },
              {
                icon: "⚡",
                title: "Real-Time Updates",
                description: "See your progress and recommendations instantly",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-slate-700 bg-slate-800 p-6"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2025 PortfolioAI. Built with Next.js + AI Technology.</p>
        </div>
      </footer>
    </div>
  );
}
