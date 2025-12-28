/**
 * AdminPanel Component - Faculty Dashboard
 * Shows all students, analytics, and CSV export
 * Access: /admin (hardcoded access - should be behind authentication in production)
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentAnalytics, DashboardMetrics } from "@/types";

export default function AdminPanel() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"points" | "level" | "name">("points");

  useEffect(() => {
    loadAdminData();
  }, [sortBy]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin?sort_by=${sortBy}`);

      if (!response.ok) {
        throw new Error("Failed to load admin data");
      }

      const data = await response.json();
      setMetrics(data.metrics);
      setStudents(data.students);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/admin/export?format=csv");

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `student-analytics-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="text-center text-slate-400">Loading admin data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="text-center text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Faculty Dashboard</h1>
          <p className="text-slate-400">Monitor student progress and engagement</p>
        </motion.div>

        {/* Metrics Cards */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-2">Total Students</div>
              <div className="text-3xl font-bold text-white">
                {metrics.total_students}
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-2">Total Portfolios</div>
              <div className="text-3xl font-bold text-white">
                {metrics.total_portfolios}
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-2">Badges Awarded</div>
              <div className="text-3xl font-bold text-white">
                {metrics.total_badges_awarded}
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-2">Avg Engagement</div>
              <div className="text-3xl font-bold text-emerald-400">
                {Math.round(metrics.avg_engagement)}%
              </div>
            </Card>
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-8"
        >
          <div className="flex gap-2">
            <Button
              onClick={() => setSortBy("points")}
              variant={sortBy === "points" ? "default" : "outline"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sort by Points
            </Button>
            <Button
              onClick={() => setSortBy("level")}
              variant={sortBy === "level" ? "default" : "outline"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sort by Level
            </Button>
            <Button
              onClick={() => setSortBy("name")}
              variant={sortBy === "name" ? "default" : "outline"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sort by Name
            </Button>
          </div>

          <Button
            onClick={handleExportCSV}
            className="ml-auto bg-emerald-600 hover:bg-emerald-700"
          >
            📊 Export CSV
          </Button>
        </motion.div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-200">Student ID</TableHead>
                    <TableHead className="text-slate-200">Name</TableHead>
                    <TableHead className="text-slate-200">Major</TableHead>
                    <TableHead className="text-slate-200 text-right">Points</TableHead>
                    <TableHead className="text-slate-200 text-right">Level</TableHead>
                    <TableHead className="text-slate-200 text-right">Portfolios</TableHead>
                    <TableHead className="text-slate-200 text-right">Badges</TableHead>
                    <TableHead className="text-slate-200 text-right">Engagement</TableHead>
                    <TableHead className="text-slate-200 text-right">Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <motion.tr
                      key={student.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="hover:bg-slate-700/50"
                    >
                      <TableCell className="text-slate-300 font-mono">
                        #{student.student_id}
                      </TableCell>
                      <TableCell className="text-slate-200 font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-slate-400">{student.major}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-yellow-400 font-semibold">
                          {student.total_points}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-blue-400 font-semibold">
                          {student.current_level}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-slate-400">
                        {student.portfolio_count}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-xs font-semibold">
                          {student.badges_earned}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-semibold ${
                            student.engagement_score > 75
                              ? "text-emerald-400"
                              : student.engagement_score > 50
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {Math.round(student.engagement_score)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-slate-500 text-sm">
                        {new Date(student.last_active).toLocaleDateString()}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
