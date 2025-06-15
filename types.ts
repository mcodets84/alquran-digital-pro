
export interface Surah {
  number: number;
  name: string; // Arabic name
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string; // Meccan or Medinan
}

export interface Ayah {
  number: number; // Overall number in Quran
  numberInSurah: number;
  text: string;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface Edition {
  identifier: string;
  language: string;
  name: string; // Edition name e.g. "Indonesian Translation"
  englishName: string;
  format: string; // "text" or "audio"
  type: string; // "translation", "quran", "transliteration"
  direction: string | null; // "ltr" or "rtl"
}

export interface SurahEditionData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
  edition: Edition;
}

export type SurahDetailResponse = SurahEditionData[];

export interface ProcessedAyah {
  numberInSurah: number;
  arabicText: string;
  translationText: string;
  detailedTransliterationText: string; // Renamed from transliterationText
  simpleTransliterationText: string;   // New field for simplified Latin
  surahNumber: number;
  surahName: string; // Arabic name of the Surah
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // Other types of chunks can be added here if needed
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // Other grounding metadata fields
}

// Keep using GenerateContentResponse based on the guidance
// Do not use the deprecated GenerateContentResult
// This is intentionally left simple as per guidance, actual SDK might have more fields.
export interface GenerateContentResponse {
  text: string; // Simplified for direct text access
  // candidates might exist for more complex scenarios, but direct .text is preferred
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string; [key: string]: any }>; // For more complex parts
      role?: string;
    };
    finishReason?: string;
    citationMetadata?: any; 
    groundingMetadata?: GroundingMetadata;
    // ... other candidate properties
  }>;
}

// For Gemini API request parameters
export interface GenerateContentParameters {
  model: string;
  contents: string | { parts: Array<{ text?: string; inlineData?: any }>, role?: string };
  config?: {
    systemInstruction?: string;
    topK?: number;
    topP?: number;
    temperature?: number;
    responseMimeType?: string;
    seed?: number;
    thinkingConfig?: { thinkingBudget?: number };
    tools?: Array<{ googleSearch: {} }>;
  };
}

export interface Chat {
  sendMessage: (params: { message: string }) => Promise<GenerateContentResponse>;
  sendMessageStream: (params: { message: string }) => Promise<AsyncIterable<GenerateContentResponse>>;
}