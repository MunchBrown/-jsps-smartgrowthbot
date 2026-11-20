import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("AI is not configured on this server (GEMINI_API_KEY is missing).");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}
