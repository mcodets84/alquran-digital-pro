import React from 'react';
import { ProcessedAyah, Surah } from '../types';
import GeminiTafsir from './GeminiTafsir';

interface AyahViewProps {
  ayahs: ProcessedAyah[];
  surahInfo: Surah;
}

// Helper function to colorize Arabic text with Tajweed rules
const colorizeArabicText = (text: string): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  let currentString = "";
  let i = 0;

  const isArabicLetter = (char: string | undefined): boolean => {
    if (!char) return false;
    const code = char.charCodeAt(0);
    // Basic Arabic letters U+0621 to U+064A, plus Alif Wasla U+0671
    return (code >= 0x0621 && code <= 0x064A) || code === 0x0671;
  };

  const isHarokatChar = (char: string | undefined): boolean => {
    if (!char) return false;
    const charCode = char.charCodeAt(0);
    return (
      (charCode >= 0x064B && charCode <= 0x0655) || // Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra, Shadda, Sukun
      charCode === 0x0670 || // SMALL ALEF (superscript alef for madd)
      charCode === 0x06E1    // SMALL HIGH DOTLESS HEAD OF KHAH (for some saktah marks) - less common for harokat
      // Note: 0x0651 (Shadda) is handled, 0x0652 (Sukun) is handled.
    );
  };


  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];
    const afterNextChar = text[i + 2];

    // 1. Ghunnah: نّ (Noon Mushaddadah) or مّ (Meem Mushaddadah) - Green
    if ((char === '\u0646' || char === '\u0645') && nextChar === '\u0651') {
      if (currentString) { elements.push(currentString); currentString = ""; }
      elements.push(<span key={`ghunnah-${i}`} className="text-green-500 dark:text-green-400">{char}{nextChar}</span>);
      i += 2;
      continue;
    }

    // 2. Madd Tabi'i (Natural Madd) - Purple for letter & madd letter, Red for harokat
    // Fatha + Alif (ا), Alif Maqsura (ى), or Superscript Alif (ٰ - U+0670)
    if (isArabicLetter(char) && nextChar === '\u064E' && (afterNextChar === '\u0627' || afterNextChar === '\u0649' || afterNextChar === '\u0670')) {
        if (currentString) { elements.push(currentString); currentString = ""; }
        elements.push(<span key={`madd-char-${i}`} className="text-purple-500 dark:text-purple-400">{char}</span>);
        elements.push(<span key={`madd-harokat-${i+1}`} className="text-red-500 dark:text-red-400">{nextChar}</span>);
        elements.push(<span key={`madd-letter-${i+2}`} className="text-purple-500 dark:text-purple-400">{afterNextChar}</span>);
        i += 3;
        continue;
    }
    // Kasra + Ya (ي) - assuming Ya after Kasra implies Madd if no other harakat on Ya
     if (isArabicLetter(char) && nextChar === '\u0650' && afterNextChar === '\u064A' && !isHarokatChar(text[i+3])) {
        if (currentString) { elements.push(currentString); currentString = ""; }
        elements.push(<span key={`madd-char-${i}`} className="text-purple-500 dark:text-purple-400">{char}</span>);
        elements.push(<span key={`madd-harokat-${i+1}`} className="text-red-500 dark:text-red-400">{nextChar}</span>);
        elements.push(<span key={`madd-letter-${i+2}`} className="text-purple-500 dark:text-purple-400">{afterNextChar}</span>);
        i += 3;
        continue;
    }
    // Dhamma + Waw (و) - assuming Waw after Dhamma implies Madd if no other harakat on Waw
    if (isArabicLetter(char) && nextChar === '\u064F' && afterNextChar === '\u0648' && !isHarokatChar(text[i+3])) {
        if (currentString) { elements.push(currentString); currentString = ""; }
        elements.push(<span key={`madd-char-${i}`} className="text-purple-500 dark:text-purple-400">{char}</span>);
        elements.push(<span key={`madd-harokat-${i+1}`} className="text-red-500 dark:text-red-400">{nextChar}</span>);
        elements.push(<span key={`madd-letter-${i+2}`} className="text-purple-500 dark:text-purple-400">{afterNextChar}</span>);
        i += 3;
        continue;
    }
    
    // 3. Waqf Lazim (Compulsory Stop - Meem) - Maroon/Dark Red
    if (char === '\u06D8' || char === '\u06E2') { // ۡ (ARABIC SMALL HIGH MEEM ISOLATED FORM U+06E2) or (ARABIC SMALL HIGH MEEM U+06D8)
      if (currentString) { elements.push(currentString); currentString = ""; }
      elements.push(<span key={`waqf-lazim-${i}`} className="text-red-700 dark:text-red-500">{char}</span>);
      i += 1;
      continue;
    }

    // 4. Waqf Mamnu' (Forbidden Stop - Laam-Alif) - Orange
    if (char === '\u06D9') { // ۙ (ARABIC SMALL HIGH LAM ALEF)
      if (currentString) { elements.push(currentString); currentString = ""; }
      elements.push(<span key={`waqf-mamnu-${i}`} className="text-orange-500 dark:text-orange-400">{char}</span>);
      i += 1;
      continue;
    }

    // 5. Harokat (General Diacritics) - Red
    // (Includes Shaddah U+0651 if not part of Ghunnah, and U+0670 if not part of Madd)
    if (isHarokatChar(char)) {
      if (currentString) { elements.push(currentString); currentString = ""; }
      elements.push(<span key={`harokat-${i}`} className="text-red-500 dark:text-red-400">{char}</span>);
      i += 1;
      continue;
    }

    // 6. Other Quranic Stop Marks & End of Ayah symbol - Blue
    // Includes: صلى (U+06D6), قلى (U+06D7), ج (U+06DA - Jeem), ∴ (U+06DB - Thalatha), ۗ (U+06D8 - Meem, already handled as Lazim specific, but can be here as general too if not differentiated), ۚ (U+06DA - Jeem, also above), ۩ (U+06E9 - Sajda symbol often), ۝ (U+06DD - End of Ayah)
    // Adding more common Waqf marks: ۖ (Qala), ۗ (Sala), ۚ (Jeem)
    const blueStopMarks = ['\u06D6', '\u06D7', '\u06DA', '\u06DB', '\u06DC', '\u06DD', '\u06D8', '\u06E9', '\u06DE', '\u06DF', '\u06E0', '\u06E3', '\u06E4', '\u06E7', '\u06E8', '\u06EA', '\u06EB', '\u06EC', '\u06ED'];
    if (blueStopMarks.includes(char) && char !== '\u06D8' && char !== '\u06E2') { // Avoid re-coloring specific meem waqf
      if (currentString) { elements.push(currentString); currentString = ""; }
      elements.push(<span key={`stop-${i}`} className="text-blue-500 dark:text-blue-400">{char}</span>);
      i += 1;
      continue;
    }
    
    // 7. Default character (part of Arabic word or other symbols)
    currentString += char;
    i += 1;
  }

  if (currentString) {
    elements.push(currentString);
  }
  return elements;
};


const AyahCard: React.FC<{ ayah: ProcessedAyah, surahName: string }> = ({ ayah, surahName }) => {
  const [showTafsir, setShowTafsir] = React.useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
          QS {ayah.surahNumber}:{ayah.numberInSurah}
        </span>
      </div>
      
      <p lang="ar" className="arabic-text text-2xl md:text-3xl lg:text-4xl mb-6 leading-relaxed text-gray-800 dark:text-gray-200">
        {colorizeArabicText(ayah.arabicText)}
      </p>
      
      {ayah.simpleTransliterationText && ayah.simpleTransliterationText !== 'Transliterasi Latin Umum tidak tersedia' && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Latin Umum:</p>
          <p className="text-sm italic text-gray-600 dark:text-gray-400">
            {ayah.simpleTransliterationText}
          </p>
        </div>
      )}
      
      {ayah.detailedTransliterationText && ayah.detailedTransliterationText !== 'Transliterasi Cara Baca (Detail) tidak tersedia' && (
         <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Cara Baca (Detail):</p>
          <p className="text-sm italic text-red-600 dark:text-red-500 font-bold">
            {ayah.detailedTransliterationText}
          </p>
        </div>
      )}
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {ayah.translationText}
      </p>

      <button
        onClick={() => setShowTafsir(!showTafsir)}
        className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium py-1 px-3 rounded-md border border-teal-500 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-expanded={showTafsir}
        aria-controls={`tafsir-${ayah.surahNumber}-${ayah.numberInSurah}`}
      >
        {showTafsir ? 'Sembunyikan Refleksi AI' : 'Dapatkan Refleksi AI'}
      </button>

      {showTafsir && (
        <div id={`tafsir-${ayah.surahNumber}-${ayah.numberInSurah}`}>
          <GeminiTafsir
            surahNumber={ayah.surahNumber}
            surahName={surahName} 
            ayahNumber={ayah.numberInSurah}
            arabicText={ayah.arabicText}
            translationText={ayah.translationText}
          />
        </div>
      )}
    </div>
  );
};


const AyahView: React.FC<AyahViewProps> = ({ ayahs, surahInfo }) => {
  if (!ayahs || ayahs.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-8">Tidak ada ayat untuk ditampilkan.</p>;
  }

  const bismillahText = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"; 

  return (
    <div className="mt-8">
      <div className="text-center mb-8 p-4 bg-teal-50 dark:bg-gray-700 rounded-lg">
        <h2 className="text-3xl font-bold text-teal-700 dark:text-teal-300 arabic-text">{surahInfo.name}</h2>
        <p className="text-xl text-teal-600 dark:text-teal-400">{surahInfo.englishName} - "{surahInfo.englishNameTranslation}"</p>
        <p className="text-md text-gray-600 dark:text-gray-400">{surahInfo.revelationType} - {surahInfo.numberOfAyahs} Ayat</p>
      </div>
      
      {surahInfo.number !== 1 && surahInfo.number !== 9 && ( 
         <p lang="ar" className="arabic-text text-3xl md:text-4xl text-center my-6 text-gray-700 dark:text-gray-300">
           {colorizeArabicText(bismillahText)}
         </p>
       )}

      <div>
        {ayahs.map((ayah) => (
          <AyahCard key={`${ayah.surahNumber}-${ayah.numberInSurah}`} ayah={ayah} surahName={surahInfo.englishName} />
        ))}
      </div>
    </div>
  );
};

export default AyahView;