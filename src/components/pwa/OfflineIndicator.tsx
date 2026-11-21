import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print fixed bottom-20 lg:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center justify-between gap-3 rounded-xl border border-[#D9AD43]/60 bg-[#102D23] px-4 py-2.5 text-xs font-medium text-[#F8F1DF] shadow-xl"
    >
      <div className="flex items-center gap-2.5">
        <WifiOff className="w-4 h-4 text-[#D9AD43] shrink-0" />
        <span>
          <strong>Offline Mode</strong> — Showing cached academy pages. Live sign-in &amp; saves
          resume automatically when online.
        </span>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-1 rounded-lg bg-[#D9AD43] px-2.5 py-1 text-[11px] font-semibold text-[#102D23] shrink-0 cursor-pointer"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Retry</span>
      </button>
    </div>
  );
};
