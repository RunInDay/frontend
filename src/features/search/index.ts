// API services
export {
  searchKeyword,
  searchFestival,
  getAreaBasedList,
  searchAllCategories,
  searchTouristCategories,
  getDetailInfo
} from './services/tourApi'

// Types
export type {
  TourItem,
  TourApiResponse,
  SearchParams,
  ContentType
} from './types/tour'

export {
  ContentTypeMap,
  AreaCodeMap,
  RunningKeywords,
  SportsEventKeywords,
  DistanceCategories
} from './types/tour'

export type {
  DistanceCategory,
  DistanceClassification
} from './types/tour'

// Distance utilities
export {
  classifyDistance,
  getDistanceClassification,
  parseDistanceString,
  classifyTourDistance,
  getDistanceIcon
} from './utils/distanceUtils'

// Components
// export { default as MapThumbnail } from './components/MapThumbnail' // 사용하지 않음
// export { default as InteractiveMap } from './components/InteractiveMap' // 사용하지 않음

// Cache utility
export { apiCache } from './utils/cache'