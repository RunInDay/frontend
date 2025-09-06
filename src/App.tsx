import { Route, Routes } from 'react-router-dom'
import Login from '@/pages/Login'
import MyPage from '@/pages/MyPage'
import Map from '@/pages/Map'
import Search from '@/pages/Search'
import Community from '@/pages/Community'
import Navigation from '@/features/Navigation/Navigation'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/map" element={<Map />} />
        <Route path="/search" element={<Search />} />
        <Route path="/community" element={<Community />} />
      </Routes>
      <Navigation />
    </>
  )
}

export default App
