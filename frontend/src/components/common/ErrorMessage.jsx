import React from 'react';

export default function ErrorMessage({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-700 hover:text-red-900 font-bold text-xl"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
