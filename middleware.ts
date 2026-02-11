import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'leelo_session';

async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return false;

    const [encodedPayload] = token.split('.');
    if (!encodedPayload) return false;

    const payload = atob(encodedPayload);
    const parsed = JSON.parse(payload);
    if (parsed.role !== 'admin') return false;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(payload)
    );
    const expectedSignature = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(signature))));
    const actualSignature = token.split('.')[1];

    return expectedSignature === actualSignature;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isValid = token ? await verifyToken(token) : false;

  const { pathname } = request.nextUrl;

  // API routes: block POST/PUT mutations with 401
  if (pathname.startsWith('/api/')) {
    const method = request.method;
    if (method === 'POST' || method === 'PUT') {
      if (!isValid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  // Page routes: redirect to login
  if (!isValid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/reaping/:path*',
    '/player/new/:path*',
    '/game/new/:path*',
    '/game/edit/:path*',
    '/api/players/:path*',
    '/api/games/:path*',
    '/api/reaping/:path*',
    '/attendance/:path*',
    '/api/attendance/:path*',
  ],
};
