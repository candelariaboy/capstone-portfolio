export type User = {
  id: string;
  student_id: string;
  name: string;
  email: string;
  major: "BSCS" | "BSIT";
  year_level: number;
  skills: { name: string; level?: string }[];
  interests: string[];
  points: number;
  level: number;
  created_at: string;
};

export type PortfolioItem = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  technologies: { name: string }[];
  skills_extracted: { name: string; confidence?: number }[];
  file_url?: string;
  file_size?: number;
  status: "active" | "archived";
  created_at: string;
};

export type Badge = {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  points_awarded: number;
  created_at: string;
};

export type Recommendation = {
  id: string;
  user_id: string;
  suggestion_type: "skill" | "project" | "course";
  content: {
    title: string;
    description: string;
    reason?: string;
  };
  ai_model_used: string;
  accepted: boolean;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  action_type: string;
  metadata?: Record<string, any>;
  timestamp: string;
};
