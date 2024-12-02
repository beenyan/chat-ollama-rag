interface SourceNode {
  metadata: {
    headline: string
    author: string
    time: string
  }
  text: string
}

interface RequestBody {
  source_nodes: Array<SourceNode>
}

export interface SourceNodes extends SourceNode {
  score: number
}

export interface ResponseData {
  source_nodes: Array<SourceNodes>,
  response: string
}

export default defineEventHandler(async (event): Promise<ResponseData> => {
  const { text } = getQuery(event)
  const body = await readBody<RequestBody>(event)
  const url = `http://140.125.45.129:5000/api/query/summary?text=${text}`
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }

  const response = await fetch(url, options)
  const data = await response.json() as ResponseData

  return data
})
