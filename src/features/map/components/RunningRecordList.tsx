import { useState } from 'react'
import { css } from '@emotion/react'
import RunningMap from '@/features/map/components/RunningMap'
import type { RunningRecord } from '@/features/map/types/running'

interface RunningRecordListProps {
  records: RunningRecord[]
}

const RunningRecordList = ({ records }: RunningRecordListProps) => {
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null)

  const toggleExpanded = (recordId: string) => {
    // 아코디언 방식: 하나를 열면 다른 것은 닫힘
    if (expandedRecordId === recordId) {
      setExpandedRecordId(null) // 같은 것을 다시 클릭하면 닫기
    } else {
      setExpandedRecordId(recordId) // 다른 것을 클릭하면 열기
    }
  }

  const handleRecordClick = (record: RunningRecord) => {
    toggleExpanded(record.id) // 카드 클릭 시 토글 작동
  }

  return (
    <div css={containerStyles}>
      {records.map((record) => {
        const isExpanded = expandedRecordId === record.id

        return (
          <div
            key={record.id}
            css={recordItemStyles(isExpanded)}
            onClick={() => handleRecordClick(record)}
          >
            <div css={recordHeaderStyles}>
              <div>
                <div css={dateTextStyles}>{record.date}</div>
                <div css={summaryTextStyles}>
                  {record.distance}km • {record.duration}
                </div>
              </div>
              <button
                css={toggleButtonStyles}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(record.id)
                }}
              >
                <span css={toggleIconStyles(isExpanded)}>▶</span>
                기록 더보기
              </button>
            </div>

            <div css={detailSectionStyles(isExpanded)}>
              <div css={detailItemStyles}>
                <span css={detailLabelStyles}>케이던스:</span>
                <span css={detailValueStyles}>{record.cadence || 0} spm</span>
              </div>
              <div css={detailItemStyles}>
                <span css={detailLabelStyles}>키로미터:</span>
                <span css={detailValueStyles}>{record.distance} km</span>
              </div>
              <div css={detailItemStyles}>
                <span css={detailLabelStyles}>시간:</span>
                <span css={detailValueStyles}>{record.duration}</span>
              </div>
              <div css={detailItemStyles}>
                <span css={detailLabelStyles}>심박수:</span>
                <span css={detailValueStyles}>{record.heartRate || 0} bpm</span>
              </div>
              <div css={detailItemStyles}>
                <span css={detailLabelStyles}>키로당 페이스:</span>
                <span css={detailValueStyles}>{record.pace || '6:00'}</span>
              </div>
              <div css={detailItemStyles}>
                <span css={detailLabelStyles}>칼로리:</span>
                <span css={detailValueStyles}>{record.calories || 0} kcal</span>
              </div>

              {/* 러닝 경로 지도 */}
              {isExpanded && (
                <div css={mapSectionStyles}>
                  <div css={mapTitleStyles}>러닝 경로</div>
                  <RunningMap selectedRecord={record} />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
const containerStyles = css`
  padding: 16px;
  background: white;
`

const recordItemStyles = (isExpanded: boolean) => css`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 16px;
  background: ${isExpanded ? '#f8f9fa' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007bff;
  }
`

const recordHeaderStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const dateTextStyles = css`
  font-family: 'PretendardSemiBold', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`

const summaryTextStyles = css`
  font-family: 'PretendardRegular', sans-serif;
  font-size: 14px;
  color: #666;
`

const toggleButtonStyles = css`
  background: none;
  border: none;
  font-family: 'PretendardRegular', sans-serif;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: #007bff;
  }
`

const toggleIconStyles = (isExpanded: boolean) => css`
  transform: ${isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`

const detailSectionStyles = (isExpanded: boolean) => css`
  max-height: ${isExpanded ? '200px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`

const detailItemStyles = css`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-family: 'PretendardRegular', sans-serif;
  font-size: 14px;
`

const detailLabelStyles = css`
  color: #666;
`

const detailValueStyles = css`
  font-family: 'PretendardSemiBold', sans-serif;
  color: #333;
  font-weight: 500;
`

const mapSectionStyles = css`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`

const mapTitleStyles = css`
  font-family: 'PretendardSemiBold', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`

export default RunningRecordList
