import styled from '@emotion/styled'
import { useState } from 'react'

interface Post {
  id: string
  type: 'general' | 'recruitment'
  author: string
  profileImage?: string
  title: string
  content?: string
  image?: string
  likes: number
  comments: number
  maxParticipants?: number
  currentParticipants?: number
}

const mockPosts: Post[] = [
  {
    id: '1',
    type: 'general',
    author: '사용자1',
    title: '러닝화 추천쫌',
    content: '뭐사지예 ..',
    likes: 21,
    comments: 3,
  },
  {
    id: '2',
    type: 'recruitment',
    author: '사용자2',
    title: '오늘 저녁에 명지 러닝하실분',
    content: '러닝 진심남들 구함니다 연락 주세여',
    image: '/placeholder-image.jpg',
    likes: 21,
    comments: 3,
    maxParticipants: 3,
    currentParticipants: 1,
  },
  {
    id: '3',
    type: 'recruitment',
    author: '사용자3',
    profileImage: '/placeholder-profile.jpg',
    title: '저랑. 가치 러닝할 분들 연락 부탁 드림다.',
    content: '러닝하면서 힘냅시다.',
    likes: 21,
    comments: 3,
    maxParticipants: 5,
    currentParticipants: 1,
  },
  {
    id: '4',
    type: 'general',
    author: '사용자4',
    title: '러닝하면 기분이 조크든여',
    content: '굿띠예',
    likes: 21,
    comments: 3,
  },
]

const Community = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'recruitment'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = mockPosts.filter((post) => {
    if (activeTab === 'recruitment') {
      return post.type === 'recruitment'
    }
    return true
  })

  return (
    <Container>
      {/* Navigation Header */}
      <Header>
        <NavContent>
          <BackButton>&#8249;</BackButton>
          <Title>Title</Title>
          <MenuButton>&#8942;</MenuButton>
        </NavContent>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon>🔍</SearchIcon>
        </SearchContainer>
      </Header>

      {/* Category Tabs */}
      <TabContainer>
        <TabButton
          $active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        >
          전체
        </TabButton>
        <TabButton
          $active={activeTab === 'recruitment'}
          onClick={() => setActiveTab('recruitment')}
        >
          러너 모집글
        </TabButton>
        <TabUnderline />
      </TabContainer>

      {/* Posts List */}
      <PostsList>
        {filteredPosts.map((post, index) => (
          <div key={post.id}>
            <PostItem>
              <PostHeader>
                <UserInfo>
                  <ProfileImage
                    src={post.profileImage || '/default-profile.png'}
                    alt={post.author}
                  />
                  <AuthorName>{post.author}</AuthorName>
                </UserInfo>
                {post.type === 'recruitment' && (
                  <RecruitmentBadge>
                    <BadgeText>러너 모집글</BadgeText>
                    <ParticipantCount>
                      현재 인원 {post.currentParticipants}/{post.maxParticipants}
                    </ParticipantCount>
                  </RecruitmentBadge>
                )}
              </PostHeader>

              <PostContent>
                <PostTitle>{post.title}</PostTitle>
                {post.content && <PostText>{post.content}</PostText>}
              </PostContent>

              {post.image && (
                <PostImage src={post.image} alt="Post image" />
              )}

              <PostActions>
                <ActionButton>
                  <HeartIcon>♡</HeartIcon>
                  <ActionCount>{post.likes}</ActionCount>
                </ActionButton>
                <ActionButton>
                  <CommentIcon>💬</CommentIcon>
                  <ActionCount>{post.comments}</ActionCount>
                </ActionButton>
              </PostActions>
            </PostItem>
            {index < filteredPosts.length - 1 && <Divider />}
          </div>
        ))}
      </PostsList>

      {/* Floating Action Button */}
      <FloatingButton>
        <PlusIcon>+</PlusIcon>
      </FloatingButton>
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg-white);
  max-width: 480px;
  margin: 0 auto;
`

const Header = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 0 16px;
  border-bottom: 1px solid var(--color-gray-200);
`

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 600;
`

const Time = styled.span`
  color: var(--color-text-black);
`

const BatteryIcon = styled.span`
  font-size: 12px;
`

const NavContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  height: 44px;
`

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: var(--color-primary);
  cursor: pointer;
`

const Title = styled.h1`
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-black);
`

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: var(--color-text-black);
  cursor: pointer;
`

const SearchContainer = styled.div`
  position: relative;
  margin: 8px 0 16px 0;
`

const SearchInput = styled.input`
  width: 100%;
  height: 36px;
  background: rgba(118, 118, 128, 0.12);
  border: none;
  border-radius: 10px;
  padding: 0 16px 0 40px;
  font-size: 17px;
  color: var(--color-text-black);

  &::placeholder {
    color: rgba(60, 60, 67, 0.6);
  }

  &:focus {
    outline: none;
    background: rgba(118, 118, 128, 0.16);
  }
`

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: rgba(60, 60, 67, 0.6);
`

const TabContainer = styled.div`
  position: relative;
  display: flex;
  background: var(--color-bg-white);
  padding: 0 16px;
`

const TabButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  color: ${(props) => 
    props.$active ? 'var(--color-text-black)' : 'var(--color-gray-500)'};
  cursor: pointer;
  margin-right: 20px;
`

const TabUnderline = styled.div`
  position: absolute;
  bottom: 0;
  left: 16px;
  width: 47px;
  height: 2px;
  background: var(--color-text-black);
`

const PostsList = styled.div`
  flex: 1;
  padding: 0 16px;
  overflow-y: auto;
`

const PostItem = styled.div`
  padding: 16px 0;
`

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const ProfileImage = styled.img`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--color-gray-200);
  object-fit: cover;
`

const AuthorName = styled.span`
  font-size: 14px;
  color: var(--color-text-black);
`

const RecruitmentBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const BadgeText = styled.span`
  background: var(--color-gray-200);
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-black);
`

const ParticipantCount = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-black);
`

const PostContent = styled.div`
  margin-bottom: 12px;
`

const PostTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-black);
  margin-bottom: 4px;
  line-height: 1.2;
`

const PostText = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-black);
  line-height: 1.2;
`

const PostImage = styled.img`
  width: 100%;
  max-width: 297px;
  height: 169px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 12px;
`

const PostActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const ActionButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`

const HeartIcon = styled.span`
  font-size: 16px;
  color: var(--color-text-black);
`

const CommentIcon = styled.span`
  font-size: 16px;
`

const ActionCount = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-black);
`

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: var(--color-gray-200);
  margin: 0;
`

const FloatingButton = styled.button`
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 28px;
  height: 28px;
  background: var(--color-text-black);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`

const PlusIcon = styled.span`
  color: var(--color-text-white);
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
`

const BottomNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--color-bg-white);
  border-top: 1px solid var(--color-gray-200);
  padding: 8px 0 16px 0;
  height: 72px;
`

const NavItem = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${(props) =>
    props.$active ? 'var(--color-primary)' : 'var(--color-gray-500)'};
  cursor: pointer;
`

const NavIcon = styled.div`
  font-size: 16px;
`

const NavLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
`

const RunButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text-black);
  cursor: pointer;
`

export default Community