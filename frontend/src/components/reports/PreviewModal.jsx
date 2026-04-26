import { memo } from "react";
import { X } from "lucide-react";

function PreviewModal({ image, onClose }) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-white/20 bg-white p-5 shadow-2xl animate-[fadeIn_.18s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Selfie Preview</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <img
          src={image}
          alt="Selfie preview"
          className="max-h-[75vh] w-full rounded-2xl border border-slate-100 object-contain"
        />
      </div>
    </div>
  );
}

export default memo(PreviewModal);
