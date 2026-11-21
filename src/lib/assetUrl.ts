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
  const cleanPath = path.replace(/^\/+/, '');
  return `${normalizedBase}${cleanPath}`;
}
