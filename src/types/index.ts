export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category_id: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}