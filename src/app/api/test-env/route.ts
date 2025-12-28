import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      env_vars: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
        HF_TOKEN: process.env.HF_TOKEN ? "✅ Set" : "❌ Missing",
        UPLOAD_MAX_FILE_SIZE: process.env.UPLOAD_MAX_FILE_SIZE || "❌ Missing",
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "❌ Missing",
        NODE_ENV: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
