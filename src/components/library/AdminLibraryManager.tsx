import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  FolderPlus,
  Image as ImageIcon,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { withBasePath } from '../../lib/assetUrl';
import {
  deleteLibraryStorageFile,
  getLibraryStorageStatus,
  inspectPdfMetadataAndText,
  uploadLibraryCover,
  uploadLibraryPdf,
  validateBookCoverFile,
  validateLibraryPdfFile,
} from '../../lib/libraryUpload';
import { hasPermission } from '../../lib/permissions';
import { formatFileSize } from '../../lib/teacherPhotoUpload';
import {
  LibraryBook,
  LibraryBookPermission,
  LibraryBookStatus,
  LibraryCategory,
  LibraryLanguage,
} from '../../types/platform';

type ManagerTab = 'books' | 'editor' | 'categories';

export const AdminLibraryManager: React.FC = () => {
  const { libraryBooks, libraryCategories, upsertRecord, deleteRecord } = usePlatform();
  const { userAccount, effectiveRole } = useAuth();

  const canManageLib = hasPermission(effectiveRole || undefined, 'manage_library');
  const storageStatus = useMemo(() => getLibraryStorageStatus(), []);

  const [activeTab, setActiveTab] = useState<ManagerTab>('books');
  const [searchFilter, setSearchFilter] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Book editor state
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState<'upload' | 'url'>('upload');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [language, setLanguage] = useState<LibraryLanguage>('Bengali');
  const [categoryId, setCategoryId] = useState<string>(libraryCategories[0]?.id || 'cat-quran-tafsir');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [publicationYear, setPublicationYear] = useState('2026');
  const [permission, setPermission] = useState<LibraryBookPermission>('both');
  const [status, setStatus] = useState<LibraryBookStatus>('published');
  const [featured, setFeatured] = useState(false);

  const [existingPdfUrl, setExistingPdfUrl] = useState('');
  const [existingPdfStoragePath, setExistingPdfStoragePath] = useState('');
  const [existingCoverUrl, setExistingCoverUrl] = useState('');
  const [existingCoverStoragePath, setExistingCoverStoragePath] = useState('');
  const [externalPdfUrl, setExternalPdfUrl] = useState('');

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [autoThumbBlob, setAutoThumbBlob] = useState<Blob | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [ocrRequired, setOcrRequired] = useState<boolean>(false);
  const [inspectingPdf, setInspectingPdf] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Category editor state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catSubcategories, setCatSubcategories] = useState('');
  const [catOrder, setCatOrder] = useState<number>(libraryCategories.length + 1);

  const sortedCategories = useMemo(
    () => [...libraryCategories].sort((a, b) => a.order - b.order),
    [libraryCategories]
  );

  const selectedCatObj = useMemo(
    () => sortedCategories.find((c) => c.id === categoryId) || sortedCategories[0],
    [sortedCategories, categoryId]
  );

  const filteredBooks = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    return libraryBooks.filter((b) => {
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        b.language.toLowerCase().includes(q)
      );
    });
  }, [libraryBooks, searchFilter]);

  const resetBookForm = () => {
    setEditingBookId(null);
    setSourceMode('upload');
    setTitle('');
    setAuthor('');
    setPublisher('');
    setLanguage('Bengali');
    setCategoryId(sortedCategories[0]?.id || 'cat-quran-tafsir');
    setSubcategory('');
    setDescription('');
    setTagsInput('');
    setPublicationYear('2026');
    setPermission('both');
    setStatus('published');
    setFeatured(false);
    setExistingPdfUrl('');
    setExistingPdfStoragePath('');
    setExistingCoverUrl('');
    setExistingCoverStoragePath('');
    setExternalPdfUrl('');
    setPdfFile(null);
    setCoverFile(null);
    setAutoThumbBlob(null);
    setCoverPreviewUrl(null);
    setPageCount(0);
    setFileSizeBytes(0);
    setSearchText('');
    setOcrRequired(false);
    setUploadProgress(null);
    setErrorMsg('');
  };

  const handleStartEditBook = (book: LibraryBook) => {
    setEditingBookId(book.id);
    setSourceMode(book.pdfStoragePath ? 'upload' : 'url');
    setTitle(book.title);
    setAuthor(book.author);
    setPublisher(book.publisher || '');
    setLanguage(book.language);
    setCategoryId(book.categoryId);
    setSubcategory(book.subcategory || '');
    setDescription(book.description || '');
    setTagsInput((book.tags || []).join(', '));
    setPublicationYear(book.publicationYear || '2026');
    setPermission(book.permission);
    setStatus(book.status);
    setFeatured(book.featured);
    setExistingPdfUrl(book.pdfUrl);
    setExistingPdfStoragePath(book.pdfStoragePath || '');
    setExistingCoverUrl(book.coverUrl || '');
    setExistingCoverStoragePath(book.coverStoragePath || '');
    setExternalPdfUrl(book.pdfStoragePath ? '' : book.pdfUrl);
    setPdfFile(null);
    setCoverFile(null);
    setAutoThumbBlob(null);
    setCoverPreviewUrl(book.coverUrl ? withBasePath(book.coverUrl) : null);
    setPageCount(book.pageCount || 0);
    setFileSizeBytes(book.fileSizeBytes || 0);
    setSearchText(book.searchText || '');
    setOcrRequired(Boolean(book.ocrRequired));
    setErrorMsg('');
    setFeedback('');
    setActiveTab('editor');
  };

  const handleSelectPdf = async (file: File | null) => {
    setErrorMsg('');
    if (!file) return;
    const check = validateLibraryPdfFile(file);
    if (!check.valid) {
      setErrorMsg(check.error || 'Invalid PDF file.');
      return;
    }

    setPdfFile(file);
    setFileSizeBytes(file.size);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' '));
    }

    setInspectingPdf(true);
    try {
      const inspected = await inspectPdfMetadataAndText(file);
      setPageCount(inspected.pageCount);
      setSearchText(inspected.searchText);
      setOcrRequired(inspected.ocrRequired);
      if (inspected.thumbnailBlob && !coverFile) {
        setAutoThumbBlob(inspected.thumbnailBlob);
        setCoverPreviewUrl(inspected.thumbnailPreviewUrl);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? `PDF analysis failed: ${err.message}`
          : 'Unable to inspect selected PDF.'
      );
    } finally {
      setInspectingPdf(false);
    }
  };

  const handleSelectCover = (file: File | null) => {
    setErrorMsg('');
    if (!file) return;
    const check = validateBookCoverFile(file);
    if (!check.valid) {
      setErrorMsg(check.error || 'Invalid cover image.');
      return;
    }
    setCoverFile(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFeedback('');

    if (!title.trim() || !author.trim()) {
      setErrorMsg('Book Title and Author are required.');
      return;
    }

    const targetBookId = editingBookId || `book_${Date.now()}`;
    const isPublished = status === 'published';

    setSavingBook(true);
    try {
      let finalPdfUrl = existingPdfUrl;
      let finalPdfStoragePath = existingPdfStoragePath;
      let finalCoverUrl = existingCoverUrl;
      let finalCoverStoragePath = existingCoverStoragePath;

      if (sourceMode === 'upload') {
        if (pdfFile) {
          setUploadProgress(5);
          const uploadedPdf = await uploadLibraryPdf(targetBookId, pdfFile, isPublished, (pct) => {
            setUploadProgress(pct);
          });
          if (existingPdfStoragePath && existingPdfStoragePath !== uploadedPdf.storagePath) {
            await deleteLibraryStorageFile(existingPdfStoragePath);
          }
          finalPdfUrl = uploadedPdf.url;
          finalPdfStoragePath = uploadedPdf.storagePath;
        } else if (!finalPdfUrl) {
          throw new Error('Please choose a PDF file to upload or switch to External HTTPS URL mode.');
        }
      } else {
        const cleanUrl = externalPdfUrl.trim();
        if (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('/media/')) {
          throw new Error('Please provide a valid https:// PDF URL.');
        }
        finalPdfUrl = cleanUrl;
        finalPdfStoragePath = '';
      }

      const coverSource = coverFile || autoThumbBlob;
      if (coverSource && storageStatus.configured) {
        try {
          const uploadedCover = await uploadLibraryCover(targetBookId, coverSource, isPublished);
          if (existingCoverStoragePath && existingCoverStoragePath !== uploadedCover.storagePath) {
            await deleteLibraryStorageFile(existingCoverStoragePath);
          }
          finalCoverUrl = uploadedCover.url;
          finalCoverStoragePath = uploadedCover.storagePath;
        } catch (coverErr) {
          // Do not abort external-URL saves if cover upload fails due to uninitialized Storage
          if (pdfFile) {
            throw coverErr;
          }
        }
      }

      const cleanTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 20);

      const categoryObj = sortedCategories.find((c) => c.id === categoryId) || sortedCategories[0];
      const existingBook = editingBookId
        ? libraryBooks.find((b) => b.id === editingBookId)
        : undefined;

      const payload: Record<string, unknown> = {
        id: targetBookId,
        title: title.trim().slice(0, 240),
        author: author.trim().slice(0, 160),
        publisher: publisher.trim().slice(0, 160),
        language,
        categoryId: categoryObj?.id || categoryId,
        categoryName: categoryObj?.name || 'Islamic Books',
        subcategory: subcategory.trim().slice(0, 120),
        description: description.trim().slice(0, 4000),
        tags: cleanTags,
        publicationYear: publicationYear.trim().slice(0, 20),
        permission,
        status,
        featured,
        pdfUrl: finalPdfUrl,
        fileSizeBytes: fileSizeBytes || existingBook?.fileSizeBytes || 0,
        pageCount: pageCount || existingBook?.pageCount || 0,
        viewsCount: existingBook?.viewsCount ?? 0,
        downloadsCount: existingBook?.downloadsCount ?? 0,
        searchText: (searchText || existingBook?.searchText || '').slice(0, 25000),
        ocrRequired,
        uploadedByUid: existingBook?.uploadedByUid || userAccount?.uid || 'admin',
        uploadedByName: existingBook?.uploadedByName || userAccount?.displayName || 'Library Admin',
      };

      if (finalPdfStoragePath) payload.pdfStoragePath = finalPdfStoragePath;
      if (finalCoverUrl) payload.coverUrl = finalCoverUrl;
      if (finalCoverStoragePath) payload.coverStoragePath = finalCoverStoragePath;

      await upsertRecord(
        'libraryBooks',
        targetBookId,
        payload,
        `${editingBookId ? 'Updated' : 'Published'} Digital Library book: ${title.trim()}`
      );

      setFeedback(
        editingBookId
          ? `Updated "${title.trim()}" in the Digital Islamic Library.`
          : `Added "${title.trim()}" (${status}) to the Digital Islamic Library.`
      );
      resetBookForm();
      setActiveTab('books');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save Digital Library book.');
    } finally {
      setSavingBook(false);
      setUploadProgress(null);
    }
  };

  const handleToggleStatus = async (book: LibraryBook) => {
    const nextStatus: LibraryBookStatus = book.status === 'published' ? 'draft' : 'published';
    await upsertRecord(
      'libraryBooks',
      book.id,
      { ...book, status: nextStatus },
      `Set book "${book.title}" status to ${nextStatus}`
    );
    setFeedback(`"${book.title}" is now ${nextStatus}.`);
  };

  const handleToggleFeatured = async (book: LibraryBook) => {
    await upsertRecord(
      'libraryBooks',
      book.id,
      { ...book, featured: !book.featured },
      `Set book "${book.title}" featured=${!book.featured}`
    );
    setFeedback(`Updated featured flag for "${book.title}".`);
  };

  const handleDeleteBook = async (book: LibraryBook) => {
    await deleteLibraryStorageFile(book.pdfStoragePath);
    await deleteLibraryStorageFile(book.coverStoragePath);
    await deleteRecord('libraryBooks', book.id, `Deleted Digital Library book: ${book.title}`);
    setFeedback(`Deleted "${book.title}".`);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!catName.trim()) {
      setErrorMsg('Category Name is required.');
      return;
    }
    const cleanId =
      editingCatId ||
      `cat_${catName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || Date.now()}`;
    const slug = catName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || cleanId;
    const subs = catSubcategories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);

    const payload: LibraryCategory = {
      id: cleanId,
      name: catName.trim().slice(0, 120),
      slug: slug.slice(0, 120),
      description: catDescription.trim().slice(0, 400),
      subcategories: subs,
      order: Number(catOrder) || sortedCategories.length + 1,
      isActive: true,
    };

    await upsertRecord('libraryCategories', cleanId, payload as unknown as Record<string, unknown>, `Saved category ${payload.name}`);
    setCatName('');
    setCatDescription('');
    setCatSubcategories('');
    setEditingCatId(null);
    setCatOrder(sortedCategories.length + 2);
    setFeedback(`Saved Digital Library category "${payload.name}".`);
  };

  if (!canManageLib) {
    return (
      <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-8 text-center space-y-4">
        <BookOpen className="w-10 h-10 text-[#8A6518] dark:text-[#D9AD43] mx-auto" />
        <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
          As-Siddique Digital Islamic Library
        </h1>
        <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] max-w-md mx-auto">
          Browse and read all published Quranic, Hadith, Arabic, Bengali Islamic, and General School
          books directly inside the public Digital Library.
        </p>
        <Link
          to="/library"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold"
        >
          <BookOpen className="w-4 h-4 text-[#D9AD43]" />
          <span>Open Digital Islamic Library</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6518] dark:text-[#D9AD43]">
            Admin PDF Upload &amp; Catalog Panel
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            As-Siddique Digital Islamic Library
          </h1>
          <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
            জ্ঞান অন্বেষণে উন্মুক্ত ডিজিটাল ইসলামিক লাইব্রেরি · {libraryBooks.length} Total Books
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/library"
            className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D9AD43]/45 bg-white dark:bg-[#102D23] text-xs font-semibold text-[#06452C] dark:text-[#D9AD43]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Public Library</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              resetBookForm();
              setActiveTab('editor');
            }}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D9AD43]" />
            <span>Upload New PDF Book</span>
          </button>
        </div>
      </div>

      {/* Honest Firebase Storage Status Banner */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 text-xs text-[#314A3F] dark:text-[#DED7C5] flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#06452C] dark:text-white">
            Firebase Storage Bucket:{' '}
            {storageStatus.configured ? storageStatus.bucket : 'Not Configured'}
          </p>
          <p>
            Direct PDF &amp; cover file uploads are saved under{' '}
            <code>library/public/&#123;bookId&#125;/</code> or{' '}
            <code>library/drafts/&#123;bookId&#125;/</code>. Note: Firebase Cloud Storage requires
            enabling <strong>Build → Storage → Get Started</strong> in Firebase Console (Blaze
            pay-as-you-go plan; includes 5 GB/month free storage) and deploying{' '}
            <code>storage.rules</code>. If Storage is not yet enabled, use{' '}
            <strong>External Authorized HTTPS URL</strong> mode cleanly.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#D9AD43] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-[#FEE2E2] border border-[#DC2626]/40 text-xs font-semibold text-[#991B1B]">
          {errorMsg}
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'books' as ManagerTab, label: `Manage Books (${libraryBooks.length})` },
          { id: 'editor' as ManagerTab, label: editingBookId ? 'Edit / Replace Book PDF' : 'Upload / Add PDF Book' },
          { id: 'categories' as ManagerTab, label: `Categories (${sortedCategories.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[42px] px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#06452C] text-[#F8F1DF]'
                : 'bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 text-[#314A3F] dark:text-[#E6DFCE]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MANAGE BOOKS */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter books by title, author, category..."
              className="w-full min-h-[42px] ps-9 pe-3 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-4 flex gap-4"
              >
                <div className="w-20 h-28 rounded-lg overflow-hidden bg-[#06452C] border border-[#D9AD43]/30 shrink-0 flex items-center justify-center">
                  {book.coverUrl ? (
                    <img
                      src={withBasePath(book.coverUrl)}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-6 h-6 text-[#D9AD43]" />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43] truncate">
                      {book.status.toUpperCase()} · {book.categoryName} · {book.language}
                      {book.featured ? ' · FEATURED' : ''}
                    </p>
                    <h3 className="font-serif text-lg font-semibold text-[#06452C] dark:text-white truncate">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] truncate">
                      {book.author}
                      {book.pageCount ? ` · ${book.pageCount} pages` : ''}
                      {book.fileSizeBytes ? ` · ${formatFileSize(book.fileSizeBytes)}` : ''}
                    </p>
                    <p className="text-[11px] text-[#314A3F] dark:text-[#C9C2B2] mt-0.5">
                      Access: <strong>{book.permission.replace('_', ' ')}</strong>
                      {book.ocrRequired ? ' · Scanned PDF (OCR recommended for full-text search)' : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20">
                    <button
                      type="button"
                      onClick={() => handleStartEditBook(book)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 text-[11px] font-semibold cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit / Replace PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggleStatus(book)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 text-[11px] font-semibold cursor-pointer"
                    >
                      {book.status === 'published' ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Unpublish</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Publish</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggleFeatured(book)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 text-[11px] font-semibold cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#D9AD43]" />
                      <span>{book.featured ? 'Unfeature' : 'Feature'}</span>
                    </button>
                    <Link
                      to={`/library/read/${book.id}`}
                      className="text-[11px] font-semibold text-[#06452C] dark:text-[#D9AD43] underline px-1"
                    >
                      Read
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDeleteBook(book)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold text-[#991B1B] hover:bg-[#FEE2E2] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD / EDIT BOOK FORM */}
      {activeTab === 'editor' && (
        <form
          onSubmit={handleSaveBook}
          className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-6 space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE6D2] dark:border-[#D9AD43]/20 pb-4">
            <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
              {editingBookId ? 'Edit Book Details or Replace PDF' : 'Upload PDF Book to Digital Library'}
            </h2>
            {editingBookId && (
              <button
                type="button"
                onClick={resetBookForm}
                className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] underline cursor-pointer"
              >
                Cancel Edit / Start New Book
              </button>
            )}
          </div>

          {/* PDF Source Selection */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSourceMode('upload')}
                className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  sourceMode === 'upload'
                    ? 'bg-[#06452C] text-[#F8F1DF]'
                    : 'bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35'
                }`}
              >
                Upload PDF File (Firebase Storage)
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('url')}
                className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  sourceMode === 'url'
                    ? 'bg-[#06452C] text-[#F8F1DF]'
                    : 'bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35'
                }`}
              >
                Authorized External HTTPS PDF URL
              </button>
            </div>

            {sourceMode === 'upload' ? (
              <div className="p-4 rounded-xl bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-dashed border-[#D9AD43]/60 space-y-3">
                <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#06452C] dark:text-white">
                        {pdfFile
                          ? `${pdfFile.name} (${formatFileSize(pdfFile.size)})`
                          : existingPdfUrl
                          ? 'Choose a replacement PDF file (up to 50 MB) or keep current PDF'
                          : 'Select PDF file from device or Android storage (up to 50 MB)'}
                      </p>
                      <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5]">
                        Automatically extracts page count, full-text search index, and Page 1 cover thumbnail.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold shrink-0">
                    Choose PDF
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => void handleSelectPdf(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                {inspectingPdf && (
                  <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                    Inspecting PDF pages, extracting searchable text &amp; rendering thumbnail...
                  </p>
                )}

                {pageCount > 0 && (
                  <p className="text-xs text-[#06452C] dark:text-[#34D399] font-medium">
                    Inspected {pageCount} pages ·{' '}
                    {ocrRequired
                      ? 'Scanned/image PDF detected — full-text search inside this file requires OCR preprocessing.'
                      : `Indexed ${searchText.length.toLocaleString()} characters for instant search.`}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Authorized PDF HTTPS URL *
                </label>
                <input
                  type="text"
                  required={sourceMode === 'url'}
                  placeholder="https://example.com/books/tajweed-guide.pdf"
                  value={externalPdfUrl}
                  onChange={(e) => setExternalPdfUrl(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Cover Image & Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 space-y-3">
              <div className="aspect-[3/4] max-w-[180px] rounded-xl overflow-hidden bg-[#06452C] border border-[#D9AD43]/40 flex items-center justify-center">
                {coverPreviewUrl ? (
                  <img
                    src={coverPreviewUrl}
                    alt="Book cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-[#DED7C5] space-y-1">
                    <ImageIcon className="w-6 h-6 text-[#D9AD43] mx-auto" />
                    <p className="text-[11px]">Cover Thumbnail Preview</p>
                  </div>
                )}
              </div>
              <label className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9AD43]/45 text-xs font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{coverFile ? 'Change Cover Image' : 'Upload Cover (Optional)'}</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(e) => handleSelectCover(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter book title (English, বাংলা, العربية, or اردو)"
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Author *</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author / Scholar name"
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Publisher / Source</label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Publisher or Academy Wing"
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Language *</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LibraryLanguage)}
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                >
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="Arabic">Arabic (العربية)</option>
                  <option value="English">English</option>
                  <option value="Urdu">Urdu (اردو)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Main Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategory('');
                  }}
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                >
                  {sortedCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Subcategory</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                >
                  <option value="">General / Unspecified</option>
                  {(selectedCatObj?.subcategories || []).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Publication Year</label>
                <input
                  type="text"
                  value={publicationYear}
                  onChange={(e) => setPublicationYear(e.target.value)}
                  placeholder="2026"
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Access Permission *</label>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as LibraryBookPermission)}
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                >
                  <option value="both">Read Online &amp; Download Permitted</option>
                  <option value="download">Download Permitted</option>
                  <option value="read_only">Read Online Only (No Download Button)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Publication Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LibraryBookStatus)}
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                >
                  <option value="published">Published (Visible in Public Library)</option>
                  <option value="draft">Draft (Admin &amp; Librarians Only)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">
                  Tags / Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Quran, Tajweed, Makharij, Class 10, বাংলা"
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">Book Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe book contents, target grade or subject scope..."
                  className="w-full p-3 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#06452C]"
                  />
                  <span>Feature on Digital Library Homepage</span>
                </label>

                <button
                  type="submit"
                  disabled={savingBook || inspectingPdf}
                  className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-bold hover:bg-[#102D23] disabled:opacity-50 cursor-pointer"
                >
                  {savingBook
                    ? uploadProgress !== null
                      ? `Uploading PDF (${uploadProgress}%)...`
                      : 'Saving Book...'
                    : editingBookId
                    ? 'Save Book Changes'
                    : 'Upload & Save Book'}
                </button>
              </div>

              {uploadProgress !== null && (
                <div className="sm:col-span-2 space-y-1">
                  <div className="w-full h-2 rounded-full bg-[#F8F1DF] dark:bg-[#081A14] overflow-hidden">
                    <div
                      className="h-full bg-[#D9AD43] transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold tabular-nums text-[#8A6518] dark:text-[#D9AD43]">
                    Uploading to Firebase Storage: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: CATEGORIES & SUBCATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveCategory}
            className="lg:col-span-5 bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 space-y-4 h-fit"
          >
            <div className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
              <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                {editingCatId ? 'Edit Category' : 'Add New Category'}
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g., Quran & Tafsir"
                className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Subcategories (comma-separated)
              </label>
              <input
                type="text"
                value={catSubcategories}
                onChange={(e) => setCatSubcategories(e.target.value)}
                placeholder="Tajweed & Makharij, Tafsir, Hifz"
                className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Description</label>
              <textarea
                rows={2}
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                placeholder="Brief category description..."
                className="w-full p-3 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Display Order</label>
              <input
                type="number"
                min={1}
                value={catOrder}
                onChange={(e) => setCatOrder(Number(e.target.value))}
                className="w-28 min-h-[40px] px-3 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="min-h-[42px] px-5 py-2 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold cursor-pointer"
              >
                {editingCatId ? 'Update Category' : 'Add Category'}
              </button>
              {editingCatId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCatId(null);
                    setCatName('');
                    setCatDescription('');
                    setCatSubcategories('');
                  }}
                  className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] underline cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {sortedCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                    Order #{cat.order} · {libraryBooks.filter((b) => b.categoryId === cat.id).length} books
                  </p>
                  <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-0.5">
                      {cat.description}
                    </p>
                  )}
                  {cat.subcategories.length > 0 && (
                    <p className="text-[11px] text-[#314A3F] dark:text-[#C9C2B2] mt-1">
                      <strong>Subcategories:</strong> {cat.subcategories.join(' · ')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(cat.id);
                      setCatName(cat.name);
                      setCatDescription(cat.description || '');
                      setCatSubcategories(cat.subcategories.join(', '));
                      setCatOrder(cat.order);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 text-xs font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void deleteRecord('libraryCategories', cat.id, `Deleted category ${cat.name}`)
                    }
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#991B1B] hover:bg-[#FEE2E2] cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
