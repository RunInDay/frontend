import axios from 'axios'

interface AdviceData {
  message: string
}
export const fetchRandomAdvice = async (): Promise<string> => {
  try {
    const response = await axios.get<AdviceData>(
      'https://korean-advice-open-api.vercel.app/api/advice',
    )
    return response.data.message
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`명언을 불러오는 데 실패했습니다: ${error.message}`)
    } else {
      throw new Error('알 수 없는 오류가 발생했습니다.')
    }
  }
}
