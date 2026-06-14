import { FaExclamationTriangle } from 'react-icons/fa';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isDangerous = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          {isDangerous && <FaExclamationTriangle className="text-2xl text-red-500" />}
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>

        <p className="text-slate-300 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 text-white rounded-lg font-medium transition-all ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
