import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { storage } from './firebase';
import { formatFileSize } from './teacherPhotoUpload';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions.workerSrc !== pdfWorkerUrl) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

export { pdfjsLib };

export const MAX_LIBRARY_PDF_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_LIBRARY_COVER_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_SEARCH_TEXT_CHARS = 25000;

export interface LibraryStorageStatus {
  configured: boolean;
  bucket: string;
  setupMessage: string;
}

export interface PdfInspectionResult {
  pageCount: number;
  searchText: string;
  ocrRequired: boolean;
  thumbnailBlob: Blob | null;
  thumbnailPreviewUrl: string | null;
}

export interface LibraryUploadResult {
  url: string;
  storagePath: string;
}

export function getLibraryStorageStatus(): LibraryStorageStatus {
  const bucket = (firebaseConfig.storageBucket || '').trim();
  if (!bucket || !storage) {
    return {
      configured: false,
      bucket,
      setupMessage:
        'Firebase Storage is not initialized. Open Firebase Console -> Build -> Storage -> Get Started (requires Firebase Blaze pay-as-you-go plan; free tier includes 5 GB/month storage) and deploy storage.rules before uploading PDF files.',
    };
  }
  return {
    configured: true,
    bucket,
    setupMessage: `Configured bucket: ${bucket} (Ensure Storage is initialized in Firebase Console and storage.rules are deployed).`,
  };
}

export function validateLibraryPdfFile(
  file: Pick<File, 'name' | 'size' | 'type'> | null | undefined
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Please select a PDF book file.' };
  }
  if (file.size <= 0) {
    return { valid: false, error: 'The selected PDF file appears to be empty.' };
  }
  if (file.size > MAX_LIBRARY_PDF_BYTES) {
    return {
      valid: false,
      error: `PDF is too large (${formatFileSize(file.size)}). Maximum allowed PDF file size is 50 MB.`,
    };
  }
  const mime = (file.type || '').trim().toLowerCase();
  const ext = file.name.split('.').pop()?.trim().toLowerCase() || '';
  if (ext !== 'pdf' && mime !== 'application/pdf') {
    return {
      valid: false,
      error: 'Only PDF documents (.pdf) are supported for Digital Library book uploads.',
    };
  }
  if (mime && mime !== 'application/pdf' && mime !== 'application/x-pdf') {
    return {
      valid: false,
      error: 'Unsupported file format. Please choose a valid PDF document.',
    };
  }
  return { valid: true };
}

export function validateBookCoverFile(
  file: Pick<File, 'name' | 'size' | 'type'> | null | undefined
): { valid: boolean; error?: string; extension?: 'jpg' | 'jpeg' | 'png' | 'webp'; contentType?: string } {
  if (!file) {
    return { valid: false, error: 'Please choose a cover image.' };
  }
  if (file.size <= 0) {
    return { valid: false, error: 'Selected cover image appears empty.' };
  }
  if (file.size > MAX_LIBRARY_COVER_BYTES) {
    return {
      valid: false,
      error: `Cover image is too large (${formatFileSize(file.size)}). Maximum allowed cover size is 5 MB.`,
    };
  }
  const mime = (file.type || '').trim().toLowerCase();
  const ext = file.name.split('.').pop()?.trim().toLowerCase() || '';
  const validMimes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
  const validExts = new Set(['jpg', 'jpeg', 'png', 'webp']);
  if ((!validMimes.has(mime) && !validExts.has(ext)) || (mime && !validMimes.has(mime))) {
    return {
      valid: false,
      error: 'Cover image must be JPG, JPEG, PNG, or WEBP.',
    };
  }
  const extension = (validExts.has(ext) ? ext : mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg') as
    | 'jpg'
    | 'jpeg'
    | 'png'
    | 'webp';
  const contentType =
    extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
  return { valid: true, extension, contentType };
}

export async function inspectPdfMetadataAndText(file: File): Promise<PdfInspectionResult> {
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDoc = await loadingTask.promise;

  const pageCount = pdfDoc.numPages;
  const maxPagesToIndex = Math.min(pageCount, 80);
  const chunks: string[] = [];
  let charCount = 0;

  for (let pageNo = 1; pageNo <= maxPagesToIndex; pageNo += 1) {
    if (charCount >= MAX_SEARCH_TEXT_CHARS) break;
    try {
      const page = await pdfDoc.getPage(pageNo);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? String(item.str) : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (pageText) {
        chunks.push(pageText);
        charCount += pageText.length + 1;
      }
    } catch {
      // Skip individual unreadable page text streams cleanly
    }
  }

  const normalizedSearchText = chunks.join(' ').replace(/\s+/g, ' ').trim().slice(0, MAX_SEARCH_TEXT_CHARS);
  const ocrRequired = pageCount > 0 && normalizedSearchText.length < 40;

  // Render Page 1 cover thumbnail onto canvas
  let thumbnailBlob: Blob | null = null;
  let thumbnailPreviewUrl: string | null = null;
  if (pageCount >= 1) {
    try {
      const firstPage = await pdfDoc.getPage(1);
      const rawViewport = firstPage.getViewport({ scale: 1 });
      const targetWidth = 480;
      const scale = Math.min(2, Math.max(0.4, targetWidth / Math.max(1, rawViewport.width)));
      const viewport = firstPage.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await firstPage.render({
          canvas,
          canvasContext: ctx,
          viewport,
        }).promise;
        thumbnailBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.88)
        );
        if (thumbnailBlob) {
          thumbnailPreviewUrl = URL.createObjectURL(thumbnailBlob);
        }
      }
    } catch {
      thumbnailBlob = null;
      thumbnailPreviewUrl = null;
    }
  }

  await loadingTask.destroy();

  return {
    pageCount,
    searchText: normalizedSearchText,
    ocrRequired,
    thumbnailBlob,
    thumbnailPreviewUrl,
  };
}

function mapLibraryStorageError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const msg = error instanceof Error ? error.message : String(error || '');

  if (code === 'storage/bucket-not-found' || code === 'storage/project-not-found' || msg.includes('404')) {
    return 'Firebase Storage bucket is not initialized yet. Open Firebase Console -> Build -> Storage -> Get Started (Blaze pay-as-you-go plan required; 5 GB/month free tier) and deploy storage.rules before uploading PDFs.';
  }
  if (code === 'storage/unauthorized' || code === 'storage/unauthenticated') {
    return 'Upload blocked by Firebase Storage rules. Sign in with a verified Admin or Librarian account and ensure storage.rules are deployed.';
  }
  if (code === 'storage/quota-exceeded') {
    return 'Firebase Storage quota exceeded for this project. Check Billing/Usage in Firebase Console.';
  }
  if (code === 'storage/canceled' || code === 'storage/retry-limit-exceeded') {
    return 'Upload interrupted due to network connectivity. Please check your connection and try again.';
  }
  return msg || 'Unable to upload file to Firebase Storage.';
}

export async function uploadLibraryPdf(
  bookId: string,
  file: File,
  isPublished: boolean,
  onProgress?: (percent: number) => void
): Promise<LibraryUploadResult> {
  const status = getLibraryStorageStatus();
  if (!status.configured || !storage) {
    throw new Error(status.setupMessage);
  }
  const check = validateLibraryPdfFile(file);
  if (!check.valid) {
    throw new Error(check.error || 'Invalid PDF file.');
  }

  const cleanBookId = bookId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const folder = isPublished ? 'public' : 'drafts';
  const storagePath = `library/${folder}/${cleanBookId}/book_${Date.now()}.pdf`;
  const storageRef = ref(storage, storagePath);

  return new Promise<LibraryUploadResult>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: 'application/pdf',
      cacheControl: 'public, max-age=86400',
    });

    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0 && onProgress) {
          onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        }
      },
      (err) => reject(new Error(mapLibraryStorageError(err))),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, storagePath });
        } catch (err) {
          reject(new Error(mapLibraryStorageError(err)));
        }
      }
    );
  });
}

export async function uploadLibraryCover(
  bookId: string,
  fileOrBlob: File | Blob,
  isPublished: boolean
): Promise<LibraryUploadResult> {
  const status = getLibraryStorageStatus();
  if (!status.configured || !storage) {
    throw new Error(status.setupMessage);
  }

  let extension: 'jpg' | 'jpeg' | 'png' | 'webp' = 'jpg';
  let contentType = 'image/jpeg';

  if (fileOrBlob instanceof File) {
    const check = validateBookCoverFile(fileOrBlob);
    if (!check.valid || !check.extension || !check.contentType) {
      throw new Error(check.error || 'Invalid cover image.');
    }
    extension = check.extension;
    contentType = check.contentType;
  } else if (fileOrBlob.type === 'image/png') {
    extension = 'png';
    contentType = 'image/png';
  } else if (fileOrBlob.type === 'image/webp') {
    extension = 'webp';
    contentType = 'image/webp';
  }

  const cleanBookId = bookId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const folder = isPublished ? 'public' : 'drafts';
  const storagePath = `library/${folder}/${cleanBookId}/cover_${Date.now()}.${extension}`;
  const storageRef = ref(storage, storagePath);

  return new Promise<LibraryUploadResult>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, fileOrBlob, {
      contentType,
      cacheControl: 'public, max-age=86400',
    });

    task.on(
      'state_changed',
      undefined,
      (err) => reject(new Error(mapLibraryStorageError(err))),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, storagePath });
        } catch (err) {
          reject(new Error(mapLibraryStorageError(err)));
        }
      }
    );
  });
}

export async function deleteLibraryStorageFile(storagePath?: string): Promise<void> {
  const trimmed = (storagePath || '').trim();
  if (!trimmed || !storage) return;
  try {
    await deleteObject(ref(storage, trimmed));
  } catch {
    // Ignore missing object or unconfigured storage when cleaning up records
  }
}
