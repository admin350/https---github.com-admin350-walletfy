export type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  profile: string;
  date: string; // ISO 8601 format
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

export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export type Profile = {
    name: string;
    color: string;
}

export type Category = {
    name: string;
    type: 'Ingreso' | 'Gasto';
}
