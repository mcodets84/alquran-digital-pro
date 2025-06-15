
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_MODEL_TEXT } from '../constants';
import { GenerateContentResponse, GroundingMetadata } from '../types';


// This function simulates getting the API key from environment variables.
// In a real Node.js environment, `process.env.API_KEY` would be directly accessible.
// In a browser-only environment, this needs careful handling for security.
// For this exercise, we follow the prompt's direction to use `process.env.API_KEY`.
const getApiKey = (): string | undefined => {
  // In a Vite/Create React App setup, env vars prefixed with VITE_ or REACT_APP_ are exposed.
  // Directly using process.env.API_KEY is more of a Node.js pattern.
  // For client-side, this would typically be `import.meta.env.VITE_GEMINI_API_KEY` or `process.env.REACT_APP_GEMINI_API_KEY`.
  // However, the prompt strictly says `process.env.API_KEY`.
  // This will likely be undefined in a pure client-side bundle unless specifically polyfilled or replaced during build.
  // We'll proceed assuming the execution environment somehow provides it.
  return process.env.API_KEY; 
};


interface GenerateTafsirResult {
  text: string;
  groundingMetadata?: GroundingMetadata;
}


export const generateTafsir = async (prompt: string, useGoogleSearch: boolean = false): Promise<GenerateTafsirResult> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key for Gemini not found. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const config: any = { // Use 'any' for config to dynamically add tools or thinkingConfig
      // thinkingConfig: { thinkingBudget: 0 } // Disable thinking for low latency if needed. Omit for higher quality.
    };

    if (useGoogleSearch) {
      config.tools = [{ googleSearch: {} }];
      // IMPORTANT: responseMimeType: "application/json" is NOT supported with googleSearch tool.
    } else {
      // If not using Google Search, you could request JSON, but here we expect text.
      // config.responseMimeType = "application/json"; // If expecting JSON output
    }


    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_API_MODEL_TEXT,
      contents: prompt,
      config: Object.keys(config).length > 0 ? config : undefined,
    });
    
    // Direct text access as per guidance
    const textOutput = response.text;
    
    // Extract grounding metadata if present (typically when tools like googleSearch are used)
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return {
      text: textOutput,
      groundingMetadata: groundingMetadata,
    };

  } catch (error) {
    console.error("Gemini API error:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API request failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred with the Gemini API.");
  }
};
