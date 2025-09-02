import { useState } from 'react'
import { isEmail, isStrongPassword } from '../utils/validators'
import { signUpWithEmail } from '../services/auth'

type Props = {
  onSuccess?: () => void
}

export default function SignupForm({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isEmail(email)) return setError('올바른 이메일을 입력하세요.')
    if (!isStrongPassword(password)) return setError('비밀번호는 8자 이상 권장합니다.')

    try {
      setLoading(true)
      await signUpWithEmail({
        email,
        password,
        metadata: { username },
      })
      onSuccess?.()
    } catch (e: any) {
      setError(e.message ?? '회원가입에 실패했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
      <input
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <input
        placeholder="비밀번호 (8자 이상 권장)"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      <input
        placeholder="닉네임 (선택)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && <p style={{ color: 'tomato' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? '가입 중…' : '회원가입'}
      </button>
    </form>
  )
}
