/**
 * Complete TypeScript interfaces for Capstone AI Portfolio System
 * All types needed for type-safe operations across the application
 */

// ==================== USER TYPES ====================

export interface User {
  id: string; // UUID
  student_id: string; // Unique student identifier
  name: string;
  email: string;
  major: "BSCS" | "BSIT";
  year_level: 1 | 2 | 3 | 4;
  skills: (string | Skill)[];
  interests: string[];
  points: number;
  level: number;
  profile_picture?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  name: string;
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  proficiency?: number; // 0-100
  endorsements?: number;
}

// ==================== PORTFOLIO TYPES ====================

export interface PortfolioItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  technologies: (string | Technology)[];
  skills_extracted: (string | ExtractedSkill)[];
  file_url?: string;
  file_name?: string;
  file_size?: number; // bytes
  file_type?: string; // PDF, Code, Document, etc.
  status: "draft" | "completed" | "submitted";
  views?: number;
  likes?: number;
  created_at: string;
  updated_at: string;
}

export interface Technology {
  name: string;
  category?: string;
  confidence?: number;
}

export interface ExtractedSkill {
  name: string;
  confidence: number; // 0-1
  category?: string; // Frontend, Backend, Database, DevOps, etc.
  mentions?: number;
}

// ==================== GAMIFICATION TYPES ====================

export interface Badge {
  id: string;
  user_id: string;
  badge_type:
    | "new_student"
    | "portfolio_builder"
    | "ai_follower"
    | "junior_developer"
    | "skill_master"
    | "pathfinder"
    | "speedrunner";
  name: string;
  description: string;
  icon_url?: string;
  earned_at: string;
  progress?: number; // 0-100 for multi-step badges
}

export interface Achievement {
  id: string;
  user_id: string;
  name: string;
  description: string;
  points_awarded: number;
  action_type:
    | "upload_project"
    | "accept_recommendation"
    | "complete_learning_path"
    | "skill_endorsement"
    | "portfolio_review";
  completed_at: string;
  metadata?: Record<string, any>;
}

export interface GamificationState {
  totalPoints: number;
  currentLevel: number;
  badges: Badge[];
  achievements: Achievement[];
  recentActions: ActivityLog[];
  pointsThisMonth: number;
  streakDays: number;
}

// ==================== RECOMMENDATION TYPES ====================

export interface Recommendation {
  id: string;
  user_id: string;
  suggestion_type: "skill" | "project" | "course";
  content: RecommendationContent;
  ai_model_used: string; // "langchain" | "distilbert" | "phi-3"
  confidence: number;
  accepted: boolean;
  reasoning?: string;
  created_at: string;
  accepted_at?: string;
}

export interface RecommendationContent {
  title: string;
  description: string;
  reason: string;
  resources?: string[];
  estimatedTime?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  relatedSkills?: string[];
}

export interface LearningPath {
  id: string;
  user_id: string;
  title: string;
  description: string;
  recommendations: Recommendation[];
  progress: number; // 0-100
  status: "active" | "completed" | "paused";
  created_at: string;
  completed_at?: string;
}

// ==================== ACTIVITY LOG TYPES ====================

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type:
    | "portfolio_upload"
    | "recommendation_accepted"
    | "badge_earned"
    | "level_up"
    | "profile_update"
    | "skill_added"
    | "project_submitted";
  metadata: {
    portfolio_id?: string;
    recommendation_id?: string;
    badge_id?: string;
    previous_level?: number;
    new_level?: number;
    [key: string]: any;
  };
  points_gained?: number;
  timestamp: string;
}

// ==================== API REQUEST/RESPONSE TYPES ====================

export interface CreateUserRequest {
  name: string;
  student_id: string;
  email: string;
  major: "BSCS" | "BSIT";
  year_level: 1 | 2 | 3 | 4;
  skills: string[];
  interests: string[];
}

export interface CreateUserResponse {
  success: boolean;
  userId: string;
  student_id: string;
  message: string;
}

export interface UploadFileRequest {
  file: File;
  portfolio_title: string;
  portfolio_description: string;
}

export interface UploadFileResponse {
  success: boolean;
  file_url: string;
  skills_extracted: ExtractedSkill[];
  points_awarded: number;
  badge_earned?: Badge;
}

export interface AnalyzePortfolioRequest {
  user_id: string;
  portfolio_id: string;
  title: string;
  description: string;
  skills: string[];
  interests: string[];
}

export interface AnalyzePortfolioResponse {
  success: boolean;
  recommendations: Recommendation[];
  ai_model: string;
  processing_time_ms: number;
}

export interface GamificationRequest {
  user_id: string;
  action: "get_state" | "award_points" | "unlock_badge";
  action_type?: string;
  points?: number;
  badge_type?: string;
}

export interface GamificationResponse {
  success: boolean;
  current_points: number;
  current_level: number;
  badges: Badge[];
  message: string;
}

// ==================== ADMIN/ANALYTICS TYPES ====================

export interface StudentAnalytics {
  user_id: string;
  student_id: string;
  name: string;
  major: string;
  total_points: number;
  current_level: number;
  portfolio_count: number;
  badges_earned: number;
  recommendations_accepted: number;
  last_active: string;
  engagement_score: number; // 0-100
}

export interface DashboardMetrics {
  total_students: number;
  total_portfolios: number;
  total_badges_awarded: number;
  avg_points_per_student: number;
  avg_level: number;
  avg_engagement: number;
  top_skills: string[];
  most_common_major: string;
  active_students_this_week: number;
}

export interface AdminPanelData {
  metrics: DashboardMetrics;
  students: StudentAnalytics[];
  recentActivities: ActivityLog[];
  topPerformers: StudentAnalytics[];
}

// ==================== THEME TYPES ====================

export type Theme = "light" | "dark" | "system";

// ==================== PAGINATION & FILTERS ====================

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface FilterOptions {
  major?: "BSCS" | "BSIT";
  yearLevel?: number;
  skill?: string;
  sortBy?: "points" | "level" | "recent" | "name";
  sortOrder?: "asc" | "desc";
}

// ==================== ERROR TYPES ====================

export interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: Record<string, any>;
  statusCode: number;
}

export interface FormError {
  field: string;
  message: string;
}
