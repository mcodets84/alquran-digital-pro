
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-200 p-4 my-4 rounded-md" role="alert">
      <p className="font-bold">Oops! Terjadi Kesalahan</p>
      <p>{message}</p>
    </div>
  );
};

export default ErrorDisplay;
