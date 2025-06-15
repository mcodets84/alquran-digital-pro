
import React from 'react';
import { Surah } from '../types';

interface SurahSelectorProps {
  surahs: Surah[];
  selectedSurahNumber: number | null;
  onSelectSurah: (surahNumber: number) => void;
  disabled?: boolean;
}

const SurahSelector: React.FC<SurahSelectorProps> = ({ surahs, selectedSurahNumber, onSelectSurah, disabled }) => {
  if (!surahs.length) {
    return <p className="text-center text-gray-500 dark:text-gray-400 my-4">Memuat daftar surah...</p>;
  }

  return (
    <div className="mb-8">
      <label htmlFor="surah-select" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        Pilih Surah:
      </label>
      <select
        id="surah-select"
        value={selectedSurahNumber || ''}
        onChange={(e) => onSelectSurah(Number(e.target.value))}
        disabled={disabled}
        className="block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
      >
        <option value="" disabled>-- Pilih Surah --</option>
        {surahs.map((surah) => (
          <option key={surah.number} value={surah.number}>
            {surah.number}. {surah.englishName} ({surah.name}) - {surah.numberOfAyahs} ayat
          </option>
        ))}
      </select>
    </div>
  );
};

export default SurahSelector;
