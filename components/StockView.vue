<template>
  <div class="row-span-1">
    <!-- <DatePicker v-model="range" /> -->
  </div>
  <div class="flex row-span-7">
    <UButtonGroup class="py-3 px-2" size="md" orientation="vertical">
      <DrawPen @update:pen="newPen => pen = newPen" :pen tag="select" icon="i-iconoir-border-out"></DrawPen>
    </UButtonGroup>
    <div class="w-full">
      <PenCanvas :pen v-model:info="newsCanvasInfo"></PenCanvas>
      <Bar
           style="background-color: #232b38"
           :data="dataFilter()"
           :options="options"
           :key="loading"
           :plugins="(plugins as any)" />
    </div>
  </div>
  <div class="row-span-2">
    <PenCanvas pen="select" v-model:info="dateCanvasInfo"></PenCanvas>
    <Bar
         style="background-color: #19212c"
         :data="data"
         :options="options"
         :key="loading"
         :plugins="(fullPlugins as any)" />
  </div>
</template>

<script lang="ts" setup>
import { Bar } from "vue-chartjs"
import { format } from "date-fns"
import type { Stock } from "@prisma/client"
import type { News } from '~/types/news'
import type { Chart, ChartEvent, ActiveElement, Element } from "chart.js"
import type { Info } from '~/types/penCanvas'
import type { Price } from '~/types/prices'
import type { AnyObject } from 'yup'

const emit = defineEmits(["selectNews"])
const props = defineProps<{ stock: Stock }>()
const loading = ref(0)
const newsCanvasInfo = ref<Info>()
const dateCanvasInfo = ref<Info>({ rect: { x: 50, y: 80, w: 60, h: 69 } })
const pen = ref<null | string>(null)
const canvasElements = ref<Array<Element<AnyObject, AnyObject>>>([])
const fullCanvasElements = ref<Array<Element<AnyObject, AnyObject>>>([])
const newsFetch = ref<Array<News>>([])
const backgroundColor = ref<Array<String>>([])
const pricesFetch = ref<Array<Price>>([])
const data = ref({
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Open & Close",
      backgroundColor: "#1355FF",
      data: [],
    },
    {
      label: "Max & Min",
      barPercentage: 0.2,
      backgroundColor: "#1355FF",
      data: [],
    },
    {
      label: "News",
      barPercentage: 0.1,
      backgroundColor: "#010819",
      data: [],
      yAxisID: 'y1',
    },
  ],
})
const options = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      ticks: {
        color: "#718096",
        maxTicksLimit: 5,
      },
      grid: {
        color: "#2e3746",
      },
    },
    y: {
      beginAtZero: false,
      ticks: {
        color: "#718096",
      },
      grid: {
        color: "#2e3746",
      },
    },
  },
  plugins: {
    title: {
      display: true,
      text: "Stock Prices Trend",
      font: {
        size: 24,
      },
      color: "#718096",
    },
    tooltip: {
      callbacks: {
        footer: (stocks: Array<any>) => {
          const displayElementLen = 15
          const todayNews = newsFromDate(new Date(stocks[0].label))

          let footer = todayNews
            .slice(0, displayElementLen)
            .map((n) => n.title)
            .join("\n")

          if (todayNews.length === 0) {
            footer += '本日無新聞'
          } else if (todayNews.length >= displayElementLen) {
            footer += `\n+ ${todayNews.length - displayElementLen} ...`
          }
          return footer
        },
      },
    },
  },
  onClick: (_: ChartEvent, elements: ActiveElement[], chart: Chart) => {
    if (elements.length === 0 || !chart.data.labels) return

    const index = elements[0].index
    const news = newsFromDate(new Date(chart.data.labels[index] as string))

    emit("selectNews", news)
  },
})

const fetch = async () => {
  newsFetch.value = (await $fetchWithAuth(`/api/stocks/news/${props.stock.stock_id}`) as any) || []
  pricesFetch.value = (await $fetchWithAuth(`/api/stocks/price/${props.stock.stock_id}`) as any) || []
  if (!newsFetch.value || !pricesFetch.value) return

  backgroundColor.value = pricesFetch.value.map((p) => p.spread > 0 ? 'green' : 'red')
  data.value.labels = pricesFetch.value.map((p) => p.date)
  data.value.datasets[0].data = pricesFetch.value.map((p) => [
    p.close,
    p.open,
  ]) as never[]
  data.value.datasets[0].backgroundColor = backgroundColor as any as string
  data.value.datasets[1].data = pricesFetch.value.map((p) => [
    p.min,
    p.max,
  ]) as never[]
  data.value.datasets[1].backgroundColor = backgroundColor as any as string

  const newsAmountMap = newsFetch.value.map(x => +new Date(format(new Date(x.date), "yyy-MM-d"))).reduce((map, item) => {
    const currentCount = (map.get(item) || 0) + 1

    return map.set(item, currentCount)
  }, new Map<number, number>())

  data.value.datasets[2].data = pricesFetch.value.map((p, _) => {
    const datetime = +new Date(format(new Date(p.date), "yyy-MM-d"))
    const amount = newsAmountMap.get(datetime)

    return amount
  }) as never[]

  loading.value++
}

const dataFilter = () => {
  const { rect } = dateCanvasInfo.value

  const idx = [rect.x, rect.x + rect.w].map((x) => {
    const index = fullCanvasElements.value.findIndex((data) => x <= data.x)
    return (index === -1) ? fullCanvasElements.value.length : index
  })

  const newData = JSON.parse(JSON.stringify(data.value)) as typeof data.value
  newData.labels = newData.labels.splice(idx[0], idx[1] - idx[0])

  for (let index = 0; index < 3; index++) {
    newData.datasets[index].data = newData.datasets[index].data.splice(idx[0], idx[1] - idx[0])
    if (Array.isArray(newData.datasets[index].backgroundColor)) {
      newData.datasets[index].backgroundColor = (newData.datasets[index].backgroundColor as any as Array<string>).splice(idx[0], idx[1] - idx[0]) as any as string
    }
  }

  return newData
}

const newsFromDate = (date: Date) => {
  return newsFetch.value.filter(
    (news) =>
      news.stock_id === props.stock.stock_id &&
      format(new Date(news.date), "yyy-MM-d") === format(date, "yyy-MM-d")
  )
}

const plugins = [{
  afterUpdate: (chart: Chart) => {
    canvasElements.value = chart.getDatasetMeta(0).data.filter(e => e.x)
  }
}]

const fullPlugins = [{
  afterUpdate: (chart: Chart) => {
    fullCanvasElements.value = chart.getDatasetMeta(0).data
  }
}]

watch(
  () => props.stock,
  () => fetch()
)

watch(
  () => newsCanvasInfo.value?.rect,
  () => {
    if (!newsCanvasInfo.value) return
    const { rect } = newsCanvasInfo.value

    const idx = [rect.x, rect.x + rect.w].map((x) => {
      const index = canvasElements.value.findIndex((data) => x <= data.x)
      return (index === -1) ? canvasElements.value.length : index
    })

    const dates = dataFilter().labels
    const news = Array.from({ length: idx[1] - idx[0] }, (_, i) => i + idx[0]).flatMap(index => newsFromDate(new Date(dates[index] as string)))

    emit("selectNews", news)
  }
)

onMounted(() => fetch())
</script>
