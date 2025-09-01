import { Route, Routes, Link } from 'react-router-dom'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import AuthCallback from '@/pages/AuthCallback'
import AuthGuard from './features/auth/components/AuthGuard'
import { signOut } from './features/auth/services/auth'

import MyPage from '@/pages/MyPage'
import Map from '@/pages/Map'
import Search from '@/pages/Search'
import Community from '@/pages/Community'

function Home() {
  return (
    <AuthGuard>
      <div style={{ maxWidth: 720, margin: '40px auto' }}>
        <h2>홈</h2>
        <p>로그인된 사용자만 볼 수 있는 페이지입니다.</p>
        <button onClick={() => signOut()}>로그아웃</button>
      </div>
    </AuthGuard>
  )
}

const App = () => {
  return (
    <>
      <nav style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/login">로그인</Link>
        <Link to="/signup">회원가입</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/map" element={<Map />} />
        <Route path="/search" element={<Search />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </>
  )
}

export default App
