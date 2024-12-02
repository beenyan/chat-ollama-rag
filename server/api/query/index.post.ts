import { ResponseData } from './summary/index.post'

export default defineEventHandler(async (event): Promise<ResponseData> => {
  const { text } = getQuery(event)
  const url = `http://140.125.45.129:5000/api/query?text=${text}`
  const options: RequestInit = {
    method: 'GET',
  }

  const response = await fetch(url, options)
  const data = await response.json() as ResponseData

  return data
})
