
import React, { useState, useEffect } from 'react';
import { generateTafsir } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { GroundingChunk } from '../types';

interface GeminiTafsirProps {
  surahNumber: number;
  surahName: string; // English name often used in APIs
  ayahNumber: number;
  arabicText: string;
  translationText: string;
}

const GeminiTafsir: React.FC<GeminiTafsirProps> = ({ surahNumber, surahName, ayahNumber, arabicText, translationText }) => {
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[] | null>(null);

  useEffect(() => {
    const fetchTafsir = async () => {
      // Check for API_KEY presence. If not available, show message and don't proceed.
      // Note: As per instructions, process.env.API_KEY is assumed to be set in the environment.
      // A real-world app might have more robust handling if it can be optional.
      if (!process.env.API_KEY) {
        setError("Kunci API Gemini tidak tersedia. Fitur refleksi AI tidak dapat digunakan.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setTafsir(null);
      setSources(null);

      try {
        const prompt = `Berikan refleksi singkat atau penjelasan sederhana (seperti tafsir ringkas) untuk ayat Al-Quran berikut: "${arabicText}" (Surah ${surahName} [${surahNumber}], Ayat ${ayahNumber}). Terjemahan Indonesianya adalah: "${translationText}". Fokus pada pesan utama, hikmah, atau pelajaran praktis yang bisa diambil. Jawab dalam Bahasa Indonesia. Jika relevan dan Anda menggunakan informasi dari pencarian Google, sebutkan sumbernya.`;
        
        // Example of possibly asking for search grounding. This might change API behavior.
        // For general tafsir, grounding might not always be needed unless the question is about current events related to the verse.
        // For this example, let's assume we might want grounding if the AI deems it necessary.
        // const useGoogleSearch = true; // or false depending on the desired behavior

        const result = await generateTafsir(prompt, false); // Set useGoogleSearch to true to enable grounding
        
        setTafsir(result.text);
        if (result.groundingMetadata?.groundingChunks && result.groundingMetadata.groundingChunks.length > 0) {
          setSources(result.groundingMetadata.groundingChunks);
        }

      } catch (err) {
        console.error("Error fetching AI tafsir:", err);
        setError("Gagal mendapatkan refleksi AI. Mohon coba beberapa saat lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTafsir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahNumber, ayahNumber, arabicText, translationText, surahName]); // Re-fetch if key props change

  if (isLoading) {
    return (
      <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
        <ErrorDisplay message={error} />
      </div>
    );
  }

  if (!tafsir) {
    return null; // Or some placeholder if needed
  }

  return (
    <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-teal-50 dark:bg-gray-700 rounded-b-lg">
      <h4 className="text-md font-semibold text-teal-700 dark:text-teal-300 mb-2">Refleksi AI (Gemini):</h4>
      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{tafsir}</p>
      {sources && sources.length > 0 && (
        <div className="mt-3">
          <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Sumber (via Google Search):</h5>
          <ul className="list-disc list-inside text-xs">
            {sources.map((source, index) => (
              source.web && (
                <li key={index} className="text-gray-500 dark:text-gray-400">
                  <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:underline text-teal-600 dark:text-teal-400">
                    {source.web.title || source.web.uri}
                  </a>
                </li>
              )
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GeminiTafsir;
