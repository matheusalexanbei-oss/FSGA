import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware simplificado - apenas passa a requisição adiante
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match apenas rotas específicas para evitar conflitos
    '/dashboard/:path*',
    '/products/:path*',
  ],
}



