import React, { useEffect, useRef, useState } from "react"
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk"

declare global { interface Window { kakao: any } }

let kakaoLoaderPromise: Promise<void> | null = null
const loadKakaoMapsScript = (appKey: string): Promise<void> => {
  if (!appKey) return Promise.reject(new Error("Kakao JS appKey가 비어 있습니다."))
  if (typeof window === "undefined") return Promise.reject(new Error("SSR 환경에서 실행됨"))
  if (window.kakao?.maps?.Map) return Promise.resolve()
  if (kakaoLoaderPromise) return kakaoLoaderPromise

  kakaoLoaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-maps-sdk]')
    if (existing) {
      if (window.kakao?.maps?.Map) return resolve()
      existing.addEventListener("load", () => {
        if (window.kakao?.maps) window.kakao.maps.load(resolve)
        else reject(new Error("카카오맵 객체를 찾을 수 없습니다"))
      }, { once: true })
      existing.addEventListener("error", () => reject(new Error("기존 SDK 스크립트 로드 실패")), { once: true })
      return
    }

    const script = document.createElement("script")
    script.type = "text/javascript"
    script.async = true
    script.defer = true
    script.setAttribute("data-kakao-maps-sdk", "true")
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services,clusterer&autoload=false`
    script.addEventListener("load", () => {
      if (window.kakao && window.kakao.maps) window.kakao.maps.load(resolve)
      else reject(new Error("카카오맵 객체를 찾을 수 없습니다"))
    }, { once: true })
    script.addEventListener("error", () => reject(new Error("SDK 스크립트 다운로드 실패")), { once: true })
    document.head.appendChild(script)
  })
  return kakaoLoaderPromise
}

// ---- 타입 ----
type LatLng = { lat: number; lng: number }

interface KakaoMapProps {
  // 기존 단일 포인트
  latitude?: number
  longitude?: number
  title?: string

  width?: number | string
  height?: number | string
  showControls?: boolean

  // 경로(폴리라인) 직접 주입
  path?: LatLng[]
  fitToPath?: boolean

  // GPX 파일로 경로 만들기
  gpxUrl?: string

  // (선택) 카카오모빌리티 길찾기 자동 경로
  useAutoRoute?: boolean
  origin?: LatLng
  destination?: LatLng
  waypoints?: LatLng[]
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  latitude,
  longitude,
  title = "위치",
  width = "100%",
  height = 400,
  showControls = true,

  path,
  fitToPath = true,

  gpxUrl,

  useAutoRoute = false,
  origin,
  destination,
  waypoints = [],
}) => {
  const apiKey = import.meta.env.VITE_KAKAO_API_KEY as string | undefined
  const restKey = import.meta.env.VITE_KAKAO_REST_KEY as string | undefined

  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [center, setCenter] = useState<LatLng>({ lat: 37.5665, lng: 126.9780 })
  const [route, setRoute] = useState<LatLng[]>([]) // 그릴 경로
  const mapRef = useRef<any | null>(null) // kakao.maps.Map

  // --- SDK 로드 + 데이터 준비 ---
  useEffect(() => {
    const boot = async () => {
      setLoading(true); setError(null)
      try {
        if (!apiKey) throw new Error("VITE_KAKAO_API_KEY가 설정되지 않았습니다")
        await loadKakaoMapsScript(apiKey)
        setReady(true)

        // 1) 우선 순위: 경로 생성
        if (useAutoRoute && origin && destination) {
          if (!restKey) throw new Error("길찾기에는 VITE_KAKAO_REST_KEY가 필요합니다")
          const autoPath = await fetchKakaoDirections(restKey, origin, destination, waypoints)
          setRoute(autoPath)
          if (autoPath.length > 0) setCenter(autoPath[Math.floor(autoPath.length / 2)])
        } else if (gpxUrl) {
          const gpxPath = await parseGpxToPath(gpxUrl)
          setRoute(gpxPath)
          if (gpxPath.length > 0) setCenter(gpxPath[Math.floor(gpxPath.length / 2)])
        } else if (Array.isArray(path) && path.length > 0) {
          setRoute(path)
          setCenter(path[Math.floor(path.length / 2)])
        } else if (typeof latitude === "number" && typeof longitude === "number") {
          setCenter({ lat: latitude, lng: longitude })
        }
      } catch (e) {
        setError(e as Error); setReady(false)
      } finally {
        setLoading(false)
      }
    }
    boot()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, restKey, latitude, longitude, gpxUrl, useAutoRoute,
      origin?.lat, origin?.lng, destination?.lat, destination?.lng,
      JSON.stringify(waypoints), JSON.stringify(path)])

  // --- 경계 맞춤 ---
  const fitBounds = (m: any, pts: LatLng[]) => {
    if (!m || pts.length === 0) return
    const bounds = new window.kakao.maps.LatLngBounds()
    pts.forEach(p => bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng)))
    // 패딩은 상황에 맞게 조절
    m.setBounds(bounds)
  }

  // --- 상태별 UI ---
  if (loading) return box(`🔄 지도 로딩 중...`, width, height, "#f5f5f5")
  if (!apiKey) return box(`⚠️ .env에 VITE_KAKAO_API_KEY가 없습니다`, width, height, "#fff3cd")
  if (error) return box(`❌ 지도 오류: ${error.message}`, width, height, "#fbe9e9")
  if (!ready) return box(`⏳ SDK 초기화 중...`, width, height, "#f5f5f5")

  const hasRoute = route.length > 1

  return (
    <Map
      center={center}
      style={{ width, height, borderRadius: "8px" }}
      level={hasRoute ? 7 : 3}
      zoomable={showControls}
      draggable={showControls}
      scrollwheel={showControls}
      onCreate={(map) => {
        mapRef.current = map
        if (fitToPath && hasRoute) {
          // 다음 프레임에 경계 맞춤 + relayout 안전
          requestAnimationFrame(() => fitBounds(map, route))
        }
      }}
    >
      {/* 경로가 있으면 폴리라인 + 시작/끝 표시 */}
      {hasRoute && (
        <>
          <Polyline
            path={route}
            strokeWeight={7}
            strokeColor="#555555"
            strokeOpacity={0.9}
            strokeStyle="solid"
          />
          <MapMarker position={route[0]} title="출발" />
          <MapMarker position={route[route.length - 1]} title="도착" />
        </>
      )}

      {/* 경로가 없으면 단일 마커 */}
      {!hasRoute && (
        <MapMarker position={center} title={title} />
      )}
    </Map>
  )
}

// ---- 유틸: GPX → LatLng[] (trkpt 기반 간단 파서) ----
async function parseGpxToPath(gpxUrl: string): Promise<LatLng[]> {
  // Durunubi GPX URL을 프록시를 통해 접근
  let fetchUrl = gpxUrl
  if (gpxUrl.includes('durunubi.kr')) {
    const filePath = gpxUrl.replace('https://www.durunubi.kr/editImgUp.do?filePath=', '')
    fetchUrl = `/api/gpx?filePath=${encodeURIComponent(filePath)}`
  }
  
  const res = await fetch(fetchUrl)
  if (!res.ok) throw new Error(`GPX 로드 실패: ${res.status}`)
  const text = await res.text()
  const doc = new DOMParser().parseFromString(text, "text/xml")
  const pts = Array.from(doc.getElementsByTagName("trkpt"))
  const path: LatLng[] = []
  for (const p of pts) {
    const lat = parseFloat(p.getAttribute("lat") || "")
    const lng = parseFloat(p.getAttribute("lon") || "")
    if (Number.isFinite(lat) && Number.isFinite(lng)) path.push({ lat, lng })
  }
  return path
}

// ---- 유틸: 카카오모빌리티 길찾기 호출 → LatLng[] ----
// ref: 응답의 roads[].vertexes 는 [x,y,x,y,...] = [lng,lat,...] 순서의 1차원 배열 :contentReference[oaicite:4]{index=4}
async function fetchKakaoDirections(
  restKey: string,
  origin: LatLng,
  destination: LatLng,
  waypoints: LatLng[] = []
): Promise<LatLng[]> {
  const params = new URLSearchParams({
    origin: `${origin.lng},${origin.lat}`,
    destination: `${destination.lng},${destination.lat}`,
    priority: "RECOMMEND",
    summary: "false",
    road_details: "true",
  })
  if (waypoints.length) {
    params.set("waypoints", waypoints.map(w => `${w.lng},${w.lat}`).join("|"))
  }
  const res = await fetch(`https://apis-navi.kakaomobility.com/v1/directions?${params.toString()}`, {
    headers: { Authorization: `KakaoAK ${restKey}` }
  })
  if (!res.ok) throw new Error(`길찾기 실패: ${res.status}`)
  const json = await res.json()

  const sections = json?.routes?.[0]?.sections ?? []
  const roads = sections.flatMap((s: any) => s?.roads ?? [])
  const path: LatLng[] = []
  for (const r of roads) {
    const v: number[] = r.vertexes || []
    for (let i = 0; i < v.length; i += 2) {
      path.push({ lng: v[i], lat: v[i + 1] })
    }
  }
  return path
}

// ---- 단순 상태 박스 ----
function box(text: string, width: number | string, height: number | string, bg: string) {
  return (
    <div style={{
      width, height, backgroundColor: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      border: "1px solid #ddd", borderRadius: 8, fontSize: 14, color: "#333"
    }}>{text}</div>
  )
}

export default KakaoMap
