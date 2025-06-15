
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-teal-600 dark:bg-teal-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl md:text-3xl font-bold">Al-Quran Digital Pro</h1>
        <p className="text-sm opacity-90">Baca, Pelajari, dan Renungkan Al-Quran</p>
      </div>
    </nav>
  );
};

export default Navbar;
