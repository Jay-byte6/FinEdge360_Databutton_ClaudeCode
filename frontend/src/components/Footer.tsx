import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
      <div className="container mx-auto max-w-6xl text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} FinEdge360. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
