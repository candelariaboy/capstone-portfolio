/**
 * Admin API Route - Faculty Dashboard
 * GET: Retrieve all student analytics and metrics
 * No authentication required (hardcoded for capstone - add auth in production)
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { StudentAnalytics, DashboardMetrics } from "@/types";

export async function GET(request: NextRequest) {
  try {
    // Safety check - prevent build-time execution
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sort_by") || "points";
    const limit = parseInt(searchParams.get("limit") || "100");

    // Fetch all users with their stats
    const { data: users, error: userError } = await supabaseServer
      .from("users")
      .select(
        `
        id,
        student_id,
        name,
        major,
        points,
        level,
        created_at,
        updated_at
      `
      )
      .order(
        sortBy === "points"
          ? "points"
          : sortBy === "level"
          ? "level"
          : "name",
        { ascending: sortBy === "name" }
      )
      .limit(limit);

    if (userError) {
      throw new Error(`Failed to fetch users: ${userError.message}`);
    }

    // Fetch portfolio counts for each user
    const { data: portfolios, error: portfolioError } = await supabaseServer
      .from("portfolio_items")
      .select("user_id");

    if (portfolioError) {
      throw new Error(`Failed to fetch portfolios: ${portfolioError.message}`);
    }

    // Fetch badge data
    const { data: badges, error: badgeError } = await supabaseServer
      .from("badges")
      .select("user_id");

    if (badgeError) {
      throw new Error(`Failed to fetch badges: ${badgeError.message}`);
    }

    // Fetch activity logs
    const { data: activities, error: activityError } = await supabaseServer
      .from("activity_logs")
      .select("user_id, timestamp")
      .gte("timestamp", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (activityError) {
      throw new Error(`Failed to fetch activities: ${activityError.message}`);
    }

    // Build analytics for each user
    const studentAnalytics: StudentAnalytics[] = users.map((user) => {
      const userPortfolios = portfolios.filter((p) => p.user_id === user.id) || [];
      const userBadges = badges.filter((b) => b.user_id === user.id) || [];
      const userActivities = activities.filter((a) => a.user_id === user.id) || [];

      // Calculate engagement score (0-100)
      const lastActiveTime = userActivities.length > 0
        ? new Date(userActivities[userActivities.length - 1].timestamp).getTime()
        : new Date(user.created_at).getTime();
      const daysSinceActive = (Date.now() - lastActiveTime) / (1000 * 60 * 60 * 24);
      let engagementScore = 100 - Math.min(daysSinceActive * 5, 100); // Decreases by 5% per day of inactivity

      // Boost engagement based on activity
      engagementScore = Math.min(100, engagementScore + Math.min(userPortfolios.length * 10, 30));
      engagementScore = Math.min(100, engagementScore + Math.min(userBadges.length * 5, 20));

      return {
        user_id: user.id,
        student_id: user.student_id,
        name: user.name,
        major: user.major,
        total_points: user.points,
        current_level: user.level,
        portfolio_count: userPortfolios.length,
        badges_earned: userBadges.length,
        recommendations_accepted: 0, // TODO: Count from recommendations table
        last_active: lastActiveTime > 0 ? new Date(lastActiveTime).toISOString() : user.updated_at,
        engagement_score: Math.round(engagementScore),
      };
    });

    // Calculate dashboard metrics
    const totalPoints = users.reduce((sum, u) => sum + u.points, 0);
    const avgPoints = users.length > 0 ? Math.round(totalPoints / users.length) : 0;
    const avgLevel = users.length > 0
      ? Math.round((users.reduce((sum, u) => sum + u.level, 0) / users.length) * 10) / 10
      : 1;
    const avgEngagement = studentAnalytics.length > 0
      ? Math.round(studentAnalytics.reduce((sum, s) => sum + s.engagement_score, 0) / studentAnalytics.length)
      : 0;

    const metrics: DashboardMetrics = {
      total_students: users.length,
      total_portfolios: portfolios.length,
      total_badges_awarded: badges.length,
      avg_points_per_student: avgPoints,
      avg_level: avgLevel,
      avg_engagement: avgEngagement,
      top_skills: [], // TODO: Extract from portfolio items
      most_common_major: getMostCommonMajor(users),
      active_students_this_week: activities.length > 0
        ? new Set(activities.map((a) => a.user_id)).size
        : 0,
    };

    const recentActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    const topPerformers = studentAnalytics.slice(0, 5);

    return NextResponse.json(
      {
        success: true,
        metrics,
        students: studentAnalytics,
        recentActivities,
        topPerformers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        code: "ADMIN_API_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * Export endpoint for CSV data
 */
export async function POST(request: NextRequest) {
  try {
    const { format } = await request.json();

    // Fetch all data needed for export
    const { data: users } = await supabaseServer
      .from("users")
      .select("*")
      .order("points", { ascending: false });

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "No users found" },
        { status: 400 }
      );
    }

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Student ID",
        "Name",
        "Email",
        "Major",
        "Year Level",
        "Points",
        "Level",
        "Created Date",
      ];

      const rows = users.map((user) => [
        user.student_id,
        user.name,
        user.email,
        user.major,
        user.year_level,
        user.points,
        user.level,
        new Date(user.created_at).toLocaleDateString(),
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=student_data.csv",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported format" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function getMostCommonMajor(users: any[]): string {
  const majors = users.map((u) => u.major);
  const majorCounts = majors.reduce((acc, major) => {
    acc[major] = (acc[major] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(majorCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || "Unknown";
}
