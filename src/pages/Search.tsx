import { useState, useEffect, useCallback } from 'react'
import styled from '@emotion/styled'
import { searchKeyword, searchFestival, getAreaBasedList, searchAllCategories, searchTouristCategories, getDetailInfo } from '@/features/search'
import { searchRunningCourses } from '@/features/search/services/durunubiApi'
import type { TourItem, ContentType } from '@/features/search'
import { ContentTypeMap, classifyTourDistance } from '@/features/search'
import KakaoMap from '@/features/search/components/KakaoMap'

// HTML 태그를 실제 텍스트로 변환하는 함수
const convertHtmlToText = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')  // <br>, <br/>, <BR> → 줄바꿈
    .replace(/<p>/gi, '\n')         // <p> → 줄바꿈
    .replace(/<\/p>/gi, '\n')       // </p> → 줄바꿈
    .replace(/<[^>]*>/g, '')        // 나머지 HTML 태그 제거
    .replace(/\n\s*\n/g, '\n')      // 연속 줄바꿈 정리
    .replace(/^\n+|\n+$/g, '')      // 앞뒤 줄바꿈 제거
    .trim()
}

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

const DistanceBadge = styled.div<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  
  h2 {
    margin-bottom: 16px;
    color: #333;
    font-size: 20px;
  }
  
  .detail-item {
    margin-bottom: 12px;
    
    strong {
      color: #666;
      display: inline-block;
      min-width: 80px;
    }
  }
  
  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    
    &:hover {
      color: #333;
    }
  }
`

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ContentType>('all')
  const [tourItems, setTourItems] = useState<TourItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<TourItem | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

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
    setIsTyping(false)  // 실제 검색 시작 시 타이핑 상태 해제
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
        // 대회정보: 검색어가 있으면 키워드 검색, 없으면 전체 축제
        if (searchQuery.trim()) {
          // 검색어가 있을 때: 축제 카테고리에서 키워드 검색
          results = await searchKeyword({
            keyword: searchQuery,
            contentTypeId: '15',  // 축제 컨텐츠 타입
            numOfRows: 20,
            pageNo: currentPage,
            arrange: 'P'  // 인기순
          })
        } else {
          // 검색어가 없을 때: 적당한 양의 축제를 가져와서 스포츠 대회 우선 표시
          const allResults = await searchFestival({
            numOfRows: 1000,
            pageNo: 1
          })
          
          // 스포츠 키워드 정의
          const sportsKeywords = ['런', '러닝', '마라톤', '레이스', '나이트런', '나이트레이스', '워크', '걷기',
                                  '트라이애슬론', '철인', '듀애슬론', '사이클링', '바이크',
                                  '트레일런', '울트라마라톤', '하프마라톤', '풀마라톤']
          
          // 스포츠 대회 필터링: A02081200 + (A02081300이면서 스포츠 키워드 포함)
          const sportsEvents = allResults.filter(item => {
            if (item.cat3 === 'A02081200') {
              return true  // 스포츠경기는 무조건 포함
            }
            
            if (item.cat3 === 'A02081300') {
              // 기타행사는 스포츠 키워드가 있을 때만 포함
              const title = (item.title || '').toLowerCase()
              return sportsKeywords.some(keyword => 
                title.includes(keyword.toLowerCase())
              )
            }
            
            return false
          })
          
          const regularFestivals = allResults.filter(item => {
            if (item.cat3 === 'A02081200') {
              return false  // 스포츠경기는 제외
            }
            
            if (item.cat3 === 'A02081300') {
              // 기타행사 중 스포츠 키워드가 없는 것만 포함
              const title = (item.title || '').toLowerCase()
              return !sportsKeywords.some(keyword => 
                title.includes(keyword.toLowerCase())
              )
            }
            
            return true  // 나머지는 모두 일반 축제
          })
          
          console.log(`🎯 전체 데이터 분석 완료:`)
          console.log(`  - 총 축제: ${allResults.length}개`)
          console.log(`  - 스포츠관련 (A02081200+A02081300): ${sportsEvents.length}개`)
          console.log(`  - 일반축제: ${regularFestivals.length}개`)
          
          if (sportsEvents.length > 0) {
            console.log('🏆 발견된 스포츠 이벤트:', sportsEvents.slice(0, 5).map(e => e.title))
          }
          
          // 스포츠 대회 우선, 그 다음 일반 축제 (페이지네이션 적용)
          const combinedResults = [...sportsEvents, ...regularFestivals]
          const startIdx = (currentPage - 1) * 10
          results = combinedResults.slice(startIdx, startIdx + 10)
        }
        
        // 축제 카테고리 상세 분석
        console.log('🔍 축제 카테고리 분석:')
        results.slice(0, 10).forEach(item => {
          console.log(`📋 ${item.title}:`, {
            cat1: item.cat1 || '없음',
            cat2: item.cat2 || '없음',
            cat3: item.cat3 || '없음',
            contentTypeId: item.contenttypeid
          })
        })
        
        // 달리기 관련 키워드로 스포츠 이벤트 찾기
        const runningKeywords = ['런', '마라톤', '레이스', 'run', '달리기', '걷기', '워킹']
        const runningEvents = results.filter(item => {
          const title = (item.title || '').toLowerCase()
          return runningKeywords.some(keyword => title.includes(keyword.toLowerCase()))
        })
        
        if (runningEvents.length > 0) {
          console.log('🏃 달리기 관련 이벤트 발견:', runningEvents.map(e => ({
            title: e.title,
            cat1: e.cat1 || '없음',
            cat2: e.cat2 || '없음',
            cat3: e.cat3 || '없음'
          })))
        }
        
        // 현재 페이지 결과 분석
        console.log(`📊 현재 페이지 결과 (${results.length}개):`)
        const categoryCount = {}
        results.forEach(item => {
          const cat = item.cat3 || '없음'
          categoryCount[cat] = (categoryCount[cat] || 0) + 1
        })
        Object.entries(categoryCount).forEach(([cat, count]) => {
          console.log(`  - ${cat}: ${count}개`)
        })
      } else if (activeTab === 'running') {
        // 러닝코스는 Durunubi API 사용 (arrange 파라미터 제외)
        results = await searchRunningCourses({
          keyword: searchQuery.trim() || undefined,
          numOfRows: 10,
          pageNo: currentPage
        })
      } else if (activeTab === 'tourist') {
        // 관광지 탭: 관광지 + 음식점 + 숙박 통합 검색
        results = await searchTouristCategories({
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
      
      // 중복 제거: contentid 기준으로 유니크한 결과만 유지
      const uniqueResults = results.filter((item, index, self) =>
        index === self.findIndex((t) => t.contentid === item.contentid)
      )
      
      if (resetPage) {
        setTourItems(uniqueResults)
        setPage(1)
      } else {
        // 기존 결과와 새 결과 합칠 때도 중복 제거
        setTourItems(prev => {
          const combined = [...prev, ...uniqueResults]
          return combined.filter((item, index, self) =>
            index === self.findIndex((t) => t.contentid === item.contentid)
          )
        })
      }
      
      setHasMore(uniqueResults.length >= 10)
    } catch (error) {
      console.error('Failed to fetch tour data:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, activeTab, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTourData(true)
    }, 100)  // 200ms에서 100ms로 더 단축
    
    return () => clearTimeout(timer)
  }, [searchQuery, activeTab])

  const handleSearch = () => {
    fetchTourData(true)
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
    fetchTourData(false)
  }

  const handleCardClick = async (item: TourItem) => {
    setSelectedCourse(item)
    
    // 상세 정보 로드 (contentid가 있는 경우에만)
    if (item.contentid && item.contenttypeid) {
      setDetailLoading(true)
      try {
        const detailInfo = await getDetailInfo(item.contentid, item.contenttypeid)
        // 상세 정보를 selectedCourse에 병합
        setSelectedCourse(prev => prev ? { ...prev, ...detailInfo } : null)
      } catch (error) {
        console.error('Failed to load detail info:', error)
      } finally {
        setDetailLoading(false)
      }
    }
  }

  const closeModal = () => {
    setSelectedCourse(null)
  }

  // 행사 날짜 포맷팅
  const formatEventDate = (startDate?: string, endDate?: string) => {
    if (!startDate) return '날짜 정보 없음'
    
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

  // 스포츠 이벤트 판별
  const isSportsEvent = (item: TourItem) => {
    if (item.contenttypeid === '28') return true  // 러닝코스
    
    const sportsKeywords = ['런', '러닝', '마라톤', '레이스', '나이트런', '나이트레이스', 
                           '트라이애슬론', '철인', '듀애슬론', '사이클링', '바이크',
                           '트레일런', '울트라마라톤', '하프마라톤', '풀마라톤']
    const title = (item.title || '').toLowerCase()
    return sportsKeywords.some(keyword => title.includes(keyword.toLowerCase()))
  }

  // 스포츠 종목 추출
  const extractSportsType = (title?: string) => {
    if (!title) return ''
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('마라톤')) return '마라톤'
    if (lowerTitle.includes('런') || lowerTitle.includes('러닝')) return '러닝'
    if (lowerTitle.includes('레이스')) return '레이스'
    if (lowerTitle.includes('트라이애슬론') || lowerTitle.includes('철인')) return '트라이애슬론'
    if (lowerTitle.includes('사이클')) return '사이클링'
    if (lowerTitle.includes('워킹') || lowerTitle.includes('걷기')) return '워킹'
    
    return '스포츠 대회'
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
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsTyping(true)  // 즉시 타이핑 상태 표시
            }}
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
        {/* 검색 상태 표시 */}
        {(isTyping || loading) && searchQuery && (
          <div style={{ padding: '12px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
            {isTyping ? '검색 준비 중...' : `"${searchQuery}" 검색 중...`}
          </div>
        )}
        
        {loading && page === 1 && !searchQuery ? (
          <LoadingContainer>로딩 중...</LoadingContainer>
        ) : tourItems.length === 0 && !loading ? (
          <EmptyState>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어나 카테고리를 선택해보세요</p>
          </EmptyState>
        ) : (
          <>
            {/* 검색 결과 수 표시 */}
            {searchQuery && tourItems.length > 0 && (
              <div style={{ padding: '8px 0', color: '#666', fontSize: '14px' }}>
                "{searchQuery}" 검색 결과 {tourItems.length}개
              </div>
            )}
            
            <CardList>
              {tourItems.map((item, index) => {
                const distanceInfo = classifyTourDistance(item.booktour)
                
                return (
                  <Card key={`${item.contentid}-${index}`} onClick={() => handleCardClick(item)}>
                    {/* 러닝코스가 아닌 경우만 이미지 표시 */}
                    {activeTab !== 'running' && (
                      item.firstimage ? (
                        <CardImage image={item.firstimage} />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '200px',
                          backgroundColor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          color: '#666'
                        }}>
                          📸 이미지 없음
                        </div>
                      )
                    )}
                    
                    <CardContent style={activeTab === 'running' ? { padding: '20px' } : {}}>
                      <CardTitle>{item.title || '제목 없음'}</CardTitle>
                      
                      {/* 러닝코스는 sigun 정보만, 다른 것들은 전체 주소 */}
                      {activeTab === 'running' ? (
                        // 러닝코스: sigun 데이터에서 시/군 추출
                        item.addr1 && item.addr1.trim() && (
                          <CardInfo>📍 {item.addr1.split(' ').slice(0, 2).join(' ')}</CardInfo>
                        )
                      ) : (
                        // 일반 콘텐츠: 전체 주소
                        item.addr1 && item.addr1.trim() && (
                          <CardInfo>📍 {item.addr1.trim()}</CardInfo>
                        )
                      )}
                      
                      {item.tel && 
                       item.tel.trim() && 
                       item.tel.trim() !== '-' &&
                       item.tel.trim() !== 'N/A' &&
                       /^\d{2,3}-?\d{3,4}-?\d{4}$/.test(item.tel.trim().replace(/[^0-9-]/g, '')) && (
                        <CardInfo>📞 {item.tel.trim()}</CardInfo>
                      )}
                      
                      {/* 러닝코스 정보 표시 */}
                      {activeTab === 'running' && (
                        <div style={{ marginTop: '12px' }}>
                          {/* 난이도, 거리, 시간을 한 줄에 */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {item.mlevel && item.mlevel.trim() && (
                              <span style={{ 
                                fontSize: '14px', 
                                color: '#4A90E2', 
                                fontWeight: '600',
                                backgroundColor: '#E3F2FD',
                                padding: '4px 8px',
                                borderRadius: '12px'
                              }}>
                                ⭐ {item.mlevel}
                              </span>
                            )}
                            {item.booktour && 
                             item.booktour.trim() && 
                             item.booktour.toLowerCase().includes('km') && 
                             parseFloat(item.booktour.replace(/[^0-9.]/g, '')) > 0 && (
                              <span style={{ 
                                fontSize: '14px', 
                                color: '#E74C3C', 
                                fontWeight: '600',
                                backgroundColor: '#FFEBEE',
                                padding: '4px 8px',
                                borderRadius: '12px'
                              }}>
                                📏 {item.booktour}
                              </span>
                            )}
                            {item.showflag && 
                             item.showflag.trim() && 
                             (item.showflag.includes('시간') || item.showflag.includes('분')) &&
                             /\d/.test(item.showflag) && (
                              <span style={{ 
                                fontSize: '14px', 
                                color: '#27AE60', 
                                fontWeight: '600',
                                backgroundColor: '#E8F5E8',
                                padding: '4px 8px',
                                borderRadius: '12px'
                              }}>
                                ⏱️ {item.showflag}
                              </span>
                            )}
                          </div>
                          
                          {/* 코스 설명 */}
                          {item.createdtime && item.createdtime.trim() && (
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#666', 
                              lineHeight: '1.4',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              marginTop: '8px'
                            }}>
                              {convertHtmlToText(item.createdtime)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {item.eventstartdate && 
                       item.eventstartdate.trim() && 
                       item.eventstartdate.length === 8 && 
                       /^\d{8}$/.test(item.eventstartdate) && (
                        <CardDate>
                          📅 {formatDateString(item.eventstartdate, item.eventenddate)}
                        </CardDate>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
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
      
      {/* 러닝코스 상세 정보 모달 */}
      {selectedCourse && (
        <Modal onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>×</button>
            
            {/* 제목 */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ marginBottom: '8px' }}>{selectedCourse.title}</h2>
              
              {/* 러닝코스 정보 배지들 */}
              {selectedCourse.contenttypeid === '28' && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {selectedCourse.mlevel && selectedCourse.mlevel.trim() && (
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#4A90E2', 
                      fontWeight: '600',
                      backgroundColor: '#E3F2FD',
                      padding: '6px 12px',
                      borderRadius: '16px'
                    }}>
                      ⭐ {selectedCourse.mlevel}
                    </span>
                  )}
                  {selectedCourse.booktour && 
                   selectedCourse.booktour.trim() && 
                   selectedCourse.booktour.toLowerCase().includes('km') && (
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#E74C3C', 
                      fontWeight: '600',
                      backgroundColor: '#FFEBEE',
                      padding: '6px 12px',
                      borderRadius: '16px'
                    }}>
                      📏 {selectedCourse.booktour}
                    </span>
                  )}
                  {selectedCourse.showflag && 
                   selectedCourse.showflag.trim() && 
                   (selectedCourse.showflag.includes('시간') || selectedCourse.showflag.includes('분')) && (
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#27AE60', 
                      fontWeight: '600',
                      backgroundColor: '#E8F5E8',
                      padding: '6px 12px',
                      borderRadius: '16px'
                    }}>
                      ⏱️ {selectedCourse.showflag}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 코스 개요 섹션 (러닝코스만) */}
            {selectedCourse.contenttypeid === '28' && (selectedCourse.createdtime || selectedCourse.overview) && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                  📋 코스 개요
                </h3>
                <div style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  color: '#333',
                  backgroundColor: '#F8F9FA',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #E9ECEF',
                  whiteSpace: 'pre-line'  // 줄바꿈 표시
                }}>
                  {convertHtmlToText(selectedCourse.overview || selectedCourse.createdtime || '')}
                </div>
              </div>
            )}

            {/* 지도 섹션 (러닝코스만) */}
            {selectedCourse.contenttypeid === '28' && selectedCourse.modifiedtime && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                  🗺️ 코스 지도
                </h3>
                <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                  {/* KakaoMap 컴포넌트로 GPX 경로 표시 */}
                  <KakaoMap 
                    gpxUrl={selectedCourse.modifiedtime}
                    width="100%"
                    height={350}
                    showControls={true}
                    fitToPath={true}
                  />
                </div>
              </div>
            )}

            {/* 기본 정보 섹션 (일반 이벤트용) */}
            {selectedCourse.contenttypeid !== '28' && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                  📋 기본 정보
                </h3>
              
              {/* 위치 정보 */}
              {selectedCourse.addr1 && selectedCourse.addr1.trim() ? (
                <div className="detail-item">
                  <strong>📍 위치:</strong> {selectedCourse.addr1.trim()}
                  {selectedCourse.addr2 && selectedCourse.addr2.trim() && (
                    <span style={{ marginLeft: '4px', color: '#666' }}>
                      {selectedCourse.addr2.trim()}
                    </span>
                  )}
                </div>
              ) : (
                <div className="detail-item">
                  <strong>📍 위치:</strong> <span style={{ color: '#666' }}>위치 정보 없음</span>
                </div>
              )}
              
              {/* 전화번호 - 유효한 전화번호만 표시하고, 없으면 명시적으로 표시 */}
              <div className="detail-item">
                <strong>📞 문의:</strong>
                {selectedCourse.tel && 
                 selectedCourse.tel.trim() && 
                 selectedCourse.tel.trim() !== '-' &&
                 selectedCourse.tel.trim() !== 'N/A' &&
                 selectedCourse.tel.trim() !== '없음' &&
                 /^\d{2,3}-?\d{3,4}-?\d{4}$/.test(selectedCourse.tel.trim().replace(/[^0-9-]/g, '')) ? (
                  <a 
                    href={`tel:${selectedCourse.tel.trim()}`} 
                    style={{ marginLeft: '8px', color: '#4A90E2', textDecoration: 'none' }}
                  >
                    {selectedCourse.tel.trim()}
                  </a>
                ) : (
                  <span style={{ marginLeft: '8px', color: '#666' }}>전화번호 없음</span>
                )}
              </div>
              
              {/* 행사 기간 - 유효한 날짜 형식만 표시 */}
              {selectedCourse.eventstartdate && 
               selectedCourse.eventstartdate.trim() && 
               selectedCourse.eventstartdate.length === 8 && 
               /^\d{8}$/.test(selectedCourse.eventstartdate) && (
                <div className="detail-item">
                  <strong>📅 행사기간:</strong> {formatEventDate(selectedCourse.eventstartdate, selectedCourse.eventenddate)}
                </div>
              )}
            </div>
            )}

            
            {/* 상세 설명 - detailCommon2 API에서 로드 */}
            {detailLoading ? (
              <div style={{ marginBottom: '24px', textAlign: 'center', color: '#666' }}>
                <div>상세 정보 로딩 중...</div>
              </div>
            ) : selectedCourse.overview && selectedCourse.overview.trim() && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                  📝 상세 정보
                </h3>
                
                <div className="detail-item">
                  <div style={{ lineHeight: '1.6', color: '#555' }}>
                    {selectedCourse.overview.trim()}
                  </div>
                </div>
              </div>
            )}
            
            {/* 콘텐츠 등록/수정 정보 - 8자리 날짜 형식만 표시 */}
            {((selectedCourse.createdtime && selectedCourse.createdtime.length === 8 && /^\d{8}$/.test(selectedCourse.createdtime)) || 
              (selectedCourse.modifiedtime && selectedCourse.modifiedtime.length === 8 && /^\d{8}$/.test(selectedCourse.modifiedtime) && !selectedCourse.modifiedtime.includes('.'))) && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                  🗓️ 콘텐츠 정보
                </h3>
                
                {selectedCourse.createdtime && 
                 selectedCourse.createdtime.length === 8 && 
                 /^\d{8}$/.test(selectedCourse.createdtime) && (
                  <div className="detail-item">
                    <strong>등록일:</strong> {formatEventDate(selectedCourse.createdtime)}
                  </div>
                )}
                
                {selectedCourse.modifiedtime && 
                 selectedCourse.modifiedtime.length === 8 && 
                 /^\d{8}$/.test(selectedCourse.modifiedtime) && 
                 !selectedCourse.modifiedtime.includes('.') && (
                  <div className="detail-item">
                    <strong>수정일:</strong> {formatEventDate(selectedCourse.modifiedtime)}
                  </div>
                )}
              </div>
            )}

            {/* 액션 버튼들 - 실제 데이터가 있을 때만 표시 */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #eee'
            }}>
              {/* 홈페이지 버튼 - detailCommon2에서 로드한 데이터 */}
              {selectedCourse.homepage && 
               selectedCourse.homepage.trim() &&
               (selectedCourse.homepage.startsWith('http') || selectedCourse.homepage.includes('.')) && (
                <button
                  onClick={() => {
                    const url = selectedCourse.homepage?.trim().startsWith('http') 
                      ? selectedCourse.homepage.trim() 
                      : `https://${selectedCourse.homepage?.trim()}`
                    window.open(url, '_blank')
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#4A90E2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  🌐 공식 홈페이지
                </button>
              )}
              
              <button
                onClick={() => {
                  let text = selectedCourse.title
                  if (selectedCourse.addr1 && selectedCourse.addr1.trim()) {
                    text += `\n📍 ${selectedCourse.addr1}`
                  }
                  if (selectedCourse.eventstartdate && 
                      selectedCourse.eventstartdate.trim() && 
                      selectedCourse.eventstartdate.length === 8 && 
                      /^\d{8}$/.test(selectedCourse.eventstartdate)) {
                    text += `\n📅 ${formatEventDate(selectedCourse.eventstartdate, selectedCourse.eventenddate)}`
                  }
                  
                  if (selectedCourse.tel && 
                      selectedCourse.tel.trim() && 
                      selectedCourse.tel.trim() !== '-' &&
                      /^\d{2,3}-?\d{3,4}-?\d{4}$/.test(selectedCourse.tel.trim().replace(/[^0-9-]/g, ''))) {
                    text += `\n📞 ${selectedCourse.tel.trim()}`
                  } else {
                    text += `\n📞 전화번호 없음`
                  }
                  
                  if (selectedCourse.homepage && 
                      selectedCourse.homepage.trim() &&
                      (selectedCourse.homepage.startsWith('http') || selectedCourse.homepage.includes('.'))) {
                    text += `\n🌐 ${selectedCourse.homepage.trim()}`
                  }
                  
                  navigator.clipboard.writeText(text).then(() => {
                    alert('정보가 클립보드에 복사되었습니다!')
                  }).catch(() => {
                    alert('복사에 실패했습니다.')
                  })
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#52C41A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                📤 정보 복사
              </button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  )
}

export default Search