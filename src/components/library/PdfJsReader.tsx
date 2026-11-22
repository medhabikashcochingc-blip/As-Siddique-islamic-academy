import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { withBasePath } from '../../lib/assetUrl';
import { pdfjsLib } from '../../lib/libraryUpload';
import { LibraryBook } from '../../types/platform';

interface PdfSearchMatch {
  pageNumber: number;
  snippet: string;
}

interface PdfJsReaderProps {
  book: LibraryBook;
  initialPage?: number;
  initialZoom?: number;
  onBack: () => void;
  onPageChange?: (page: number, totalPages: number, zoom: number) => void;
  onDownload?: () => void;
}

type ReaderSurface = 'cream' | 'white' | 'night';

export const PdfJsReader: React.FC<PdfJsReaderProps> = ({
  book,
  initialPage = 1,
  initialZoom = 1,
  onBack,
  onPageChange,
  onDownload,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const pageTextCacheRef = useRef<Map<number, string>>(new Map());

  const [loading, setLoading] = useState(true);
  const [renderingPage, setRenderingPage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [totalPages, setTotalPages] = useState(book.pageCount || 1);
  const [currentPage, setCurrentPage] = useState(Math.max(1, initialPage));
  const [pageInput, setPageInput] = useState(String(Math.max(1, initialPage)));
  const [zoom, setZoom] = useState(Math.min(2.5, Math.max(0.6, initialZoom)));
  const [surface, setSurface] = useState<ReaderSurface>('cream');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stageWidth, setStageWidth] = useState(840);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchingPdf, setSearchingPdf] = useState(false);
  const [searchResults, setSearchResults] = useState<PdfSearchMatch[]>([]);
  const [searchScannedNote, setSearchScannedNote] = useState(false);

  const canDownload = book.permission === 'download' || book.permission === 'both';
  const resolvedPdfUrl = withBasePath(book.pdfUrl);

  // Measure reading stage container width for responsive mobile/desktop canvas scaling
  useEffect(() => {
    const updateWidth = () => {
      if (stageRef.current) {
        const w = Math.max(280, stageRef.current.clientWidth - 24);
        setStageWidth(w);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Load PDF document via PDF.js
  useEffect(() => {
    let cancelled = false;
    pageTextCacheRef.current.clear();
    setLoading(true);
    setErrorMsg('');

    const loadingTask = pdfjsLib.getDocument({
      url: resolvedPdfUrl,
      withCredentials: false,
    });

    loadingTask.promise
      .then((doc) => {
        if (cancelled) {
          void loadingTask.destroy();
          return;
        }
        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        const clampedInitial = Math.min(Math.max(1, initialPage), doc.numPages);
        setCurrentPage(clampedInitial);
        setPageInput(String(clampedInitial));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        const raw = err instanceof Error ? err.message : String(err || '');
        if (raw.toLowerCase().includes('cors') || raw.toLowerCase().includes('failed to fetch')) {
          setErrorMsg(
            'Unable to fetch this PDF directly into the browser reader. Ensure the PDF is stored in Firebase Storage with public/authorized read rules or hosted on a CORS-enabled HTTPS origin.'
          );
        } else {
          setErrorMsg(raw || 'Unable to load the requested PDF document.');
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      pdfDocRef.current = null;
      void loadingTask.destroy();
    };
  }, [resolvedPdfUrl, initialPage]);

  // Render active page onto high-DPI canvas
  const renderActivePage = useCallback(async () => {
    const doc = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas || loading) return;

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // Ignore previous render cancellation
      }
    }

    setRenderingPage(true);
    try {
      const page = await doc.getPage(currentPage);
      const baseViewport = page.getViewport({ scale: 1 });
      const fitScale = Math.min(1.65, Math.max(0.45, Math.min(stageWidth, 920) / Math.max(1, baseViewport.width)));
      const effectiveScale = fitScale * zoom;
      const viewport = page.getViewport({ scale: effectiveScale });
      const dpr = Math.min(2.5, window.devicePixelRatio || 1);

      canvas.width = Math.round(viewport.width * dpr);
      canvas.height = Math.round(viewport.height * dpr);
      canvas.style.width = `${Math.round(viewport.width)}px`;
      canvas.style.height = `${Math.round(viewport.height)}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderTask = page.render({
        canvas,
        canvasContext: ctx,
        viewport,
      });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.toLowerCase().includes('cancel')) {
        setErrorMsg('Failed to render this page. Try reloading the book.');
      }
    } finally {
      setRenderingPage(false);
    }
  }, [currentPage, loading, stageWidth, zoom]);

  useEffect(() => {
    void renderActivePage();
  }, [renderActivePage]);

  useEffect(() => {
    setPageInput(String(currentPage));
    if (!loading && totalPages > 0 && onPageChange) {
      onPageChange(currentPage, totalPages, zoom);
    }
  }, [currentPage, totalPages, zoom, loading, onPageChange]);

  const goToPage = (target: number) => {
    const clamped = Math.min(Math.max(1, target), totalPages);
    setCurrentPage(clamped);
  };

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!Number.isNaN(parsed)) {
      goToPage(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen unavailable in restricted browser context
    }
  };

  const handleSearchInsidePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    const doc = pdfDocRef.current;
    if (!term || !doc) return;

    setSearchingPdf(true);
    setSearchScannedNote(false);
    const matches: PdfSearchMatch[] = [];
    let totalExtractedChars = 0;

    for (let p = 1; p <= doc.numPages; p += 1) {
      let pageText = pageTextCacheRef.current.get(p);
      if (pageText === undefined) {
        try {
          const page = await doc.getPage(p);
          const content = await page.getTextContent();
          pageText = content.items
            .map((it) => ('str' in it ? String(it.str) : ''))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          pageTextCacheRef.current.set(p, pageText);
        } catch {
          pageText = '';
        }
      }
      totalExtractedChars += pageText.length;
      const idx = pageText.toLowerCase().indexOf(term);
      if (idx !== -1) {
        const start = Math.max(0, idx - 45);
        const end = Math.min(pageText.length, idx + term.length + 75);
        matches.push({
          pageNumber: p,
          snippet: `${start > 0 ? '...' : ''}${pageText.slice(start, end)}${end < pageText.length ? '...' : ''}`,
        });
      }
    }

    if (totalExtractedChars < 30 && doc.numPages > 0) {
      setSearchScannedNote(true);
    }
    setSearchResults(matches);
    setSearchingPdf(false);
  };

  const handleTriggerDownload = () => {
    if (!canDownload) return;
    if (onDownload) onDownload();
    const a = document.createElement('a');
    a.href = resolvedPdfUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = `${book.title.replace(/[^a-zA-Z0-9\u0980-\u09FF\u0600-\u06FF_-]+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const stageThemeClass =
    surface === 'night'
      ? 'bg-[#081A14] text-[#F8F1DF]'
      : surface === 'white'
      ? 'bg-[#ECEEEB] text-[#102D23]'
      : 'bg-[#EDE3CB] text-[#102D23]';

  return (
    <div
      ref={containerRef}
      onContextMenu={!canDownload ? (e) => e.preventDefault() : undefined}
      className="min-h-screen flex flex-col bg-[#081A14] text-[#F8F1DF]"
    >
      {/* Top Reader Toolbar */}
      <header className="sticky top-0 z-30 bg-[#102D23] border-b border-[#D9AD43]/35 px-3 sm:px-5 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06452C] border border-[#D9AD43]/40 text-xs font-semibold text-[#F8F1DF] hover:bg-[#0B5A3A] cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#D9AD43]" />
              <span>Library</span>
            </button>
            <div className="min-w-0">
              <h1 className="font-serif text-base sm:text-lg font-semibold text-white truncate">
                {book.title}
              </h1>
              <p className="text-[11px] text-[#DED7C5] truncate">
                {book.author} · {book.categoryName} · {book.language}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Page Step Controls */}
            <div className="inline-flex items-center bg-[#081A14] border border-[#D9AD43]/35 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                aria-label="Previous page"
                className="min-h-[38px] px-2.5 text-[#F8F1DF] disabled:opacity-40 hover:bg-[#06452C] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <form onSubmit={handlePageJumpSubmit} className="inline-flex items-center gap-1 px-2 text-xs">
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Current page number"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  className="w-10 text-center bg-transparent text-white font-semibold tabular-nums focus:outline-none border-b border-[#D9AD43]/40"
                />
                <span className="text-[#DED7C5] tabular-nums">/ {totalPages}</span>
              </form>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                aria-label="Next page"
                className="min-h-[38px] px-2.5 text-[#F8F1DF] disabled:opacity-40 hover:bg-[#06452C] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="inline-flex items-center bg-[#081A14] border border-[#D9AD43]/35 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
                aria-label="Zoom out"
                className="min-h-[38px] px-2.5 hover:bg-[#06452C] cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                title="Reset Zoom"
                className="px-2 text-xs font-semibold tabular-nums text-[#D9AD43] cursor-pointer"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
                aria-label="Zoom in"
                className="min-h-[38px] px-2.5 hover:bg-[#06452C] cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Reading Surface Toggle */}
            <div
              role="group"
              aria-label="Reading background surface"
              className="hidden sm:inline-flex items-center bg-[#081A14] border border-[#D9AD43]/35 rounded-lg overflow-hidden text-[11px] font-semibold"
            >
              {(['cream', 'white', 'night'] as ReaderSurface[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSurface(mode)}
                  className={`min-h-[38px] px-2.5 capitalize cursor-pointer ${
                    surface === mode ? 'bg-[#D9AD43] text-[#102D23]' : 'text-[#DED7C5] hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Search Inside PDF Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                searchOpen
                  ? 'bg-[#D9AD43] text-[#102D23] border-[#D9AD43]'
                  : 'bg-[#081A14] border-[#D9AD43]/35 text-[#F8F1DF] hover:bg-[#06452C]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Find in PDF</span>
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="min-h-[38px] inline-flex items-center px-2.5 rounded-lg bg-[#081A14] border border-[#D9AD43]/35 text-[#F8F1DF] hover:bg-[#06452C] cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Admin-Permitted Download Button (strictly suppressed when read_only) */}
            {canDownload ? (
              <button
                type="button"
                onClick={handleTriggerDownload}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold hover:bg-[#e5be5c] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-[#D9AD43] px-2">
                Read Online Only
              </span>
            )}
          </div>
        </div>

        {/* Collapsible In-PDF Text Search Bar */}
        {searchOpen && (
          <div className="max-w-7xl mx-auto mt-2.5 pt-2.5 border-t border-[#D9AD43]/25 space-y-2">
            <form onSubmit={handleSearchInsidePdf} className="flex flex-wrap gap-2">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Bengali, Arabic, English, or Urdu words inside this PDF..."
                className="flex-1 min-w-[220px] min-h-[40px] px-3 py-1.5 rounded-lg bg-[#081A14] border border-[#D9AD43]/40 text-xs text-white placeholder:text-[#A9B7AF]"
              />
              <button
                type="submit"
                disabled={searchingPdf || !searchTerm.trim()}
                className="min-h-[40px] px-4 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {searchingPdf ? 'Scanning Pages...' : 'Search PDF'}
              </button>
            </form>

            {searchScannedNote && (
              <p className="text-xs text-[#FCD34D]">
                This document appears to be an image-scanned PDF without embedded text layers; full-text search requires an OCR-processed PDF.
              </p>
            )}

            {searchResults.length > 0 && (
              <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                {searchResults.map((match) => (
                  <button
                    key={match.pageNumber}
                    type="button"
                    onClick={() => goToPage(match.pageNumber)}
                    className="text-left p-2 rounded-lg bg-[#081A14] border border-[#D9AD43]/30 hover:border-[#D9AD43] text-xs cursor-pointer"
                  >
                    <p className="font-bold text-[#D9AD43]">Page {match.pageNumber}</p>
                    <p className="text-[11px] text-[#DED7C5] line-clamp-2">{match.snippet}</p>
                  </button>
                ))}
              </div>
            )}

            {!searchingPdf && searchTerm.trim() && searchResults.length === 0 && !searchScannedNote && (
              <p className="text-xs text-[#DED7C5]">No matching text found in this document.</p>
            )}
          </div>
        )}
      </header>

      {/* Main Document Canvas Stage */}
      <div
        ref={stageRef}
        className={`flex-1 overflow-auto p-3 sm:p-6 flex flex-col items-center ${stageThemeClass}`}
      >
        {loading ? (
          <div className="my-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#D9AD43] mx-auto" />
            <p className="text-sm font-medium">Opening PDF Reader...</p>
          </div>
        ) : errorMsg ? (
          <div className="my-16 max-w-lg w-full p-6 rounded-xl bg-[#102D23] text-[#F8F1DF] border border-[#D9AD43]/40 space-y-3 text-center">
            <AlertCircle className="w-8 h-8 text-[#D9AD43] mx-auto" />
            <h2 className="font-serif text-xl font-semibold text-white">Unable to Render Document</h2>
            <p className="text-xs text-[#DED7C5] leading-relaxed">{errorMsg}</p>
            {canDownload && (
              <button
                type="button"
                onClick={handleTriggerDownload}
                className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Open / Download PDF Directly</span>
              </button>
            )}
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-4">
            <div className="relative bg-white shadow-xl border border-[#D9AD43]/35 rounded-sm overflow-hidden">
              <canvas ref={canvasRef} className="block max-w-none" />
              {renderingPage && (
                <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#06452C]" />
                </div>
              )}
            </div>

            {/* Bottom Page Turn Bar (mobile friendly touch targets >= 44px) */}
            <div className="flex items-center gap-3 pb-4">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#102D23] text-[#F8F1DF] border border-[#D9AD43]/40 text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Page</span>
              </button>
              <span className="text-xs font-semibold tabular-nums px-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#8A6518]" />
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#06452C] text-[#F8F1DF] border border-[#D9AD43]/40 text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                <span>Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
