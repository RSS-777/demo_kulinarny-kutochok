<script setup lang="ts">
defineEmits(['cancel', 'confirm'])
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h2 class=" text-center text-xl  font-semibold title-color mb-4">Підтвердження видалення</h2>
      <p class="mb-4 text-sm text-gray-700">
        Ви впевнені, що хочете видалити профіль? <br />
        <strong>Усі ваші рецепти, улюблені страви, автори, коментарі будуть безповоротно втрачені.</strong>
      </p>
      <div class="flex justify-center gap-2">
        <button @click="$emit('cancel')"
          class="button-cancel py-[2px] px-[10px] rounded-lg text-sm cursor-pointer w-fit shadow-md shadow-black/40 duration-150">
          Скасувати
        </button>
        <button @click="$emit('confirm')"
          class="button-delete py-[2px] px-[10px] rounded-lg text-sm cursor-pointer w-fit shadow-md shadow-black/40 duration-150">
          Видалити
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-color {
  color: var(--color-title-h1);
}

.button-cancel {
  color: var(--color-background-button);
  border: 2px solid var(--color-background-button);
}

.button-delete {
  color: #fb2c36;
  border: 2px solid #fb2c36;
}

@media (hover: hover) and (pointer: fine) {
  .button-cancel:hover {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .button-delete:hover {
    color: white;
    background-color: #fb2c36;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}

@media (hover: none), (pointer: coarse) {
  .button-cancel:active {
    color: var(--color-text-button-white);
    background-color: var(--color-text-button-active);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .button-delete:active {
    color: white;
    background-color: #fb2c36;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
}
</style>
