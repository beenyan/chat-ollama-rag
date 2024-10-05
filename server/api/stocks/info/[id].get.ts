import type { KnowledgeBase } from "@prisma/client"
import prisma from "@/server/utils/prisma"

export interface News {
  id: number
  date: string
  link: string
  source: string
  stock_id: number
  title: string
}

export default defineEventHandler(async (event) => {
  const id = event?.context?.params?.id
  if (!id) return

  const price = JSON.parse(JSON.stringify(
    await prisma.stockPrice.findMany({ where: { stock_id: parseInt(id) } }),
    (key, value) => (typeof value === 'bigint' ? value.toString() : value)
  ))

  return {
    price,
    news: await prisma.stockNew.findMany({ where: { stock_id: parseInt(id) } }),
  }
})
