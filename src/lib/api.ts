/**
 * Resolves API paths for both environments.
 *
 * Development uses Vite's /api proxy. In Amplify Hosting, set
 * VITE_API_URL to the API Gateway URL created by the Amplify backend, for
 * example: https://abc123.execute-api.eu-west-2.amazonaws.com.
 */
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return configuredApiUrl ? `${configuredApiUrl}${normalizedPath}` : normalizedPath;
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), init);
}
