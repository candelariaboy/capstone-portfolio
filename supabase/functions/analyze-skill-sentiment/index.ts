// Supabase Edge Function - Analyze Skill Sentiment
// This function runs on Supabase's edge network and performs NLP analysis
// Deploy with: supabase functions deploy analyze-skill-sentiment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface AnalysisRequest {
  portfolioDescription: string;
  extractedSkills: string[];
}

interface SentimentAnalysis {
  skill: string;
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  context: string;
}

/**
 * Analyze sentiment around each skill mentioned in portfolio
 * Uses pattern matching and keyword analysis for fast edge processing
 */
function analyzeSkillSentiment(text: string, skills: string[]): SentimentAnalysis[] {
  const results: SentimentAnalysis[] = [];
  const lowerText = text.toLowerCase();

  const positiveIndicators = [
    "led", "developed", "built", "created", "designed", "architected",
    "implemented", "optimized", "improved", "solved", "achieved", "delivered",
    "innovative", "efficient", "robust", "scalable", "excellent", "amazing"
  ];

  const negativeIndicators = [
    "struggled", "failed", "error", "bug", "issue", "problem", "slow",
    "outdated", "deprecated", "difficult", "challenging", "limited"
  ];

  skills.forEach(skill => {
    const skillRegex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'i');
    const match = lowerText.match(skillRegex);

    if (match && match.index !== undefined) {
      // Get context around skill mention (500 char window)
      const contextStart = Math.max(0, match.index - 250);
      const contextEnd = Math.min(text.length, match.index + 250);
      const context = text.substring(contextStart, contextEnd);

      // Count sentiment indicators in context
      let positiveCount = 0;
      let negativeCount = 0;

      positiveIndicators.forEach(indicator => {
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        positiveCount += (context.match(regex) || []).length;
      });

      negativeIndicators.forEach(indicator => {
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        negativeCount += (context.match(regex) || []).length;
      });

      // Determine sentiment
      let sentiment: "positive" | "neutral" | "negative" = "neutral";
      let confidence = 0.5;

      if (positiveCount > negativeCount) {
        sentiment = "positive";
        confidence = Math.min(0.99, 0.6 + positiveCount * 0.15);
      } else if (negativeCount > positiveCount) {
        sentiment = "negative";
        confidence = Math.min(0.99, 0.6 + negativeCount * 0.15);
      } else {
        confidence = 0.5;
      }

      results.push({
        skill,
        sentiment,
        confidence,
        context: context.trim()
      });
    }
  });

  return results;
}

/**
 * Extract skill proficiency levels from portfolio text
 * Maps sentiment and context to proficiency: Beginner, Intermediate, Advanced, Expert
 */
function determineProficiencyLevel(
  skill: string,
  sentiment: SentimentAnalysis,
  text: string
): "Beginner" | "Intermediate" | "Advanced" | "Expert" {
  const lowerText = text.toLowerCase();
  const skillPattern = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'gi');
  const mentions = (text.match(skillPattern) || []).length;

  const advancedKeywords = [
    "architected", "designed", "optimized", "led", "innovative",
    "expert", "specialized", "mastered", "deep experience"
  ];

  const intermediateKeywords = [
    "developed", "built", "implemented", "worked with", "familiar with",
    "experience", "proficient"
  ];

  // Check for proficiency indicators
  let hasAdvancedKeywords = false;
  let hasIntermediateKeywords = false;

  const skillContext = sentiment.context.toLowerCase();

  advancedKeywords.forEach(kw => {
    if (skillContext.includes(kw)) hasAdvancedKeywords = true;
  });

  intermediateKeywords.forEach(kw => {
    if (skillContext.includes(kw)) hasIntermediateKeywords = true;
  });

  // Determine level based on sentiment, mentions, and keywords
  if (sentiment.sentiment === "positive" && hasAdvancedKeywords && mentions >= 3) {
    return "Expert";
  } else if (sentiment.sentiment === "positive" && (hasAdvancedKeywords || mentions >= 2)) {
    return "Advanced";
  } else if (hasIntermediateKeywords || mentions >= 1) {
    return "Intermediate";
  } else {
    return "Beginner";
  }
}

serve(async (req) => {
  // Enable CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const { portfolioDescription, extractedSkills }: AnalysisRequest = await req.json();

    if (!portfolioDescription || !extractedSkills || extractedSkills.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Missing portfolioDescription or extractedSkills"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    // Analyze sentiment for each skill
    const sentimentAnalysis = analyzeSkillSentiment(portfolioDescription, extractedSkills);

    // Determine proficiency levels
    const skillAnalysis = sentimentAnalysis.map(item => ({
      ...item,
      proficiencyLevel: determineProficiencyLevel(item.skill, item, portfolioDescription)
    }));

    // Calculate overall quality metrics
    const overallSentiment = {
      positive: skillAnalysis.filter(s => s.sentiment === "positive").length,
      neutral: skillAnalysis.filter(s => s.sentiment === "neutral").length,
      negative: skillAnalysis.filter(s => s.sentiment === "negative").length
    };

    const expertSkills = skillAnalysis.filter(s => s.proficiencyLevel === "Expert").length;
    const advancedSkills = skillAnalysis.filter(s => s.proficiencyLevel === "Advanced").length;

    return new Response(
      JSON.stringify({
        success: true,
        skillAnalysis,
        overallSentiment,
        metrics: {
          totalSkillsAnalyzed: extractedSkills.length,
          expertCount: expertSkills,
          advancedCount: advancedSkills,
          averageConfidence: Math.round(
            (skillAnalysis.reduce((sum, s) => sum + s.confidence, 0) / skillAnalysis.length) * 100
          ) / 100
        },
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  } catch (error) {
    console.error("Error in analyze-skill-sentiment:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze skill sentiment",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  }
});
