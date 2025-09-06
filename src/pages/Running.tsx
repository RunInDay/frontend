import { useState } from 'react'
import Wisesaying from '@/features/Running/components/Wisesaying'

const Running = () => {
  const [isRun, setIsRun] = useState<boolean>(false)

  return (
    <div>
      {isRun ? (
        <>
          <button onClick={() => setIsRun(false)}>정지</button>
        </>
      ) : (
        <>
          <Wisesaying />
          <button onClick={() => setIsRun(true)}>시작</button>
        </>
      )}
    </div>
  )
}

export default Running
