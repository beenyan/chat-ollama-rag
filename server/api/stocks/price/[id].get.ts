import prisma from "@/server/utils/prisma"
import type { Price } from '~/types/prices'

export default defineEventHandler(async (event) => {
  const id = event?.context?.params?.id
  if (!id) return

  const prices = JSON.parse(JSON.stringify(
    await prisma.stockPrice.findMany({ where: { stock_id: parseInt(id) } }),
    (key, value) => (typeof value === 'bigint' ? value.toString() : value)
  ))

  return prices as Array<Price>
})
