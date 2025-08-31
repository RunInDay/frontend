export interface TourItem {
  contentid?: string
  contenttypeid?: string
  title: string
  addr1?: string
  addr2?: string
  areacode?: string
  mapx?: string
  mapy?: string
  mlevel?: string
  tel?: string
  firstimage?: string
  firstimage2?: string
  eventstartdate?: string
  eventenddate?: string
  cat1?: string
  cat2?: string
  cat3?: string
  createdtime?: string
  modifiedtime?: string
  booktour?: string
  showflag?: string
  // detailCommon2 API에서 제공되는 추가 필드들
  overview?: string    // 상세 설명
  homepage?: string    // 홈페이지 URL
  telname?: string     // 전화번호 담당자명
}

export interface TourApiResponse {
  response: {
    header: {
      resultCode: string
      resultMsg: string
    }
    body: {
      items: {
        item: TourItem | TourItem[]
      }
      numOfRows: number
      pageNo: number
      totalCount: number
    }
  }
}

export interface SearchParams {
  keyword?: string
  contentTypeId?: string
  areaCode?: string
  sigungucode?: string
  cat1?: string
  cat2?: string
  cat3?: string
  eventStartDate?: string
  eventEndDate?: string
  numOfRows?: number
  pageNo?: number
  arrange?: string
}

export type ContentType = 'all' | 'running' | 'tourist' | 'festival'

export const ContentTypeMap: Record<ContentType, string | undefined> = {
  all: undefined,
  running: '28', // 레포츠 (스포츠 시설, 러닝코스)
  tourist: '12', // 관광지 (실제로는 관광지+음식점+숙박 통합)
  festival: '15' // 축제공연행사 (대회정보 포함)
}

// 지역 코드 매핑 (주요 도시)
export const AreaCodeMap: Record<string, string> = {
  서울: '1',
  인천: '2', 
  대전: '3',
  대구: '4',
  광주: '5',
  부산: '6',
  울산: '7',
  세종: '8',
  경기: '31',
  강원: '32',
  충북: '33',
  충남: '34',
  경북: '35',
  경남: '36',
  전북: '37',
  전남: '38',
  제주: '39'
}

// 러닝 관련 키워드
export const RunningKeywords = [
  '러닝', '조깅', '마라톤', '런닝', '달리기', '트랙', '코스', '산책로', '둘레길'
]

// 스포츠 대회 관련 키워드  
export const SportsEventKeywords = [
  '마라톤', '하프마라톤', '10K', '5K', '달리기', '런닝', '트레일런', '울트라마라톤', 
  '국제마라톤', '시민마라톤', '대회', '경주', '레이스'
]

// 거리별 분류 타입
export type DistanceCategory = 'short' | 'medium' | 'long'

// 거리별 분류 정보
export interface DistanceClassification {
  category: DistanceCategory
  label: string
  color: string
  description: string
}

// 거리별 분류 매핑
export const DistanceCategories: Record<DistanceCategory, DistanceClassification> = {
  short: {
    category: 'short',
    label: '단거리',
    color: '#52C41A', // 초록색
    description: '5km 미만 - 건강 마라톤, 입문자용'
  },
  medium: {
    category: 'medium', 
    label: '중거리',
    color: '#FA8C16', // 주황색
    description: '5-15km - 단축 마라톤, 러닝 입문자 도전'
  },
  long: {
    category: 'long',
    label: '장거리', 
    color: '#F5222D', // 빨간색
    description: '15km 이상 - 하프마라톤 수준'
  }
}