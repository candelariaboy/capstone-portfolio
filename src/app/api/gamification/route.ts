import { supabaseServer } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    // Get user data
    const { data: user } = await supabaseServer
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Get badges
    const { data: badges } = await supabaseServer
      .from("badges")
      .select("*")
      .eq("user_id", userId);

    // Get achievements
    const { data: achievements } = await supabaseServer
      .from("achievements")
      .select("*")
      .eq("user_id", userId);

    return NextResponse.json({
      user: {
        points: user.points,
        level: user.level,
      },
      badges: badges || [],
      achievements: achievements || [],
    });
  } catch (error) {
    console.error("Error fetching gamification data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, points, badgeType } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current user
    const { data: user } = await supabaseServer
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Add points if specified
    let newPoints = user.points;
    if (points) {
      newPoints = user.points + points;
    }

    // Calculate new level
    let newLevel = user.level;
    if (newPoints >= 1000) newLevel = 5;
    else if (newPoints >= 500) newLevel = 4;
    else if (newPoints >= 250) newLevel = 3;
    else if (newPoints >= 100) newLevel = 2;
    else newLevel = 1;

    // Update user
    await supabaseServer
      .from("users")
      .update({
        points: newPoints,
        level: newLevel,
      })
      .eq("id", userId);

    // Award badge if specified
    if (badgeType) {
      // Check if badge already exists
      const { data: existingBadge } = await supabaseServer
        .from("badges")
        .select("id")
        .eq("user_id", userId)
        .eq("badge_type", badgeType)
        .single();

      if (!existingBadge) {
        await supabaseServer.from("badges").insert({
          user_id: userId,
          badge_type: badgeType,
        });
      }
    }

    // Log activity
    await supabaseServer.from("activity_logs").insert({
      user_id: userId,
      action_type: action,
      metadata: {
        points_awarded: points || 0,
        new_level: newLevel,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        points: newPoints,
        level: newLevel,
      },
    });
  } catch (error) {
    console.error("Error updating gamification:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
