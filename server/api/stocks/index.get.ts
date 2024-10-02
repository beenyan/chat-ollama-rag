import prisma from "@/server/utils/prisma";

export type Stock = {
  stock_id: number;
  name: string;
};

export default defineEventHandler(async (event): Promise<Stock[]> => {
  return prisma.stock.findMany();
});
