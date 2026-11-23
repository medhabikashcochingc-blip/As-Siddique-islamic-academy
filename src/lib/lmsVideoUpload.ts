import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { storage } from './firebase';

export const MAX_LMS_VIDEO_BYTES = 150 * 1024 * 1024; // 150 MB
export const ALLOWED_LMS_VIDEO_ACCEPT =
  '.mp4,.webm,.mov,.m4v,video/mp4,video/webm,video/quicktime';

const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
]);
const ALLOWED_VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'm4v']);

export interface VideoValidationResult {
  valid: boolean;
  error?: string;
  extension?: string;
  contentType?: string;
}

export interface VideoStorageStatus {
  configured: boolean;
  bucket: string;
  setupMessage?: string;
}

export interface UploadedLmsVideoResult {
  videoUrl: string;
  storagePath: string;
}

export const APPROVED_PLAYBOOK_EMBED_URL =
  'https://www.playbook.com/e/as-siddiqueislamicacademy/4RggDwKfDCc5wX4R5uHLA79X?theme=gallery&assetNumber=3&displaySize=medium';

export const APPROVED_PLAYBOOK_IFRAME_TITLE =
  'As-Siddique Islamic Academy Educational Videos';

export function getLmsVideoStorageStatus(): VideoStorageStatus {
  const bucket = (firebaseConfig.storageBucket || '').trim();
  if (!bucket || !storage) {
    return {
      configured: false,
      bucket,
      setupMessage:
        'Firebase Storage is not configured yet. Enable Storage in Firebase Console (Build -> Storage) and deploy storage.rules, or use the approved Playbook Embedded Video URL.',
    };
  }
  return { configured: true, bucket };
}

export function isPlaybookUrl(input: string): boolean {
  const trimmed = (input || '').trim().toLowerCase();
  if (!trimmed) return false;
  return trimmed.includes('playbook.com/');
}

export function isYouTubeUrl(input: string): boolean {
  const trimmed = (input || '').trim().toLowerCase();
  if (!trimmed) return false;
  if (/^[a-zA-Z0-9_-]{11}$/.test((input || '').trim())) return true;
  return (
    trimmed.includes('youtube.com/') ||
    trimmed.includes('youtube-nocookie.com/') ||
    trimmed.includes('youtu.be/')
  );
}

export function resolvePlaybookEmbedUrl(input?: string): string {
  const trimmed = (input || '').trim();
  if (!trimmed || !isPlaybookUrl(trimmed)) {
    return APPROVED_PLAYBOOK_EMBED_URL;
  }
  if (trimmed.includes('playbook.com/e/')) {
    return trimmed;
  }
  return APPROVED_PLAYBOOK_EMBED_URL;
}

export function validateLmsVideoFile(
  file: Pick<File, 'name' | 'size' | 'type'> | null | undefined
): VideoValidationResult {
  if (!file) {
    return { valid: false, error: 'Please select a video file to upload.' };
  }
  if (file.size <= 0) {
    return { valid: false, error: 'The selected video file is empty.' };
  }
  if (file.size > MAX_LMS_VIDEO_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Video file is too large (${mb} MB). Maximum upload size is 150 MB.`,
    };
  }

  const mime = (file.type || '').trim().toLowerCase();
  const ext = file.name.split('.').pop()?.trim().toLowerCase() || '';
  const hasMime = ALLOWED_VIDEO_MIMES.has(mime);
  const hasExt = ALLOWED_VIDEO_EXTS.has(ext);

  if (!hasMime && !hasExt) {
    return {
      valid: false,
      error: 'Unsupported video format. Please upload MP4, WEBM, MOV, or M4V video lectures.',
    };
  }
  if (mime && !hasMime) {
    return {
      valid: false,
      error: 'Unsupported MIME type. Please upload MP4, WEBM, or MOV video lectures.',
    };
  }

  const finalExt = hasExt ? ext : mime === 'video/webm' ? 'webm' : mime === 'video/quicktime' ? 'mov' : 'mp4';
  const finalMime =
    hasMime
      ? mime
      : finalExt === 'webm'
      ? 'video/webm'
      : finalExt === 'mov'
      ? 'video/quicktime'
      : 'video/mp4';

  return {
    valid: true,
    extension: finalExt,
    contentType: finalMime,
  };
}

export async function uploadLmsLectureVideo(
  courseId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadedLmsVideoResult> {
  const status = getLmsVideoStorageStatus();
  if (!status.configured || !storage) {
    throw new Error(
      status.setupMessage || 'Firebase Storage is not configured. Enable Storage in Firebase Console.'
    );
  }

  const validation = validateLmsVideoFile(file);
  if (!validation.valid || !validation.extension || !validation.contentType) {
    throw new Error(validation.error || 'Invalid video file.');
  }

  const cleanCourseId = courseId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const storagePath = `lmsVideos/${cleanCourseId}/lecture_${Date.now()}.${validation.extension}`;
  const storageRef = ref(storage, storagePath);

  return new Promise<UploadedLmsVideoResult>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: validation.contentType,
      cacheControl: 'public, max-age=86400',
    });

    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0 && onProgress) {
          onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        }
      },
      (err) => {
        const msg = err instanceof Error ? err.message : 'Unable to upload video to Firebase Storage.';
        if (msg.includes('404') || msg.includes('bucket-not-found')) {
          reject(
            new Error(
              'Firebase Storage bucket is not initialized yet. Enable Storage in Firebase Console -> Build -> Storage and deploy storage.rules.'
            )
          );
          return;
        }
        if (msg.includes('unauthorized') || msg.includes('unauthenticated')) {
          reject(
            new Error(
              'Video upload blocked by Storage permissions. Ensure you are signed in with a verified Teacher or Admin account and deploy storage.rules.'
            )
          );
          return;
        }
        reject(new Error(msg));
      },
      async () => {
        try {
          const videoUrl = await getDownloadURL(task.snapshot.ref);
          resolve({ videoUrl, storagePath });
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Failed to obtain uploaded video download URL.'));
        }
      }
    );
  });
}

export async function removeLmsLectureVideo(storagePath?: string): Promise<void> {
  const trimmed = (storagePath || '').trim();
  if (!trimmed || !storage) return;
  try {
    await deleteObject(ref(storage, trimmed));
  } catch {
    // Non-blocking cleanup
  }
}
