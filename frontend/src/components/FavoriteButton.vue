<script setup lang="ts">
const { onClick, ariaPressed, title, disabled } = defineProps<{
  onClick: () => void | Promise<void>
  ariaPressed: boolean
  title?: string
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    @click="onClick"
    class="focus:outline-none cursor-pointer"
    :aria-pressed="ariaPressed"
    :title="title"
    :disabled="disabled"
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
  }
}

@media (hover: none), (pointer: coarse) {
  .button-link:active {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
  }
}
</style>
