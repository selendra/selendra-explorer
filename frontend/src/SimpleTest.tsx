import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">Selendra Explorer</h1>
        <p className="text-gray-600 text-center mb-6">Testing Tailwind CSS</p>
        <div className="flex justify-center">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Click Me
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;
