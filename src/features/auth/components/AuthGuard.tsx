import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getSession } from '../services/auth'
import { useNavigate } from 'react-router-dom'

type Props = { children: React.ReactNode }

export default function AuthGuard({ children }: Props) {
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const session = await getSession()
      if (!session) {
        navigate('/login', { replace: true })
      }
      if (mounted) setReady(true)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate('/login', { replace: true })
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [navigate])

  if (!ready) return null
  return <>{children}</>
}
