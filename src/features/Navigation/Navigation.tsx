/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Link } from 'react-router-dom'

const Navigation = () => {
  const navLinks = [
    { name: '홈', path: '/search ' },
    { name: '커뮤니티', path: '/community' },
    { name: 'RUN', path: '/running' },
    { name: '내 러닝 지도', path: '/map' },
    { name: '마이페이지', path: '/mypage' },
  ]

  return (
    <nav css={navContainer}>
      <ul css={navList}>
        {navLinks.map((link) => (
          <li key={link.path}>
            <Link to={link.path} css={navLink}>
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
const navContainer = css`
  padding: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
`

const navList = css`
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 0.5rem;
`

const navLink = css`
  font-size: 0.875rem; /* text-sm */
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #60a5fa; /* blue-400 */
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
`
