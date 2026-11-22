/**
 * Resolves a root-relative static asset or media path against Vite's configured
 * `import.meta.env.BASE_URL`, so builds deployed at either `/` (Firebase Hosting,
 * Cloud Run, local preview) or a subpath like `/As-Siddique-islamic-academy/`
 * (GitHub Pages) load assets reliably on every route.
 */
export function withBasePath(path: string): string {
  if (!path) {
    return path;
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:') ||
    path.startsWith('#')
  ) {
    return path;
  }

  const rawBase = import.meta.env.BASE_URL || '/';
  const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  if (normalizedBase !== '/' && path.startsWith(normalizedBase)) {
    return path;
  }

  const cleanPath = path.replace(/^\/+/, '');
  return `${normalizedBase}${cleanPath}`;
}

export function isStaticOnlyHost(): boolean {
  if (typeof window === 'undefined') return false;
  const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (configuredApiBase) return false;
  return window.location.hostname.endsWith('.github.io');
}

export function resolveApiUrl(path: string): string {
  const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return configuredApiBase ? `${configuredApiBase}${normalizedPath}` : normalizedPath;
}

