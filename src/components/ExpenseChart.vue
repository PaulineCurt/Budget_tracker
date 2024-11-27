<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useTransactionStore } from "../stores/transactions";
import { useCategoryStore } from "../stores/categories";
import type { Transaction } from "../types";
import { supabase } from "../lib/supabase";

ChartJS.register(ArcElement, Tooltip, Legend);

const transactionStore = useTransactionStore();
const categoryStore = useCategoryStore();

const transactions = ref<Transaction[]>([]);

const fetchTransactions = async () => {
  const data = await transactionStore.fetchTransactions();
  if (data) {
    transactions.value = data;
  }
};

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

// Watch for changes in the transaction store
watch(
  () => transactionStore.transactions,
  (newTransactions) => {
    transactions.value = newTransactions;
  },
  { immediate: true }
);

// ChartData
const chartData = computed(() => {
  const categoryTotals = new Map<string, number>();

  if (transactions.value && transactions.value.length > 0) {
    transactions.value.forEach((transaction) => {
      const current = categoryTotals.get(transaction.category_id) || 0;
      categoryTotals.set(transaction.category_id, current + transaction.amount);
    });
  }

  const labels = [];
  const data = [];
  const backgroundColor = [];

  for (const [categoryId, total] of categoryTotals) {
    const category = categoryStore.categories.find((c) => c.id === categoryId);
    if (category) {
      labels.push(category.name);
      data.push(Math.abs(total));
      backgroundColor.push(category.color);
    }
  }

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
      },
    ],
  };
});
const totalAmount = computed(() => {
  if (Array.isArray(transactions.value)) {
    return transactions.value.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
  }
  return 0;
});

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: function (tooltipItem: { label: string; raw: unknown }) {
          let label = tooltipItem.label || "";
          if (label) {
            label += ": ";
          }
          if (tooltipItem.raw !== null) {
            label += new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(tooltipItem.raw as number);
          }
          return label;
        },
      },
    },
    legend: {
      labels: {
        color: "white",
        font: {
          size: 14,
        },
        padding: 20,
        usePointStyle: true,
        pointStyle: "circle",
        cursor: "pointer",
      },
      onHover: function (this: any, e: any) {
        e.native.target.style.cursor = "pointer";
      },
    },
  },
};
</script>

<template>
  <div class="bg-sky-950 p-6 rounded-lg shadow-md">
    <h2 class="text-2xl text-white font-bold mb-4">Expences by category</h2>
    <p class="text-lg text-white font-semibold mb-4">
      Total: {{ totalAmount.toFixed(2) }} €
    </p>
    <div class="h-[300px]">
      <Doughnut :data="chartData" :options="options" />
    </div>
  </div>
</template>
