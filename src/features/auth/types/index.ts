export type SignInValues = {
  email: string
  password: string
}

export type SignUpValues = {
  email: string
  password: string
  metadata?: {
    username?: string
    image?: string
  }
}

/**
 * 'google'은 기본 제공. 'kakao'는
 * - Supabase에서 직접 제공 중이면 그대로 문자열 사용
 * - 그렇지 않으면 Custom OIDC로 등록하고 providerId로 동일 문자열 사용
 */
export type OAuthProvider = 'google' | 'kakao'
