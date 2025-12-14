import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GitHubUser, GitHubRepo, ProfileAnalysis } from "../types";

// Schema definition for Professional Analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    profileScore: { type: Type.NUMBER, description: "Professional score 0-100 based on portfolio quality." },
    professionalPersona: { type: Type.STRING, description: "A 2-4 word high-level professional title (e.g., 'Distributed Systems Architect', 'Product-Minded Frontend Lead')." },
    profileSummary: { type: Type.STRING, description: "A sophisticated executive summary of the developer's capability. Focus on their 'brand' and technical philosophy." },
    technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 5-7 inferred technical skills (focus on architectures/frameworks)." },
    overallImpression: { type: Type.STRING, description: "A decisive one-sentence verdict on their engineering level." },
    careerAdvice: { type: Type.STRING, description: "High-level strategic advice for career growth. Focus on architectural impact, community leadership, or personal branding." },
    repoAnalyses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: { type: Type.NUMBER, description: "Repo quality score 0-100." },
          completeness: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          summary: { type: Type.STRING, description: "Technical summary focusing on the problem solved." },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key technical strengths." },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Architectural or documentation gaps." },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable improvements." }
        },
        required: ["name", "score", "completeness", "summary", "strengths", "weaknesses", "suggestions"]
      }
    }
  },
  required: ["profileScore", "professionalPersona", "profileSummary", "technicalSkills", "overallImpression", "careerAdvice", "repoAnalyses"]
};

export const analyzeProfile = async (user: GitHubUser, repos: GitHubRepo[]): Promise<ProfileAnalysis> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are a **Distinguished Engineer** and **Chief Technology Officer (CTO)** at a top-tier tech company. 
    You are conducting a high-level talent review of a software engineer based on their GitHub profile.
    
    **Your Mandate**:
    Evaluate the candidate's engineering maturity, architectural thinking, and potential business impact. 
    Avoid generic advice like "add more comments." Focus on "Personal Branding", "System Design", and "Engineering Authority".

    **Analysis Output Guidelines**:
    
    1. **Professional Persona**: Identify their specific niche. Are they a "Full-Stack Product Engineer", a "Systems Performance Specialist", or an "Open Source Maintainer"? Be precise.
    
    2. **Executive Summary**: 
       - Write a sophisticated narrative (approx. 3-4 sentences).
       - Highlight their patterns: Do they ship finished products? Do they experiment with bleeding-edge tech?
       - Use active, professional voice (e.g., "Demonstrates strong grasp of...", "Profile suggests a focus on...").
    
    3. **Strategic Growth Advice**: 
       - Provide **one** powerful, strategic recommendation to elevate their career to the next level (e.g., Staff/Principal level).
       - Focus on high-leverage activities: contributing to major open source, writing architectural RFCs, building developer tooling, or public speaking.
       - **Do not** simply say "add a readme". Explain *why* (e.g., "Transform this repo into a case study to demonstrate system design skills").

    **Scoring Calibration**:
    - **90-100 (Exceptional)**: Production-ready, well-documented, widely used, or architecturally complex.
    - **75-89 (Strong)**: Solid coding skills, decent documentation, consistent activity.
    - **50-74 (Junior/Growth)**: Works in progress, inconsistency, sparse documentation.
    - **<50 (Needs Work)**: Empty repositories, no descriptions, "hello world" projects.

    **Input Data Context**:
    - If specific files (like READMEs) are missing, infer based on file structure and languages.
    - Treat "Forked" repositories with low weight unless they have significant contributions.
  `;

  // Prepare concise data for the prompt
  const promptData = {
    username: user.login,
    name: user.name,
    bio: user.bio,
    public_repos: user.public_repos,
    followers: user.followers,
    created_at: user.created_at,
    repositories: repos.map(r => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stargazers: r.stargazers_count,
      updated_at: r.updated_at,
      homepage: r.homepage,
      topics: r.topics,
      readme_preview: r.readmeContent ? r.readmeContent.slice(0, 1500) : "No README content available."
    }))
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: `Conduct a strategic executive review of this profile: ${JSON.stringify(promptData)}` }] }
    ],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      temperature: 0.2, // Lower temperature for more consistent, professional output
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI service");

  return JSON.parse(text) as ProfileAnalysis;
};