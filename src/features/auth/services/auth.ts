import { supabase } from '@/lib/supabase'
import type { SignInValues, SignUpValues, OAuthProvider } from '../types'

/** 이메일/비밀번호 회원가입 */
export async function signUpWithEmail(values: SignUpValues) {
  const { email, password, metadata } = values
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata ?? {}, // { nickname, profile_image, ... }
      emailRedirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL,
    },
  })
  if (error) throw error
  return data
}

/** 이메일/비밀번호 로그인 */
export async function signInWithEmail(values: SignInValues) {
  const { email, password } = values
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/** 소셜 로그인 (Google / Kakao / Naver + Custom OIDC 대응) */
export async function signInWithOAuth(provider: OAuthProvider) {
  // Kakao, Naver가 프로젝트에 "직접 프로바이더"로 있으면 그대로,
  // Custom OIDC로 등록했다면 provider='oidc', providerId 사용
  const redirectTo = import.meta.env.VITE_AUTH_REDIRECT_URL

  // 프로젝트 설정에 맞게 우선순위: direct → oidc
  const directProviders = ['google', 'kakao', 'naver'] as const
  if (directProviders.includes(provider as any)) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: { redirectTo },
    })
    if (error) throw error
    return data
  }

  // OIDC 경로 (providerId: 'kakao' | 'naver' 로 대시보드에서 등록)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'oidc',
    options: { redirectTo, providerId: provider },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

/** 프로필 메타데이터 업데이트 */
export async function updateUserMetadata(metadata: Record<string, any>) {
  const { data, error } = await supabase.auth.updateUser({ data: metadata })
  if (error) throw error
  return data.user
}

/** 비밀번호 재설정 메일 */
export async function requestPasswordReset(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL,
  })
  if (error) throw error
  return data
}
