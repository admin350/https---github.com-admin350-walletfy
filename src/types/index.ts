export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
};

export type UpcomingPayment = {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
};

export type ExpenseByCategory = {
  category: string;
  total: number;
  fill: string;
};
