

export type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  profile: string;
  date: Date;
  accountId: string; // source account
  destinationAccountId?: string; // destination account for transfers
  cardId?: string; // Optional: link to a BankCard for expenses
  isCreditLinePayment?: boolean; // Flag for credit line usage
  taxDetails?: { // Optional: for tax tracking (e.g., IVA)
    rate: number; // e.g., 19 for 19%
    amount: number; // calculated tax amount
  };
};

export type BankAccount = {
  id: string;
  name: string;
  bank: string;
  accountType: string;
  accountNumber: string;
  balance: number;
  profile: string;
  purpose: 'main' | 'savings' | 'investment' | 'tax'; // Designate account for a specific purpose
  color?: string;
  monthlyLimit?: number; // For "Cuenta Vista" monthly deposit limit
  rut?: string;
  email?: string;
  // New optional fields for Credit Line associated with a Current Account
  hasCreditLine?: boolean;
  creditLineLimit?: number;
  creditLineUsed?: number;
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
    cardLevel?: string; // e.g., 'Gold', 'Black', 'Premium'
    cardColor?: string; // hex color code
    brand?: 'visa' | 'mastercard' | 'amex' | 'other';
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  estimatedDate: Date;
  profile: string;
  category: string;
  // New field to track if completion notification has been sent
  completionNotified?: boolean;
};

export type GoalContribution = {
  id: string;
  goalId: string;
  goalName: string;
  amount: number;
  date: Date;
  sourceAccountId: string;
}

export type Debt = {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  monthlyPayment: number;
  installments: number; // total number of installments
  dueDate: Date; // next payment due date
  financialInstitution?: string;
  profile: string;
  accountId: string;
  cardId?: string; // Link to the source credit card if applicable
  debtType: 'consumo' | 'hipotecario' | 'auto' | 'line-of-credit' | 'credit-card' | 'otro';
  // New field for notification settings
  dueNotificationDays?: number; // e.g., notify 3 days before due date
  // New field to link to a transaction
  sourceTransactionId?: string;
};

export type DebtPayment = {
    id: string;
    debtId: string;
    debtName: string;
    amount: number;
    date: Date;
    accountId: string;
    taxDetails?: {
        rate: number;
        amount: number;
    };
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
  lastPaymentMonth?: number; // 0-11
  lastPaymentYear?: number;
  paymentDetails?: { // Optional details for overriding payment method
    accountId?: string;
    cardId?: string;
    taxDetails?: {
        rate: number;
        amount: number;
    };
  };
  paidThisPeriod?: boolean;
};


export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  profile: string;
  paymentDay: number; // Day of the month (1-31)
}

export type Investment = {
  id:string;
  name: string; // e.g., 'Portafolio Acciones US'
  initialAmount: number;
  currentValue: number;
  startDate: Date;
  investmentType: string; // e.g., 'Acciones', 'Criptomonedas', 'Forex', 'Índices'
  platform: string; // e.g., 'Interactive Brokers', 'Binance'
  profile: string;
  purpose: 'investment' | 'saving'; // Differentiates between growth investment and savings instrument
};

export type InvestmentContribution = {
  id: string;
  investmentId: string;
  investmentName: string;
  amount: number;
  date: Date;
  purpose: 'investment' | 'saving';
}

export type TaxPayment = {
  id: string;
  year: number;
  month: number;
  amount: number;
  date: Date; // payment date
  sourceAccountId: string; // the tax portfolio account
  profile: string; // Profile associated with the tax payment
  remanente?: number; // Credit carryover to the next month
};

export type BudgetItem = {
  category: string;
  percentage: number;
};

export type Budget = {
  id: string;
  name: string;
  profile: string;
  items: BudgetItem[];
  isFavorite?: boolean;
};

export type Profile = {
    id: string;
    name: string;
    color: string;
}

export type Category = {
    id: string;
    name: string;
    type: 'Ingreso' | 'Gasto' | 'Transferencia';
    color: string;
}

export type AppSettings = {
    currency: 'CLP' | 'USD' | 'EUR';
    largeTransactionThreshold?: number;
    background?: string; // e.g., 'theme-noise', 'theme-lines'
    showSensitiveData?: boolean;
}

export type AppNotification = {
    id: string;
    title: string;
    description: string;
    date: Date;
    read: boolean;
    type: 'warning' | 'info' | 'success' | 'error';
    link?: string;
}

export type Service = {
  id: string;
  name: string;
  category: string;
  profile: string;
  paymentUrl: string;
};

export type TangibleAsset = {
    id: string;
    name: string;
    category: string;
    estimatedValue: number;
    purchaseDate: Date;
    profile: string;
    description?: string;
}
