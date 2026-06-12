import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
