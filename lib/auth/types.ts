// Auth types - provider agnostic
export interface AuthUser {
  id: string
  email: string
  fullName: string
  displayName?: string
  emailConfirmed: boolean
}

export interface SignupData {
  email: string
  password: string
  fullName: string
  teamName: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: string
  confirmCode?: string
}

export interface SessionData {
  userId: string
  email: string
  expiresAt: Date
}
