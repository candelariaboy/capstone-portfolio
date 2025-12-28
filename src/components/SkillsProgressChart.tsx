"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface SkillData {
  skill: string;
  proficiency: number;
  projects: number;
}

interface SkillsProgressChartProps {
  skills: (string | { name: string })[];
  portfolioCount: number;
}

export function SkillsProgressChart({ skills, portfolioCount }: SkillsProgressChartProps) {
  // Generate chart data from skills
  const chartData: SkillData[] = skills.slice(0, 6).map((skill, index) => {
    const skillName = typeof skill === 'string' ? skill : skill.name;
    return {
      skill: skillName.split(" ")[0], // Get first word for shorter labels
      proficiency: Math.min(100, (index + 1) * (portfolioCount > 0 ? Math.floor(100 / skills.length) : 20)),
      projects: Math.max(1, index + 1),
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-bold text-white">Skills Progress</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="skill" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend />
              <Bar dataKey="proficiency" fill="#3b82f6" name="Proficiency %" radius={[8, 8, 0, 0]} />
              <Bar dataKey="projects" fill="#8b5cf6" name="Projects" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-slate-400">Upload your first portfolio to see skills progress</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
