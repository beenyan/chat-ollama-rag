<template>
    <canvas class="absolute select-none" :class="{ 'pointer-events-none': pen === null }" ref="canvas"></canvas>
</template>

<script setup lang="ts">
import type { Info } from '~/types/penCanvas'

const info = defineModel<Info>('info')
const prop = defineProps<{ pen: null | string }>()
const emit = defineEmits<{ (e: 'change:info', value: Info): void }>()
const canvas = ref<null | HTMLCanvasElement>(null)
const context = ref<null | CanvasRenderingContext2D>(null)
const mouseEnter = ref(false)
const pos1 = { x: 0, y: 0 }
const pos2 = { x: 0, y: 0 }

const canvasMouseDown = (event: HTMLElementEventMap['mousedown']) => {
    pos1.x = event.offsetX
    pos1.y = event.offsetY
    mouseEnter.value = true
}

const MouseUp = (_: HTMLElementEventMap['mouseup']) => {
    if (mouseEnter.value === false) return

    mouseEnter.value = false
    if (!canvas.value) return

    // Update Model Value
    info.value = {
        rect: calcRect(canvas.value)
    }
}

const canvasMouseMove = (event: HTMLElementEventMap['mousemove']) => {
    if (!mouseEnter.value) return

    pos2.x = event.offsetX
    pos2.y = event.offsetY
}

const resizeCanvas = () => {
    if (!canvas.value) return

    const parentRect = canvas.value.parentElement?.getBoundingClientRect()
    if (!parentRect || canvas.value.width === parentRect.width && canvas.value.height === parentRect.height) return

    canvas.value.width = parentRect.width
    canvas.value.height = parentRect.height

    render()
}

const calcRect = (canvas: HTMLCanvasElement) => {
    const TOP = 80
    const BOTTOM = 20
    const Left = 50

    let x = Math.max(Left, pos1.x)
    const y = TOP
    let w = pos2.x - x
    const h = canvas.height - TOP - BOTTOM

    // let w alway positive
    if (w < 0) {
        x += w
        w = -w
    }

    return { x, y, w, h }
}

const infoInverse = (info: Info) => {
    const { rect } = info

    pos1.x = rect.x
    pos1.y = rect.y
    pos2.x = rect.x + rect.w
    pos2.y = rect.y + rect.h
}

const render = () => {
    if (prop.pen === null || !context.value || !canvas.value) {
        requestAnimationFrame(render)
        return
    }

    const ctx = context.value
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    const { x, y, w, h } = calcRect(canvas.value)

    ctx.beginPath()
    ctx.fillStyle = "rgba(255,141,161, 0.05)"
    ctx.strokeStyle = "rgba(255,141,161)"
    ctx.rect(x, y, w, h)
    ctx.fill()
    ctx.stroke()
    requestAnimationFrame(render)
}

requestAnimationFrame(render)

watch(
    () => prop.pen,
    () => {
        if (prop.pen !== null || !canvas.value || !context.value) return
        context.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
    }
)

onMounted(() => {
    if (info.value) infoInverse(info.value)
    context.value = canvas.value?.getContext('2d') ?? null
    canvas.value?.addEventListener('mousedown', canvasMouseDown)
    canvas.value?.addEventListener('mousemove', canvasMouseMove)
    window.addEventListener('mouseup', MouseUp)
    window.addEventListener('resize', resizeCanvas)
    setTimeout(resizeCanvas, 1000)
})

onUnmounted(() => {
    window.removeEventListener('mouseup', MouseUp)
    window.removeEventListener('resize', resizeCanvas)
})
</script>