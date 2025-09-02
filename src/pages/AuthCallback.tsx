import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const [msg, setMsg] = useState('로그인 처리 중…')
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase는 기본적으로 URL fragment에서 세션을 파싱한다(detectSessionInUrl=true).
    // 여기서는 성공/실패 메시지 정도만 처리해주자.
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setMsg('로그인 성공! 메인으로 이동합니다…')
        navigate('/', { replace: true })
      } else {
        setMsg('로그인 세션을 찾지 못했습니다. 다시 시도해주세요.')
        navigate('/login', { replace: true })
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <p>{msg}</p>
    </div>
  )
}
