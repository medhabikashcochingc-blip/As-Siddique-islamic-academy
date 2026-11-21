import React, { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export const ServiceWorkerUpdater: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const pollIntervalRef = useRef<number | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      registrationRef.current = registration;
      if (pollIntervalRef.current !== null) {
        window.clearInterval(pollIntervalRef.current);
      }
      // Automatically detect new builds every 15 minutes while online
      pollIntervalRef.current = window.setInterval(() => {
        if (navigator.onLine) {
          void registration.update();
        }
      }, 15 * 60 * 1000);
    },
    onRegisterError(error) {
      console.error('Service worker registration error:', error);
    },
  });

  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (
        document.visibilityState === 'visible' &&
        navigator.onLine &&
        registrationRef.current
      ) {
        void registrationRef.current.update();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      if (pollIntervalRef.current !== null) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Re-open banner cleanly whenever a newer service worker update arrives
  useEffect(() => {
    if (needRefresh) {
      setDismissed(false);
    }
  }, [needRefresh]);

  if (!needRefresh || dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print fixed bottom-20 lg:bottom-4 right-4 left-4 sm:left-auto z-50 max-w-sm rounded-xl border border-[#D9AD43]/70 bg-[#06452C] p-4 text-xs text-[#F8F1DF] shadow-xl flex items-center gap-3"
    >
      <div className="flex-1">
        <p className="font-semibold text-[#D9AD43]">Update Available</p>
        <p className="text-[11px] text-[#E6DFCE] mt-0.5 leading-relaxed">
          A newer version of As-Siddique Islamic Academy is ready. Click Refresh when you are ready
          to load it.
        </p>
      </div>
      <button
        type="button"
        onClick={() => void updateServiceWorker(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#D9AD43] px-3.5 py-2 text-xs font-semibold text-[#102D23] hover:bg-[#e5be5c] shrink-0 cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Refresh</span>
      </button>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          setNeedRefresh(false);
        }}
        aria-label="Dismiss update notification"
        className="p-1 text-[#DED7C5] hover:text-white cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
