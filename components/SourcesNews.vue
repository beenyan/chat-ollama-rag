<script lang="ts" setup>
import type { SourceNodes } from '~/server/api/query/summary/index.post'

defineProps<{
  relevant_news: Array<SourceNodes>
}>()

const scoreCorrection = (score: number) => {
  // (sqrt(x * 100) * 10) / 100
  return Math.round(Math.sqrt(score * 100) * 100) / 1000
}
</script>

<template>
  <div class="mt-4 pt-4" v-if="relevant_news?.length > 0 && Object.keys(relevant_news[0].metadata).length">
    {{ relevant_news }}
    <h3 class="flex flex-row items-center font-bold gap-1 text-lg mb-2">
      <UIcon name="i-heroicons-newspaper" /> Sources
    </h3>
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-gray-100 dark:bg-yellow-900 border border-gray-200 dark:border-red-900 p-2 rounded hover:border-primary-400 hover:dark:border-primary-700"
           v-for="(relevant_news, index) in relevant_news"
           :key="index">
        <UPopover mode="click">
          <div class="w-full">
            <pre class="p-4 text-sm whitespace-break-spaces" v-text="relevant_news.metadata.headline" />
            <div class="flex w-full justify-between p-4 text-sm whitespace-break-spaces">
              <pre v-text="relevant_news.metadata.author" />
              <pre class="text-gray-500" v-text="scoreCorrection(relevant_news.score)" />
            </div>
          </div>

          <template #panel>
            <div class="max-h-[40vh] overflow-auto">
              <pre class="p-4 text-gray-500 text-sm whitespace-break-spaces" v-text="relevant_news.text" />
            </div>
          </template>
        </UPopover>
      </div>
    </div>
  </div>
</template>
