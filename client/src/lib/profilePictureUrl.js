// API endpoints and media are siblings; never append /uploads to /api.
export function profilePictureUrl(imageUrl, apiBase = '/api') {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (!imageUrl.startsWith('/uploads/')) return null;
  return /^https?:\/\//i.test(apiBase) ? new URL(imageUrl, apiBase).href : imageUrl;
}
