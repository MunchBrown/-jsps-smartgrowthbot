import { Type } from "@google/genai";
import { getGeminiClient, GEMINI_MODEL } from "./gemini";

export interface LeadScore {
  score: number;
  category: "Hot" | "Warm" | "Cold";
  justification: string;
  actionPlan: string[];
}

/** Scores a lead with Gemini. Returns null if AI is unavailable — never fakes a score. */
export async function scoreLead(lead: any): Promise<LeadScore | null> {
  try {
    const ai = getGeminiClient();
    const prompt = `Evaluate this painting-contractor lead.
Type: ${lead.clientType || "Residential"}
Budget: ${lead.budget ? "$" + lead.budget : "unknown"}
Square feet: ${lead.sqft || "unknown"}
Timeline: ${lead.timeline || "unknown"}
Condition / project: ${[lead.condition, lead.projectDescription].filter(Boolean).join(" — ") || "unknown"}
Source: ${lead.source || "unknown"}
Score 0-100 for likelihood to become a profitable job, classify Hot/Warm/Cold, give a one-sentence justification and 3 short next steps.`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            category: { type: Type.STRING },
            justification: { type: Type.STRING },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "category", "justification", "actionPlan"],
        },
      },
    });
    const parsed = JSON.parse(response.text || "{}");
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
    const category = ["Hot", "Warm", "Cold"].includes(parsed.category) ? parsed.category : score >= 75 ? "Hot" : score >= 50 ? "Warm" : "Cold";
    return {
      score,
      category,
      justification: String(parsed.justification || "").slice(0, 500),
      actionPlan: (Array.isArray(parsed.actionPlan) ? parsed.actionPlan : []).slice(0, 5).map((s: any) => String(s).slice(0, 200)),
    };
  } catch (err) {
    console.warn("[leadScore] AI scoring unavailable:", (err as Error).message);
    return null;
  }
}
