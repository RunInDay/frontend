import { useState } from 'react'
import { css } from '@emotion/react'
import RunningRecordList from '@/features/map/components/RunningRecordList'
import type { RunningRecord } from '@/features/map/types/running'

// 임시 데이터 (실제로는 API에서 가져올 데이터)
const mockRunningRecords: RunningRecord[] = [
  {
    id: '1',
    date: '6월 29일',
    distance: 5,
    duration: '30:00',
    cadence: 180,
    heartRate: 150,
    pace: '6:00',
    calories: 300,
    route: [
      { lat: 35.1796, lng: 129.1756 },
      { lat: 35.18, lng: 129.176 },
      { lat: 35.1805, lng: 129.1765 },
      { lat: 35.181, lng: 129.177 },
      { lat: 35.1815, lng: 129.1775 },
      { lat: 35.182, lng: 129.178 },
      { lat: 35.1825, lng: 129.1785 },
      { lat: 35.183, lng: 129.179 },
      { lat: 35.1835, lng: 129.1795 },
      { lat: 35.184, lng: 129.18 },
    ],
  },
  {
    id: '2',
    date: '6월 28일',
    distance: 3,
    duration: '18:30',
    cadence: 175,
    heartRate: 145,
    pace: '6:10',
    calories: 180,
    route: [
      { lat: 35.1796, lng: 129.1756 },
      { lat: 35.1798, lng: 129.1758 },
      { lat: 35.18, lng: 129.176 },
      { lat: 35.1802, lng: 129.1762 },
      { lat: 35.1804, lng: 129.1764 },
      { lat: 35.1806, lng: 129.1766 },
      { lat: 35.1808, lng: 129.1768 },
      { lat: 35.181, lng: 129.177 },
    ],
  },
]

const Map = () => {
  const [records] = useState<RunningRecord[]>(mockRunningRecords)

  return (
    <div css={pageContainerStyles}>
      <header css={headerStyles}>
        <h1 css={headerTitleStyles}>마이 러닝 데이터</h1>
      </header>

      <div css={contentContainerStyles}>
        <section css={recordsSectionStyles}>
          {records.length > 0 ? (
            <RunningRecordList records={records} />
          ) : (
            <div css={emptyStateStyles}>
              <div css={emptyIconStyles}>🏃‍♂️</div>
              <h3 css={emptyTitleStyles}>러닝 기록이 없습니다</h3>
              <p css={emptyDescriptionStyles}>첫 번째 러닝을 시작해보세요!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const pageContainerStyles = css`
  min-height: 100vh;
  background: #f5f5f5;
`

const headerStyles = css`
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
`

const headerTitleStyles = css`
  font-family: 'PretendardSemiBold', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`

const contentContainerStyles = css`
  padding: 0;
`

const recordsSectionStyles = css`
  background: white;
  min-height: 200px;
`

const emptyStateStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
  text-align: center;
`

const emptyIconStyles = css`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 24px;
`

const emptyTitleStyles = css`
  font-family: 'PretendardSemiBold', sans-serif;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
`

const emptyDescriptionStyles = css`
  font-family: 'PretendardRegular', sans-serif;
  font-size: 14px;
  margin: 0;
  color: #666;
`

export default Map
