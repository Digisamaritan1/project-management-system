// Loader.jsx
import React from 'react';
import ReactDOM from 'react-dom';

const Loader = () => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50  bg-opacity-70 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-8 text-[#2F3990] animate-spin border-gray-300 border-t-[#2F3990] rounded-full">
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Loader;
