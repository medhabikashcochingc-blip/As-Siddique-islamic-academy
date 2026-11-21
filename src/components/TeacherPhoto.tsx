import React, { useEffect, useState } from 'react';
import { AcademyEmblem } from './AcademyEmblem';

interface TeacherPhotoProps {
  photoUrl?: string;
  name: string;
  className?: string;
  emblemClassName?: string;
  fallbackBgClassName?: string;
}

export const TeacherPhoto: React.FC<TeacherPhotoProps> = ({
  photoUrl,
  name,
  className = 'w-full h-full object-cover object-top',
  emblemClassName = 'w-16 h-16',
  fallbackBgClassName = 'w-full h-full flex items-center justify-center bg-[#06452C]',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [photoUrl]);

  const trimmedUrl = (photoUrl || '').trim();

  if (!trimmedUrl || hasError) {
    return (
      <div className={fallbackBgClassName} aria-label={`${name} portrait placeholder`}>
        <AcademyEmblem className={emblemClassName} variant="gold-on-emerald" />
      </div>
    );
  }

  return (
    <img
      src={trimmedUrl}
      alt={name}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
