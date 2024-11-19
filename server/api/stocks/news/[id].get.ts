import prisma from "@/server/utils/prisma"

export default defineEventHandler(async (event) => {
  const id = event?.context?.params?.id
  if (!id) return

  return await prisma.stockNews.findMany({ where: { stock_id: parseInt(id) } })
})
