import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FolderOpen, Search, ShieldCheck, SlidersHorizontal, Sparkles, Video } from 'lucide-react';
import { BookCoverCard } from '../../components/library/BookCoverCard';
import { EducationalVideosSection } from '../../components/library/EducationalVideosSection';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { LIBRARY_HERO_IMAGE } from '../../lib/defaultData';
import { hasPermission } from '../../lib/permissions';
import { LibraryLanguage } from '../../types/platform';

const ITEMS_PER_PAGE = 12;

export const DigitalLibraryPage: React.FC<{ initialSearchFocus?: boolean }> = ({
  initialSearchFocus = false,
}) => {
  const { libraryBooks, libraryCategories } = usePlatform();
  const { effectiveRole } = useAuth();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [heroError, setHeroError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | LibraryLanguage>('all');
  const [selectedPermission, setSelectedPermission] = useState<'all' | 'downloadable' | 'read_only'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'title'>('recent');
  const [page, setPage] = useState(1);

  const canManageLib = hasPermission(effectiveRole || undefined, 'manage_library');

  useEffect(() => {
    if (initialSearchFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [initialSearchFocus]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategoryId, selectedSubcategory, selectedLanguage, selectedPermission, sortBy]);

  const publishedBooks = useMemo(
    () => libraryBooks.filter((b) => b.status === 'published'),
    [libraryBooks]
  );

  const activeCategories = useMemo(
    () => [...libraryCategories].filter((c) => c.isActive).sort((a, b) => a.order - b.order),
    [libraryCategories]
  );

  const selectedCategoryObj = useMemo(
    () => activeCategories.find((c) => c.id === selectedCategoryId),
    [activeCategories, selectedCategoryId]
  );

  const availableSubcategories = useMemo(
    () => selectedCategoryObj?.subcategories || [],
    [selectedCategoryObj]
  );

  const isFiltering =
    searchQuery.trim().length > 0 ||
    selectedCategoryId !== 'all' ||
    selectedSubcategory !== 'all' ||
    selectedLanguage !== 'all' ||
    selectedPermission !== 'all';

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = publishedBooks.filter((book) => {
      if (selectedCategoryId !== 'all' && book.categoryId !== selectedCategoryId) return false;
      if (selectedSubcategory !== 'all' && (book.subcategory || '') !== selectedSubcategory) return false;
      if (selectedLanguage !== 'all' && book.language !== selectedLanguage) return false;
      if (selectedPermission === 'downloadable' && book.permission === 'read_only') return false;
      if (selectedPermission === 'read_only' && book.permission !== 'read_only') return false;

      if (!q) return true;
      const haystack = [
        book.title,
        book.author,
        book.publisher || '',
        book.categoryName,
        book.subcategory || '',
        book.language,
        book.description || '',
        ...(book.tags || []),
        book.searchText || '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    const sorted = [...list];
    if (sortBy === 'popular') {
      sorted.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    } else if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.reverse();
    }
    return sorted;
  }, [
    publishedBooks,
    searchQuery,
    selectedCategoryId,
    selectedSubcategory,
    selectedLanguage,
    selectedPermission,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / ITEMS_PER_PAGE));
  const pagedBooks = filteredBooks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const featuredBooks = useMemo(
    () => publishedBooks.filter((b) => b.featured).slice(0, 4),
    [publishedBooks]
  );
  const recentBooks = useMemo(() => [...publishedBooks].reverse().slice(0, 4), [publishedBooks]);
  const popularBooks = useMemo(
    () => [...publishedBooks].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 4),
    [publishedBooks]
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId('all');
    setSelectedSubcategory('all');
    setSelectedLanguage('all');
    setSelectedPermission('all');
    setSortBy('recent');
  };

  return (
    <div className="bg-[#F8F1DF] dark:bg-[#081A14] min-h-screen">
      {/* Library Archival Hero Banner */}
      <section className="relative overflow-hidden bg-[#06452C] text-[#F8F1DF] border-b border-[#D9AD43]/35">
        {!heroError ? (
          <img
            src={LIBRARY_HERO_IMAGE}
            alt="As-Siddique Digital Islamic Library archival reading hall"
            referrerPolicy="no-referrer"
            onError={() => setHeroError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : (
          <div className="absolute inset-0 islamic-lattice-dark opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#042E1D]/95 via-[#06452C]/88 to-[#102D23]/80" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D9AD43]">
                As-Siddique Islamic Academy · Knowledge Archive
              </p>
              <h1
                className="font-serif font-semibold text-white leading-[1.1]"
                style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)' }}
              >
                As-Siddique Digital Islamic Library
              </h1>
              <p className="text-base sm:text-lg text-[#F8F1DF] font-medium">
                জ্ঞান অন্বেষণে উন্মুক্ত ডিজিটাল ইসলামিক লাইব্রেরি
              </p>
              <p className="text-xs sm:text-sm text-[#DED7C5] max-w-2xl leading-relaxed">
                Explore authentic Quran &amp; Tajweed manuals, Hadith compilations, Seerah studies,
                Arabic grammar primers, Bengali Islamic literature, and Class 1–12 textbooks—with
                multi-language full-text search and integrated online PDF reading.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-5 py-3.5 rounded-xl bg-[#102D23]/90 border border-[#D9AD43]/45">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D9AD43]">
                  Available Books
                </p>
                <p className="font-serif text-3xl font-semibold text-white tabular-nums">
                  {publishedBooks.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('educational-videos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="min-h-[46px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#102D23]/90 border border-[#D9AD43]/45 text-[#F8F1DF] text-xs font-bold hover:border-[#D9AD43] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Video className="w-4 h-4 text-[#D9AD43]" />
                <span>Educational Videos</span>
              </button>
              {canManageLib && (
                <Link
                  to="/portal"
                  className="min-h-[46px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9AD43] text-[#102D23] text-xs font-bold hover:bg-[#e5be5c]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Upload PDF</span>
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl">
            <label htmlFor="library-search-input" className="sr-only">
              Search books by title, author, topic, Arabic, Bengali, or inside PDF content
            </label>
            <div className="relative">
              <Search className="w-5 h-5 text-[#D9AD43] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                id="library-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, author, topic, tags, or words inside PDF (English / বাংলা / العربية / اردو)..."
                className="w-full min-h-[52px] ps-12 pe-4 py-3 rounded-xl bg-white dark:bg-[#102D23] text-[#102D23] dark:text-white border border-[#D9AD43]/60 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D9AD43]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Category Strip & Filters */}
        <section
          aria-label="Category and book filters"
          className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId('all');
                setSelectedSubcategory('all');
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategoryId === 'all'
                  ? 'bg-[#06452C] text-[#F8F1DF]'
                  : 'bg-[#F8F1DF] dark:bg-[#081A14] text-[#102D23] dark:text-[#E6DFCE] border border-[#D9AD43]/30 hover:border-[#D9AD43]'
              }`}
            >
              All Categories ({publishedBooks.length})
            </button>
            {activeCategories.map((cat) => {
              const count = publishedBooks.filter((b) => b.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setSelectedSubcategory('all');
                  }}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    selectedCategoryId === cat.id
                      ? 'bg-[#06452C] text-[#F8F1DF]'
                      : 'bg-[#F8F1DF] dark:bg-[#081A14] text-[#102D23] dark:text-[#E6DFCE] border border-[#D9AD43]/30 hover:border-[#D9AD43]'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                Subcategory
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={availableSubcategories.length === 0}
                className="w-full min-h-[42px] px-3 py-2 text-xs rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 disabled:opacity-50"
              >
                <option value="all">All Subcategories</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as 'all' | LibraryLanguage)}
                className="w-full min-h-[42px] px-3 py-2 text-xs rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35"
              >
                <option value="all">All Languages</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Arabic">Arabic (العربية)</option>
                <option value="English">English</option>
                <option value="Urdu">Urdu (اردو)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                Reading Access
              </label>
              <select
                value={selectedPermission}
                onChange={(e) =>
                  setSelectedPermission(e.target.value as 'all' | 'downloadable' | 'read_only')
                }
                className="w-full min-h-[42px] px-3 py-2 text-xs rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35"
              >
                <option value="all">All Access Types</option>
                <option value="downloadable">Read Online &amp; Download Permitted</option>
                <option value="read_only">Read Online Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                Sort Order
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'title')}
                  className="flex-1 min-h-[42px] px-3 py-2 text-xs rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35"
                >
                  <option value="recent">Recently Added</option>
                  <option value="popular">Most Popular</option>
                  <option value="title">Title (A–Z)</option>
                </select>
                {isFiltering && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="min-h-[42px] px-3 rounded-lg border border-[#D9AD43]/40 text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {isFiltering ? (
          /* Filtered Search & Category Results */
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43]" />
                <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
                  Matching Books ({filteredBooks.length})
                </h2>
              </div>
              {totalPages > 1 && (
                <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] tabular-nums">
                  Page {page} of {totalPages}
                </p>
              )}
            </div>

            {pagedBooks.length === 0 ? (
              <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-10 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-[#8A6518] dark:text-[#D9AD43] mx-auto" />
                <h3 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
                  No Books Found Matching Your Criteria
                </h3>
                <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] max-w-md mx-auto">
                  Try clearing filters or searching using broader English, Bengali, Arabic, or Urdu
                  keywords.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-[42px] px-5 py-2 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold cursor-pointer"
                >
                  Show All Available Books
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {pagedBooks.map((book) => (
                    <BookCoverCard key={book.id} book={book} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="min-h-[40px] px-4 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-semibold px-3 tabular-nums">
                      Page {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="min-h-[40px] px-4 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        ) : (
          /* Curated Digital Library Homepage Shelves */
          <div className="space-y-12">
            {/* Featured Books */}
            {featuredBooks.length > 0 && (
              <section className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D9AD43]" />
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white">
                      Featured Books
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {featuredBooks.map((book) => (
                    <BookCoverCard key={book.id} book={book} />
                  ))}
                </div>
              </section>
            )}

            {/* Category Browsing Cards */}
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white">
                  Browse by Category
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCategories.map((cat) => {
                  const count = publishedBooks.filter((b) => b.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSelectedSubcategory('all');
                      }}
                      className="text-left p-5 rounded-xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 hover:border-[#D9AD43] transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                          {cat.name}
                        </h3>
                        <span className="text-xs font-bold tabular-nums text-[#8A6518] dark:text-[#D9AD43]">
                          {count} books
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                      {cat.subcategories.length > 0 && (
                        <p className="text-[11px] text-[#314A3F] dark:text-[#C9C2B2] truncate">
                          {cat.subcategories.join(' · ')}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Recently Added Books */}
            {recentBooks.length > 0 && (
              <section className="space-y-5">
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white">
                  Recently Added Books
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {recentBooks.map((book) => (
                    <BookCoverCard key={book.id} book={book} />
                  ))}
                </div>
              </section>
            )}

            {/* Popular Books */}
            {popularBooks.length > 0 && (
              <section className="space-y-5">
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white">
                  Popular Books
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {popularBooks.map((book) => (
                    <BookCoverCard key={book.id} book={book} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Embedded Playbook Educational Videos Gallery */}
        <EducationalVideosSection />
      </div>
    </div>
  );
};
