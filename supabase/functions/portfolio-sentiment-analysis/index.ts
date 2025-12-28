// Supabase Edge Function - Portfolio Sentiment Analysis
// Analyzes overall portfolio quality using NLP patterns
// Deploy with: supabase functions deploy portfolio-sentiment-analysis

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface PortfolioData {
  description: string;
  skills: string[];
  projects?: Array<{ title: string; description: string }>;
}

interface QualityScore {
  overall: number;
  clarity: number;
  achievement: number;
  professionalism: number;
  technicalDepth: number;
}

/**
 * Analyze portfolio clarity and structure
 */
function analyzeClarity(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(" ").length, 0) / sentences.length;

  // Ideal sentence length is 15-25 words
  const clarityScore =
    sentences.length > 3 ? // At least 4 sentences
      1 - Math.abs(avgSentenceLength - 20) / 30 // Penalize very long or very short sentences
    : 0.3;

  return Math.max(0, Math.min(1, clarityScore));
}

/**
 * Analyze achievement indicators in portfolio
 */
function analyzeAchievements(text: string): number {
  const achievementKeywords = [
    "improved", "optimized", "accelerated", "reduced", "increased",
    "led", "managed", "directed", "designed", "architected", "developed",
    "delivered", "achieved", "accomplished", "innovative", "pioneering",
    "solved", "transformed", "automated", "scaled", "enhanced"
  ];

  const metrics = [
    /(\d+)%\s*(improvement|increase|decrease|reduction)/gi,
    /(\d+)x\s*(faster|slower|larger|smaller)/gi,
    /saved\s*\$?\d+/gi,
    /impacted\s*\d+\s*(users|customers|team members)/gi
  ];

  let achievementCount = 0;
  let metricsCount = 0;

  achievementKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    achievementCount += (text.match(regex) || []).length;
  });

  metrics.forEach(metric => {
    metricsCount += (text.match(metric) || []).length;
  });

  const baseScore = Math.min(1, achievementCount / 10);
  const metricsBonus = Math.min(0.2, metricsCount * 0.05);

  return Math.min(1, baseScore + metricsBonus);
}

/**
 * Analyze professionalism and tone
 */
function analyzeProfessionalism(text: string): number {
  const professionalIndicators = [
    "developed", "implemented", "designed", "optimized", "deployed",
    "collaborat", "stakeholder", "requirement", "infrastructure", "architecture"
  ];

  const unprofessionalIndicators = [
    "lol", "haha", "awesome dude", "cool stuff", "just playing", "lazy"
  ];

  let professionalCount = 0;
  let unprofessionalCount = 0;

  professionalIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator}`, 'gi');
    professionalCount += (text.match(regex) || []).length;
  });

  unprofessionalIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator}`, 'gi');
    unprofessionalCount += (text.match(regex) || []).length;
  });

  const baseScore = Math.min(1, professionalCount / 8);
  const unprofessionalPenalty = Math.max(0, 0.3 * unprofessionalCount);

  return Math.max(0, Math.min(1, baseScore - unprofessionalPenalty));
}

/**
 * Analyze technical depth based on terminology
 */
function analyzeTechnicalDepth(text: string, skills: string[]): number {
  const technicalTerms = [
    "algorithm", "complexity", "optimization", "caching", "indexing",
    "asynchronous", "middleware", "deployment", "pipeline", "infrastructure",
    "scalability", "concurrency", "distributed", "microservice", "containerization",
    "ci/cd", "database", "api", "protocol", "encryption", "authentication"
  ];

  const skillMentionBonus = skills.length > 0 ?
    Math.min(1, skills.length / 15) : 0;

  let technicalTermCount = 0;
  technicalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    technicalTermCount += (text.match(regex) || []).length;
  });

  const termScore = Math.min(1, technicalTermCount / 10);

  return (termScore * 0.7 + skillMentionBonus * 0.3);
}

/**
 * Calculate overall portfolio quality score
 */
function calculatePortfolioQuality(data: PortfolioData): QualityScore {
  const fullText = data.description + " " +
    (data.projects?.map(p => `${p.title} ${p.description}`).join(" ") || "");

  const clarity = analyzeClarity(data.description);
  const achievement = analyzeAchievements(fullText);
  const professionalism = analyzeProfessionalism(fullText);
  const technicalDepth = analyzeTechnicalDepth(fullText, data.skills);

  // Weighted average for overall score
  const overall =
    clarity * 0.2 +
    achievement * 0.3 +
    professionalism * 0.25 +
    technicalDepth * 0.25;

  return {
    overall: Math.round(overall * 100) / 100,
    clarity: Math.round(clarity * 100) / 100,
    achievement: Math.round(achievement * 100) / 100,
    professionalism: Math.round(professionalism * 100) / 100,
    technicalDepth: Math.round(technicalDepth * 100) / 100
  };
}

/**
 * Generate portfolio improvement recommendations
 */
function generateRecommendations(scores: QualityScore): string[] {
  const recommendations: string[] = [];

  if (scores.clarity < 0.6) {
    recommendations.push("Consider breaking down lengthy paragraphs into shorter, clearer sentences (15-25 words each)");
  }

  if (scores.achievement < 0.5) {
    recommendations.push("Add more quantifiable achievements and impact metrics (e.g., '30% performance improvement')");
  }

  if (scores.professionalism < 0.6) {
    recommendations.push("Use more formal, professional language suitable for technical audiences");
  }

  if (scores.technicalDepth < 0.5) {
    recommendations.push("Include more technical terminology and architectural decisions in your description");
  }

  if (recommendations.length === 0) {
    recommendations.push("Excellent portfolio! Continue showcasing your achievements with metrics and technical depth.");
  }

  return recommendations;
}

serve(async (req) => {
  // Enable CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const portfolioData: PortfolioData = await req.json();

    if (!portfolioData.description) {
      return new Response(
        JSON.stringify({ error: "Missing portfolio description" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    const qualityScores = calculatePortfolioQuality(portfolioData);
    const recommendations = generateRecommendations(qualityScores);

    return new Response(
      JSON.stringify({
        success: true,
        qualityScores,
        recommendations,
        rating: qualityScores.overall >= 0.8 ? "Excellent" :
          qualityScores.overall >= 0.6 ? "Good" :
            qualityScores.overall >= 0.4 ? "Fair" : "Needs Improvement",
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  } catch (error) {
    console.error("Error in portfolio-sentiment-analysis:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze portfolio sentiment",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  }
});
