import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;