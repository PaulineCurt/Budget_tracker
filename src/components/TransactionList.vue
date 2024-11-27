<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useTransactionStore } from "../stores/transactions";
import { useCategoryStore } from "../stores/categories";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";
import Modal from "../components/Modal.vue";
import type { Transaction } from "../types";

const transactionStore = useTransactionStore();
const categoryStore = useCategoryStore();

const transactions = computed<Transaction[]>(() => {
  return transactionStore.transactions.slice().reverse();
});
const showDeleteModal = ref(false);
const showEditModal = ref(false);
const selectedTransaction = ref<Transaction | null>(null);
const transactionIdToDelete = ref<string | null>(null);
const editedAmount = ref("");
const editedCategoryId = ref("");
const editedDescription = ref("");

const fetchTransactions = async () => {
  await transactionStore.fetchTransactions();
};

// Real-time subscription
onMounted(() => {
  fetchTransactions();

  const channel = supabase
    .channel("transactions-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "transactions",
      },
      () => {
        fetchTransactions();
      }
    )
    .subscribe();

  // Cleanup subscription
  onUnmounted(() => {
    supabase.removeChannel(channel);
  });
});

const getCategory = (categoryId: string) => {
  return (
    categoryStore.categories.find((c) => c.id === categoryId) || {
      name: "Unknown",
      icon: "",
    }
  );
};

const formatDate = (date: string) => {
  return format(new Date(date), "dd/MM/yyyy");
};

const openDeleteModal = (id: string) => {
  transactionIdToDelete.value = id;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  transactionIdToDelete.value = null;
  showDeleteModal.value = false;
};

const confirmDelete = async () => {
  if (transactionIdToDelete.value) {
    const success = await transactionStore.deleteTransaction(
      transactionIdToDelete.value
    );
    if (success) {
      fetchTransactions();
    }
    closeDeleteModal();
  }
};

const openEditModal = (transaction: Transaction) => {
  selectedTransaction.value = transaction;
  editedAmount.value = transaction.amount.toString();
  editedCategoryId.value = transaction.category_id;
  editedDescription.value = transaction.description;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedTransaction.value = null;
  editedAmount.value = "";
  editedCategoryId.value = "";
};

const handleUpdate = async () => {
  if (selectedTransaction.value) {
    const updatedTransaction = {
      ...selectedTransaction.value,
      amount: parseFloat(editedAmount.value),
      category_id: editedCategoryId.value,
      description: editedDescription.value,
    };
    const success = await transactionStore.updateTransaction(
      updatedTransaction
    );
    if (success) {
      fetchTransactions();
      closeEditModal();
    }
  }
};
</script>

<template>
  <div class="bg-sky-950 text-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl text-white font-bold mb-4">Recent expenses</h2>

    <div v-if="transactionStore.isLoading" class="text-center py-4">
      Loading transactions...
    </div>

    <div v-else-if="transactionStore.error" class="text-red-600 py-4">
      {{ transactionStore.error }}
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="transaction in transactions"
        :key="transaction.id"
        class="border-b border-gray-200 pb-4"
      >
        <div class="flex justify-between items-start">
          <div>
            <h4 class="">
              <span>{{ getCategory(transaction.category_id).icon }}</span>
              {{ getCategory(transaction.category_id).name }} •
              {{ formatDate(transaction.date) }}
            </h4>
            <p class="text-sm">{{ transaction.description }}</p>
          </div>
          <div class="flex items-center gap-4">
            <span
              :class="transaction.amount < 0 ? 'text-red-600' : 'text-white'"
            >
              {{ transaction.amount.toFixed(2) }} $
            </span>
            <button
              @click="openEditModal(transaction)"
              class="text-blue-600 hover:text-blue-800 p-1"
              title="Edit transaction"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM6 12v2h2l6.586-6.586-2-2L6 12z"
                />
              </svg>
            </button>
            <button
              @click="openDeleteModal(transaction.id)"
              class="text-red-600 hover:text-red-800 p-1"
              title="Delete transaction"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <Modal
    :isVisible="showDeleteModal"
    @confirm="confirmDelete"
    @cancel="closeDeleteModal"
  >
    <p class="text-bold text-lg text-white">
      Are you sure you want to delete this transaction?
    </p>
  </Modal>

  <!-- Edit Modal -->
  <Modal
    :isVisible="showEditModal"
    @confirm="handleUpdate"
    @cancel="closeEditModal"
  >
    <h2 class="text-2xl text-white font-bold mb-4">Update transaction</h2>
    <div class="mb-4">
      <label for="description" class="block text-sm font-medium text-white"
        >Description</label
      >
      <input
        type="text"
        id="description"
        v-model="editedDescription"
        class="mt-1 p-2 block w-full text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
    <div class="mb-4">
      <label for="amount" class="block text-sm font-medium text-white"
        >Amount $</label
      >
      <input
        type="number"
        id="amount"
        v-model="editedAmount"
        class="mt-1 p-2 block w-full text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
    <div class="mb-4">
      <label for="category" class="block text-sm font-medium text-white"
        >Category</label
      >
      <select
        id="category"
        v-model="editedCategoryId"
        class="mt-1 p-2 block w-full border text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option
          v-for="category in categoryStore.categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>
  </Modal>
</template>
