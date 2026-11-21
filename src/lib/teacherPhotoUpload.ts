import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { storage } from './firebase';

export const MAX_TEACHER_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_TEACHER_PHOTO_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

export interface PhotoValidationResult {
  valid: boolean;
  error?: string;
  extension?: 'jpg' | 'jpeg' | 'png' | 'webp';
  contentType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface StorageConfigurationStatus {
  configured: boolean;
  bucket: string;
  setupMessage?: string;
}

export interface TeacherPhotoUploadResult {
  photoUrl: string;
  photoStoragePath: string;
}

export function getTeacherStorageStatus(): StorageConfigurationStatus {
  const bucket = (firebaseConfig.storageBucket || '').trim();
  if (!bucket || !storage) {
    return {
      configured: false,
      bucket,
      setupMessage:
        'Firebase Storage is not configured yet. Add a valid "storageBucket" in firebase-applet-config.json and enable Storage in Firebase Console (Build -> Storage) to upload teacher photos.',
    };
  }
  return {
    configured: true,
    bucket,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateTeacherPhotoFile(
  file: Pick<File, 'name' | 'size' | 'type'> | null | undefined
): PhotoValidationResult {
  if (!file) {
    return { valid: false, error: 'Please select an image file.' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'The selected image file appears to be empty.' };
  }

  if (file.size > MAX_TEACHER_PHOTO_BYTES) {
    return {
      valid: false,
      error: `Image is too large (${formatFileSize(file.size)}). Maximum allowed photo size is 5 MB.`,
    };
  }

  const normalizedMime = (file.type || '').trim().toLowerCase();
  const extRaw = file.name.split('.').pop()?.trim().toLowerCase() || '';

  const hasValidMime = ALLOWED_MIME_TYPES.has(normalizedMime);
  const hasValidExt = ALLOWED_EXTENSIONS.has(extRaw);

  if (!hasValidMime && !hasValidExt) {
    return {
      valid: false,
      error: 'Unsupported image format. Please choose a JPG, JPEG, PNG, or WEBP photograph.',
    };
  }

  // Reject mismatch when a non-image MIME type (e.g. application/pdf or image/gif) is explicitly present
  if (normalizedMime && !hasValidMime) {
    return {
      valid: false,
      error: 'Unsupported image format. Please choose a JPG, JPEG, PNG, or WEBP photograph.',
    };
  }

  let extension: 'jpg' | 'jpeg' | 'png' | 'webp' = 'jpg';
  if (hasValidExt) {
    extension = extRaw as 'jpg' | 'jpeg' | 'png' | 'webp';
  } else if (normalizedMime === 'image/png') {
    extension = 'png';
  } else if (normalizedMime === 'image/webp') {
    extension = 'webp';
  } else {
    extension = 'jpg';
  }

  const contentType: 'image/jpeg' | 'image/png' | 'image/webp' =
    extension === 'png'
      ? 'image/png'
      : extension === 'webp'
      ? 'image/webp'
      : 'image/jpeg';

  return {
    valid: true,
    extension,
    contentType,
  };
}

export function mapStorageUploadError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const message = error instanceof Error ? error.message : String(error || '');

  if (code === 'storage/bucket-not-found' || code === 'storage/project-not-found' || message.includes('404')) {
    return 'Firebase Storage bucket is not initialized yet. Enable Storage in Firebase Console (Build -> Storage) and deploy storage.rules before uploading photos.';
  }
  if (code === 'storage/unauthorized' || code === 'storage/unauthenticated') {
    return 'Upload blocked by Firebase Storage permissions. Ensure you are signed in with a verified administrator account and that storage.rules are deployed.';
  }
  if (code === 'storage/retry-limit-exceeded' || code === 'storage/canceled') {
    return 'Network interruption while uploading the photo. Please check your connection and try again.';
  }
  return message || 'Unable to upload teacher photo to Firebase Storage.';
}

export async function uploadTeacherPhoto(
  teacherId: string,
  file: File
): Promise<TeacherPhotoUploadResult> {
  const status = getTeacherStorageStatus();
  if (!status.configured || !storage) {
    throw new Error(
      status.setupMessage ||
        'Firebase Storage is not configured. Please enable Storage in Firebase Console.'
    );
  }

  const validation = validateTeacherPhotoFile(file);
  if (!validation.valid || !validation.extension || !validation.contentType) {
    throw new Error(validation.error || 'Invalid teacher photo.');
  }

  const cleanTeacherId = teacherId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const storagePath = `teachers/${cleanTeacherId}/photo_${Date.now()}.${validation.extension}`;
  const storageRef = ref(storage, storagePath);

  try {
    const snap = await uploadBytes(storageRef, file, {
      contentType: validation.contentType,
      cacheControl: 'public, max-age=86400',
    });
    const photoUrl = await getDownloadURL(snap.ref);
    return {
      photoUrl,
      photoStoragePath: storagePath,
    };
  } catch (err) {
    throw new Error(mapStorageUploadError(err));
  }
}

export async function removeTeacherPhotoFile(photoStoragePath?: string): Promise<void> {
  const trimmedPath = (photoStoragePath || '').trim();
  if (!trimmedPath || !storage) return;
  try {
    await deleteObject(ref(storage, trimmedPath));
  } catch {
    // Ignore missing files or unconfigured Storage so Firestore profile updates always complete cleanly
  }
}
