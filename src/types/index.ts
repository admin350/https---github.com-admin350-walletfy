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

export type Debt = {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  financialInstitution: string;
};

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  paymentMethod: string;
  bank: string;
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
