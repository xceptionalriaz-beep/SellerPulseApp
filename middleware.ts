import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes — no auth needed
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/reset-password', '/auth/callback']
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith('/auth/'))

  if (isPublic) {
    return NextResponse.next()
  }

  // Check for session cookie
  const token = request.cookies.get('sb-ohgejewwsnbyouozymcc-auth-token')?.value
    ?? request.cookies.get('supabase-auth-token')?.value
    ?? request.cookies.get('sb-access-token')?.value

  // If no token and trying to access dashboard, redirect to login
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}