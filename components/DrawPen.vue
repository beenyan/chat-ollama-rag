<template>
    <UButton
             @click="setPen(tag)"
             color="indigo"
             :variant="pen === tag ? 'solid' : 'outline'" />
</template>

<script setup lang="ts">
const prop = defineProps<{ pen: null | string, tag: string }>()
const emit = defineEmits<{
    (e: 'update:pen', value: string | null): void
}>()

const setPen = (name: string) => {
    let newPen = null
    if (prop.pen !== name) {
        newPen = name
    }

    emit('update:pen', newPen)
}
</script>
