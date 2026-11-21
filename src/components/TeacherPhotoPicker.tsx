import React, { useEffect, useId, useMemo, useRef } from 'react';
import { AlertTriangle, Camera, ImagePlus, Trash2, UploadCloud, X } from 'lucide-react';
import {
  ALLOWED_TEACHER_PHOTO_ACCEPT,
  formatFileSize,
  getTeacherStorageStatus,
  validateTeacherPhotoFile,
} from '../lib/teacherPhotoUpload';
import { TeacherPhoto } from './TeacherPhoto';

interface TeacherPhotoPickerProps {
  label?: string;
  teacherName?: string;
  existingPhotoUrl?: string;
  selectedFile: File | null;
  removeExistingPhoto?: boolean;
  validationError: string;
  disabled?: boolean;
  onSelectFile: (file: File | null, errorMessage: string) => void;
  onToggleRemoveExisting?: (remove: boolean) => void;
}

export const TeacherPhotoPicker: React.FC<TeacherPhotoPickerProps> = ({
  label = 'Upload Teacher Photo',
  teacherName = 'Teacher',
  existingPhotoUrl = '',
  selectedFile,
  removeExistingPhoto = false,
  validationError,
  disabled = false,
  onSelectFile,
  onToggleRemoveExisting,
}) => {
  const galleryInputId = useId();
  const cameraInputId = useId();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const storageStatus = useMemo(() => getTeacherStorageStatus(), []);

  const previewObjectUrl = useMemo(() => {
    if (!selectedFile) return '';
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [previewObjectUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    e.target.value = '';
    if (!file) return;

    const result = validateTeacherPhotoFile(file);
    if (!result.valid) {
      onSelectFile(null, result.error || 'Invalid teacher photo selected.');
      return;
    }

    if (onToggleRemoveExisting) {
      onToggleRemoveExisting(false);
    }
    onSelectFile(file, '');
  };

  const clearSelectedFile = () => {
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onSelectFile(null, '');
  };

  const effectivePreviewUrl = previewObjectUrl
    ? previewObjectUrl
    : removeExistingPhoto
    ? ''
    : existingPhotoUrl;

  return (
    <div className="rounded-xl border border-[#D9AD43]/40 bg-[#F8F1DF]/60 dark:bg-[#081A14]/70 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#06452C] dark:text-[#D9AD43]">
            {label}
          </p>
          <p className="text-[11px] text-[#5A6D64] dark:text-[#C9C2B2]">
            Supported: JPG, JPEG, PNG, WEBP · Max size: 5 MB · Works from Gallery, Camera, or Computer
          </p>
        </div>
        {selectedFile && (
          <span className="text-[11px] font-medium px-2.5 py-1 rounded bg-[#06452C] text-[#F8F1DF]">
            Ready: {formatFileSize(selectedFile.size)}
          </span>
        )}
      </div>

      {!storageStatus.configured && (
        <div
          role="status"
          className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FEF3C7] dark:bg-[#3A2809] border border-[#D9AD43]/60 text-[#5C3D08] dark:text-[#FDE68A] text-xs"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{storageStatus.setupMessage}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Live Photo Preview */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden border-2 border-[#D9AD43]/50 bg-[#EFE6D2] dark:bg-[#06452C] relative">
          <TeacherPhoto
            photoUrl={effectivePreviewUrl}
            name={teacherName}
            className="w-full h-full object-cover object-top"
            emblemClassName="w-12 h-12"
          />
          {previewObjectUrl && (
            <span className="absolute bottom-1.5 left-1.5 right-1.5 text-center text-[10px] font-semibold bg-[#06452C]/90 text-[#F8F1DF] rounded py-0.5 px-1 truncate">
              New Preview
            </span>
          )}
          {!previewObjectUrl && removeExistingPhoto && existingPhotoUrl && (
            <span className="absolute bottom-1.5 left-1.5 right-1.5 text-center text-[10px] font-semibold bg-[#7F1D1D]/90 text-white rounded py-0.5 px-1">
              Will Remove
            </span>
          )}
        </div>

        {/* Touch-Friendly File & Camera Controls */}
        <div className="flex-1 w-full space-y-2.5">
          <input
            ref={galleryInputRef}
            id={galleryInputId}
            type="file"
            accept={ALLOWED_TEACHER_PHOTO_ACCEPT}
            disabled={disabled}
            onChange={handleFileChange}
            className="sr-only"
          />
          <input
            ref={cameraInputRef}
            id={cameraInputId}
            type="file"
            accept="image/*"
            capture="user"
            disabled={disabled}
            onChange={handleFileChange}
            className="sr-only"
          />

          <div className="flex flex-wrap gap-2.5">
            <label
              htmlFor={galleryInputId}
              className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                disabled
                  ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500 border-gray-300'
                  : 'cursor-pointer bg-[#06452C] text-white border-[#06452C] hover:bg-[#102D23]'
              }`}
            >
              <ImagePlus className="w-4 h-4 shrink-0" />
              <span>Choose Photo (Gallery / Computer)</span>
            </label>

            <label
              htmlFor={cameraInputId}
              className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                disabled
                  ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500 border-gray-300'
                  : 'cursor-pointer bg-white dark:bg-[#102D23] text-[#06452C] dark:text-[#F8F1DF] border-[#D9AD43]/60 hover:bg-[#EFE6D2] dark:hover:bg-[#06452C]'
              }`}
            >
              <Camera className="w-4 h-4 shrink-0 text-[#8A6518] dark:text-[#D9AD43]" />
              <span>Take Photo (Camera)</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {selectedFile && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white dark:bg-[#102D23] border border-[#D9AD43]/40">
                <UploadCloud className="w-3.5 h-3.5 text-[#06452C] dark:text-[#D9AD43]" />
                <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={clearSelectedFile}
                  aria-label="Clear selected photo"
                  className="text-[#7F1D1D] dark:text-[#FCA5A5] hover:opacity-80 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {existingPhotoUrl && !selectedFile && onToggleRemoveExisting && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onToggleRemoveExisting(!removeExistingPhoto)}
                className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                  removeExistingPhoto
                    ? 'bg-[#06452C] text-white border-[#06452C]'
                    : 'bg-white dark:bg-[#102D23] text-[#7F1D1D] dark:text-[#FCA5A5] border-[#7F1D1D]/40 hover:bg-[#FDF2F2]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{removeExistingPhoto ? 'Undo Photo Removal' : 'Remove Current Photo'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {validationError && (
        <p
          role="alert"
          className="text-xs font-medium text-[#7F1D1D] dark:text-[#FCA5A5] bg-[#FDF2F2] dark:bg-[#3B1212] border border-[#F5C2C2]/60 rounded-lg px-3 py-2"
        >
          {validationError}
        </p>
      )}
    </div>
  );
};
