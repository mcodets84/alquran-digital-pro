
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500"></div>
      <p className="ml-4 text-lg text-gray-600 dark:text-gray-300">Memuat...</p>
    </div>
  );
};

export default LoadingSpinner;
