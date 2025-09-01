import SignupForm from '@/features/auth/components/SignupForm'
import { Link, useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  return (
    <div style={{ maxWidth: 420, margin: '40px auto', display: 'grid', gap: 16 }}>
      <h2>회원가입</h2>
      <SignupForm onSuccess={() => navigate('/login')} />
      <p>
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </p>
    </div>
  )
}
