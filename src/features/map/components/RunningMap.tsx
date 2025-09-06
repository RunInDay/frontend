import { useRef } from 'react'
import { Map, MapMarker, Polyline } from 'react-kakao-maps-sdk'
import { css } from '@emotion/react'
import type { RunningRecord } from '@/features/map/types/running'

interface RunningMapProps {
  selectedRecord?: RunningRecord
  center?: {
    lat: number
    lng: number
  }
}

const mapContainerStyles = css`
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const mapWrapperStyles = css`
  width: 100%;
  height: 100%;
`

const noRouteMessageStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-family: 'PretendardRegular', sans-serif;
  font-size: 14px;
  background: #f8f9fa;
`

const RunningMap = ({
  selectedRecord,
  center = { lat: 35.1796, lng: 129.1756 }, // 부산 좌표 (기본값)
}: RunningMapProps) => {
  const mapRef = useRef<kakao.maps.Map>(null)

  // 선택된 기록의 경로가 있으면 해당 경로를 표시
  const routePoints = selectedRecord?.route || []

  // 경로가 있으면 경로의 중심점을 계산
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

  // 경로를 카카오맵 Polyline 형식으로 변환
  const polylinePath = routePoints.map((point) => ({
    lat: point.lat,
    lng: point.lng,
  }))

  return (
    <div css={mapContainerStyles}>
      <div css={mapWrapperStyles}>
        <Map
          center={mapCenter}
          style={{ width: '100%', height: '100%' }}
          level={3}
          ref={mapRef}
        >
          {routePoints.length > 0 ? (
            <>
              {/* 시작점 마커 */}
              {routePoints[0] && (
                <MapMarker
                  position={routePoints[0]}
                  image={{
                    src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                    size: { width: 24, height: 35 },
                    options: {
                      offset: { x: 12, y: 35 },
                    },
                  }}
                  title="시작점"
                />
              )}

              {/* 끝점 마커 */}
              {routePoints[routePoints.length - 1] && (
                <MapMarker
                  position={routePoints[routePoints.length - 1]}
                  image={{
                    src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerRed.png',
                    size: { width: 24, height: 35 },
                    options: {
                      offset: { x: 12, y: 35 },
                    },
                  }}
                  title="도착점"
                />
              )}

              {/* 러닝 경로 */}
              <Polyline
                path={polylinePath}
                strokeWeight={5}
                strokeColor="#FF69B4" // 핑크색
                strokeOpacity={0.8}
                strokeStyle="solid"
              />
            </>
          ) : (
            <div css={noRouteMessageStyles}>
              {selectedRecord
                ? '이 기록에는 경로 정보가 없습니다'
                : '러닝 기록을 선택하면 경로가 표시됩니다'}
            </div>
          )}
        </Map>
      </div>
    </div>
  )
}

export default RunningMap
