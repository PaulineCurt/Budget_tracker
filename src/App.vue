<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import TransactionForm from "./components/TransactionForm.vue";
import TransactionList from "./components/TransactionList.vue";
import ExpenseChart from "./components/ExpenseChart.vue";
import AuthForm from "./components/AuthForm.vue";

const authStore = useAuthStore();

onMounted(() => {
  authStore.initialize();
});
</script>

<template>
  <div
    v-if="authStore.loading"
    class="min-h-screen flex items-center justify-center bg-gray-900"
  >
    <div class="text-xl">Loading...</div>
  </div>

  <AuthForm v-else-if="!authStore.isAuthenticated" />

  <div v-else class="min-h-screen bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-cyan-600">Expense Tracker</h1>
        <h3 class="text-white">{{ authStore.user?.email }}</h3>
        <button
          @click="authStore.signOut"
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Sign out
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TransactionForm />
        <ExpenseChart />
      </div>

      <div class="mt-6">
        <TransactionList />
      </div>
    </div>
  </div>
</template>
