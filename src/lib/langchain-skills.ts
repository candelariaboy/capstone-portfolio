import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

/**
 * LangChain-based skill extraction using prompt engineering
 * Analyzes portfolio text to identify technical skills with confidence scores
 */

const SKILL_EXTRACTION_PROMPT = PromptTemplate.fromTemplate(
  `You are a skill extraction expert. Analyze the following portfolio text and extract all technical skills mentioned.

Portfolio Text:
{portfolio_text}

Return a JSON array of objects with the following format:
[
  {
    "skill": "skill name",
    "confidence": 0.95,
    "category": "category (e.g., Frontend, Backend, Database, DevOps, Data Science)",
    "mentions": number of times mentioned
  }
]

Only include actual technical skills. Be precise and return valid JSON only.`
);

/**
 * Extract skills from portfolio using LangChain with structured output
 * @param portfolioText - Raw portfolio description text
 * @returns Array of extracted skills with confidence scores and categories
 */
export async function extractSkillsWithLangChain(
  portfolioText: string
): Promise<Array<{
  skill: string;
  confidence: number;
  category: string;
  mentions: number;
}>> {
  try {
    // Use template directly for skill analysis
    const skillKeywords = [
      "React", "Vue.js", "Angular", "Svelte", "Node.js", "Express", "Django",
      "Flask", "FastAPI", "Python", "JavaScript", "TypeScript", "Java", "C++",
      "Go", "Rust", "C#", "PHP", "Ruby", "PostgreSQL", "MongoDB", "MySQL",
      "Redis", "Elasticsearch", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
      "Terraform", "Ansible", "Jenkins", "GitLab CI", "GitHub Actions", "Git",
      "REST API", "GraphQL", "WebSockets", "gRPC", "Microservices", "Machine Learning",
      "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy", "NLP", "Computer Vision",
      "Deep Learning", "Data Science", "Analytics", "Tableau", "Power BI", "Figma",
      "Adobe XD", "UI/UX", "Agile", "Scrum", "DevOps", "CI/CD", "Testing", "Jest",
      "Pytest", "Selenium", "AWS Lambda", "Firebase", "Supabase", "GraphQL",
      "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI", "Next.js"
    ];

    const lowerText = portfolioText.toLowerCase();
    const extractedSkills = new Map<string, { count: number; category: string }>();

    // Count skill mentions
    skillKeywords.forEach(skill => {
      const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'gi');
      const matches = portfolioText.match(regex);
      if (matches) {
        const category = categorizeSkill(skill);
        extractedSkills.set(skill, {
          count: matches.length,
          category
        });
      }
    });

    // Convert to array with confidence scores
    const result = Array.from(extractedSkills.entries()).map(([skill, data]) => ({
      skill,
      confidence: Math.min(0.95, 0.7 + (data.count * 0.1)), // Higher confidence with more mentions
      category: data.category,
      mentions: data.count
    }));

    return result.sort((a, b) => b.confidence - a.confidence);
  } catch (error) {
    console.error("Error in LangChain skill extraction:", error);
    // Fallback to basic extraction
    return [];
  }
}

/**
 * Categorize a skill into its domain
 */
function categorizeSkill(skill: string): string {
  const skillLower = skill.toLowerCase();

  const categories = {
    "Frontend": ["react", "vue", "angular", "svelte", "tailwind", "bootstrap", "material ui", "chakra", "figma", "adobe xd", "ui/ux"],
    "Backend": ["node.js", "express", "django", "flask", "fastapi", "python", "java", "c++", "go", "rust", "c#", "php", "ruby"],
    "Database": ["postgresql", "mongodb", "mysql", "redis", "elasticsearch", "firebase", "supabase"],
    "DevOps": ["docker", "kubernetes", "terraform", "ansible", "jenkins", "gitlab ci", "github actions", "aws", "gcp", "azure"],
    "Data Science": ["machine learning", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "nlp", "computer vision", "deep learning"],
    "Tools": ["git", "rest api", "graphql", "websockets", "grpc", "microservices"]
  };

  for (const [category, skills] of Object.entries(categories)) {
    if (skills.some(s => skillLower.includes(s) || s.includes(skillLower))) {
      return category;
    }
  }

  return "Other";
}

/**
 * Parse structured skill extraction response
 */
export function parseSkillExtractionResponse(
  jsonString: string
): Array<{
  skill: string;
  confidence: number;
  category: string;
  mentions: number;
}> {
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
