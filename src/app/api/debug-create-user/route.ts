import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("=== CREATE USER DEBUG ===");
    console.log("Received request");
    
    const body = await request.json();
    console.log("Request body:", body);

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
      console.log("Missing required fields:", { student_id, name, email });
      return NextResponse.json(
        { message: "Missing required fields: student_id, name, email required" },
        { status: 400 }
      );
    }

    // Import supabase
    console.log("Importing supabase...");
    const { supabaseServer } = await import("@/lib/supabase");
    
    console.log("Initializing db...");
    const db = supabaseServer();
    console.log("DB initialized successfully");

    // Check if student already exists
    console.log("Checking for existing student:", student_id);
    const { data: existingUser, error: checkError } = await db
      .from("users")
      .select("id")
      .eq("student_id", student_id);

    if (checkError) {
      console.error("Check error:", checkError);
      throw checkError;
    }

    console.log("Existing user check result:", existingUser);

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { message: "Student ID already registered" },
        { status: 409 }
      );
    }

    // Create user
    console.log("Creating user with data:", {
      student_id,
      name,
      email,
      major,
      year_level,
      skills,
      interests,
    });

    const { data: user, error: userError } = await db
      .from("users")
      .insert({
        student_id,
        name,
        email,
        major,
        year_level,
        skills: skills || [],
        interests: interests || [],
        points: 50,
        level: 1,
      })
      .select()
      .single();

    if (userError) {
      console.error("User creation error:", userError);
      throw userError;
    }

    console.log("User created:", user);

    // Award "New Student" badge
    console.log("Awarding badge...");
    const { error: badgeError } = await db.from("badges").insert({
      user_id: user.id,
      badge_type: "new_student",
    });

    if (badgeError) {
      console.error("Badge error:", badgeError);
      // Don't throw - badge is optional
    }

    // Log the activity
    console.log("Logging activity...");
    const { error: logError } = await db.from("activity_logs").insert({
      user_id: user.id,
      action_type: "account_created",
      metadata: {
        major,
        year_level,
        skills_count: skills?.length || 0,
      },
    });

    if (logError) {
      console.error("Log error:", logError);
      // Don't throw - logging is optional
    }

    console.log("Account creation successful");

    return NextResponse.json({
      success: true,
      user_id: user.id,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("FATAL ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error message:", errorMessage);
    console.error("Error stack:", error instanceof Error ? error.stack : "N/A");

    return NextResponse.json(
      {
        message: "Internal server error",
        error: errorMessage,
        type: error instanceof Error ? error.constructor.name : "Unknown",
      },
      { status: 500 }
    );
  }
}
