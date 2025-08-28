const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.example.com';

export function getCanonicalUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Remove trailing slash if present (except for root)
  const normalizedPath =
    cleanPath.endsWith('/') && cleanPath !== ''
      ? cleanPath.slice(0, -1)
      : cleanPath;

  return `${SITE_URL}${normalizedPath ? `/${normalizedPath}` : ''}`;
}

export function getCurrentUrl(
  pathname: string,
  searchParams?: URLSearchParams
): string {
  const baseUrl = getCanonicalUrl(pathname);

  if (searchParams && searchParams.toString()) {
    return `${baseUrl}?${searchParams.toString()}`;
  }

  return baseUrl;
}
