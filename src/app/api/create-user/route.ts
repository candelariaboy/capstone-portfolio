import { supabaseServer } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    const missingVars: string[] = [];
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
    
    if (missingVars.length > 0) {
      console.error("❌ Missing environment variables:", missingVars);
      return NextResponse.json(
        { 
          message: "Server configuration error",
          missing_vars: missingVars,
          help: "Please set the following variables in Vercel: " + missingVars.join(", ")
        },
        { status: 503 }
      );
    }

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
        { message: "Missing required fields: student_id, name, email" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.includes("@")) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    let db;
    try {
      db = supabaseServer();
    } catch (error) {
      console.error("❌ Supabase initialization error:", error);
      return NextResponse.json(
        { 
          message: "Database connection failed",
          error: error instanceof Error ? error.message : String(error)
        },
        { status: 503 }
      );
    }

    // Check if student already exists
    let existingUser;
    try {
      const result = await db
        .from("users")
        .select("id")
        .eq("student_id", student_id);

      if (result.error) {
        console.error("❌ Query error:", result.error);
        throw result.error;
      }

      existingUser = result.data;
    } catch (error) {
      console.error("❌ Error checking for existing user:", error);
      return NextResponse.json(
        { message: "Failed to check for existing student" },
        { status: 500 }
      );
    }

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { message: "Student ID already registered" },
        { status: 409 }
      );
    }

    // Create user
    let user;
    try {
      const { data, error } = await db
        .from("users")
        .insert({
          student_id,
          name,
          email,
          major: major || "BSCS",
          year_level: year_level || 1,
          skills: skills || [],
          interests: interests || [],
          points: 50,
          level: 1,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Insert error:", error);
        throw error;
      }

      user = data;
    } catch (error) {
      console.error("❌ User creation error:", error);
      return NextResponse.json(
        { 
          message: "Failed to create user account",
          error: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }

    // Award "New Student" badge (non-critical)
    try {
      await db.from("badges").insert({
        user_id: user.id,
        badge_type: "new_student",
      });
    } catch (error) {
      console.warn("⚠️ Badge insertion warning:", error);
    }

    // Log the activity (non-critical)
    try {
      await db.from("activity_logs").insert({
        user_id: user.id,
        action_type: "account_created",
        metadata: {
          major,
          year_level,
          skills_count: skills?.length || 0,
        },
      });
    } catch (error) {
      console.warn("⚠️ Activity log warning:", error);
    }

    console.log("✅ Account created successfully:", user.id);
    return NextResponse.json({
      success: true,
      user_id: user.id,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("❌ Fatal error in create-user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
