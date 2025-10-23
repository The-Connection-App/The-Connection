import { API_BASE } from 'shared-env';

export type HttpInit = Omit<RequestInit, 'body' | 'credentials'> & { body?: unknown };

function sanitizeApiBase(raw: string | undefined | null): string {
  if (!raw) return '';

  const trimmed = raw.trim();
  if (!trimmed) return '';

  const withoutWhitespace = trimmed.replace(/\s+/g, '');
  const normalizedProtocol = withoutWhitespace
    .replace(/^(https?):(?=[^/])/i, (_, protocol: string) => `${protocol.toLowerCase()}://`)
    .replace(/^(https?):\/(?!\/)/i, (_, protocol: string) => `${protocol.toLowerCase()}://`);

  return normalizedProtocol;
}

function composeUrl(path: string): string {
  const isAbsoluteHttp = /^https?:\/\//i.test(path);
  if (isAbsoluteHttp) return path;

  const sanitizedBase = sanitizeApiBase(API_BASE);
  const hadRawBase = Boolean(API_BASE && API_BASE.trim().length > 0);

  if (sanitizedBase) {
    if (/^https?:\/\//i.test(sanitizedBase) || sanitizedBase.startsWith('/')) {
      const base = sanitizedBase.replace(/\/+$/, '');
      return `${base}${path.startsWith('/') ? path : `/${path}`}`;
    }

    throw new Error(
      `Invalid API_BASE value "${API_BASE}". Expected an HTTPS URL (e.g. https://api.example.com) or a relative "/api" path.`
    );
  }

  if (hadRawBase) {
    throw new Error(
      `Invalid API_BASE value "${API_BASE}". Expected an HTTPS URL (e.g. https://api.example.com) or a relative "/api" path.`
    );
  }

  if (path.startsWith('/')) return path; // allow same-origin absolute paths in web dev/tests

  throw new Error(
    'API_BASE is not set. Use an absolute "/api/..." path in web dev/tests or configure API_BASE.'
  );
}

export async function http<T>(path: string, init: HttpInit = {}): Promise<T> {
  const url = composeUrl(path);
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = json?.message || json?.error || res.statusText || 'Request failed';
    throw Object.assign(new Error(msg), { status: res.status, data: json });
  }
  return json as T;
}
