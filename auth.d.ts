import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    tenant: {
      id: string
    }
  }

  interface Session {
    user: User
  }
}
