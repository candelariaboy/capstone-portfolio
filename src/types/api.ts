/**
 * API Request/Response types for all endpoints
 * Centralized location for API contracts
 */

import {
  User,
  Badge,
  Recommendation,
  ActivityLog,
  ExtractedSkill,
  StudentAnalytics,
  DashboardMetrics
} from "./index";

// ==================== CREATE USER API ====================

export namespace CreateUserAPI {
  export interface Request {
    name: string;
    student_id: string;
    email: string;
    major: "BSCS" | "BSIT";
    year_level: 1 | 2 | 3 | 4;
    skills: string[];
    interests: string[];
  }

  export interface Response {
    success: boolean;
    userId: string;
    student_id: string;
    name: string;
    message: string;
    initialBadge?: Badge;
    initialPoints?: number;
  }

  export interface Error {
    success: false;
    error: string;
    code: "INVALID_DATA" | "DUPLICATE_STUDENT_ID" | "DATABASE_ERROR";
  }
}

// ==================== UPLOAD FILE API ====================

export namespace UploadFileAPI {
  export interface Request {
    file: File;
    portfolio_title: string;
    portfolio_description: string;
    user_id: string;
  }

  export interface Response {
    success: boolean;
    file_url: string;
    file_name: string;
    file_size: number;
    skills_extracted: ExtractedSkill[];
    points_awarded: number;
    badge_earned?: Badge;
    recommendation_triggered?: string;
    processing_time_ms: number;
  }

  export interface Error {
    success: false;
    error: string;
    code:
      | "FILE_TOO_LARGE"
      | "INVALID_FILE_TYPE"
      | "UPLOAD_FAILED"
      | "STORAGE_ERROR"
      | "PROCESSING_ERROR";
  }
}

// ==================== ANALYZE PORTFOLIO API ====================

export namespace AnalyzePortfolioAPI {
  export interface Request {
    user_id: string;
    portfolio_id: string;
    title: string;
    description: string;
    skills: string[];
    interests: string[];
  }

  export interface Response {
    success: boolean;
    recommendations: Recommendation[];
    ai_model: "langchain" | "distilbert" | "phi-3" | "hybrid";
    processing_time_ms: number;
    confidence_scores: number[];
    nlp_analysis?: {
      langchainEnabled: boolean;
      distilbertEnabled: boolean;
      edgeFunctionAnalysis?: {
        skillAnalyzed: number;
        averageConfidence: number;
      };
      qualityScore?: {
        overallScore: number;
        sentimentScore: number;
        skillDiversityScore: number;
        achievementScore: number;
        recommendation: string;
      };
    };
  }

  export interface Error {
    success: false;
    error: string;
    code:
      | "INVALID_DATA"
      | "AI_SERVICE_ERROR"
      | "PROCESSING_FAILED"
      | "RATE_LIMITED";
  }
}

// ==================== GAMIFICATION API ====================

export namespace GamificationAPI {
  export interface GetStateRequest {
    user_id: string;
  }

  export interface GetStateResponse {
    success: boolean;
    totalPoints: number;
    currentLevel: number;
    badges: Badge[];
    recentActions: ActivityLog[];
    pointsThisMonth: number;
    streakDays: number;
    nextLevelThreshold: number;
    pointsToNextLevel: number;
  }

  export interface AwardPointsRequest {
    user_id: string;
    points: number;
    action_type: string;
    metadata?: Record<string, any>;
  }

  export interface AwardPointsResponse {
    success: boolean;
    new_points: number;
    level_up?: boolean;
    new_level?: number;
    badge_unlocked?: Badge;
  }

  export interface UnlockBadgeRequest {
    user_id: string;
    badge_type: string;
    progress?: number;
  }

  export interface UnlockBadgeResponse {
    success: boolean;
    badge: Badge;
    points_awarded?: number;
  }

  export interface Error {
    success: false;
    error: string;
    code: "USER_NOT_FOUND" | "BADGE_NOT_FOUND" | "DATABASE_ERROR";
  }
}

// ==================== ADMIN API ====================

export namespace AdminAPI {
  export interface GetAllStudentsRequest {
    page?: number;
    limit?: number;
    major?: "BSCS" | "BSIT";
    sort_by?: "points" | "level" | "name" | "recent";
  }

  export interface GetAllStudentsResponse {
    success: boolean;
    students: StudentAnalytics[];
    total_count: number;
    page: number;
    limit: number;
  }

  export interface GetMetricsResponse {
    success: boolean;
    metrics: DashboardMetrics;
  }

  export interface ExportDataRequest {
    format: "csv" | "json";
    include_private?: boolean;
  }

  export interface ExportDataResponse {
    success: boolean;
    download_url: string;
    file_size: number;
    created_at: string;
  }

  export interface Error {
    success: false;
    error: string;
    code: "UNAUTHORIZED" | "DATABASE_ERROR" | "EXPORT_FAILED";
  }
}

// ==================== RECOMMENDATIONS API ====================

export namespace RecommendationsAPI {
  export interface GetRecommendationsRequest {
    user_id: string;
    limit?: number;
    filter_by?: "skill" | "project" | "course";
  }

  export interface GetRecommendationsResponse {
    success: boolean;
    recommendations: Recommendation[];
    total_count: number;
    acceptance_rate: number; // percentage
  }

  export interface AcceptRecommendationRequest {
    user_id: string;
    recommendation_id: string;
  }

  export interface AcceptRecommendationResponse {
    success: boolean;
    points_awarded: number;
    new_total_points: number;
    updated_recommendation: Recommendation;
  }

  export interface Error {
    success: false;
    error: string;
    code:
      | "RECOMMENDATION_NOT_FOUND"
      | "USER_NOT_FOUND"
      | "ALREADY_ACCEPTED"
      | "DATABASE_ERROR";
  }
}

// ==================== THEME API ====================

export namespace ThemeAPI {
  export type Theme = "light" | "dark" | "system";

  export interface SetThemeRequest {
    theme: Theme;
  }

  export interface SetThemeResponse {
    success: boolean;
    current_theme: Theme;
  }
}
