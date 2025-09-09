<script setup lang="ts">
const props = defineProps<{
  isSubscribed: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isSubscribed', value: boolean): void
  (e: 'toggleSubscription', event: Event): void
}>()

const toggleSubscription = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:isSubscribed', target.checked)
  emit('toggleSubscription', event)
}
</script>

<template>
  <section>
    <h2 class="text-2xl font-semibold mb-4 title-color">Розсилки</h2>
    <p class="mb-6 text-color italic text-sm">
      Тут ви можете увімкнути або вимкнути повідомлення на email про нові рецепти та коментарі до ваших рецептів.
    </p>
    <label for="newsletter-subscription" class="flex items-center gap-3 cursor-pointer select-none relative">
      <input
        type="checkbox"
        id="newsletter-subscription"
        :checked="props.isSubscribed"
        @change="toggleSubscription"
        class="cursor-pointer appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-[#D88B5A] checked:border-[#D88B5A] peer"
      />
      <svg
        class="absolute left-[4px] top-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="3"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span class="text-color">Підписаний на email-повідомлення</span>
    </label>
  </section>
</template>

<style scoped>
.title-color {
  color: var(--color-title-h1);
}

.text-color {
  color: var(--color-text);
}
</style>
