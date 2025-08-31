// GPX 파일에서 좌표를 추출하는 유틸리티

export interface GPXCoordinates {
  lat: number
  lng: number
}

export const extractCoordinatesFromGPX = async (gpxUrl: string): Promise<GPXCoordinates> => {
  try {
    // GPX URL을 프록시를 통해 접근
    const proxyUrl = `/api/gpx?filePath=${encodeURIComponent(gpxUrl.replace('https://www.durunubi.kr/editImgUp.do?filePath=', ''))}`
    console.log('🔄 GPX 파일 요청:', proxyUrl)
    
    const response = await fetch(proxyUrl)
    
    if (!response.ok) {
      throw new Error(`GPX fetch failed: ${response.status}`)
    }
    
    const gpxText = await response.text()
    const parser = new DOMParser()
    const gpxDoc = parser.parseFromString(gpxText, 'text/xml')
    
    // 첫 번째 트랙포인트 추출
    const firstTrackPoint = gpxDoc.querySelector('trkpt')
    if (firstTrackPoint) {
      const lat = parseFloat(firstTrackPoint.getAttribute('lat') || '0')
      const lng = parseFloat(firstTrackPoint.getAttribute('lon') || '0')
      
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        console.log('✅ GPX에서 좌표 추출 성공:', { lat, lng })
        return { lat, lng }
      }
    }
    
    throw new Error('GPX에서 유효한 좌표를 찾을 수 없음')
  } catch (error) {
    console.warn('⚠️ GPX 좌표 추출 실패:', error)
    throw error
  }
}

// 지역명으로 대략적 좌표 추출
export const getApproximateCoordinatesByRegion = (sigun: string): GPXCoordinates => {
  const regionCoordinates: { [key: string]: GPXCoordinates } = {
    '서울': { lat: 37.5665, lng: 126.9780 },
    '부산': { lat: 35.1796, lng: 129.0756 },
    '대구': { lat: 35.8714, lng: 128.6014 },
    '인천': { lat: 37.4563, lng: 126.7052 },
    '광주': { lat: 35.1595, lng: 126.8526 },
    '대전': { lat: 36.3504, lng: 127.3845 },
    '울산': { lat: 35.5384, lng: 129.3114 },
    '세종': { lat: 36.4800, lng: 127.2890 },
    '경기': { lat: 37.4138, lng: 127.5183 },
    '강원': { lat: 37.8228, lng: 128.1555 },
    '충북': { lat: 36.6358, lng: 127.4917 },
    '충남': { lat: 36.5184, lng: 126.8000 },
    '전북': { lat: 35.7175, lng: 127.1530 },
    '전남': { lat: 34.8679, lng: 126.9910 },
    '경북': { lat: 36.4919, lng: 128.8889 },
    '경남': { lat: 35.4606, lng: 128.2132 },
    '제주': { lat: 33.4996, lng: 126.5312 }
  }

  const province = sigun?.split(' ')[0]
  return regionCoordinates[province] || regionCoordinates['서울']
}