import React from 'react'
import { signInWithOAuth } from '../services/auth'

type Props = {
  onLoading?: (loading: boolean) => void
  onError?: (msg: string) => void
}

export default function SocialButtons({ onLoading, onError }: Props) {
  const handle = async (provider: 'google' | 'kakao' | 'naver') => {
    try {
      onLoading?.(true)
      // 구글/카카오/네이버 모두 이 함수 하나로 처리
      await signInWithOAuth(provider)
      // OAuth는 redirect되므로 이후 로직은 보통 실행되지 않음
    } catch (e: any) {
      onError?.(e.message ?? '소셜 로그인 실패')
    } finally {
      onLoading?.(false)
    }
  }

  return (
    <div className="social-buttons" style={{ display: 'grid', gap: 8 }}>
      <button onClick={() => handle('google')}>Continue with Google</button>
      <button onClick={() => handle('kakao')}>카카오로 계속하기</button>
      <button onClick={() => handle('naver')}>네이버로 계속하기</button>
    </div>
  )
}
