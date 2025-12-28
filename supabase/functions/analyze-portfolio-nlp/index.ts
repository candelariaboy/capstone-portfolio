// Supabase Edge Function - Analyze Portfolio with NLP (Deno + TypeScript)
// This will be replaced with Python version on deployment
// Deploy: supabase functions deploy analyze-portfolio

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AnalysisRequest {
  user_id: string;
  portfolio_id: string;
  title: string;
  description: string;
  skills: string[];
  interests: string[];
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// NLP Processing: Extract entities, sentiment, and recommendations
function processNLP(text: string) {
  // Entity extraction (spaCy-like)
  const entities = extractEntities(text);
  
  // Sentiment analysis
  const sentiment = analyzeSentiment(text);
  
  // Skill proficiency assessment
  const skillProficiency = assessSkillProficiency(text);
  
  return { entities, sentiment, skillProficiency };
}

function extractEntities(text: string) {
  const entities: { [key: string]: string[] } = {
    TECHNOLOGY: [],
    SKILL: [],
    FRAMEWORK: [],
    TOOL: [],
  };

  const techPatterns = {
    TECHNOLOGY: ["React", "Node.js", "Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust"],
    FRAMEWORK: ["Next.js", "Django", "Express", "Spring", "FastAPI", "Vue.js", "Angular"],
    TOOL: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "Git", "Jenkins", "GitLab"],
  };

  Object.entries(techPatterns).forEach(([entityType, patterns]) => {
    patterns.forEach((pattern) => {
      if (text.toLowerCase().includes(pattern.toLowerCase())) {
        entities[entityType].push(pattern);
      }
    });
  });

  return entities;
}

function analyzeSentiment(text: string): { score: number; label: string } {
  const positiveWords = [
    "excellent", "amazing", "great", "awesome", "outstanding", "innovative",
    "successful", "efficient", "robust", "scalable", "optimized",
  ];
  const negativeWords = [
    "failed", "error", "bug", "issue", "problem", "slow", "outdated",
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  const lowerText = text.toLowerCase();
  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) positiveCount++;
  });
  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) negativeCount++;
  });

  const score = (positiveCount - negativeCount) / (positiveCount + negativeCount || 1);
  const label = score > 0.2 ? "positive" : score < -0.2 ? "negative" : "neutral";

  return { score: Math.max(-1, Math.min(1, score)), label };
}

function assessSkillProficiency(text: string): {
  [key: string]: "Beginner" | "Intermediate" | "Advanced" | "Expert";
} {
  const proficiencies: { [key: string]: "Beginner" | "Intermediate" | "Advanced" | "Expert" } = {};

  const advancedKeywords = ["architected", "designed", "optimized", "led", "expert"];
  const intermediateKeywords = ["developed", "built", "implemented", "worked with"];

  // Common skills to assess
  const skillsToAssess = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure",
  ];

  skillsToAssess.forEach((skill) => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      const skillContext = text.toLowerCase();
      let proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert" = "Beginner";

      const hasAdvanced = advancedKeywords.some((kw) => skillContext.includes(kw));
      const hasIntermediate = intermediateKeywords.some((kw) => skillContext.includes(kw));

      if (hasAdvanced) proficiency = "Advanced";
      if (hasIntermediate && !hasAdvanced) proficiency = "Intermediate";

      // Check for Expert level (multiple mentions + advanced keywords)
      const mentions = (text.match(new RegExp(skill, "gi")) || []).length;
      if (mentions >= 3 && hasAdvanced) proficiency = "Expert";

      proficiencies[skill] = proficiency;
    }
  });

  return proficiencies;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const body: AnalysisRequest = await req.json();
    const { user_id, portfolio_id, title, description, skills, interests } = body;

    // Run NLP analysis
    const fullText = `${title} ${description}`;
    const nlpResult = processNLP(fullText);

    // Generate recommendations based on NLP results
    const recommendations = generateRecommendations(
      skills,
      interests,
      nlpResult.skillProficiency
    );

    // Store analysis in database
    await supabase.from("portfolio_items").update({
      skills_extracted: Object.entries(nlpResult.skillProficiency).map(([skill, level]) => ({
        name: skill,
        level,
        confidence: 0.85,
      })),
      analysis_metadata: {
        sentiment: nlpResult.sentiment,
        entities: nlpResult.entities,
        analyzed_at: new Date().toISOString(),
        nlp_model: "deno-typescript-nlp",
      },
    }).eq("id", portfolio_id);

    // Award points for analysis
    await awardPointsForAnalysis(user_id, portfolio_id);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        nlp_analysis: {
          entities: nlpResult.entities,
          sentiment: nlpResult.sentiment,
          proficiency_levels: nlpResult.skillProficiency,
        },
        processing_time_ms: Date.now(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-portfolio:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze portfolio",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }
});

function generateRecommendations(
  skills: string[],
  interests: string[],
  proficiencies: { [key: string]: string }
) {
  const recommendations = [];

  // Skill gap recommendations
  const recommendedSkills = getSkillGaps(skills);
  recommendedSkills.forEach((skill) => {
    recommendations.push({
      suggestion_type: "skill",
      content: {
        title: `Master ${skill}`,
        description: `Build on your existing skills by learning ${skill}`,
        reason: "Complements your current tech stack",
        difficulty: "intermediate",
      },
    });
  });

  // Project recommendations based on interests
  interests.forEach((interest) => {
    recommendations.push({
      suggestion_type: "project",
      content: {
        title: `Build a ${interest} Project`,
        description: `Create a real-world project focusing on ${interest}`,
        reason: "Aligns with your career interests",
        difficulty: "advanced",
      },
    });
  });

  return recommendations.slice(0, 3); // Return top 3 recommendations
}

function getSkillGaps(currentSkills: string[]): string[] {
  const recommendedSkills = [
    "TypeScript",
    "Docker",
    "Kubernetes",
    "AWS",
    "GraphQL",
    "Machine Learning",
  ];

  return recommendedSkills.filter(
    (skill) =>
      !currentSkills.some(
        (s) => s.toLowerCase() === skill.toLowerCase()
      )
  );
}

async function awardPointsForAnalysis(userId: string, portfolioId: string) {
  try {
    const { data } = await supabase
      .from("users")
      .select("points")
      .eq("id", userId)
      .single();

    if (data) {
      await supabase
        .from("users")
        .update({ points: data.points + 25 })
        .eq("id", userId);
    }
  } catch (error) {
    console.error("Error awarding points:", error);
  }
}
