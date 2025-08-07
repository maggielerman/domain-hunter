import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ConceptAnalysis {
  keywords: string[];
  industry: string;
  businessModel: string;
  targetAudience: string;
  brandPersonality: string[];
  suggestedDomainStyles: string[];
}

export interface DomainSuggestion {
  domain: string;
  reasoning: string;
  brandFit: number; // 1-10 score
  memorability: number; // 1-10 score
  seoValue: number; // 1-10 score
}

export async function analyzeConcept(businessConcept: string): Promise<ConceptAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert business analyst and branding consultant. Analyze business concepts and extract key information for domain name generation. Respond with JSON in this exact format:
          {
            "keywords": ["array", "of", "relevant", "keywords"],
            "industry": "primary industry category",
            "businessModel": "brief business model description",
            "targetAudience": "target customer description",
            "brandPersonality": ["array", "of", "brand", "traits"],
            "suggestedDomainStyles": ["array", "of", "domain", "naming", "approaches"]
          }`
        },
        {
          role: "user",
          content: `Analyze this business concept: "${businessConcept}"`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as ConceptAnalysis;
  } catch (error) {
    console.error("Failed to analyze concept:", error);
    throw new Error("Failed to analyze business concept");
  }
}

export async function generateConceptBasedDomains(
  businessConcept: string,
  analysis: ConceptAnalysis,
  count: number = 20
): Promise<DomainSuggestion[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a creative domain name expert. Generate memorable, brandable domain names based on business concepts and analysis. Focus on:
          - Brandability and memorability
          - Relevance to the business concept
          - SEO potential
          - Availability likelihood (avoid obvious taken domains)
          - Various naming approaches (compound words, made-up words, descriptive, abstract)
          
          Respond with JSON object in this exact format:
          {
            "domains": [
              {
                "domain": "example.com",
                "reasoning": "Brief explanation of why this domain fits",
                "brandFit": 8,
                "memorability": 7,
                "seoValue": 6
              }
            ]
          }
          
          Generate exactly ${count} unique suggestions with various extensions (.com, .io, .co, .tech, .app, .dev, etc.)`
        },
        {
          role: "user",
          content: `Business concept: "${businessConcept}"
          
          Analysis:
          - Keywords: ${analysis.keywords.join(", ")}
          - Industry: ${analysis.industry}
          - Business Model: ${analysis.businessModel}
          - Target Audience: ${analysis.targetAudience}
          - Brand Personality: ${analysis.brandPersonality.join(", ")}
          - Suggested Domain Styles: ${analysis.suggestedDomainStyles.join(", ")}
          
          Generate ${count} creative domain name suggestions that would work well for this business.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || '{"domains":[]}');
    
    // Expect object with domains array
    if (result.domains && Array.isArray(result.domains)) {
      return result.domains as DomainSuggestion[];
    } else {
      console.error("Unexpected response format:", result);
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Failed to generate concept-based domains:", error);
    throw new Error("Failed to generate domain suggestions");
  }
}

export async function enhanceDomainWithConcept(
  domain: string,
  businessConcept: string
): Promise<{
  brandingInsights: string;
  marketingAngles: string[];
  potentialConcerns: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a branding expert. Analyze how well a domain name fits a business concept and provide insights. Respond with JSON:
          {
            "brandingInsights": "detailed analysis of domain-business fit",
            "marketingAngles": ["array", "of", "marketing", "opportunities"],
            "potentialConcerns": ["array", "of", "potential", "issues"]
          }`
        },
        {
          role: "user",
          content: `Domain: "${domain}"
          Business concept: "${businessConcept}"
          
          How well does this domain fit the business? What are the branding opportunities and concerns?`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Failed to enhance domain with concept:", error);
    throw new Error("Failed to analyze domain fit");
  }
}