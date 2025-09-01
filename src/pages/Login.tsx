import { useState } from 'react'
import LoginForm from '@/features/auth/components/LoginForm'
import SocialButtons from '@/features/auth/components/SocialButtons'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [socialLoading, setSocialLoading] = useState(false)
  const [socialError, setSocialError] = useState<string | null>(null)
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', display: 'grid', gap: 16 }}>
      <h2>로그인</h2>
      <LoginForm onSuccess={() => navigate('/')} />
      <div style={{ textAlign: 'center' }}>또는</div>
      <SocialButtons onLoading={setSocialLoading} onError={setSocialError} />
      {socialLoading && <p>소셜 로그인 리다이렉트 중…</p>}
      {socialError && <p style={{ color: 'tomato' }}>{socialError}</p>}
      <p>
        아직 계정이 없나요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  )
}