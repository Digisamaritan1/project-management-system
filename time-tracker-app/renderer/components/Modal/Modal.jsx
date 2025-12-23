import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-2 flex items-end transition-opacity duration-300 ease-in-out">
      <div className={`bg-white w-full rounded-t-[20px] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Handle for drawer */}
        <div className="w-full flex justify-center pt-2 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-2 max-h-[70vh] overflow-y-scroll scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 