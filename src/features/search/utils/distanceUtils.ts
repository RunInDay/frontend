import type { DistanceCategory, DistanceClassification } from '../types/tour'
import { DistanceCategories } from '../types/tour'

/**
 * 거리(km)를 기준으로 단거리/중거리/장거리 분류를 반환합니다
 * @param distance 거리 (km 단위)
 * @returns DistanceCategory
 */
export const classifyDistance = (distance: number): DistanceCategory => {
  if (distance < 5) {
    return 'short'
  } else if (distance < 15) {
    return 'medium'
  } else {
    return 'long'
  }
}

/**
 * 거리 분류 카테고리에 해당하는 분류 정보를 반환합니다
 * @param category DistanceCategory
 * @returns DistanceClassification
 */
export const getDistanceClassification = (category: DistanceCategory): DistanceClassification => {
  return DistanceCategories[category]
}

/**
 * 거리 문자열(예: "5.2km", "10KM")에서 숫자를 추출합니다
 * @param distanceString 거리 문자열
 * @returns 숫자 거리 (km) 또는 0
 */
export const parseDistanceString = (distanceString: string): number => {
  if (!distanceString || typeof distanceString !== 'string') {
    return 0
  }
  
  // 숫자와 소수점만 추출
  const match = distanceString.match(/(\d+\.?\d*)/);
  if (match) {
    return parseFloat(match[1])
  }
  
  return 0
}

/**
 * TourItem의 booktour 필드에서 거리를 추출하고 분류합니다
 * @param booktour TourItem의 booktour 필드 (예: "5.2km")
 * @returns DistanceClassification 또는 null
 */
export const classifyTourDistance = (booktour?: string): DistanceClassification | null => {
  if (!booktour) return null
  
  const distance = parseDistanceString(booktour)
  if (distance === 0) return null
  
  const category = classifyDistance(distance)
  return getDistanceClassification(category)
}

/**
 * 거리 분류에 따른 아이콘을 반환합니다
 * @param category DistanceCategory
 * @returns 이모지 아이콘
 */
export const getDistanceIcon = (category: DistanceCategory): string => {
  switch (category) {
    case 'short':
      return '🚶‍♂️'
    case 'medium':
      return '🏃‍♂️'
    case 'long':
      return '🏃‍♀️‍➡️'
    default:
      return '🏃‍♂️'
  }
}