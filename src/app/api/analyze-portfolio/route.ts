import { supabaseServer } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { extractSkillsWithLangChain } from "@/lib/langchain-skills";
import {
  analyzeSentiment,
  classifySkills,
  calculatePortfolioQualityScore
} from "@/lib/huggingface-distilbert";
import { HfInference } from "@huggingface/inference";

// Simple skill extraction - now enhanced with LangChain + DistilBERT
const COMMON_SKILLS = [
  "React",
  "Node.js",
  "Python",
  "JavaScript",
  "TypeScript",
  "Next.js",
  "Vue.js",
  "Angular",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Git",
  "REST API",
  "GraphQL",
  "Tailwind CSS",
  "HTML",
  "CSS",
  "Java",
  "C++",
  "Go",
  "Rust",
  "Firebase",
  "Supabase",
  "Redis",
  "RabbitMQ",
  "Microservices",
  "CI/CD",
  "Machine Learning",
  "Deep Learning",
  "Data Science",
  "NLP",
  "Computer Vision",
];

function extractSkillsFromText(text: string): string[] {
  const lowerText = text.toLowerCase();
  const extractedSkills = COMMON_SKILLS.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );
  return [...new Set(extractedSkills)];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolio_item_id, title, description, user_id } = body;

    if (!portfolio_item_id || !user_id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const textContent = `${title} ${description}`;
    
    // Phase 1: Basic skill extraction as fallback
    let extractedSkills = extractSkillsFromText(textContent);

    // Phase 2: Enhanced extraction with LangChain
    try {
      const langchainSkills = await extractSkillsWithLangChain(textContent);
      if (langchainSkills.length > 0) {
        // Merge LangChain results with basic extraction
        const mergedSkills = new Map<string, number>();
        extractedSkills.forEach(skill => {
          mergedSkills.set(skill, 0.8);
        });
        langchainSkills.forEach(item => {
          if (!mergedSkills.has(item.skill)) {
            mergedSkills.set(item.skill, item.confidence);
          }
        });
        extractedSkills = Array.from(mergedSkills.keys());
      }
    } catch (error) {
      console.warn("LangChain skill extraction failed, using basic extraction:", error);
    }

    // Phase 3: DistilBERT sentiment analysis and skill classification
    let skillClassifications = null;
    try {
      const sentiment = await analyzeSentiment(textContent);
      const classifications = await classifySkills(extractedSkills, textContent);
      const qualityScore = await calculatePortfolioQualityScore(description, extractedSkills);
      
      skillClassifications = {
        sentiment,
        classifications,
        qualityScore
      };
    } catch (error) {
      console.warn("DistilBERT analysis failed, continuing with basic extraction:", error);
    }

    // Phase 4: Call Supabase Edge Function for skill sentiment analysis
    let edgeFunctionResult = null;
    try {
      const response = await fetch(
        `${process.env.SUPABASE_URL}/functions/v1/analyze-skill-sentiment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            portfolioDescription: description,
            extractedSkills: extractedSkills,
          }),
        }
      );

      if (response.ok) {
        edgeFunctionResult = await response.json();
      }
    } catch (error) {
      console.warn("Edge Function call failed, continuing:", error);
    }

    // Update portfolio item with extracted skills and confidence scores
    if (extractedSkills.length > 0) {
      const skillsWithConfidence = extractedSkills.map((skill) => {
        // Find confidence from LangChain analysis if available
        const confidence = skillClassifications?.classifications?.find(
          (c: any) => c.skill === skill
        )?.score ?? 0.8;
        
        return {
          name: skill,
          confidence: confidence,
          classification: skillClassifications?.classifications?.find(
            (c: any) => c.skill === skill
          )?.classification ?? "SUPPORTING"
        };
      });

      await supabaseServer
        .from("portfolio_items")
        .update({
          skills_extracted: skillsWithConfidence,
          analysis_metadata: {
            sentimentAnalysis: skillClassifications?.sentiment,
            qualityScore: skillClassifications?.qualityScore,
            edgeFunctionAnalysis: edgeFunctionResult?.skillAnalysis,
            analyzedAt: new Date().toISOString(),
            nlpModels: ["langchain", "distilbert", "edge-function"]
          }
        })
        .eq("id", portfolio_item_id);
    }

    // Generate AI recommendations using Hugging Face Phi-3-mini (FREE)
    const recommendations = await generateRecommendationsWithHF(extractedSkills, textContent);

    // Store recommendations in database
    for (const rec of recommendations) {
      await supabaseServer.from("recommendations").insert({
        user_id,
        suggestion_type: rec.type,
        content: {
          title: rec.title,
          description: rec.description,
          reason: rec.reason,
        },
        ai_model_used: "langchain-distilbert-edge-functions",
      });
    }

    return NextResponse.json({
      success: true,
      skills_extracted: extractedSkills,
      recommendations_generated: recommendations.length,
      nlp_analysis: {
        langchainEnabled: true,
        distilbertEnabled: true,
        edgeFunctionAnalysis: edgeFunctionResult ? {
          skillAnalyzed: edgeFunctionResult.skillAnalysis?.length || 0,
          averageConfidence: edgeFunctionResult.metrics?.averageConfidence || 0
        } : null,
        qualityScore: skillClassifications?.qualityScore
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error analyzing portfolio:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

async function generateRecommendationsWithHF(
  skills: string[],
  description: string
): Promise<{ type: "skill" | "project" | "course"; title: string; description: string; reason: string }[]> {
  try {
    if (!process.env.HF_TOKEN) {
      throw new Error("HF_TOKEN not configured");
    }

    const hf = new HfInference(process.env.HF_TOKEN);
    
    const prompt = `You are an AI career advisor for computer science students. Based on the student's skills and portfolio description, generate exactly 3 personalized learning recommendations in JSON format.

Student Skills: ${skills.join(", ")}
Portfolio Description: ${description.substring(0, 500)}

Generate recommendations as a JSON array with exactly 3 items. Each item must have:
- type: "skill", "project", or "course"
- title: recommendation title
- description: 2-3 sentence explanation
- reason: why this helps them

Return ONLY valid JSON array, no markdown:
[{"type": "skill", "title": "...", "description": "...", "reason": "..."}]`;

    const response = await hf.textGeneration({
      model: "microsoft/Phi-3-mini-4k-instruct",
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false,
      }
    });

    // Parse the LLM response
    const responseText = response.generated_text || "";
    const jsonMatch = responseText.match(/\[\s*{[\s\S]*}\s*\]/);
    
    if (!jsonMatch) {
      console.warn("Failed to parse HF response, using fallback recommendations");
      return generateFallbackRecommendations(skills);
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    
    // Validate and sanitize recommendations
    return recommendations.slice(0, 3).map((rec: any) => ({
      type: rec.type || "skill",
      title: (rec.title || "Recommendation").substring(0, 100),
      description: (rec.description || "No description provided").substring(0, 300),
      reason: (rec.reason || "Recommended for your growth").substring(0, 200)
    }));
  } catch (error) {
    console.error("HF API recommendation generation failed:", error);
    // Fallback to basic recommendations
    return generateFallbackRecommendations(skills);
  }
}

function generateFallbackRecommendations(
  skills: string[]
): { type: "skill" | "project" | "course"; title: string; description: string; reason: string }[] {
  const recommendations = [];

  // Generate recommendations based on skill gaps
  if (skills.includes("React") && !skills.includes("Next.js")) {
    recommendations.push({
      type: "skill" as const,
      title: "Master Next.js Framework",
      description:
        "Build server-rendered React applications with advanced features like API routes, streaming, and more.",
      reason: "Pairs perfectly with your React expertise",
    });
  }

  if (
    (skills.includes("React") || skills.includes("Vue.js")) &&
    !skills.includes("TypeScript")
  ) {
    recommendations.push({
      type: "skill" as const,
      title: "Learn TypeScript",
      description:
        "Add type safety to your JavaScript projects and catch errors before runtime.",
      reason: "Essential for modern frontend development",
    });
  }

  if (
    skills.length > 0 &&
    !skills.includes("Docker")
  ) {
    recommendations.push({
      type: "skill" as const,
      title: "Master Docker & Containers",
      description:
        "Learn containerization to deploy applications consistently across environments.",
      reason: "Crucial for DevOps and deployment pipelines",
    });
  }

  // Project recommendations
  if (
    skills.includes("React") &&
    skills.includes("Node.js")
  ) {
    recommendations.push({
      type: "project" as const,
      title: "Build a Full-Stack SaaS Application",
      description:
        "Create a production-ready web application with authentication, database, and payment integration.",
      reason: "Demonstrates comprehensive full-stack capabilities",
    });
  }

  // Course recommendations
  if (skills.includes("Python") && !skills.includes("Machine Learning")) {
    recommendations.push({
      type: "course" as const,
      title: "Introduction to Machine Learning",
      description:
        "Learn ML fundamentals, model training, and deployment using Python libraries.",
      reason: "High-demand skill in 2025",
    });
  }

  return recommendations.slice(0, 3);
}
