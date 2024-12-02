import type { SourceNodes } from '~/server/api/query/summary/index.post'

export interface ChatMessage {
  id?: number
  role: 'system' | 'assistant' | 'user'
  model: string
  content: string
  type?: 'loading' | 'canceled' | 'error'
  startTime: number
  endTime: number
  relevantDocs?: RelevantDocument[]
  relevantNews?: SourceNodes[]
}
