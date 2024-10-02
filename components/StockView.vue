<template>
  <div class="row-span-1">
    <DatePicker v-model="range" />
  </div>
  <div class="row-span-7">
    <Bar
      style="background-color: #232b38"
      :data="data_filter()"
      :options="options"
      :key="loading"
    />
  </div>
  <div class="row-span-2">
    <Bar
      style="background-color: #19212c"
      :data="data"
      :options="options"
      :key="loading"
    />
  </div>
</template>

<script lang="ts" setup>
import { Bar } from "vue-chartjs";
import type { Stock } from "@prisma/client";
import type { News } from "@/server/api/stocks/info/[id].get";
import { format } from "date-fns";
import type { Chart, ChartEvent, ActiveElement } from "chart.js";

const emit = defineEmits(["selectNews"]);
const props = defineProps<{ stock: Stock }>();
const loading = ref(0);
const news = ref<Array<News>>([]);
const range = ref({
  start: new Date("2023-01-01"),
  end: new Date("2023-02-01"),
});
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
  ],
});
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
      text: "", //stock.name,
      font: {
        size: 24,
      },
      color: "#718096",
    },
    tooltip: {
      events: ["click"],
      callbacks: {
        footer: (stocks: Array<any>) => {
          const todayNews = newsFromDate(new Date(stocks[0].label));

          let footer = todayNews
            .slice(0, 20)
            .map((n) => n.title)
            .join("\n");

          if (footer.length >= 20) {
            footer += `\n+ ${todayNews.length - 20} ...`;
          }
          return footer;
        },
      },
    },
  },
  onClick: (_: ChartEvent, elements: ActiveElement[], chart: Chart) => {
    if (elements.length === 0 || !chart.data.labels) return;
    const index = elements[0].index;
    const news = newsFromDate(new Date(chart.data.labels[index] as string));
    emit("selectNews", news);
  },
});

const fetch = async () => {
  const response = await $fetchWithAuth(
    `/api/stocks/info/${props.stock.stock_id}`
  );
  if (!response) return;

  news.value = response.news;
  data.value.labels = response.price.map((p) => p.date);
  data.value.datasets[0].data = response.price.map((p) => [
    p.close,
    p.open,
  ]) as never[];

  data.value.datasets[1].data = response.price.map((p) => [
    p.min,
    p.max,
  ]) as never[];

  loading.value++;
};

const data_filter = () => {
  const dates = data.value.labels.map((target) => new Date(target));
  const idx = [range.value.start, range.value.end].map((rg) =>
    dates.findIndex((date) => date >= rg)
  );

  const newData = JSON.parse(JSON.stringify(data.value)) as typeof data.value;
  newData.labels = newData.labels.splice(idx[0], idx[1] - idx[0]);

  return newData;
};

const newsFromDate = (date: Date) => {
  return news.value.filter(
    (news) =>
      news.stock_id === props.stock.stock_id &&
      format(new Date(news.date), "yyy-MM-d") === format(date, "yyy-MM-d")
  );
};

watch(
  () => props.stock,
  () => fetch()
);

onMounted(() => fetch());
</script>
