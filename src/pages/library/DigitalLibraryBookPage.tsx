import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, Lock, Search } from 'lucide-react';
import { AcademyEmblem } from '../../components/AcademyEmblem';
import { BookCoverCard } from '../../components/library/BookCoverCard';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { withBasePath } from '../../lib/assetUrl';
import { hasPermission } from '../../lib/permissions';
import { formatFileSize } from '../../lib/teacherPhotoUpload';

export const DigitalLibraryBookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { libraryBooks, libraryReadingProgress } = usePlatform();
  const { userAccount, effectiveRole } = useAuth();
  const [coverFailed, setCoverFailed] = useState(false);

  const canManageLib = hasPermission(effectiveRole || undefined, 'manage_library');
  const book = libraryBooks.find((b) => b.id === id);

  if (!book || (book.status !== 'published' && !canManageLib)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43]">
          As-Siddique Digital Islamic Library
        </p>
        <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
          Book Unavailable
        </h1>
        <p className="text-sm text-[#5A6D64] dark:text-[#DED7C5]">
          This publication could not be found or has not been published for public viewing yet.
        </p>
        <Link
          to="/library"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Digital Library</span>
        </Link>
      </div>
    );
  }

  const savedProgress = userAccount
    ? libraryReadingProgress.find((p) => p.bookId === book.id)
    : undefined;
  const canDownload = book.permission === 'download' || book.permission === 'both';
  const coverSrc = book.coverUrl ? withBasePath(book.coverUrl.trim()) : '';
  const resolvedPdfUrl = withBasePath(book.pdfUrl);

  const relatedBooks = libraryBooks
    .filter(
      (b) =>
        b.id !== book.id &&
        b.status === 'published' &&
        (b.categoryId === book.categoryId || b.language === book.language)
    )
    .slice(0, 4);

  return (
    <div className="bg-[#F8F1DF] dark:bg-[#081A14] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <button
            type="button"
            onClick={() => navigate('/library')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Digital Islamic Library</span>
          </button>
        </div>

        <article className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Book Cover */}
          <div className="lg:col-span-4">
            <div className="aspect-[3/4] max-w-xs mx-auto rounded-xl overflow-hidden border border-[#D9AD43]/40 bg-[#06452C] shadow-md">
              {coverSrc && !coverFailed ? (
                <img
                  src={coverSrc}
                  alt={`${book.title} cover`}
                  referrerPolicy="no-referrer"
                  onError={() => setCoverFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-[#06452C] to-[#102D23] text-[#F8F1DF]">
                  <AcademyEmblem className="w-9 h-9" variant="gold-on-emerald" />
                  <div>
                    <p className="text-xs font-semibold text-[#D9AD43] mb-1">{book.categoryName}</p>
                    <h2 className="font-serif text-2xl font-semibold text-white leading-snug">
                      {book.title}
                    </h2>
                  </div>
                  <p className="text-xs text-[#DED7C5]">{book.author}</p>
                </div>
              )}
            </div>
          </div>

          {/* Book Metadata & Actions */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6518] dark:text-[#D9AD43]">
                {book.categoryName}
                {book.subcategory ? ` · ${book.subcategory}` : ''}
                {book.status === 'draft' ? ' · DRAFT PREVIEW' : ''}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#06452C] dark:text-white mt-1.5">
                {book.title}
              </h1>
              <p className="text-sm font-medium text-[#314A3F] dark:text-[#DED7C5] mt-1">
                By {book.author}
                {book.publisher ? ` · ${book.publisher}` : ''}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/library/read/${book.id}`}
                className="min-h-[46px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#06452C] text-[#F8F1DF] text-sm font-semibold hover:bg-[#102D23]"
              >
                <BookOpen className="w-4 h-4 text-[#D9AD43]" />
                <span>
                  {savedProgress && savedProgress.lastPage > 1
                    ? `Continue Reading (Page ${savedProgress.lastPage} / ${savedProgress.totalPages})`
                    : 'Read Online'}
                </span>
              </Link>

              {canDownload ? (
                <a
                  href={resolvedPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="min-h-[46px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D9AD43]/50 bg-[#F8F1DF] dark:bg-[#081A14] text-sm font-semibold text-[#06452C] dark:text-[#D9AD43] hover:border-[#D9AD43]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                  <Lock className="w-3.5 h-3.5" />
                  Read Online Only (Download Restricted by Admin)
                </span>
              )}
            </div>

            {book.description && (
              <div className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                  Synopsis &amp; Academic Scope
                </h2>
                <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            {/* Archival Specification Grid */}
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20 text-xs">
              <div>
                <dt className="text-[#5A6D64] dark:text-[#C9C2B2]">Language</dt>
                <dd className="font-semibold text-[#06452C] dark:text-white mt-0.5">{book.language}</dd>
              </div>
              <div>
                <dt className="text-[#5A6D64] dark:text-[#C9C2B2]">Publication Year</dt>
                <dd className="font-semibold text-[#06452C] dark:text-white mt-0.5 tabular-nums">
                  {book.publicationYear || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[#5A6D64] dark:text-[#C9C2B2]">Total Pages</dt>
                <dd className="font-semibold text-[#06452C] dark:text-white mt-0.5 tabular-nums">
                  {book.pageCount ? `${book.pageCount} pages` : 'PDF Reader'}
                </dd>
              </div>
              <div>
                <dt className="text-[#5A6D64] dark:text-[#C9C2B2]">File Size</dt>
                <dd className="font-semibold text-[#06452C] dark:text-white mt-0.5 tabular-nums">
                  {book.fileSizeBytes ? formatFileSize(book.fileSizeBytes) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[#5A6D64] dark:text-[#C9C2B2]">Full-Text Search</dt>
                <dd className="font-semibold text-[#06452C] dark:text-white mt-0.5 inline-flex items-center gap-1">
                  <Search className="w-3 h-3 text-[#D9AD43]" />
                  <span>{book.ocrRequired ? 'Scanned PDF (OCR recommended)' : 'Indexed & Searchable'}</span>
                </dd>
              </div>
              <div>
                <dt className="text-[#5A6D64] dark:text-[#C9C2B2]">Views / Downloads</dt>
                <dd className="font-semibold text-[#06452C] dark:text-white mt-0.5 tabular-nums">
                  {book.viewsCount} views · {book.downloadsCount} downloads
                </dd>
              </div>
            </dl>

            {book.tags && book.tags.length > 0 && (
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                <strong className="text-[#06452C] dark:text-[#D9AD43]">Keywords:</strong>{' '}
                {book.tags.join(' · ')}
              </p>
            )}
          </div>
        </article>

        {relatedBooks.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
              Related Publications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedBooks.map((item) => (
                <BookCoverCard key={item.id} book={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
