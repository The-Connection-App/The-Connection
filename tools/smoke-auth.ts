import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';

// Use global fetch enhanced with cookie jar for session persistence.
// Cast to the standard WHATWG fetch type so RequestInit/Response are correct.
const cookieFetch = fetchCookie(globalThis.fetch as any, new CookieJar()) as typeof fetch;

const API = process.env.API_BASE;
if (!API) {
  console.error('API_BASE env var required');
  process.exit(1);
}

(async () => {
  try {
    const loginRes = await cookieFetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'secret123' }),
    });
    if (!loginRes.ok) throw new Error('login failed');

    const meRes = await cookieFetch(`${API}/api/user`);
    if (!meRes.ok) throw new Error('me failed');
    const user = await meRes.json();
    if (!user?.email) throw new Error('me invalid');

    const logoutRes = await cookieFetch(`${API}/api/logout`, { method: 'POST' });
    if (!logoutRes.ok) throw new Error('logout failed');

    console.log('SMOKE OK');
  } catch (e: any) {
    console.error('SMOKE FAIL:', e.message || e);
    process.exit(1);
  }
})();
