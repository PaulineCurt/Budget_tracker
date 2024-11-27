<script setup lang="ts">
import { ref } from "vue";
import { useTransactionStore } from "../stores/transactions";
import { useCategoryStore } from "../stores/categories";

const transactionStore = useTransactionStore();
const categoryStore = useCategoryStore();
const emit = defineEmits(["transaction-added"]);

const amount = ref("");
const description = ref("");
const date = ref(new Date().toISOString().split("T")[0]);
const categoryId = ref("");

const submitTransaction = async () => {
  if (!amount.value || !description.value || !categoryId.value) return;

  const transaction = {
    amount: parseFloat(amount.value),
    description: description.value,
    date: date.value,
    category_id: categoryId.value,
  };

  const result = await transactionStore.addTransaction(transaction);

  if (result) {
    amount.value = "";
    description.value = "";
    categoryId.value = "";
    emit("transaction-added");
  }
};
</script>

<template>
  <div class="bg-sky-950 p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4 text-white">Add transaction</h2>
    <form @submit.prevent="submitTransaction" class="space-y-4">
      <div
        v-if="transactionStore.error"
        class="bg-red-50 text-red-600 p-3 rounded"
      >
        {{ transactionStore.error }}
      </div>

      <div>
        <label class="block text-sm font-medium text-white">Amount</label>
        <input
          v-model="amount"
          type="number"
          step="0.01"
          required
          :disabled="transactionStore.isLoading"
          class="mt-1 p-2 block w-full rounded-md border-2"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-white">Description</label>
        <input
          v-model="description"
          type="text"
          required
          :disabled="transactionStore.isLoading"
          class="mt-1 p-2 block w-full rounded-md"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-white">Category</label>
        <select
          v-model="categoryId"
          required
          :disabled="transactionStore.isLoading"
          class="mt-1 p-2 block w-full rounded-md"
        >
          <option value="">Selected category</option>
          <option
            v-for="category in categoryStore.categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-white">Date</label>
        <input
          v-model="date"
          type="date"
          required
          :disabled="transactionStore.isLoading"
          class="mt-1 p-2 block w-full rounded-md"
        />
      </div>

      <button
        type="submit"
        :disabled="transactionStore.isLoading"
        class="w-full bg-amber-500 text-white py-2 px-4 rounded-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ transactionStore.isLoading ? "Adding..." : "Add transaction" }}
      </button>
    </form>
  </div>
</template>
