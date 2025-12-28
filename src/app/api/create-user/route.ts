import { supabaseServer } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      student_id,
      name,
      email,
      major,
      year_level,
      skills,
      interests,
    } = body;

    // Validate required fields
    if (!student_id || !name || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if student already exists
    const { data: existingUser } = await supabaseServer
      .from("users")
      .select("id")
      .eq("student_id", student_id)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: "Student ID already registered" },
        { status: 409 }
      );
    }

    // Create user
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .insert({
        student_id,
        name,
        email,
        major,
        year_level,
        skills: skills || [],
        interests: interests || [],
        points: 50, // Initial points
        level: 1,
      })
      .select()
      .single();

    if (userError) {
      console.error("User creation error:", userError);
      return NextResponse.json(
        { message: "Failed to create user" },
        { status: 500 }
      );
    }

    // Award "New Student" badge
    await supabaseServer.from("badges").insert({
      user_id: user.id,
      badge_type: "new_student",
    });

    // Log the activity
    await supabaseServer.from("activity_logs").insert({
      user_id: user.id,
      action_type: "account_created",
      metadata: {
        major,
        year_level,
        skills_count: skills?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      user_id: user.id,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
