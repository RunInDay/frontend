/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import { fetchRandomAdvice } from '@/features/Running/services/Wisesaying' // 방금 만든 함수 import

const Text = () => {
  const [advice, setAdvice] = useState<string>('명언을 불러오는 중...')

  useEffect(() => {
    const loadAdvice = async () => {
      try {
        const data = await fetchRandomAdvice()
        setAdvice(data)
      } catch (error) {
        if (error instanceof Error) {
          setAdvice(error.message)
        } else {
          setAdvice('알 수 없는 오류가 발생했습니다.')
        }
      }
    }

    loadAdvice()
  }, [])

  return <div css={textStyle}>{advice}</div>
}

export default Text

const textStyle = css`
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
  margin-top: 2rem;
`
