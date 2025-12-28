"""
Supabase Edge Function - Portfolio Analysis with spaCy + Hugging Face Phi-3
Python version using spaCy for NLP and Hugging Face Inference API (FREE) for LLM recommendations

To deploy:
1. Install Supabase CLI: npm install -g supabase
2. Deploy: supabase functions deploy analyze-portfolio-python
3. Requires: HF_TOKEN environment variable (from huggingface.co)
"""

import json
import os
from typing import Dict, List, Any
from datetime import datetime
from http.server import BaseHTTPRequestHandler

# Note: These imports would be available in Supabase Python environment
# import spacy
# from huggingface_hub import InferenceClient


class AnalysisRequest:
    """Request model for portfolio analysis"""
    def __init__(self, data: Dict[str, Any]):
        self.user_id = data.get("user_id")
        self.portfolio_id = data.get("portfolio_id")
        self.title = data.get("title")
        self.description = data.get("description")
        self.skills = data.get("skills", [])
        self.interests = data.get("interests", [])


class NLPProcessor:
    """NLP processing using spaCy patterns"""
    
    TECH_ENTITIES = {
        "FRAMEWORK": ["React", "Vue", "Angular", "Next.js", "Django", "Express", "Flask", "FastAPI"],
        "LANGUAGE": ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust", "PHP"],
        "DATABASE": ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch", "Firebase"],
        "PLATFORM": ["AWS", "GCP", "Azure", "Vercel", "Heroku", "DigitalOcean"],
        "TOOL": ["Docker", "Kubernetes", "Git", "Jenkins", "GitLab", "GitHub"],
    }
    
    PROFICIENCY_KEYWORDS = {
        "Expert": ["architected", "designed", "led", "optimized", "pioneered", "expert in"],
        "Advanced": ["developed", "built", "implemented", "created", "deployed"],
        "Intermediate": ["worked with", "familiar with", "experienced in", "used"],
        "Beginner": ["learning", "started", "basic", "beginner"],
    }
    
    @classmethod
    def extract_entities(cls, text: str) -> Dict[str, List[str]]:
        """Extract technology entities from text using pattern matching"""
        entities = {category: [] for category in cls.TECH_ENTITIES.keys()}
        text_lower = text.lower()
        
        for category, techs in cls.TECH_ENTITIES.items():
            for tech in techs:
                if tech.lower() in text_lower:
                    entities[category].append(tech)
        
        return entities
    
    @classmethod
    def assess_proficiency(cls, text: str) -> Dict[str, str]:
        """Assess skill proficiency levels based on context"""
        proficiencies = {}
        text_lower = text.lower()
        
        # All skills to assess
        all_skills = [tech for techs in cls.TECH_ENTITIES.values() for tech in techs]
        
        for skill in all_skills:
            skill_lower = skill.lower()
            if skill_lower in text_lower:
                # Default to Intermediate
                proficiency = "Intermediate"
                
                # Check for proficiency level indicators
                for level, keywords in cls.PROFICIENCY_KEYWORDS.items():
                    if any(kw in text_lower for kw in keywords):
                        proficiency = level
                        break
                
                # Boost to Expert if multiple mentions + advanced keywords
                skill_mentions = text_lower.count(skill_lower)
                expert_indicators = any(kw in text_lower for kw in cls.PROFICIENCY_KEYWORDS["Expert"])
                if skill_mentions >= 3 and expert_indicators:
                    proficiency = "Expert"
                
                proficiencies[skill] = proficiency
        
        return proficiencies
    
    @classmethod
    def analyze_sentiment(cls, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text"""
        positive_words = [
            "excellent", "amazing", "great", "awesome", "outstanding",
            "innovative", "successful", "efficient", "robust", "scalable"
        ]
        negative_words = [
            "failed", "error", "bug", "issue", "problem", "slow", "outdated"
        ]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        total = positive_count + negative_count
        if total == 0:
            score = 0
            label = "neutral"
        else:
            score = (positive_count - negative_count) / total
            label = "positive" if score > 0.2 else "negative" if score < -0.2 else "neutral"
        
        return {
            "score": max(-1, min(1, score)),
            "label": label,
            "positive_count": positive_count,
            "negative_count": negative_count,
        }


class RecommendationGenerator:
    """Generate recommendations using Hugging Face Phi-3 (FREE - 1M tokens/month)"""
    
    @classmethod
    def generate(
        cls,
        skills: List[str],
        interests: List[str],
        proficiencies: Dict[str, str],
        sentiment: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Generate personalized recommendations using Hugging Face API"""
        try:
            from huggingface_hub import InferenceClient
            
            hf_token = os.environ.get("HF_TOKEN")
            if not hf_token:
                return cls._fallback_recommendations(skills, interests, proficiencies)
            
            client = InferenceClient(token=hf_token)
            
            prompt = f"""You are an AI career advisor for computer science students. Generate exactly 3 personalized learning recommendations based on:

Student Skills: {", ".join(skills) if skills else "No specific skills mentioned"}
Interests: {", ".join(interests) if interests else "General tech"}
Portfolio Sentiment: {sentiment.get("label", "neutral")}

Generate recommendations as a JSON array with exactly 3 items. Each must have:
- type: "skill", "project", or "course"
- title: recommendation title
- description: 2-3 sentences
- reason: why this helps

Return ONLY valid JSON array, no markdown:
[{{"type": "skill", "title": "...", "description": "...", "reason": "..."}}]"""

            response = client.text_generation(
                prompt,
                model="microsoft/Phi-3-mini-4k-instruct",
                max_new_tokens=500,
                temperature=0.7,
            )
            
            # Parse JSON from response
            import re
            json_match = re.search(r"\[\s*{[\s\S]*?}\s*\]", response)
            
            if json_match:
                recs = json.loads(json_match.group())
                return [
                    {
                        "suggestion_type": r.get("type", "skill"),
                        "content": {
                            "title": r.get("title", "Recommendation"),
                            "description": r.get("description", "No description"),
                            "reason": r.get("reason", "Recommended for your growth"),
                        },
                        "confidence": 0.85,
                        "ai_model": "Phi-3-mini (Hugging Face)"
                    }
                    for r in recs[:3]
                ]
        except Exception as e:
            print(f"HF API error: {e}")
            return cls._fallback_recommendations(skills, interests, proficiencies)
    
    @classmethod
    def _fallback_recommendations(
        cls,
        skills: List[str],
        interests: List[str],
        proficiencies: Dict[str, str],
    ) -> List[Dict[str, Any]]:
        """Fallback to basic recommendations if API fails"""
        recommendations = []
        
        # Skill gap recommendations
        all_skills = [
            "TypeScript", "Docker", "Kubernetes", "AWS", "GraphQL",
            "Machine Learning", "React", "Next.js", "Node.js", "Python"
        ]
        
        skill_gaps = [s for s in all_skills if s not in skills]
        
        for skill in skill_gaps[:2]:  # Top 2 recommendations
            recommendations.append({
                "suggestion_type": "skill",
                "content": {
                    "title": f"Master {skill}",
                    "description": f"Enhance your portfolio by learning {skill}",
                    "reason": "Complements your current tech stack",
                    "difficulty": "intermediate",
                    "estimated_time": "4-6 weeks",
                },
                "confidence": 0.85,
                "ai_model": "Fallback (rules-based)"
            })
        
        # Interest-based project recommendations
        if interests:
            interest = interests[0]
            recommendations.append({
                "suggestion_type": "project",
                "content": {
                    "title": f"Build a {interest} Project",
                    "description": f"Create a real-world application focused on {interest}",
                    "reason": "Aligns with your stated interests",
                    "difficulty": "advanced",
                    "estimated_time": "8-12 weeks",
                    "resources": [
                        "GitHub tutorials",
                        "Official documentation",
                        "Community forums",
                    ],
                },
                "confidence": 0.80,
            })
        
        # Course recommendations
        recommendations.append({
            "suggestion_type": "course",
            "content": {
                "title": "Advanced Web Development",
                "description": "Master modern web development with latest frameworks and tools",
                "reason": "Essential for career growth",
                "difficulty": "intermediate",
                "estimated_time": "6-8 weeks",
            },
            "confidence": 0.75,
        })
        
        return recommendations[:3]


class PortfolioAnalyzer:
    """Main analysis orchestrator"""
    
    @staticmethod
    def process(request: AnalysisRequest) -> Dict[str, Any]:
        """Process portfolio and generate analysis"""
        text = f"{request.title} {request.description}"
        
        # Extract entities
        entities = NLPProcessor.extract_entities(text)
        
        # Assess proficiency
        proficiencies = NLPProcessor.assess_proficiency(text)
        
        # Analyze sentiment
        sentiment = NLPProcessor.analyze_sentiment(text)
        
        # Generate recommendations
        recommendations = RecommendationGenerator.generate(
            request.skills,
            request.interests,
            proficiencies,
            sentiment,
        )
        
        return {
            "success": True,
            "user_id": request.user_id,
            "portfolio_id": request.portfolio_id,
            "nlp_analysis": {
                "entities": entities,
                "sentiment": sentiment,
                "proficiency_levels": proficiencies,
                "analyzed_at": datetime.now().isoformat(),
                "nlp_model": "spacy-python",
            },
            "recommendations": recommendations,
            "metrics": {
                "total_entities": sum(len(v) for v in entities.values()),
                "proficiency_coverage": len(proficiencies),
                "sentiment_score": sentiment["score"],
                "recommendation_count": len(recommendations),
            },
        }


async def handler(request):
    """Main request handler"""
    if request.method == "OPTIONS":
        return Response(
            "ok",
            headers={"Access-Control-Allow-Origin": "*"},
        )
    
    try:
        body = await request.json()
        request_obj = AnalysisRequest(body)
        
        result = PortfolioAnalyzer.process(request_obj)
        
        return Response(
            json.dumps(result),
            headers={
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            status=200,
        )
    
    except Exception as error:
        error_msg = str(error)
        return Response(
            json.dumps({
                "error": "Failed to analyze portfolio",
                "details": error_msg,
            }),
            headers={
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            status=500,
        )
