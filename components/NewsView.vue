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
          :fuse="{ resultLimit: Infinity }"
        />
      </div>
    </div>

    <Floating @click="if (selectNews.length) chatDialog = !chatDialog;">
      <UAvatar
        :chip-color="selectNews.length ? 'red' : ''"
        :chip-text="selectNews.length"
        :class="selectNews.length ? 'cursor-pointer' : 'cursor-not-allowed'"
        icon="i-iconoir-chat-lines"
        size="lg"
      />
    </Floating>

    <UModal
      v-model="chatDialog"
      :ui="{ width: 'w-full sm:max-w-6xl', height: 'h-[800px]' }"
    >
      <div
        class="h-full max-w-6xl mx-auto flex flex-1 border border-gray-200 dark:border-gray-800 rounded-md shadow-md"
        style="--chat-side-width: 240px"
      >
        <ChatSessionList
          ref="chatSessionListRef"
          class="shrink-0 w-[var(--chat-side-width)]"
          @select="onChangeChatSession"
        />
        <NewsChat
          ref="chatRef"
          v-if="sessionId > 0"
          class="flex-1 px-4 pb-4 box-border w-[calc(100%-var(--chat-side-width))]"
          :news="selectNews"
          :session-id="sessionId"
          @change-settings="onChangeSettings"
          @message="onMessage"
        />
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import type { News } from "@/server/api/stocks/info/[id].get";
import type { ComponentInstance } from "vue";
import ChatSessionList from "~/components/ChatSessionList.vue";
import NewsChat, { type Message } from "~/components/NewsChat.vue";
import { type ChatSessionSettings } from "~/pages/chat/index.vue";

const props = defineProps<{
  news?: Array<News>;
}>();
const chatDialog = ref(false);
const selectNews = ref([]);
const sessionId = ref(0);
const latestMessageId = ref(0);
const chatSessionListRef =
  shallowRef<ComponentInstance<typeof ChatSessionList>>();
const chatRef = shallowRef<ComponentInstance<typeof NewsChat>>();

const onMessage = (data: Message | null) => {
  // remove a message if it's null
  if (data === null) {
    chatSessionListRef.value?.updateMessageCount(-1);
    return;
  }

  chatSessionListRef.value?.updateSessionInfo({
    title: data.content.slice(0, 20),
    updateTime: data.timestamp,
  });
  if (latestMessageId.value !== data.id) {
    chatSessionListRef.value?.updateMessageCount(1);
    latestMessageId.value = data.id!;
  }
};

const onChangeSettings = (data: ChatSessionSettings) => {
  chatSessionListRef.value?.updateSessionInfo({
    ...data,
    forceUpdateTitle: true,
  });
};

const onChangeChatSession = async (id: number) => {
  await chatRef.value?.abortChat();
  sessionId.value = id;
};
</script>

<style lang="scss">
.truncate {
  white-space: wrap;
}
</style>
