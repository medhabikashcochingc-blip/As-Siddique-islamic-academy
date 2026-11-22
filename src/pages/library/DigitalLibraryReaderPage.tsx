import React, { useCallback, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PdfJsReader } from '../../components/library/PdfJsReader';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { hasPermission } from '../../lib/permissions';

export const DigitalLibraryReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { libraryBooks, libraryReadingProgress, upsertRecord } = usePlatform();
  const { userAccount, effectiveRole } = useAuth();
  const lastSavedRef = useRef<{ page: number; ts: number }>({ page: 0, ts: 0 });

  const canManageLib = hasPermission(effectiveRole || undefined, 'manage_library');
  const book = libraryBooks.find((b) => b.id === id);

  const savedProgress = userAccount
    ? libraryReadingProgress.find((p) => p.bookId === book?.id)
    : undefined;

  const handlePageChange = useCallback(
    (page: number, totalPages: number, zoom: number) => {
      if (!book || !userAccount || userAccount.status !== 'active') return;
      const now = Date.now();
      if (lastSavedRef.current.page === page && now - lastSavedRef.current.ts < 5000) {
        return;
      }
      lastSavedRef.current = { page, ts: now };
      const progressId = `${userAccount.uid}_${book.id}`;
      void upsertRecord(
        'libraryReadingProgress',
        progressId,
        {
          id: progressId,
          userUid: userAccount.uid,
          bookId: book.id,
          lastPage: page,
          totalPages,
          zoom,
        },
        `Updated reading progress for ${book.title} to page ${page}`
      ).catch(() => {
        // Ignore silent offline/guest write failures so reading continues uninterrupted
      });
    },
    [book, userAccount, upsertRecord]
  );

  if (!book || (book.status !== 'published' && !canManageLib)) {
    return (
      <div className="min-h-screen bg-[#081A14] text-[#F8F1DF] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="font-serif text-3xl font-semibold text-white">
          Book Unavailable in Reader
        </h1>
        <p className="text-xs text-[#DED7C5] max-w-md">
          The requested book does not exist or is currently saved as an unpublished draft.
        </p>
        <Link
          to="/library"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Digital Library</span>
        </Link>
      </div>
    );
  }

  return (
    <PdfJsReader
      book={book}
      initialPage={savedProgress?.lastPage || 1}
      initialZoom={savedProgress?.zoom || 1}
      onBack={() => navigate(`/library/book/${book.id}`)}
      onPageChange={handlePageChange}
    />
  );
};
