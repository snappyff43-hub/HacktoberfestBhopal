import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Film, User, Volume2, Clock, Check } from 'lucide-react';

export default function CreditSafetyModal({
  isOpen,
  onClose,
  onConfirm,
  project,
  avatar,
  voice,
  durationSeconds = 60,
  loading = false,
}) {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  // Approximate credits: HeyGen standard is 1 credit per minute of generated video
  const estimatedCredits = Math.ceil((durationSeconds || 60) / 60);

  const handleConfirm = () => {
    if (!confirmed) return;
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-lg w-full nm-card-lg p-6 sm:p-8 bg-[#eef2f7] border border-white/80 shadow-2xl relative">
        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shadow-[2px_2px_6px_#cbd5e1,-2px_-2px_6px_#ffffff]">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Confirm Video Generation
            </h3>
            <p className="text-xs text-slate-500">
              HeyGen V3 Credit Authorization & Review Gate
            </p>
          </div>
        </div>

        {/* Warning callout */}
        <div className="nm-inset p-4 rounded-xl mb-6 flex items-start gap-3 bg-amber-50/50 border border-amber-200/60 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Strict Safety Rule:</span> This action will invoke the official HeyGen V3 video generation engine and may deduct credits from your active workspace balance.
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="nm-card-sm p-4 space-y-3 mb-6 bg-white/40">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-indigo-500" /> Project Title
            </span>
            <span className="font-semibold text-slate-800 max-w-[220px] truncate text-right">
              {project?.title || 'Untitled Video'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" /> Selected Avatar
            </span>
            <span className="font-semibold text-slate-800">
              {avatar?.avatar_name || avatar?.name || 'Dante Office 2'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-indigo-500" /> Selected Voice
            </span>
            <span className="font-semibold text-slate-800">
              {voice?.voice_name || voice?.name || 'Leanne (en-US)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" /> Video Duration
            </span>
            <span className="font-semibold text-slate-800">
              ~{durationSeconds} Seconds
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-bold text-indigo-900">
              Estimated Credit Cost:
            </span>
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-xs">
              {estimatedCredits} Credit{estimatedCredits > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* User Approval Checkbox */}
        <label className="flex items-start gap-3 p-3 rounded-xl nm-inset cursor-pointer mb-6 select-none bg-white/50">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer accent-indigo-600"
          />
          <span className="text-xs font-medium text-slate-700 leading-snug">
            I verify that this script has been reviewed and I authorize CreatorFlow AI to render this video using HeyGen V3.
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl nm-button text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!confirmed || loading}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              confirmed && !loading
                ? 'nm-button-primary cursor-pointer'
                : 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 shadow-none'
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Initiating Render...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Authorize & Render
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
