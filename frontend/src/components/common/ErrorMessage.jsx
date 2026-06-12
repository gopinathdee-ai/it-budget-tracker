import React from 'react';

export default function ErrorMessage({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="p-4 mb-4 bg-red-900/30 border border-red-700 text-red-300 rounded">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-bold text-red-200">Error</p>
          <p className="text-sm text-red-300">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-200 font-bold text-xl transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
