
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
  estimatedDate: Date;
  profile: string;
  category: string;
};

export type GoalContribution = {
  id: string;
  goalId: string;
  goalName: string;
  amount: number;
  date: Date;
}

export type Debt = {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  financialInstitution: string;
  profile: string;
};

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  paymentMethod: string;
  bank: string;
  profile: string;
};


export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  profile: string;
}

export type Profile = {
    name: string;
    color: string;
}

export type Category = {
    name: string;
    type: 'Ingreso' | 'Gasto';
}
