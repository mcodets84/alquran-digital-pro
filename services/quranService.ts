
import { QURAN_API_BASE_URL } from '../constants';
import { Surah, SurahDetailResponse } from '../types';

interface ApiSurahListResponse {
  code: number;
  status: string;
  data: Surah[];
}

interface ApiSurahDetailResponse {
  code: number;
  status: string;
  data: SurahDetailResponse;
}

export const fetchSurahList = async (): Promise<Surah[]> => {
  const response = await fetch(`${QURAN_API_BASE_URL}/surah`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: ApiSurahListResponse = await response.json();
  if (data.code !== 200) {
    throw new Error(`API error! status: ${data.status}`);
  }
  return data.data;
};

export const fetchSurahDetail = async (surahNumber: number): Promise<SurahDetailResponse> => {
  const editions = 'quran-uthmani,id.indonesian,en.transliteration';
  const response = await fetch(`${QURAN_API_BASE_URL}/surah/${surahNumber}/editions/${editions}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} for Surah ${surahNumber}`);
  }
  const data: ApiSurahDetailResponse = await response.json();
   if (data.code !== 200) {
    throw new Error(`API error! status: ${data.status} for Surah ${surahNumber}`);
  }
  return data.data;
};
