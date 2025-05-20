import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4 mt-8">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 bg-primary-500 rounded-full"></div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Selendra Explorer</div>
        <p className="text-gray-500">Test Component</p>
      </div>
    </div>
  );
};

export default TestComponent;
