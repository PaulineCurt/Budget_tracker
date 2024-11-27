import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Category } from '../types';

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<Category[]>([
    { id: 'b383a871-adba-430d-80d7-f766970aaf08', name: 'Food', color: '#ffc93c', icon: '🍔' },
    { id: 'adef1b40-d269-4297-9e40-27d22aa15fb8', name: 'Transport', color: '#33FF57', icon: '🚗' },
    { id: 'dc405929-eed3-4e63-9582-18d4633ffc4a', name: 'House', color: '#FB8500', icon: '🏠' },
    { id: '4df9437f-ef05-4acf-8fd5-850321989e63', name: 'Health', color: '#00b4d8', icon: '💊' },
    { id: 'dbfdecd5-0fab-48dc-8e19-c9ef5f147892', name: 'Shopping', color: '#ffcad4', icon: '🛍️' }
  ]);

  const addCategory = (category: Omit<Category, 'id'>) => {
    const uuid = crypto.randomUUID();
    categories.value.push({
      ...category,
      id: uuid
    });
  };

  const deleteCategory = (id: string) => {
    categories.value = categories.value.filter(c => c.id !== id);
  };

  return {
    categories,
    addCategory,
    deleteCategory
  };
});