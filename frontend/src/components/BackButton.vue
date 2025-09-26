<script setup lang="ts">
const { onClick } = defineProps<{
  onClick: () => void
}>()
</script>

<template>
  <button
    type="button"
    @click="onClick"
    class="button-link my-4 px-5 py-2 rounded-lg text-sm font-semibold shadow-md shadow-black/40 transition duration-150 cursor-pointer"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.button-link {
  color: var(--color-background-button);
  border: 2px solid var(--color-background-button);
}

@media (hover: hover) and (pointer: fine) {
  .button-link:hover {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}

@media (hover: none), (pointer: coarse) {
  .button-link:active {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
  }
}
</style>
