/**
 * Supabase-generated types for database tables
 * These correspond exactly to the PostgreSQL schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          student_id: string;
          name: string;
          email: string;
          major: "BSCS" | "BSIT";
          year_level: number;
          skills: Json[];
          interests: string[];
          points: number;
          level: number;
          profile_picture: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          name: string;
          email: string;
          major: "BSCS" | "BSIT";
          year_level: number;
          skills?: Json[];
          interests?: string[];
          points?: number;
          level?: number;
          profile_picture?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          name?: string;
          email?: string;
          major?: "BSCS" | "BSIT";
          year_level?: number;
          skills?: Json[];
          interests?: string[];
          points?: number;
          level?: number;
          profile_picture?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      portfolio_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          technologies: Json[];
          skills_extracted: Json[];
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          file_type: string | null;
          status: "draft" | "completed" | "submitted";
          views: number;
          likes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          technologies?: Json[];
          skills_extracted?: Json[];
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          status?: "draft" | "completed" | "submitted";
          views?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          technologies?: Json[];
          skills_extracted?: Json[];
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          status?: "draft" | "completed" | "submitted";
          views?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          name: string;
          description: string;
          icon_url: string | null;
          earned_at: string;
          progress: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
          name: string;
          description: string;
          icon_url?: string | null;
          earned_at?: string;
          progress?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_type?: string;
          name?: string;
          description?: string;
          icon_url?: string | null;
          earned_at?: string;
          progress?: number | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          points_awarded: number;
          action_type: string;
          completed_at: string;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          points_awarded: number;
          action_type: string;
          completed_at?: string;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          points_awarded?: number;
          action_type?: string;
          completed_at?: string;
          metadata?: Json | null;
        };
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          suggestion_type: "skill" | "project" | "course";
          content: Json;
          ai_model_used: string;
          confidence: number;
          accepted: boolean;
          reasoning: string | null;
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          suggestion_type: "skill" | "project" | "course";
          content: Json;
          ai_model_used: string;
          confidence?: number;
          accepted?: boolean;
          reasoning?: string | null;
          created_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          suggestion_type?: "skill" | "project" | "course";
          content?: Json;
          ai_model_used?: string;
          confidence?: number;
          accepted?: boolean;
          reasoning?: string | null;
          created_at?: string;
          accepted_at?: string | null;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action_type: string;
          metadata: Json;
          points_gained: number | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_type: string;
          metadata: Json;
          points_gained?: number | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_type?: string;
          metadata?: Json;
          points_gained?: number | null;
          timestamp?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
