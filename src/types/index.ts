

export type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'transfer-investment';
  amount: number;
  description: string;
  category: string;
  profile: string;
  date: string; // ISO 8601 format
  accountId: string;
  cardId?: string; // Optional: link to a BankCard for expenses
};

export type BankAccount = {
  id: string;
  name: string;
  bank: string;
  accountType: string;
  accountNumber: string;
  balance: number;
  profile: string;
}

export type BankCard = {
    id: string;
    name: string;
    bank: string;
    cardType: 'credit' | 'debit' | 'prepaid';
    last4Digits: string;
    profile: string;
    accountId: string; // Link to a BankAccount
    creditLimit?: number; // Only for credit cards
    usedAmount?: number; // Only for credit cards
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
  totalAmount: number;
  paidAmount: number;
  monthlyPayment: number;
  installments: number; // total number of installments
  dueDate: Date; // next payment due date
  financialInstitution: string;
  profile: string;
  accountId: string;
};

export type DebtPayment = {
    id: string;
    debtId: string;
    debtName: string;
    amount: number;
    date: Date;
    accountId: string;
}

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  cardId: string;
  profile: string;
  status: 'active' | 'cancelled';
  cancellationDate?: Date;
};


export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  profile: string;
}

export type Investment = {
  id:string;
  name: string; // e.g., 'Portafolio Acciones US'
  initialAmount: number;
  currentValue: number;
  investmentType: string; // e.g., 'Acciones', 'Criptomonedas', 'Forex', 'Índices'
  platform: string; // e.g., 'Interactive Brokers', 'Binance'
  profile: string;
};

export type InvestmentContribution = {
  id: string;
  investmentId: string;
  investmentName: string;
  amount: number;
  date: Date;
}

export type BudgetItem = {
  category: string;
  percentage: number;
};

export type Budget = {
  id: string;
  name: string;
  profile: string;
  items: BudgetItem[];
};

export type Profile = {
    name: string;
    color: string;
}

export type Category = {
    id: string;
    name: string;
    type: 'Ingreso' | 'Gasto';
    color: string;
}
