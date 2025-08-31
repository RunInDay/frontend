import { apiCache } from '../utils/cache'
import type { TourItem } from '../types/tour'

// Durunubi API Base URL
const BASE_URL = import.meta.env.DEV ? '/api/durunubi' : 'http://apis.data.go.kr/B551011/Durunubi'
const API_KEY = import.meta.env.VITE_TOUR_API_KEY

if (!API_KEY) {
  console.error('Durunubi API key is not configured. Please set VITE_TOUR_API_KEY in your .env file')
}

// Durunubi API 응답 인터페이스 (실제 필드명 기준)
export interface DurunubiCourse {
  routeIdx?: string         // 루트 인덱스
  crsIdx?: string          // 코스 인덱스
  crsKorNm?: string        // 코스 한국어 이름
  crsDstnc?: string        // 거리
  crsTotlRqrmHour?: string // 총 소요시간(분)
  crsDfclGrd?: string      // 코스 난이도 등급
  crsCourseDetail?: string // 코스 상세설명
  siDo?: string            // 시도
  siGunGu?: string         // 시군구
  emdNm?: string           // 읍면동명
  crsSummary?: string      // 코스 요약
  crsContents?: string     // 코스 내용
  crsTourInfo?: string     // 코스 관광정보
  crsLevel?: string        // 코스 레벨
  firstimage?: string      // 첫번째 이미지
  firstimage2?: string     // 두번째 이미지
  mapx?: string           // GPS X좌표
  mapy?: string           // GPS Y좌표
  tel?: string            // 전화번호
  addr1?: string          // 주소1
  addr2?: string          // 주소2
}

export interface DurunubiApiResponse {
  response: {
    header: {
      resultCode: string
      resultMsg: string
    }
    body: {
      items?: {
        item: DurunubiCourse | DurunubiCourse[]
      }
      numOfRows: number
      pageNo: number
      totalCount: number
    }
  }
}

export interface DurunubiSearchParams {
  numOfRows?: number
  pageNo?: number
  arrange?: string
  keyword?: string
  areacode?: string
  sigungucode?: string
}

// buildQueryString 함수 (tourApi와 동일)
const buildQueryString = (params: Record<string, string | number | undefined>): string => {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, String(value))
    }
  })
  
  return queryParams.toString()
}

// Durunubi API 기본 호출 함수
const fetchDurunubiApi = async (endpoint: string, params: Record<string, string | number | undefined>): Promise<DurunubiApiResponse> => {
  if (!API_KEY) {
    throw new Error('Durunubi API key is not configured')
  }

  const defaultParams = {
    serviceKey: API_KEY,
    MobileOS: 'ETC',
    MobileApp: 'RunInDay',
    _type: 'json',
    ...params
  }
  
  
  // Check cache first
  const cachedData = apiCache.get<DurunubiApiResponse>(endpoint, defaultParams)
  if (cachedData) {
    console.log(`🏃‍♂️ Durunubi Cache hit for ${endpoint}:`, Object.keys(defaultParams))
    return cachedData
  }

  const queryString = buildQueryString(defaultParams)
  const url = `${BASE_URL}/${endpoint}?${queryString}`
  
  console.log('🌐 Durunubi API URL:', url.length > 200 ? url.substring(0, 200) + '...' : url)
  
  try {
    console.log(`📡 Durunubi API 요청 시작: ${endpoint}`)
    const response = await fetch(url)
    
    console.log('📥 Durunubi API 응답 상태:', response.status, response.statusText)
    
    const contentType = response.headers.get('content-type')
    
    if (contentType && !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Received non-JSON response:', text.substring(0, 200))
      throw new Error(`Durunubi API returned HTML instead of JSON. Status: ${response.status}`)
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log('✅ Durunubi JSON 파싱 성공:', {
      resultCode: data?.response?.header?.resultCode,
      resultMsg: data?.response?.header?.resultMsg,
      totalCount: data?.response?.body?.totalCount,
      itemsLength: Array.isArray(data?.response?.body?.items?.item) 
        ? data.response.body.items.item.length 
        : data?.response?.body?.items?.item ? 1 : 0
    })
    
    // Cache the successful response (30분 TTL - 코스 정보는 자주 변하지 않음)
    apiCache.set(endpoint, defaultParams, data, 30)
    
    return data
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Failed to parse Durunubi JSON response.')
      throw new Error('Durunubi API returned invalid JSON.')
    }
    console.error('Durunubi API fetch error:', error)
    throw error
  }
}

// 코스 목록 조회 (courseList)
export const getDurunubiCourseList = async (params: DurunubiSearchParams = {}): Promise<DurunubiCourse[]> => {
  const apiParams: Record<string, string | number> = {
    numOfRows: params.numOfRows || 10,
    pageNo: params.pageNo || 1
  }
  
  // 선택적 파라미터들은 값이 있을 때만 추가
  if (params.arrange) {
    apiParams.arrange = params.arrange
  }
  
  if (params.keyword) {
    apiParams.keyword = params.keyword
  }
  
  if (params.areacode) {
    apiParams.areacode = params.areacode
  }
  
  if (params.sigungucode) {
    apiParams.sigungucode = params.sigungucode
  }
  
  try {
    const data = await fetchDurunubiApi('courseList', apiParams)
    
    console.log('📦 getDurunubiCourseList 응답 구조:', {
      hasResponse: !!data.response,
      dataKeys: Object.keys(data)
    })
    
    if (!data.response) {
      console.log('⚠️ Durunubi data.response가 없습니다:', data)
      return []
    }
    
    if (data.response.header?.resultCode !== '0000') {
      throw new Error(data.response.header?.resultMsg || 'Unknown Durunubi API error')
    }
    
    const items = data.response.body?.items?.item
    
    if (!items) {
      console.log('📋 Durunubi items가 없습니다:', data.response.body)
      return []
    }
    
    const results = Array.isArray(items) ? items : [items]
    console.log('🏃‍♂️ Durunubi 코스 결과:', results.length, '개')
    
    // 디버깅: 실제 데이터 구조 확인
    if (results.length > 0) {
      console.log('🔍 첫 번째 Durunubi 코스 데이터 구조:', results[0])
      console.log('🔍 사용 가능한 필드들:', Object.keys(results[0]))
    }
    
    return results
  } catch (error) {
    console.error('Durunubi courseList error:', error)
    return []
  }
}

// 길 목록 조회 (routeList) - 필요시 사용
export const getDurunubiRouteList = async (params: DurunubiSearchParams = {}): Promise<DurunubiCourse[]> => {
  const apiParams: Record<string, string | number> = {
    numOfRows: params.numOfRows || 10,
    pageNo: params.pageNo || 1
  }
  
  // 선택적 파라미터들은 값이 있을 때만 추가
  if (params.arrange) {
    apiParams.arrange = params.arrange
  }
  
  try {
    const data = await fetchDurunubiApi('routeList', apiParams)
    
    if (!data.response || data.response.header?.resultCode !== '0000') {
      console.error('Durunubi routeList API error:', data.response?.header?.resultMsg)
      return []
    }
    
    const items = data.response.body?.items?.item
    if (!items) {
      return []
    }
    
    return Array.isArray(items) ? items : [items]
  } catch (error) {
    console.error('Durunubi routeList error:', error)
    return []
  }
}

// Durunubi 코스 데이터를 TourItem 형식으로 변환
export const convertDurunubiToTourItem = (course: DurunubiCourse): TourItem => {
  console.log('🔄 Converting Durunubi course:', course)
  
  // 주소 조합: 시도 + 시군구 + 읍면동명 또는 addr1 사용
  const combinedAddr = course.addr1 || 
    [course.siDo, course.siGunGu, course.emdNm].filter(Boolean).join(' ') || 
    '위치 정보 없음'
  
  return {
    contentid: course.crsIdx,
    contenttypeid: '28', // 레포츠 타입으로 설정
    title: course.crsKorNm || '코스명 없음',
    addr1: combinedAddr,
    addr2: course.addr2 || '',
    areacode: undefined, // Durunubi에서는 시도/시군구로 제공
    sigungucode: undefined,
    mapx: course.mapx,
    mapy: course.mapy,
    tel: course.tel,
    firstimage: course.firstimage,
    firstimage2: course.firstimage2,
    cat1: undefined,
    cat2: undefined,
    cat3: undefined,
    // Durunubi 전용 정보를 기존 필드에 매핑
    mlevel: course.crsDfclGrd, // 난이도
    booktour: course.crsDstnc ? `${course.crsDstnc}km` : undefined, // 거리 정보
    showflag: course.crsTotlRqrmHour ? `${Math.floor(Number(course.crsTotlRqrmHour) / 60)}시간 ${Number(course.crsTotlRqrmHour) % 60}분` : undefined, // 소요시간
    createdtime: course.crsSummary || course.crsContents, // 코스설명
    modifiedtime: course.crsCourseDetail // 상세설명
  }
}

// Durunubi API로 러닝코스 검색 (TourItem 형식으로 반환)
export const searchRunningCourses = async (params: DurunubiSearchParams = {}): Promise<TourItem[]> => {
  try {
    const courses = await getDurunubiCourseList(params)
    return courses.map(convertDurunubiToTourItem)
  } catch (error) {
    console.error('Search running courses error:', error)
    return []
  }
}