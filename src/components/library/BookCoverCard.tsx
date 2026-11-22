import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { withBasePath } from '../../lib/assetUrl';
import { LibraryBook } from '../../types/platform';
import { AcademyEmblem } from '../AcademyEmblem';

interface BookCoverCardProps {
  book: LibraryBook;
}

export const BookCoverCard: React.FC<BookCoverCardProps> = ({ book }) => {
  const [coverFailed, setCoverFailed] = useState(false);
  const coverSrc = book.coverUrl ? withBasePath(book.coverUrl.trim()) : '';

  return (
    <article className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-hidden flex flex-col justify-between transition-colors hover:border-[#D9AD43]">
      <div>
        <Link
          to={`/library/book/${book.id}`}
          className="block aspect-[3/4] bg-[#06452C] relative overflow-hidden"
        >
          {coverSrc && !coverFailed ? (
            <img
              src={coverSrc}
              alt={`${book.title} cover`}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setCoverFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full p-5 flex flex-col justify-between bg-gradient-to-br from-[#06452C] via-[#0B3A26] to-[#102D23] text-[#F8F1DF] border-s-8 border-[#D9AD43]/60">
              <div className="flex items-center justify-between">
                <AcademyEmblem className="w-7 h-7" variant="gold-on-emerald" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#D9AD43]">
                  {book.language}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#D9AD43] mb-1">
                  {book.categoryName}
                </p>
                <h3 className="font-serif text-lg font-semibold leading-snug text-white line-clamp-4">
                  {book.title}
                </h3>
              </div>
              <p className="text-[11px] text-[#DED7C5] truncate">{book.author}</p>
            </div>
          )}
        </Link>

        <div className="p-4 space-y-1.5">
          <p className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43] truncate">
            {book.language} · {book.categoryName}
            {book.pageCount ? ` · ${book.pageCount}p` : ''}
          </p>
          <h3 className="font-serif text-lg font-semibold text-[#06452C] dark:text-white leading-snug line-clamp-2">
            <Link to={`/library/book/${book.id}`} className="hover:underline">
              {book.title}
            </Link>
          </h3>
          <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] truncate">{book.author}</p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20 flex items-center justify-between gap-2">
        <Link
          to={`/library/book/${book.id}`}
          className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline"
        >
          Book Details
        </Link>
        <Link
          to={`/library/read/${book.id}`}
          className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold hover:bg-[#102D23]"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#D9AD43]" />
          <span>Read Online</span>
        </Link>
      </div>
    </article>
  );
};
