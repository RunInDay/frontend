import React, { useState } from 'react'
import { isEmail } from '../utils/validators'
import { signInWithEmail } from '../services/auth'

type Props = {
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isEmail(email)) return setError('이메일 형식이 올바르지 않아요.')
    if (!password) return setError('비밀번호를 입력해주세요.')

    try {
      setLoading(true)
      await signInWithEmail({ email, password })
      onSuccess?.()
    } catch (e: any) {
      setError(e.message ?? '로그인에 실패했어요.')
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
        placeholder="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      {error && <p style={{ color: 'tomato' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? '로그인 중…' : '로그인'}
      </button>
    </form>
  )
}
