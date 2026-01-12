
import { GoogleGenAI, Type } from "@google/genai";
import { NLPParseResult, Priority } from "../types";

// Note: For 1M+ users, this API key should be moved to a secure Backend Proxy.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Exponential backoff helper for handling Rate Limits (429 errors)
 */
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.status === 503)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function parseTaskNLP(input: string): Promise<NLPParseResult | null> {
  return retryWithBackoff(async () => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Task: "${input}". Current Time: ${new Date().toISOString()}.
        Return JSON: {title, dueDate(ISO), priority(LOW/MEDIUM/HIGH), tags[], projectName}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              dueDate: { type: Type.STRING },
              priority: { type: Type.STRING, enum: [Priority.LOW, Priority.MEDIUM, Priority.HIGH] },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              projectName: { type: Type.STRING }
            },
            required: ["title"]
          }
        }
      });

      const text = response.text;
      return text ? JSON.parse(text.trim()) : null;
    } catch (error) {
      console.error("NLP Error:", error);
      return null;
    }
  });
}

export async function generateSubtasks(taskTitle: string): Promise<string[]> {
  return retryWithBackoff(async () => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 3-5 subtasks for: "${taskTitle}". Output: JSON string array.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      const text = response.text;
      return text ? JSON.parse(text.trim()) : [];
    } catch (error) {
      console.error("Subtask Error:", error);
      return [];
    }
  });
}
