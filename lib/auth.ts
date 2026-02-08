import { cookies } from 'next/headers';

export const COOKIE_NAME = 'leelo_session';
export const COOKIE_MAX_AGE = 604800; // 7 days

function getSecret(): ArrayBuffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET environment variable is not set');
  const encoded = new TextEncoder().encode(secret);
  return encoded.buffer as ArrayBuffer;
}

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) throw new Error('ADMIN_PASSWORD environment variable is not set');
  return password === adminPassword;
}

async function hmacSign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    getSecret(),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  );
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(signature))));
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({ role: 'admin', iat: Date.now() });
  const signature = await hmacSign(payload);
  const encodedPayload = btoa(payload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [encodedPayload] = token.split('.');
    if (!encodedPayload) return false;
    const payload = atob(encodedPayload);
    const parsed = JSON.parse(payload);
    if (parsed.role !== 'admin') return false;

    const expectedSignature = await hmacSign(payload);
    const actualSignature = token.split('.')[1];
    return expectedSignature === actualSignature;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return verifySessionToken(token);
  } catch {
    return false;
  }
}
