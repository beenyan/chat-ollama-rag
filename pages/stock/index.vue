<template>
  <div class="flex items-center flex-col h-full overflow-hidden">
    <div class="gap-3 mt-1 mb-4 max-w-6xl mx-auto flex rounded-md shadow-md">
      <UButton
        color="blue"
        variant="outline"
        @click="targetIdx = index"
        v-for="(stock, index) in stocks"
        :key="stock.stock_id"
        >{{ stock.stock_id }}</UButton
      >
    </div>

    <div class="flex justify-center gap-4 h-full w-full">
      <div class="h-full w-7/12 grid" style="max-height: 90%">
        <StockView
          @select-news="(news) => (selectNews = news)"
          v-if="targetIdx !== null"
          :stock="stocks[targetIdx]"
        />
      </div>

      <div class="h-full w-3/12">
        <NewsView :news="selectNews" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Stock } from "@prisma/client";
const stocks = ref<Stock[]>([]);
const targetIdx = ref<number | null>(null);
const selectNews = ref([]);

onMounted(async () => {
  stocks.value = await $fetchWithAuth<Stock[]>("/api/stocks/");
});
</script>
