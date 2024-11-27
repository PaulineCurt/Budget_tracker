<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-sky-950 p-6 rounded-lg shadow-md w-96">
      <slot></slot>
      <div class="flex justify-end mt-4 gap-2 text-white">
        <button
          @click="cancel"
          class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Annuler
        </button>
        <button
          @click="confirm"
          class="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded mr-2"
        >
          Appliquer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from "vue";

const props = defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits(["confirm", "cancel"]);

const confirm = () => {
  emit("confirm");
};

const cancel = () => {
  emit("cancel");
};
</script>

<style scoped></style>
