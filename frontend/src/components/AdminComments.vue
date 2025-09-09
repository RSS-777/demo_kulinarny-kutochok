<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchAllCommentsApi, deleteCommentApi, deleteAnswerApi } from '@/api/adminApi'
import type { IComment } from '@/api/adminApi'

const fetchMessage = ref<string | undefined>('')
const isLoading = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const allComments = ref<IComment[]>([])

let timeoutId: number | undefined

const clearMessageWithTimeout = () => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = window.setTimeout(() => {
    fetchMessage.value = ''
  }, 2000)
}

const fetchAllComments = async () => {
  isLoading.value = true
  const response = await fetchAllCommentsApi()

  if (response.success && response.comments) {
    allComments.value = response.comments
  } else {
    fetchMessage.value = response.error

    clearMessageWithTimeout()
  }
  isLoading.value = false
}

const handleDeleteComment = async (id: string) => {
  isSubmitting.value = true
  const response = await deleteCommentApi(id)

  if (response.success) {
    fetchMessage.value = response.message
    await fetchAllComments()

    clearMessageWithTimeout()
  } else {
    fetchMessage.value = response.error

    clearMessageWithTimeout()
  }
  isSubmitting.value = false
}

const handleDeleteAnswer = async (commentId: string, answerId: string) => {
  isSubmitting.value = true
  const response = await deleteAnswerApi(commentId, answerId)

  if (response.success) {
    fetchMessage.value = response.message
    await fetchAllComments()

    clearMessageWithTimeout()
  } else {
    fetchMessage.value = response.error

    clearMessageWithTimeout()
  }
  isSubmitting.value = false
}

onMounted(() => {
  fetchAllComments()
})
</script>

<template>
  <section>
    <div v-if="isLoading" class="text-center my-10 text-gray-500 text-lg">Завантаження Коментарів...</div>
    <ul v-else class="flex flex-col gap-4">
      <li
        v-for="comments in allComments"
        :key="comments._id"
        class="p-4 rounded-xl shadow-md bg-white hover:shadow-lg transition-all duration-200"
      >
        <div class="mb-2">
          <span class="text-xs text-gray-500 block">{{ comments.recipeId }}</span>
          <span class="text-xs text-gray-500 block">{{ comments.userName }}</span>
          <span class="font-medium text-color block">{{ comments.text }}</span>
        </div>
        <div class="flex justify-end mb-2">
          <button
            @click.stop="handleDeleteComment(comments._id)"
            class="button-delete py-[2px] px-[10px] rounded-lg text-sm cursor-pointer shadow-md hover:shadow-sm duration-150"
            :disabled="isSubmitting"
          >
            Видалити коментар
          </button>
        </div>
        <div v-if="comments.answers.length" class="pl-4 border-l-2 border-gray-300">
          <ul class="flex flex-col gap-2">
            <li v-for="answer in comments.answers" :key="answer.id" class="bg-gray-50 rounded-lg p-2">
              <span class="text-xs text-gray-500 block">{{ answer.userName }}</span>
              <span class="text-sm text-gray-700 block">{{ answer.text }}</span>

              <div class="flex justify-end mt-1">
                <button
                  @click.stop="handleDeleteAnswer(comments._id, answer.id)"
                  class="button-delete py-[2px] px-[10px] rounded-lg text-xs cursor-pointer shadow-md hover:shadow-sm duration-150"
                  :disabled="isSubmitting"
                >
                  Видалити відповідь
                </button>
              </div>
            </li>
          </ul>
        </div>
      </li>
    </ul>
    <p v-if="allComments.length === 0" class="mt-4 text-center text-gray-500 italic">Коментарів немає.</p>
    <p v-if="fetchMessage !== ''" class="text-center mt-4">{{ fetchMessage }}</p>
  </section>
</template>

<style scoped>
.text-color {
  color: var(--color-text);
}

.button-delete {
  color: #fb2c36;
  border: 2px solid #fb2c36;
}

.button-delete:hover {
  color: white;
  background-color: #fb2c36;
}
</style>
