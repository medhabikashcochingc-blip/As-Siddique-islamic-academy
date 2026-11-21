import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'portal' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState<'ios' | 'android' | null>(null);

  // Automatically suppress inside installed standalone PWA or TWA
  if (isInstalled) {
    return null;
  }

  const buttonClasses =
    variant === 'portal'
      ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9AD43]/50 bg-[#06452C] text-[#F8F1DF] text-xs font-semibold hover:bg-[#102D23] transition-colors cursor-pointer'
      : variant === 'compact'
      ? 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#D9AD43]/40 text-[#D9AD43] hover:bg-[#102D23] text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer'
      : 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D9AD43]/55 bg-[#D9AD43]/15 text-[#06452C] dark:text-[#D9AD43] hover:bg-[#D9AD43]/25 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer';

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        aria-label="Install As-Siddique Academy App"
        className={buttonClasses}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS || isAndroid) {
    const mode: 'ios' | 'android' = isIOS ? 'ios' : 'android';
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuide(mode)}
          aria-label={`Install app on ${isIOS ? 'iOS' : 'Android'} device`}
          className={buttonClasses}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span>Install App</span>
        </button>

        {showGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-guide-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <div className="w-full max-w-sm rounded-xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/45 p-6 shadow-xl text-[#102D23] dark:text-[#F8F1DF]">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3
                  id="pwa-install-guide-title"
                  className="font-serif text-xl font-semibold text-[#06452C] dark:text-white"
                >
                  {showGuide === 'ios' ? 'Install on iPhone / iPad' : 'Install on Android Phone'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGuide(null)}
                  aria-label="Close installation guide"
                  className="p-1 rounded hover:bg-[#F8F1DF] dark:hover:bg-[#081A14] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {showGuide === 'ios' ? (
                <ol className="space-y-2 text-xs leading-relaxed text-[#314A3F] dark:text-[#DED7C5] list-decimal list-inside">
                  <li>
                    Tap the <strong>Share</strong> icon in the Safari toolbar.
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> to launch As-Siddique Islamic Academy in app mode.
                  </li>
                </ol>
              ) : (
                <ol className="space-y-2 text-xs leading-relaxed text-[#314A3F] dark:text-[#DED7C5] list-decimal list-inside">
                  <li>
                    Open this site in <strong>Google Chrome</strong> on your Android phone.
                  </li>
                  <li>
                    Tap the three-dot menu (<strong>⋮</strong>) at the top right of Chrome.
                  </li>
                  <li>
                    Tap <strong>Add to Home screen</strong> or <strong>Install app</strong> to open
                    As-Siddique Academy in its own full-screen app window.
                  </li>
                </ol>
              )}
              <button
                type="button"
                onClick={() => setShowGuide(null)}
                className="mt-5 w-full min-h-[44px] py-2 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold hover:bg-[#102D23] cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || !isInstallable || dismissed) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Install Academy App"
      className="no-print bg-[#06452C] text-[#F8F1DF] border-b border-[#D9AD43]/40 px-4 py-2.5"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/pwa-192x192.png"
            alt="As-Siddique Academy App Icon"
            className="w-8 h-8 rounded-lg border border-[#D9AD43]/50 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              Install As-Siddique Academy App
            </p>
            <p className="text-[11px] text-[#DED7C5] truncate">
              Open classes, MCQs &amp; results directly in full-screen app mode.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void install()}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold hover:bg-[#e5be5c] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss install banner"
            className="p-1.5 text-[#DED7C5] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
