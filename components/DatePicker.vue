<template>
  <UPopover :popper="{ placement: 'bottom-start' }">
    <UButton v-if="date" icon="i-heroicons-calendar-days-20-solid">
      {{ format(date.start as Date, "yyy年MM月d日") }} -
      {{ format(date.end as Date, "yyy年MM月d日") }}
    </UButton>

    <template #panel="{ close }">
      <div
        class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800"
      >
        <DatePicker v-model.range="date" @close="close" is-dark />
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { DatePicker } from "v-calendar";
import { format } from "date-fns";
import type { DatePickerRangeObject } from "v-calendar/dist/types/src/use/datePicker.js";
const props = defineProps({
  modelValue: {
    type: [Date, Object] as PropType<DatePickerRangeObject | null>,
    default: null,
  },
});

const date = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:model-value", value);
    emit("close");
  },
});

const emit = defineEmits(["update:model-value", "close"]);
</script>
