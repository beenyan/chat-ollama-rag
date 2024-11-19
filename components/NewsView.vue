<template>
  <div class="grid grid-rows-12 h-full bg-zinc-900 p-3 rounded-lg">
    <div class="flex flex-col row-span-12">
      <div class="flex justify-between items-end" v-if="news">
        <span class="mb-2">News Amount: {{ news.length }}</span>
        <span class="text-sm text-zinc-500" v-if="news.length">{{
          format(new Date(news[0].date), "yyy-MM-d")
        }}</span>
      </div>

      <div class="overflow-auto pb-10">
        <UCommandPalette
                         v-model="selectNews"
                         multiple
                         nullable
                         command-attribute="title"
                         :groups="[{ key: 'news', commands: news }]"
                         :fuse="{ resultLimit: Infinity }" />
      </div>
    </div>

    <Floating @click="openChatDialog">
      <UAvatar
               :chip-color="selectNews.length ? 'red' : 'gray'"
               :chip-text="selectNews.length"
               :class="selectNews.length ? 'cursor-pointer' : 'cursor-not-allowed'"
               icon="i-iconoir-chat-lines"
               size="lg" />
    </Floating>

    <UModal
            v-model="chatDialog"
            :ui="{ width: 'w-full sm:max-w-6xl', height: 'h-[800px]' }">
      <div class="h-full flex flex-1 border border-gray-200 dark:border-gray-800 rounded-md shadow-md"
           style="--chat-side-width:240px">
        <ClientOnly>
          <ChatSessionList ref="chatSessionListRef"
                           class="shrink-0 w-[var(--chat-side-width)] hidden md:block"
                           @select="onChangeChatSession" />
        </ClientOnly>
        <NewsChat ref="chatRef" v-if="sessionId > 0"
                  class="flex-1 md:px-4 pb-4 box-border w-full md:w-[calc(100%-var(--chat-side-width))]"
                  :session-id="sessionId"
                  :news="selectNews"
                  :stock="stock"
                  @change-settings="onChangeSettings"
                  @message="onMessage">
          <template #left-menu-btn>
            <UButton icon="i-material-symbols-lists-rounded" color="gray" class="mr-4 md:hidden rotate-180" @click="onOpenSideMenu"></UButton>
          </template>
        </NewsChat>
        <div v-else class="grow h-full flex justify-center items-center">
          <UButton icon="i-material-symbols-add" color="primary" square @click="onNewChat">{{ t("chat.newChat") }}</UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns"
import type { News } from '~/types/news'
import type { ComponentInstance } from 'vue'
import ChatSessionList from '~/components/ChatSessionList.vue'
import Chat from '~/components/Chat.vue'
import type { ChatMessage } from '@/types/chat'
import type { Stock } from "@prisma/client"

const createChatSession = useCreateChatSession()
const props = defineProps<{
  news?: Array<News>,
  stock: Stock
}>()
const chatDialog = ref(false)
const selectNews = ref([])
export interface ChatSessionSettings extends Partial<Omit<ChatSession, 'id' | 'createTime'>> { }

const { t } = useI18n()
const chatSessionListRef = shallowRef<ComponentInstance<typeof ChatSessionList>>()
const chatRef = shallowRef<ComponentInstance<typeof Chat>>()
const slideover = useSlideover()
const { isMobile } = useMediaBreakpoints()
const sessionList = ref<ChatSession[]>([])

const sessionId = ref(0)
const latestMessageId = ref(0)

watch(isMobile, val => {
  if (!val) {
    slideover.close()
  }
})

function onChangeSettings(data: ChatSessionSettings) {
  chatSessionListRef.value?.updateSessionInfo({ ...data, forceUpdateTitle: true })
}

function onMessage(data: ChatMessage | null) {
  // remove a message if it's null
  if (data === null) {
    return
  }

  chatSessionListRef.value?.updateSessionInfo({
    title: data.content.slice(0, 20),
    updateTime: data.endTime || data.startTime,
  })
  if (latestMessageId.value !== data.id) {
    latestMessageId.value = data.id!
  }
}

function onNewChat() {
  chatSessionListRef.value?.createChat()
}

async function onChangeChatSession(id: number) {
  sessionId.value = id
}

function onOpenSideMenu() {
  slideover.open(ChatSessionList, {
    ref: chatSessionListRef,
    onSelect: onChangeChatSession,
    onClosePanel: () => {
      slideover.close()
    },
    side: 'left',
    preventClose: true,
  })
}

const openChatDialog = async () => {
  if (!selectNews.value.length) return

  // const data = await createChatSession({
  //   title: `${format(new Date(), "yyy年MM月d日")} - ${props.news?.length} News`
  // })

  chatDialog.value = !chatDialog.value
}
</script>

<style lang="scss">
.truncate {
  white-space: wrap;
}
</style>
