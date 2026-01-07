import { GoogleGenAI, Type } from "@google/genai";
import { Book, SearchMode } from "../types";
import { STANDARD_INSTRUCTION, DEEP_CUTS_INSTRUCTION } from "../constants";

// The API key is injected by Vite during the build process
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateCover = async (book: Book): Promise<string | null> => {
  try {
    const prompt = `A professional, moody, noir-style mystery thriller atmospheric image. Strictly NO text, NO titles, NO typography, and NO letters. Style: minimalist, dramatic shadows, cinematic lighting, primarily dark tones. ${book.coverPrompt}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to generate cover:", error);
    return null;
  }
};

export const getRecommendations = async (query: string, excludedTitles: string[] = [], mode: SearchMode = 'standard'): Promise<Book[]> => {
  const instruction = mode === 'deep-cuts' ? DEEP_CUTS_INSTRUCTION : STANDARD_INSTRUCTION;
  const modelName = mode === 'deep-cuts' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `SEARCH PARAMETER: "${query}"
    
    TASK: Recommend 6 DIFFERENT real mystery/thriller books.
    
    STRICT EXCLUSIONS:
    1. Do NOT include any books by the author of "${query}" (if the query is an author or title).
    2. Do NOT include the book "${query}" itself.
    3. Do NOT include these specific titles: ${excludedTitles.join(', ')}.
    
    Mode: ${mode.toUpperCase()}.`,
    config: {
      systemInstruction: instruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            description: { type: Type.STRING },
            reason: { type: Type.STRING },
            publishedYear: { type: Type.STRING },
            isbn: { type: Type.STRING },
            coverPrompt: { type: Type.STRING },
          },
          required: ["id", "title", "author", "description", "reason", "publishedYear", "isbn", "coverPrompt"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) return [];
  
  try {
    const data = JSON.parse(text);
    return data.map((b: any) => ({
        ...b,
        id: b.id || Math.random().toString(36).substring(2, 11)
    }));
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return [];
  }
};