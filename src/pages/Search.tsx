import { useState, useEffect, useCallback } from 'react'
import styled from '@emotion/styled'
import { searchKeyword, searchFestival, getAreaBasedList, searchAllCategories } from '@/features/search'
import { searchRunningCourses } from '@/features/search/services/durunubiApi'
import type { TourItem, ContentType } from '@/features/search'
import { ContentTypeMap } from '@/features/search'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
`

const Header = styled.header`
  background: white;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 16px;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: #f9f9f9;
  
  &:focus {
    outline: none;
    border-color: #4A90E2;
    background: white;
  }
`

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  font-size: 20px;
`

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 4px;
`

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px;
  border: none;
  background: ${props => props.active ? '#4A90E2' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#4A90E2' : '#f0f0f0'};
  }
`

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Card = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`

const CardImage = styled.div<{ image?: string }>`
  width: 100%;
  height: 200px;
  background-image: url(${props => props.image || '/placeholder.jpg'});
  background-size: cover;
  background-position: center;
  background-color: #e0e0e0;
`

const CardContent = styled.div`
  padding: 16px;
`

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const CardInfo = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const CardDate = styled.p`
  font-size: 13px;
  color: #999;
  margin-top: 8px;
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  
  h3 {
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
  }
`

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 16px;
  margin-top: 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #4A90E2;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #f0f0f0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ContentType>('all')
  const [tourItems, setTourItems] = useState<TourItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const formatDateString = (startDate?: string, endDate?: string) => {
    if (!startDate) return ''
    
    const formatDate = (dateStr: string) => {
      if (dateStr.length !== 8) return dateStr
      const year = dateStr.substring(0, 4)
      const month = dateStr.substring(4, 6)
      const day = dateStr.substring(6, 8)
      return `${year}.${month}.${day}`
    }
    
    const start = formatDate(startDate)
    const end = endDate ? formatDate(endDate) : ''
    
    if (end && start !== end) {
      return `${start} ~ ${end}`
    }
    return start
  }

  const fetchTourData = useCallback(async (resetPage = false) => {
    setLoading(true)
    const currentPage = resetPage ? 1 : page
    
    try {
      let results: TourItem[] = []
      
      if (activeTab === 'all') {
        // 전체 카테고리에서는 검색어가 있을 때 모든 카테고리 검색
        if (searchQuery.trim()) {
          results = await searchAllCategories({
            keyword: searchQuery,
            numOfRows: 10,
            pageNo: currentPage
          })
        } else {
          // 검색어가 없을 때는 관광지, 레포츠 위주로 보여주기
          results = await getAreaBasedList({
            contentTypeId: '12', // 관광지 위주
            numOfRows: 10,
            pageNo: currentPage
          })
        }
      } else if (activeTab === 'festival') {
        // 대회정보는 searchFestival 사용 (스포츠 대회 필터링 적용)
        results = await searchFestival({
          numOfRows: 10,
          pageNo: currentPage
        })
      } else if (activeTab === 'running') {
        // 러닝코스는 Durunubi API 사용 (arrange 파라미터 제외)
        results = await searchRunningCourses({
          keyword: searchQuery.trim() || undefined,
          numOfRows: 10,
          pageNo: currentPage
        })
      } else if (searchQuery.trim()) {
        // 검색어가 있을 때는 키워드 검색
        results = await searchKeyword({
          keyword: searchQuery,
          contentTypeId: ContentTypeMap[activeTab],
          numOfRows: 10,
          pageNo: currentPage
        })
      } else {
        // 검색어가 없을 때는 지역별 검색
        results = await getAreaBasedList({
          contentTypeId: ContentTypeMap[activeTab],
          numOfRows: 10,
          pageNo: currentPage
        })
      }
      
      if (resetPage) {
        setTourItems(results)
        setPage(1)
      } else {
        setTourItems(prev => [...prev, ...results])
      }
      
      setHasMore(results.length === 10)
    } catch (error) {
      console.error('Failed to fetch tour data:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, activeTab, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTourData(true)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchQuery, activeTab])

  const handleSearch = () => {
    fetchTourData(true)
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
    fetchTourData(false)
  }

  const tabs: { key: ContentType; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'running', label: '러닝코스' },
    { key: 'tourist', label: '관광지' },
    { key: 'festival', label: '대회정보' }
  ]

  return (
    <Container>
      <Header>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <SearchButton onClick={handleSearch}>🔍</SearchButton>
        </SearchBar>
        
        <TabContainer>
          {tabs.map(tab => (
            <Tab
              key={tab.key}
              active={activeTab === tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                setPage(1)
              }}
            >
              {tab.label}
            </Tab>
          ))}
        </TabContainer>
      </Header>
      
      <Content>
        {loading && page === 1 ? (
          <LoadingContainer>로딩 중...</LoadingContainer>
        ) : tourItems.length === 0 ? (
          <EmptyState>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어나 카테고리를 선택해보세요</p>
          </EmptyState>
        ) : (
          <>
            <CardList>
              {tourItems.map((item, index) => (
                <Card key={`${item.contentid}-${index}`}>
                  {item.firstimage && (
                    <CardImage image={item.firstimage} />
                  )}
                  <CardContent>
                    <CardTitle>{item.title}</CardTitle>
                    <CardInfo>📍 {item.addr1 || '위치 정보 없음'}</CardInfo>
                    {item.tel && <CardInfo>📞 {item.tel}</CardInfo>}
                    {(item.eventstartdate || item.eventenddate) && (
                      <CardDate>
                        📅 {formatDateString(item.eventstartdate, item.eventenddate)}
                      </CardDate>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardList>
            
            {hasMore && !loading && tourItems.length > 0 && (
              <LoadMoreButton onClick={handleLoadMore}>
                더 보기
              </LoadMoreButton>
            )}
            
            {loading && page > 1 && (
              <LoadingContainer>추가 로딩 중...</LoadingContainer>
            )}
          </>
        )}
      </Content>
    </Container>
  )
}

export default Search