import { useEffect, useRef } from 'react'
import { css } from '@emotion/react'
import type { RunningRecord } from '@/features/map/types/running'

interface RunningMapProps {
  selectedRecord?: RunningRecord
  center?: {
    lat: number
    lng: number
  }
}

const RunningMap = ({
  selectedRecord,
  center = { lat: 35.1796, lng: 129.1756 }, // 기본 좌표 (부산)
}: RunningMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // SDK 중복 로드 방지
    if (document.getElementById('kakao-map-sdk')) {
      window.kakao.maps.load(() => initMap())
      return
    }

    // 카카오맵 SDK 로드
    const script = document.createElement('script')
    script.id = 'kakao-map-sdk'
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_API_KEY
    }&autoload=false`
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      console.log('✅ Kakao Maps SDK loaded successfully')
      window.kakao.maps.load(() => {
        console.log('✅ Kakao Maps initialized')
        initMap()
      })
    }

    script.onerror = () => {
      console.error('❌ Failed to load Kakao Maps SDK')
    }

    // 지도 초기화 함수
    function initMap() {
      if (!mapRef.current) {
        console.error('❌ Map container not found')
        return
      }

      console.log('🗺️ Initializing map...')
      const routePoints = selectedRecord?.route || []

      // 중심 좌표 계산
      const mapCenter =
        routePoints.length > 0
          ? {
              lat:
                routePoints.reduce((sum, point) => sum + point.lat, 0) /
                routePoints.length,
              lng:
                routePoints.reduce((sum, point) => sum + point.lng, 0) /
                routePoints.length,
            }
          : center

      // 지도 생성
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng),
        level: 3,
      })

      console.log('✅ Map created successfully:', map)
      console.log('📍 Map center:', mapCenter)
      console.log('📏 Container size:', {
        width: mapRef.current.offsetWidth,
        height: mapRef.current.offsetHeight,
      })

      // 경로가 있으면 선과 마커 추가
      if (routePoints.length > 0) {
        const path = routePoints.map(
          (p) => new window.kakao.maps.LatLng(p.lat, p.lng),
        )

        // 경로 폴리라인
        new window.kakao.maps.Polyline({
          map,
          path,
          strokeWeight: 5,
          strokeColor: '#FF69B4',
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
        })

        // 시작점 마커
        new window.kakao.maps.Marker({
          map,
          position: path[0],
          title: '시작점',
        })

        // 도착점 마커
        new window.kakao.maps.Marker({
          map,
          position: path[path.length - 1],
          title: '도착점',
        })

        // 경로에 맞게 지도 영역 조정
        const bounds = new window.kakao.maps.LatLngBounds()
        path.forEach((pos) => bounds.extend(pos))
        map.setBounds(bounds)

        console.log('🛣️ Route added to map:', routePoints.length, 'points')
      } else {
        console.log('ℹ️ No route data available')
      }
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [selectedRecord, center])

  return <div ref={mapRef} css={mapContainerStyles} />
}

const mapContainerStyles = css`
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #f0f0f0;
  position: relative;
  display: block;
  z-index: 1000;
`

export default RunningMap
