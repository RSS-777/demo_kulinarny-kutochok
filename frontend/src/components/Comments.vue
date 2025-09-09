<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authUser'
import { addCommentApi, getCommentsByRecipeApi, deleteCommentApi, deleteReplyApi, addReplyApi } from '@/api/commentsApi'
import type { IComment } from '@/api/commentsApi'

const { recipeId } = defineProps<{ recipeId: string }>()
const authStore = useAuthStore()
const comments = ref<IComment[]>([])
const openComments = reactive<Record<string, boolean>>({})
const showAddCommentForm = ref<boolean>(false)
const newCommentText = ref<string>('')
const replyToCommentId = ref<string | null>(null)
const newReplyText = ref<string>('')
const isLoading = ref(false)

const fetchGetComments = async () => {
  isLoading.value = true
  const response = await getCommentsByRecipeApi(recipeId)
  if (response.success && response.comments) {
    comments.value = response.comments
  } else {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error(response.error)
    }
  }

  isLoading.value = false
}

const handletoggleShowAnswers = (commentId: string) => {
  openComments[commentId] = !openComments[commentId]
}

const handleAddComment = async () => {
  const token = authStore.token
  if (!token || !recipeId) return

  const response = await addCommentApi(recipeId, newCommentText.value, token)
  if (response.success && response.comment) {
    comments.value.push(response.comment)
    newCommentText.value = ''
    showAddCommentForm.value = false
  } else {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error(response.error)
    }
  }
}

const handleDeleteComment = async (commentId: string) => {
  const token = authStore.token
  if (!token) return

  const response = await deleteCommentApi(commentId, token)
  if (response.success) {
    comments.value = comments.value.filter((comment) => comment._id !== commentId)
  } else {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error(response.error)
    }
  }
}

const handleDeleteAnswer = async (commentId: string, answerId: string) => {
  const token = authStore.token
  if (!token) return

  const response = await deleteReplyApi(commentId, answerId, token)
  if (response.success) {
    const comment = comments.value.find((c) => c._id === commentId)
    if (comment) {
      comment.answers = comment.answers.filter((a) => a.id !== answerId)
    }
  } else {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error(response.error)
    }
  }
}

const startReply = (commentId: string) => {
  replyToCommentId.value = commentId
  newReplyText.value = ''
}

const handleAddReply = async (commentId: string) => {
  if (!newReplyText.value.trim()) return
  const token = authStore.token
  if (!token) return

  const response = await addReplyApi(commentId, newReplyText.value, token)
  if (response.success && response.answer) {
    const comment = comments.value.find((c) => c._id === commentId)
    if (comment) {
      comment.answers.push(response.answer)
    }

    newReplyText.value = ''
    replyToCommentId.value = null
    openComments[commentId] = true
  } else {
    if (import.meta.env.VITE_APP_MODE === 'development') {
      console.error(response.error)
    }
  }
}

watch(
  () => recipeId,
  async () => {
    await fetchGetComments()
  },
)

onMounted(async () => {
  await fetchGetComments()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <div v-if="authStore.token">
        <button
          @click="showAddCommentForm = !showAddCommentForm"
          class="button-change mb-4 px-4 py-2 w-full rounded-lg text-sm cursor-pointer shadow-md shadow-black/40 hover:shadow-sm duration-150"
        >
          {{ showAddCommentForm ? 'Скасувати' : 'Додати коментар' }}
        </button>

        <div v-if="showAddCommentForm" class="mb-6">
          <textarea
            v-model="newCommentText"
            class="w-full border border-gray-300 rounded p-2 resize-none outline-none"
            rows="3"
            placeholder="Ваш коментар"
          ></textarea>
          <button
            @click="handleAddComment"
            class="button-change mt-2 px-4 py-2 rounded-lg text-sm cursor-pointer w-fit shadow-md shadow-black/40 hover:shadow-sm duration-150"
          >
            Надіслати
          </button>
        </div>
      </div>
      <p v-else class="text-gray-600 italic mb-4">Залишати коментарі можуть лише зареєстровані користувачі.</p>
    </div>
    <div v-if="isLoading" class="py-4 italic text-gray-500">Завантаження коментарів...</div>
    <article
      v-else-if="comments.length"
      v-for="comment in comments"
      :key="comment._id"
      class="p-4 rounded shadow-sm bg-white border border-gray-200"
    >
      <header class="flex items-center justify-between mb-1">
        <span class="font-semibold title-color">{{
          comment.userId === authStore.userId ? 'Ви' : comment.userName
        }}</span>
        <time class="text-xs text-[var(--color-text-muted)]" :datetime="comment.date">{{ comment.date }}</time>
      </header>
      <p class="text-color break-all flex items-center gap-2">
        {{ comment.text }}
        <span
          v-if="comment.answers.length"
          class="text-yellow-600 text-sm font-semibold select-none"
          title="Цей коментар має відповіді"
        >
          💬 {{ comment.answers.length }}
        </span>
      </p>
      <div class="mt-3 flex gap-4">
        <button
          v-if="comment.answers.length"
          @click="handletoggleShowAnswers(comment._id)"
          class="text-link hover:underline text-sm cursor-pointer"
        >
          {{ openComments[comment._id] ? 'Приховати відповіді' : 'Показати відповіді' }}
        </button>
        <button
          v-if="authStore.token"
          @click="startReply(comment._id)"
          class="text-link hover:underline text-sm cursor-pointer"
        >
          Відповісти
        </button>
        <button
          v-if="authStore.userId === comment.userId"
          @click="handleDeleteComment(comment._id)"
          class="text-red-600 hover:underline text-sm cursor-pointer"
        >
          Видалити
        </button>
      </div>
      <div v-if="openComments[comment._id]" class="mt-4 ml-6 border-l-2 border-gray-300 pl-4">
        <article v-for="answer in comment.answers" :key="answer.id" class="mb-3">
          <header class="flex items-center justify-between mb-1">
            <span class="font-semibold text-[var(--color-title-h2)]">{{
              answer.userId === authStore.userId ? 'Ви' : answer.userName
            }}</span>
            <time class="text-xs text-[var(--color-text-muted)]" :datetime="answer.date">{{ answer.date }}</time>
          </header>
          <p class="text-color break-all flex justify-between items-center gap-2">
            <span>{{ answer.text }}</span>
            <button
              v-if="authStore.userId === answer.userId"
              @click="handleDeleteAnswer(comment._id, answer.id)"
              class="text-red-600 hover:underline text-xs"
            >
              Видалити
            </button>
          </p>
        </article>
      </div>
      <div v-if="replyToCommentId === comment._id" class="mt-4 ml-6">
        <textarea
          v-model="newReplyText"
          class="w-full border border-gray-300 rounded p-2 resize-none outline-none"
          rows="2"
          placeholder="Ваша відповідь"
        ></textarea>
        <button
          @click="handleAddReply(comment._id)"
          class="button-change mt-2 px-4 py-2 rounded-lg text-sm cursor-pointer w-fit shadow-md shadow-black/40 hover:shadow-sm duration-150"
        >
          Надіслати відповідь
        </button>
      </div>
    </article>
    <div v-else class="bg-gray-50 p-4 rounded shadow-sm">
      <p class="text-gray-500 italic">Наразі немає коментарів. Додайте перший!</p>
    </div>
  </div>
</template>

<style scoped>
.title-color {
  color: var(--color-title-h1);
}

.text-color {
  color: var(--color-text);
}

.text-link {
  color: var(--color-text-button-active);
}

.button-change {
  color: var(--color-background-button);
  border: 2px solid var(--color-background-button);
}

.button-change:hover {
  color: var(--color-text-button-white);
  background-color: var(--color-text-button-active);
}
</style>
