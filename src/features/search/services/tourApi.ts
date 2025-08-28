
import type { TourApiResponse, SearchParams, TourItem } from '../types/tour'
import { apiCache } from '../utils/cache'
import { AreaCodeMap, RunningKeywords, SportsEventKeywords } from '../types/tour'

const BASE_URL = import.meta.env.DEV ? '/api/tour' : 'http://apis.data.go.kr/B551011/KorService2'
const API_KEY = import.meta.env.VITE_TOUR_API_KEY

if (!API_KEY) {
  console.error('Tour API key is not configured. Please set VITE_TOUR_API_KEY in your .env file')
}

// Cache TTL settings (in minutes)
const CACHE_TTL = {
  searchKeyword2: 15,   // General search results - 15 minutes
  searchFestival2: 5,   // Festival info changes more frequently - 5 minutes
  areaBasedList2: 20    // Area-based lists are more stable - 20 minutes
} as const

const buildQueryString = (params: Record<string, string | number | undefined>): string => {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, String(value))
    }
  })
  
  return queryParams.toString()
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const fetchTourApi = async (endpoint: string, params: Record<string, string | number | undefined>): Promise<TourApiResponse> => {
  if (!API_KEY) {
    throw new Error('Tour API key is not configured')
  }

  const defaultParams = {
    serviceKey: API_KEY, // API_KEY 직접 사용 (이미 인코딩됨)
    MobileOS: 'ETC',
    MobileApp: 'RunInDay',
    _type: 'json',
    ...params
  }
  
  console.log('🔍 API 호출 준비:', {
    endpoint,
    apiKeyPrefix: API_KEY.substring(0, 20) + '...',
    params: Object.keys(params)
  })
  
  // Check cache first
  const cachedData = apiCache.get<TourApiResponse>(endpoint, defaultParams)
  if (cachedData) {
    console.log(`Cache hit for ${endpoint}:`, Object.keys(defaultParams))
    return cachedData
  }

  const queryString = buildQueryString(defaultParams)
  const url = `${BASE_URL}/${endpoint}?${queryString}`
  
  console.log('🌐 실제 API URL:', url.length > 200 ? url.substring(0, 200) + '...' : url)
  
  try {
    console.log(`📡 API 요청 시작: ${endpoint}`)
    const response = await fetch(url)
    
    console.log('📥 API 응답 상태:', response.status, response.statusText)
    
    const contentType = response.headers.get('content-type')
    
    if (contentType && !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Received non-JSON response:', text.substring(0, 200))
      throw new Error(`API returned HTML instead of JSON. Status: ${response.status}. This usually means the API key is invalid or there's an authentication issue.`)
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log('✅ JSON 파싱 성공:', {
      resultCode: data?.response?.header?.resultCode,
      resultMsg: data?.response?.header?.resultMsg,
      totalCount: data?.response?.body?.totalCount,
      itemsLength: Array.isArray(data?.response?.body?.items?.item) 
        ? data.response.body.items.item.length 
        : data?.response?.body?.items?.item ? 1 : 0
    })
    
    // Cache the successful response
    const ttl = CACHE_TTL[endpoint as keyof typeof CACHE_TTL] || 15
    apiCache.set(endpoint, defaultParams, data, ttl)
    
    return data
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Failed to parse JSON response. The API might be returning an error page.')
      throw new Error('API returned invalid JSON. Check your API key and network configuration.')
    }
    console.error('Tour API fetch error:', error)
    throw error
  }
}

// 지역명에서 지역 코드 추출
const getAreaCodeFromKeyword = (keyword: string): string | undefined => {
  for (const [region, code] of Object.entries(AreaCodeMap)) {
    if (keyword.includes(region)) {
      return code
    }
  }
  return undefined
}

export const searchKeyword = async (params: SearchParams): Promise<TourItem[]> => {
  const keyword = params.keyword || ''
  const areaCode = params.areaCode || getAreaCodeFromKeyword(keyword)
  
  const apiParams: Record<string, string | number> = {
    numOfRows: params.numOfRows || 10,
    pageNo: params.pageNo || 1,
    MobileOS: 'ETC',
    MobileApp: 'RunInDay',
    _type: 'json',
    arrange: params.arrange || 'A'
  }
  
  // 키워드는 필수이므로 항상 추가
  if (keyword) {
    apiParams.keyword = keyword
  }
  
  // 선택적 파라미터들은 값이 있을 때만 추가
  if (params.contentTypeId) {
    apiParams.contentTypeId = params.contentTypeId
  }
  
  if (areaCode) {
    apiParams.areaCode = areaCode
    // areaCode가 있을 때만 sigunguCode 추가 가능
    if (params.sigunguCode) {
      apiParams.sigunguCode = params.sigunguCode
    }
  }
  
  // cat1이 있을 때만 cat2, cat3 추가
  if (params.cat1) {
    apiParams.cat1 = params.cat1
    if (params.cat2) {
      apiParams.cat2 = params.cat2
      if (params.cat3) {
        apiParams.cat3 = params.cat3
      }
    }
  }
  
  try {
    const data = await fetchTourApi('searchKeyword2', apiParams)
    
    console.log('📦 searchKeyword 응답 구조:', {
      hasResponse: !!data.response,
      dataKeys: Object.keys(data),
      keyword: keyword
    })
    
    if (!data.response) {
      console.log('⚠️ searchKeyword data.response가 없습니다:', data)
      return []
    }
    
    if (data.response.header?.resultCode !== '0000') {
      throw new Error(data.response.header?.resultMsg || 'Unknown API error')
    }
    
    const items = data.response.body?.items?.item
    
    if (!items) {
      console.log('📋 searchKeyword items가 없습니다:', data.response.body)
      return []
    }
    
    return Array.isArray(items) ? items : [items]
  } catch (error) {
    console.error('Search keyword error:', error)
    return []
  }
}

export const searchFestival = async (params: SearchParams): Promise<TourItem[]> => {
  const today = new Date()
  const oneMonthLater = new Date(today)
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 6) // 6개월로 확장
  
  const apiParams: Record<string, string | number> = {
    numOfRows: params.numOfRows || 10,
    pageNo: params.pageNo || 1,
    MobileOS: 'ETC',
    MobileApp: 'RunInDay',
    _type: 'json',
    arrange: params.arrange || 'A',
    eventStartDate: params.eventStartDate || formatDate(today),
    eventEndDate: params.eventEndDate || formatDate(oneMonthLater)
  }
  
  // 선택적 파라미터들은 값이 있을 때만 추가
  if (params.areaCode) {
    apiParams.areaCode = params.areaCode
    if (params.sigunguCode) {
      apiParams.sigunguCode = params.sigunguCode
    }
  }
  
  if (params.cat1) {
    apiParams.cat1 = params.cat1
    if (params.cat2) {
      apiParams.cat2 = params.cat2
      if (params.cat3) {
        apiParams.cat3 = params.cat3
      }
    }
  }
  
  try {
    const data = await fetchTourApi('searchFestival2', apiParams)
    
    console.log('📦 searchFestival 응답 구조:', {
      hasResponse: !!data.response,
      dataKeys: Object.keys(data)
    })
    
    if (!data.response) {
      console.log('⚠️ searchFestival data.response가 없습니다:', data)
      return []
    }
    
    if (data.response.header?.resultCode !== '0000') {
      throw new Error(data.response.header?.resultMsg || 'Unknown API error')
    }
    
    const items = data.response.body?.items?.item
    
    if (!items) {
      console.log('📋 searchFestival items가 없습니다:', data.response.body)
      return []
    }
    
    let results = Array.isArray(items) ? items : [items]
    
    // 디버깅: 원본 결과 확인
    console.log('Festival API 원본 결과:', results.length, '개')
    if (results.length > 0) {
      console.log('첫 번째 항목 제목:', results[0].title)
    }
    
    // 스포츠 대회 관련 항목 우선 표시, 없으면 전체 표시
    const filteredResults = results.filter(item => {
      const title = (item.title || '').toLowerCase()
      return SportsEventKeywords.some(keyword => 
        title.includes(keyword.toLowerCase())
      )
    })
    
    console.log('필터링 후 결과:', filteredResults.length, '개')
    
    // 필터링 결과가 없으면 원본 결과의 일부를 반환
    return filteredResults.length > 0 ? filteredResults : results
  } catch (error) {
    console.error('Search festival error:', error)
    return []
  }
}

export const getAreaBasedList = async (params: SearchParams): Promise<TourItem[]> => {
  const apiParams: Record<string, string | number> = {
    numOfRows: params.numOfRows || 10,
    pageNo: params.pageNo || 1,
    MobileOS: 'ETC',
    MobileApp: 'RunInDay',
    _type: 'json',
    arrange: params.arrange || 'A'
  }
  
  // 선택적 파라미터들은 값이 있을 때만 추가
  if (params.contentTypeId) {
    apiParams.contentTypeId = params.contentTypeId
  }
  
  if (params.areaCode) {
    apiParams.areaCode = params.areaCode
    if (params.sigunguCode) {
      apiParams.sigunguCode = params.sigunguCode
    }
  }
  
  if (params.cat1) {
    apiParams.cat1 = params.cat1
    if (params.cat2) {
      apiParams.cat2 = params.cat2
      if (params.cat3) {
        apiParams.cat3 = params.cat3
      }
    }
  }
  
  try {
    const data = await fetchTourApi('areaBasedList2', apiParams)
    
    console.log('📦 getAreaBasedList 응답 구조:', {
      hasResponse: !!data.response,
      dataKeys: Object.keys(data),
      response: data.response ? Object.keys(data.response) : null
    })
    
    if (!data.response) {
      console.log('⚠️ data.response가 없습니다:', data)
      return []
    }
    
    if (data.response.header?.resultCode !== '0000') {
      throw new Error(data.response.header?.resultMsg || 'Unknown API error')
    }
    
    const items = data.response.body?.items?.item
    
    if (!items) {
      console.log('📋 items가 없습니다:', data.response.body)
      return []
    }
    
    let results = Array.isArray(items) ? items : [items]
    
    // 디버깅: 원본 결과 확인
    console.log(`AreaBased API (contentTypeId=${params.contentTypeId}) 원본 결과:`, results.length, '개')
    if (results.length > 0) {
      console.log('첫 번째 항목 제목:', results[0].title)
    }
    
    // 러닝코스(contentTypeId=28) 요청 시 러닝 관련 항목 우선 표시
    if (params.contentTypeId === '28') {
      const filteredResults = results.filter(item => {
        const title = (item.title || '').toLowerCase()
        const addr = ((item.addr1 || '') + ' ' + (item.addr2 || '')).toLowerCase()
        
        return RunningKeywords.some(keyword => 
          title.includes(keyword.toLowerCase()) || 
          addr.includes(keyword.toLowerCase())
        )
      })
      
      console.log('러닝코스 필터링 후 결과:', filteredResults.length, '개')
      
      // 필터링 결과가 없으면 원본 결과 반환 (레포츠 카테고리 전체)
      results = filteredResults.length > 0 ? filteredResults : results
    }
    
    return results
  } catch (error) {
    console.error('Get area based list error:', error)
    return []
  }
}

// 전체 카테고리에서 검색하는 함수 - 단순화 버전 (디버깅용)
export const searchAllCategories = async (params: SearchParams): Promise<TourItem[]> => {
  const keyword = params.keyword || ''
  
  console.log('🔍 전체 검색 시작:', { keyword, pageNo: params.pageNo })
  
  try {
    // 단순한 키워드 검색만 수행 (복잡한 로직 제거)
    const results = await searchKeyword({
      keyword: params.keyword,
      numOfRows: params.numOfRows || 10,
      pageNo: params.pageNo || 1,
      arrange: 'A' // 제목순 정렬로 변경
    })
    
    console.log('🎯 전체 검색 결과:', results.length, '개')
    if (results.length > 0) {
      console.log('📋 첫 번째 결과 제목:', results[0].title)
    }
    
    return results
  } catch (error) {
    console.error('❌ 전체 검색 에러:', error)
    return []
  }
}