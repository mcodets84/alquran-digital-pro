
import React, { useState, useEffect, useCallback } from 'react';
import { Surah, ProcessedAyah, SurahDetailResponse } from './types';
import { fetchSurahList, fetchSurahDetail } from './services/quranService';
import Navbar from './components/Navbar';
import SurahSelector from './components/SurahSelector';
import AyahView from './components/AyahView';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';

const simplifyTransliteration = (detailedText: string | undefined): string => {
  if (!detailedText) return 'Transliterasi Latin Umum tidak tersedia';
  let simpleText = detailedText;

  // Remove macrons (ā -> a, ī -> i, ū -> u and capitals)
  simpleText = simpleText.replace(/ā/g, 'a').replace(/ī/g, 'i').replace(/ū/g, 'u');
  simpleText = simpleText.replace(/Ā/g, 'A').replace(/Ī/g, 'I').replace(/Ū/g, 'U');

  // Simplify common phonetic symbols from alquran.cloud's en.transliteration
  simpleText = simpleText.replace(/ḥ/g, 'h').replace(/Ḥ/g, 'H'); // For ح
  simpleText = simpleText.replace(/ĥ/g, 'h').replace(/Ĥ/g, 'H'); // Also for ح (another variant)
  // kh (خ), dh (ذ), sh (ش), gh (غ) are often kept as they are reasonably readable
  // simpleText = simpleText.replace(/kh/g, 'kh'); 
  // simpleText = simpleText.replace(/dh/g, 'dh'); 
  // simpleText = simpleText.replace(/sh/g, 'sh');
  // simpleText = simpleText.replace(/gh/g, 'gh'); 
  
  simpleText = simpleText.replace(/ṣ/g, 's').replace(/Ṣ/g, 'S'); // For ص
  simpleText = simpleText.replace(/ḍ/g, 'd').replace(/Ḍ/g, 'D'); // For ض
  simpleText = simpleText.replace(/ṭ/g, 't').replace(/Ṭ/g, 'T'); // For ط
  simpleText = simpleText.replace(/ẓ/g, 'z').replace(/Ẓ/g, 'Z'); // For ظ
  
  // Handle Ayn (ع) and Hamza (ء) - normalize to apostrophe or remove
  simpleText = simpleText.replace(/[ʿʻʽ`']/g, "'"); // Normalize various Ayn and Hamza forms to apostrophe
  // simpleText = simpleText.replace(/[ʿʻʽ`']/g, ""); // Alternative: remove completely

  // Remove other potential diacritics like acute accents if present
  simpleText = simpleText.replace(/[áéíóú]/g, (match) => match.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  simpleText = simpleText.replace(/[ÁÉÍÓÚ]/g, (match) => match.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase());
  
  return simpleText;
};


const App: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(1);
  const [currentSurahData, setCurrentSurahData] = useState<ProcessedAyah[] | null>(null);
  const [currentSurahInfo, setCurrentSurahInfo] = useState<Surah | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSurahList = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const surahList = await fetchSurahList();
        setSurahs(surahList);
        if (surahList.length > 0 && !selectedSurahNumber) {
           //setSelectedSurahNumber(surahList[0].number); // Select first Surah by default
        }
      } catch (err) {
        setError('Gagal memuat daftar surah. Silakan coba lagi nanti.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSurahList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSurahData = useCallback(async (surahNumber: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentSurahData(null); // Clear previous data
      const surahDetail = await fetchSurahDetail(surahNumber);
      
      const arabicEdition = surahDetail.find(ed => ed.edition.identifier === 'quran-uthmani');
      const translationEdition = surahDetail.find(ed => ed.edition.identifier === 'id.indonesian');
      const transliterationEdition = surahDetail.find(ed => ed.edition.identifier === 'en.transliteration');

      if (!arabicEdition || !translationEdition || !transliterationEdition) {
        throw new Error('Data edisi tidak lengkap.');
      }

      const processedAyahs: ProcessedAyah[] = arabicEdition.ayahs.map((ayah, index) => {
        const detailedTranslit = transliterationEdition.ayahs[index]?.text;
        return {
          numberInSurah: ayah.numberInSurah,
          arabicText: ayah.text,
          translationText: translationEdition.ayahs[index]?.text || 'Terjemahan tidak tersedia',
          detailedTransliterationText: detailedTranslit || 'Transliterasi Cara Baca (Detail) tidak tersedia',
          simpleTransliterationText: simplifyTransliteration(detailedTranslit),
          surahNumber: arabicEdition.number,
          surahName: arabicEdition.name, 
        };
      });
      
      setCurrentSurahData(processedAyahs);
      const currentSurah = surahs.find(s => s.number === surahNumber);
      setCurrentSurahInfo(currentSurah || {
        number: arabicEdition.number,
        name: arabicEdition.name,
        englishName: arabicEdition.englishName,
        englishNameTranslation: arabicEdition.englishNameTranslation,
        numberOfAyahs: arabicEdition.numberOfAyahs,
        revelationType: arabicEdition.revelationType,
      });

    } catch (err) {
      setError(`Gagal memuat data Surah ${surahNumber}. Silakan coba lagi nanti.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [surahs]);


  useEffect(() => {
    if (selectedSurahNumber) {
      loadSurahData(selectedSurahNumber);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurahNumber, loadSurahData]); // Do not add loadSurahData here to avoid loop if surahs is in its deps


  const handleSurahSelect = (surahNumber: number) => {
    setSelectedSurahNumber(surahNumber);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-lg p-6 md:p-8">
          <SurahSelector
            surahs={surahs}
            selectedSurahNumber={selectedSurahNumber}
            onSelectSurah={handleSurahSelect}
            disabled={isLoading}
          />

          {isLoading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} />}
          
          {!isLoading && !error && currentSurahData && currentSurahInfo && (
            <AyahView 
              ayahs={currentSurahData} 
              surahInfo={currentSurahInfo}
            />
          )}
           {!isLoading && !error && !currentSurahData && selectedSurahNumber && (
             <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <p>Pilih surah untuk menampilkan ayat.</p>
             </div>
           )}
        </div>
      </div>
      <footer className="text-center py-4 text-sm text-gray-600 dark:text-gray-400">
        Dikembangkan dengan ❤️ untuk kemudahan membaca Al-Quran.
      </footer>
    </div>
  );
};

export default App;
