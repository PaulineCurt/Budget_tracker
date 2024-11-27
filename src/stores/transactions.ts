import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Transaction } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  // const fetchTransactions = async () => {
  //   if (!authStore.user) return null;
    
  //   isLoading.value = true;
  //   error.value = null;
    
  //   try {
  //     const { data, error: supabaseError } = await supabase
  //       .from('transactions')
  //       .select('*')
  //       // .order('date', { ascending: false });

  //     if (supabaseError) throw supabaseError;
  //     return data;
  //   } catch (e) {
  //     error.value = e instanceof Error ? e.message : 'Failed to fetch transactions';
  //     return [];
  //   } finally {
  //     isLoading.value = false;
  //   }
  // };

  const fetchTransactions = async () => {
    if (!authStore.user) return null;

    isLoading.value = true;
    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('*');
    if (fetchError) {
      error.value = fetchError.message;
    } else {
      transactions.value = data;
    }
    isLoading.value = false;
  };

  const addTransaction = async (transaction: { amount: number; description: string; date: string; category_id: string }) => {
    if (!authStore.user) return null;
    isLoading.value = true;
    error.value = null;
  
    try {
      const { data, error: supabaseError } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();
  
      if (supabaseError) throw supabaseError;
  
      // Ajouter la nouvelle transaction à la liste locale
      transactions.value.push(data);
      console.log('Transaction added:', data); // Ajoutez ce log
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add transaction';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    if (!authStore.user) return false;
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', transaction.id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Mettre à jour la transaction dans la liste locale
      const index = transactions.value.findIndex(t => t.id === transaction.id);
      if (index !== -1) {
        transactions.value[index] = data;
      }
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update transaction';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!authStore.user) return false;
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (deleteError) {
      error.value = deleteError.message;
      return false;
    } else {
      transactions.value = transactions.value.filter(t => t.id !== id);
      return true;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction, // Assurez-vous que cette fonction est exportée
    deleteTransaction,
  };
});