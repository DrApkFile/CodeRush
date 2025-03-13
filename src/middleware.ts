import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip middleware for onboarding page and api routes
  if (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname === '/login'
  ) {
    return NextResponse.next();
  }

  // Add your authentication logic here if needed
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
}; 