export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/admin/:path*',
    '/clients/:path*',
    '/projects/:path*',
    '/track/:path*'
  ]
}
