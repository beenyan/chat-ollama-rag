import type { KnowledgeBase } from "@prisma/client";
import prisma from "@/server/utils/prisma";

export interface News {
  id: number;
  date: string;
  link: string;
  source: string;
  stock_id: number;
  title: string;
}

export default defineEventHandler(async (event) => {
  const id = event?.context?.params?.id;
  if (!id) return;

  return {
    price: await prisma.stockPrice.findMany({
      where: { stock_id: parseInt(id) },
    }),
    news: await prisma.stockNew.findMany({ where: { stock_id: parseInt(id) } }),
  };
});
