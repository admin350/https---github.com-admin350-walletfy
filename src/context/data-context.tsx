
'use client';

import type { Transaction, SavingsGoal, Subscription, Profile, Category, FixedExpense, Debt, GoalContribution, DebtPayment, Investment, InvestmentContribution, Budget, BankAccount, BankCard, MonthlyReport } from "@/types";
import { createContext, useState, useEffect, ReactNode, useMemo } from "react";
import { addDays, addMonths, setDate, getYear, getMonth, startOfMonth, endOfMonth, isPast } from "date-fns";

// MOCK DATA
const mockBankAccounts: BankAccount[] = [
    { id: 'acc1', name: 'Cuenta Principal', bank: 'Banco de Chile', accountType: 'Cuenta Corriente', accountNumber: '123456789', balance: 1850000, profile: 'Personal' },
    { id: 'acc2', name: 'Cuenta de Negocios', bank: 'Santander', accountType: 'Cuenta Corriente', accountNumber: '987654321', balance: 3200000, profile: 'Negocio' },
    { id: 'acc3', name: 'Cuenta MACH', bank: 'BCI', accountType: 'Cuenta Vista', accountNumber: '112233445', balance: 250000, profile: 'Personal' },
];

const mockBankCards: BankCard[] = [
    { id: 'card1', name: 'Visa Personal', bank: 'Banco de Chile', cardType: 'credit', last4Digits: '1234', profile: 'Personal', accountId: 'acc1', creditLimit: 2000000, usedAmount: 450000 },
    { id: 'card2', name: 'Mastercard Negocios', bank: 'Santander', cardType: 'debit', last4Digits: '5678', profile: 'Negocio', accountId: 'acc2' },
    { id: 'card3', name: 'Prepago Tenpo', bank: 'Tenpo', cardType: 'prepaid', last4Digits: '9988', profile: 'Personal', accountId: 'acc3' },
];

const mockTransactions: Transaction[] = [
  { id: '1', type: "income", description: "Salario Mensual", amount: 2500000, category: "Sueldo", profile: 'Trabajo Fijo', date: new Date(new Date().setDate(5)).toISOString(), accountId: 'acc1' },
  { id: '2', type: "expense", description: "Alquiler", amount: 800000, category: "Vivienda", profile: 'Personal', date: new Date(new Date().setDate(5)).toISOString(), accountId: 'acc1' },
  { id: '3', type: "expense", description: "Compra Semanal", amount: 150750, category: "Alimentación", profile: 'Personal', date: new Date(new Date().setDate(10)).toISOString(), accountId: 'acc3' },
  { id: '4', type: "expense", description: "Suscripción Netflix", amount: 15990, category: "Suscripciones", profile: 'Personal', date: new Date(new Date().setDate(3)).toISOString(), accountId: 'acc3', cardId: 'card1' },
  { id: '5', type: "income", description: "Proyecto Freelance", amount: 750000, category: "Negocio", profile: 'Negocio', date: new Date(new Date().setDate(15)).toISOString(), accountId: 'acc2' },
  { id: '6', type: "transfer", description: "Ahorro para vacaciones", amount: 200000, category: "Sueldo", profile: 'Personal', date: new Date(new Date().setDate(6)).toISOString(), accountId: 'acc1' },
  { id: '8', type: "transfer-investment", description: "Aporte a cartera de inversión", amount: 300000, category: "Sueldo", profile: 'Personal', date: new Date(new Date().setDate(7)).toISOString(), accountId: 'acc1' },
  { id: '7', type: "expense", description: "Compra Amazon", amount: 80000, category: "Compras", profile: 'Negocio', date: addMonths(new Date(), -1).toISOString(), accountId: 'acc2'},
];

const mockGoals: SavingsGoal[] = [
  { id: '1', name: "Vacaciones a Japón", currentAmount: 3500000, targetAmount: 5000000, estimatedDate: new Date('2025-12-01'), profile: 'Personal', category: 'Viaje' },
  { id: '2', name: "Nuevo Portátil", currentAmount: 800000, targetAmount: 2000000, estimatedDate: new Date('2024-10-31'), profile: 'Negocio', category: 'Tecnología' },
  { id: '3', name: "Fondo de Emergencia", currentAmount: 4500000, targetAmount: 10000000, estimatedDate: new Date('2026-01-01'), profile: 'Personal', category: 'Inversión' },
];

const mockGoalContributions: GoalContribution[] = [
    { id: '1', goalId: '1', goalName: 'Vacaciones a Japón', amount: 100000, date: new Date() },
    { id: '2', goalId: '2', goalName: 'Nuevo Portátil', amount: 50000, date: new Date() },
];

const mockInvestments: Investment[] = [
    { id: '1', name: "Portafolio Acciones US", initialAmount: 5000000, currentValue: 6200000, investmentType: 'Acciones', platform: 'Interactive Brokers', profile: 'Personal'},
    { id: '2', name: "Bitcoin Hold", initialAmount: 1000000, currentValue: 1800000, investmentType: 'Criptomonedas', platform: 'Binance', profile: 'Personal'},
    { id: '3', name: "Trading Forex", initialAmount: 2000000, currentValue: 2150000, investmentType: 'Forex', platform: 'Admirals', profile: 'Negocio'},
];

const mockInvestmentContributions: InvestmentContribution[] = [
    { id: '1', investmentId: '1', investmentName: 'Portafolio Acciones US', amount: 500000, date: new Date() },
    { id: '2', investmentId: '2', investmentName: 'Bitcoin Hold', amount: 200000, date: new Date() },
];


const mockSubscriptions: Subscription[] = [
    { id: '1', name: "Suscripción Netflix", amount: 15990, dueDate: addDays(new Date(), 3), cardId: "card1", profile: "Personal", status: 'active' },
    { id: '4', name: "Spotify", amount: 9990, dueDate: addDays(new Date(), 12), cardId: "card1", profile: "Personal", status: 'active' },
    { id: '3', name: "Hosting Sitio Web", amount: 25000, dueDate: addDays(new Date(), 15), cardId: "card2", profile: "Negocio", status: 'active' },
    { id: '5', name: "HBO Max", amount: 7990, dueDate: addMonths(new Date(), -2), cardId: "card1", profile: "Personal", status: 'cancelled', cancellationDate: new Date() },
];

const mockDebts: Debt[] = [
    { id: '1', name: "Préstamo Auto", totalAmount: 12000000, paidAmount: 4200000, monthlyPayment: 350000, installments: 48, dueDate: addDays(new Date(), 7), financialInstitution: "Santander", profile: "Personal", accountId: 'acc1' },
    { id: '2', name: "Crédito Hipotecario", totalAmount: 80000000, paidAmount: 15000000, monthlyPayment: 800000, installments: 240, dueDate: addDays(new Date(), 10), financialInstitution: "Banco BCI", profile: "Personal", accountId: 'acc1' },
    { id: '3', name: "Tarjeta de Crédito", totalAmount: 500000, paidAmount: 150000, monthlyPayment: 50000, installments: 10, dueDate: addDays(new Date(), -5), financialInstitution: "Falabella", profile: "Personal", accountId: 'acc3' },
    { id: '4', name: "Línea de Crédito", totalAmount: 2000000, paidAmount: 500000, monthlyPayment: 100000, installments: 20, dueDate: addDays(new Date(), 20), financialInstitution: "Banco de Chile", profile: "Negocio", accountId: 'acc2' },
];

const mockDebtPayments: DebtPayment[] = [
    { id: '1', debtId: '1', debtName: 'Préstamo Auto', amount: 350000, date: addMonths(new Date(), -1), accountId: 'acc1' },
    { id: '2', debtId: '1', debtName: 'Préstamo Auto', amount: 350000, date: addMonths(new Date(), -2), accountId: 'acc1' },
    { id: '3', debtId: '2', debtName: 'Crédito Hipotecario', amount: 800000, date: addMonths(new Date(), -1), accountId: 'acc1' },
];

const mockFixedExpenses: FixedExpense[] = [
    { id: '1', name: "Gimnasio", amount: 50000, category: "Salud", profile: "Personal", type: 'expense' },
    { id: '2', name: "Plan Celular", amount: 45000, category: "Servicios", profile: "Personal", type: 'expense' },
    { id: '3', name: "Internet", amount: 60000, category: "Servicios", profile: "Negocio", type: 'expense' },
];

const mockProfiles: Profile[] = [
    { name: "Personal", color: "#3b82f6" },
    { name: "Esposa", color: "#ec4899" },
    { name: "Hijo/a", color: "#f97316" },
    { name: "Negocio", color: "#14b8a6" },
    { name: "Trabajo Fijo", color: "#8b5cf6" },
];

const mockCategories: Category[] = [
    { id: '1', name: "Alimentación", type: "Gasto", color: "#f97316" },
    { id: '2', name: "Transporte", type: "Gasto", color: "#3b82f6" },
    { id: '3', name: "Vivienda", type: "Gasto", color: "#84cc16" },
    { id: '4', name: "Entretenimiento", type: "Gasto", color: "#a855f7" },
    { id: '5', name: "Suscripciones", type: "Gasto", color: "#6366f1" },
    { id: '6', name: "Servicios", type: "Gasto", color: "#0ea5e9" },
    { id: '7', name: "Salud", type: "Gasto", color: "#ef4444" },
    { id: '8', name: "Compras", type: "Gasto", color: "#d946ef" },
    { id: '9', name: "Inversiones", type: "Gasto", color: "#14b8a6" },
    { id: '10', name: "Fondo de Emergencia", type: "Gasto", color: "#f59e0b" },
    { id: '11', name: "Otros", type: "Gasto", color: "#6b7280" },
    { id: '12', name: "Pago de Deuda", type: "Gasto", color: "#ec4899" },
    { id: '13', name: "Ahorro para Meta", type: "Gasto", color: "#facc15" },
    { id: '14', name: "Sueldo", type: "Ingreso", color: "#22c55e" },
    { id: '15', name: "Negocio", type: "Ingreso", color: "#06b6d4" },
    { id: '16', name: "Otros Ingresos", type: "Ingreso", color: "#10b981" },
];

const mockBudgets: Budget[] = [
    { 
        id: '1',
        name: 'Presupuesto Ideal Personal 2024',
        profile: 'Personal',
        items: [
            { category: 'Vivienda', percentage: 30 },
            { category: 'Alimentación', percentage: 15 },
            { category: 'Transporte', percentage: 10 },
            { category: 'Ahorro para Meta', percentage: 20 },
            { category: 'Entretenimiento', percentage: 10 },
            { category: 'Suscripciones', percentage: 5 },
            { category: 'Otros', percentage: 10 },
        ]
    }
];

const mockReports: MonthlyReport[] = [];

interface IFilters {
    profile: string;
    month: number; // -1 for all months
    year: number;
}

// CONTEXT
interface DataContextType {
    transactions: Transaction[];
    goals: SavingsGoal[];
    subscriptions: Subscription[];
    debts: Debt[];
    fixedExpenses: FixedExpense[];
    profiles: Profile[];
    categories: Category[];
    goalContributions: GoalContribution[];
    debtPayments: DebtPayment[];
    investments: Investment[];
    investmentContributions: InvestmentContribution[];
    budgets: Budget[];
    bankAccounts: BankAccount[];
    bankCards: BankCard[];
    reports: MonthlyReport[];
    isLoading: boolean;
    filters: IFilters;
    setFilters: React.Dispatch<React.SetStateAction<IFilters>>;
    availableYears: number[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => Promise<void>;
    updateGoal: (goal: SavingsGoal) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    addSubscription: (subscription: Omit<Subscription, 'id' | 'status'>) => Promise<void>;
    updateSubscription: (subscription: Subscription) => Promise<void>;
    cancelSubscription: (id: string) => Promise<void>;
    addDebt: (debt: Omit<Debt, 'id' | 'paidAmount'>) => Promise<void>;
    updateDebt: (debt: Debt) => Promise<void>;
    deleteDebt: (id: string) => Promise<void>;
    addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => Promise<void>;
    updateFixedExpense: (expense: FixedExpense) => Promise<void>;
    deleteFixedExpense: (id: string) => Promise<void>;
    addGoalContribution: (contribution: Omit<GoalContribution, 'id'>) => Promise<void>;
    addDebtPayment: (payment: Omit<DebtPayment, 'id'>) => Promise<void>;
    paySubscription: (subscription: Subscription) => Promise<void>;
    addInvestment: (investment: Omit<Investment, 'id' | 'currentValue'>) => Promise<void>;
    updateInvestment: (investment: Investment) => Promise<void>;
    deleteInvestment: (id: string) => Promise<void>;
    addInvestmentContribution: (contribution: Omit<InvestmentContribution, 'id'>) => Promise<void>;
    addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
    updateBudget: (budget: Budget) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    addBankAccount: (account: Omit<BankAccount, 'id'>) => Promise<void>;
    updateBankAccount: (account: BankAccount) => Promise<void>;
    deleteBankAccount: (id: string) => Promise<void>;
    addBankCard: (card: Omit<BankCard, 'id' | 'usedAmount'>) => Promise<void>;
    updateBankCard: (card: BankCard) => Promise<void>;
    deleteBankCard: (id: string) => Promise<void>;
    addReport: (report: MonthlyReport) => Promise<void>;
    deleteReport: (id: string) => Promise<void>;
    getAllDataForMonth: (month: number, year: number) => { transactions: Transaction[], goals: SavingsGoal[], debts: Debt[], investments: Investment[], budgets: Budget[] };
}

export const DataContext = createContext<DataContextType>({
    transactions: [],
    goals: [],
    subscriptions: [],
    debts: [],
    fixedExpenses: [],
    profiles: [],
    categories: [],
    goalContributions: [],
    debtPayments: [],
    investments: [],
    investmentContributions: [],
    budgets: [],
    bankAccounts: [],
    bankCards: [],
    reports: [],
    isLoading: true,
    filters: { profile: 'all', month: getMonth(new Date()), year: getYear(new Date()) },
    setFilters: () => {},
    availableYears: [],
    addTransaction: async () => {},
    updateTransaction: async () => {},
    deleteTransaction: async () => {},
    addGoal: async () => {},
    updateGoal: async () => {},
    deleteGoal: async () => {},
    addSubscription: async () => {},
    updateSubscription: async () => {},
    cancelSubscription: async () => {},
    addDebt: async () => {},
    updateDebt: async () => {},
    deleteDebt: async () => {},
    addFixedExpense: async () => {},
    updateFixedExpense: async () => {},
    deleteFixedExpense: async () => {},
    addGoalContribution: async () => {},
    addDebtPayment: async () => {},
    paySubscription: async () => {},
    addInvestment: async () => {},
    updateInvestment: async () => {},
    deleteInvestment: async () => {},
    addInvestmentContribution: async () => {},
    addBudget: async () => {},
    updateBudget: async () => {},
    deleteBudget: async () => {},
    addCategory: async () => {},
    updateCategory: async () => {},
    deleteCategory: async () => {},
    addBankAccount: async () => {},
    updateBankAccount: async () => {},
    deleteBankAccount: async () => {},
    addBankCard: async () => {},
    updateBankCard: async () => {},
    deleteBankCard: async () => {},
    addReport: async () => {},
    deleteReport: async () => {},
    getAllDataForMonth: () => ({ transactions: [], goals: [], debts: [], investments: [], budgets: [] }),
});

// PROVIDER
export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [goalContributions, setGoalContributions] = useState<GoalContribution[]>([]);
    const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [investmentContributions, setInvestmentContributions] = useState<InvestmentContribution[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [bankCards, setBankCards] = useState<BankCard[]>([]);
    const [reports, setReports] = useState<MonthlyReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<IFilters>({
        profile: 'all',
        month: getMonth(new Date()),
        year: getYear(new Date()),
    });
    
    // Simulate fetching data on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setTransactions(mockTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setSubscriptions(mockSubscriptions.sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime()));
            setGoals(mockGoals);
            setDebts(mockDebts);
            setDebtPayments(mockDebtPayments);
            setFixedExpenses(mockFixedExpenses);
            setProfiles(mockProfiles);
            setCategories(mockCategories);
            setGoalContributions(mockGoalContributions);
            setInvestments(mockInvestments);
            setInvestmentContributions(mockInvestmentContributions);
            setBudgets(mockBudgets);
            setBankAccounts(mockBankAccounts);
            setBankCards(mockBankCards);
            setReports(mockReports);
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const availableYears = useMemo(() => {
        const years = new Set(transactions.map(t => getYear(new Date(t.date))));
        return Array.from(years).sort((a, b) => b - a);
    }, [transactions]);
    
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const profileMatch = filters.profile === 'all' || t.profile === filters.profile;
            const monthMatch = filters.month === -1 || getMonth(date) === filters.month;
            const yearMatch = getYear(date) === filters.year;
            return profileMatch && monthMatch && yearMatch;
        });
    }, [transactions, filters]);
    
    const filteredBankAccounts = useMemo(() => {
        return bankAccounts.filter(acc => filters.profile === 'all' || acc.profile === filters.profile);
    }, [bankAccounts, filters]);

    const filteredBankCards = useMemo(() => {
        return bankCards.filter(card => filters.profile === 'all' || card.profile === filters.profile);
    }, [bankCards, filters]);

    const filteredDebts = useMemo(() => {
        return debts.filter(d => filters.profile === 'all' || d.profile === filters.profile);
    }, [debts, filters]);
    
    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter(s => {
            const profileMatch = filters.profile === 'all' || s.profile === filters.profile;
            return profileMatch;
        });
    }, [subscriptions, filters]);

    const filteredGoals = useMemo(() => {
        return goals.filter(g => filters.profile === 'all' || g.profile === filters.profile);
    }, [goals, filters]);
    
    const filteredFixedExpenses = useMemo(() => {
        return fixedExpenses.filter(fe => filters.profile === 'all' || fe.profile === filters.profile);
    }, [fixedExpenses, filters]);

    const filteredGoalContributions = useMemo(() => {
        return goalContributions.filter(gc => {
            const goal = goals.find(g => g.id === gc.goalId);
            if (!goal) return false;
            const profileMatch = filters.profile === 'all' || goal.profile === filters.profile;
            const date = new Date(gc.date);
            const monthMatch = filters.month === -1 || getMonth(date) === filters.month;
            const yearMatch = getYear(date) === filters.year;
            return profileMatch && monthMatch && yearMatch;
        });
    }, [goalContributions, goals, filters]);

     const filteredDebtPayments = useMemo(() => {
        return debtPayments.filter(dp => {
            const debt = debts.find(d => d.id === dp.debtId);
            if (!debt) return false;
            const profileMatch = filters.profile === 'all' || debt.profile === filters.profile;
            const date = new Date(dp.date);
            const monthMatch = filters.month === -1 || getMonth(date) === filters.month;
            const yearMatch = getYear(date) === filters.year;
            return profileMatch && monthMatch && yearMatch;
        });
    }, [debtPayments, debts, filters]);

    const filteredInvestments = useMemo(() => {
        return investments.filter(i => filters.profile === 'all' || i.profile === filters.profile);
    }, [investments, filters]);

    const filteredInvestmentContributions = useMemo(() => {
        return investmentContributions.filter(ic => {
            const investment = investments.find(i => i.id === ic.investmentId);
            if (!investment) return false;
            const profileMatch = filters.profile === 'all' || investment.profile === filters.profile;
            const date = new Date(ic.date);
            const monthMatch = filters.month === -1 || getMonth(date) === filters.month;
            const yearMatch = getYear(date) === filters.year;
            return profileMatch && monthMatch && yearMatch;
        });
    }, [investmentContributions, investments, filters]);
    
     const filteredBudgets = useMemo(() => {
        return budgets.filter(b => filters.profile === 'all' || b.profile === filters.profile);
    }, [budgets, filters]);


    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...transaction, id: crypto.randomUUID() };
        setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        const card = bankCards.find(c => c.id === newTransaction.cardId);

        if (card && card.cardType === 'credit') {
            // It's a credit card transaction, so update the usedAmount on the card
            setBankCards(prev => prev.map(c => 
                c.id === card.id ? { ...c, usedAmount: (c.usedAmount || 0) + newTransaction.amount } : c
            ));
        } else {
            // It's a debit/prepaid card transaction or a non-card transaction, so update the bank account balance
            setBankAccounts(prev => prev.map(acc => {
                if (acc.id === newTransaction.accountId) {
                    if (newTransaction.type === 'income') {
                        return { ...acc, balance: acc.balance + newTransaction.amount };
                    } else {
                        return { ...acc, balance: acc.balance - newTransaction.amount };
                    }
                }
                return acc;
            }));
        }
    };

    const updateTransaction = async (updatedTransaction: Transaction) => {
        let originalTransaction: Transaction | undefined;
        setTransactions(prev => {
            originalTransaction = prev.find(t => t.id === updatedTransaction.id);
            return prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        });
        
        // This logic gets complex with credit cards. For now, we simplify it by assuming
        // updates don't change card type vs non-card, which is a reasonable assumption for an MVP.
        if (originalTransaction) {
            setBankAccounts(prev => prev.map(acc => {
                let balance = acc.balance;
                if (acc.id === originalTransaction!.accountId) {
                    if (originalTransaction!.type === 'income') {
                        balance -= originalTransaction!.amount;
                    } else {
                        balance += originalTransaction!.amount;
                    }
                }
                if (acc.id === updatedTransaction.accountId) {
                     if (updatedTransaction.type === 'income') {
                        balance += updatedTransaction.amount;
                    } else {
                        balance -= updatedTransaction.amount;
                    }
                }
                return { ...acc, balance };
            }));
        }
    };

    const deleteTransaction = async (id: string) => {
        const transactionToDelete = transactions.find(t => t.id === id);
        if (transactionToDelete) {
             setTransactions(prev => prev.filter(t => t.id !== id));

             const card = bankCards.find(c => c.id === transactionToDelete.cardId);
             if (card && card.cardType === 'credit') {
                 setBankCards(prev => prev.map(c => 
                     c.id === card.id ? { ...c, usedAmount: (c.usedAmount || 0) - transactionToDelete.amount } : c
                 ));
             } else {
                setBankAccounts(prev => prev.map(acc => {
                    if (acc.id === transactionToDelete.accountId) {
                        if (transactionToDelete.type === 'income') {
                            return { ...acc, balance: acc.balance - transactionToDelete.amount };
                        } else {
                            return { ...acc, balance: acc.balance + transactionToDelete.amount };
                        }
                    }
                    return acc;
                }));
             }
        }
    };

    const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
        const newGoal = { ...goal, id: crypto.randomUUID(), currentAmount: 0 };
        setGoals(prev => [...prev, newGoal]);
    }

    const updateGoal = async (updatedGoal: SavingsGoal) => {
        setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    }

    const deleteGoal = async (id: string) => {
        setGoals(prev => prev.filter(g => g.id !== id));
        // Also delete associated contributions
        setGoalContributions(prev => prev.filter(c => c.goalId !== id));
    }
    
    const addSubscription = async (subscription: Omit<Subscription, 'id' | 'status'>) => {
        const newSubscription = { ...subscription, id: crypto.randomUUID(), status: 'active' as const };
        setSubscriptions(prev => [...prev, newSubscription].sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime()));
    }

    const updateSubscription = async (updatedSubscription: Subscription) => {
        setSubscriptions(prev => prev.map(s => s.id === updatedSubscription.id ? updatedSubscription : s));
    }

    const cancelSubscription = async (id: string) => {
        setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled', cancellationDate: new Date() } : s));
    }

    const addDebt = async (debt: Omit<Debt, 'id' | 'paidAmount'>) => {
        const newDebt = { ...debt, id: crypto.randomUUID(), paidAmount: 0 };
        setDebts(prev => [...prev, newDebt]);
    }

    const updateDebt = async (updatedDebt: Debt) => {
        setDebts(prev => prev.map(d => d.id === updatedDebt.id ? updatedDebt : d));
    }

    const deleteDebt = async (id: string) => {
        setDebts(prev => prev.filter(d => d.id !== id));
        // Also delete associated payments
        setDebtPayments(prev => prev.filter(p => p.debtId !== id));
    }

    const addFixedExpense = async (expense: Omit<FixedExpense, 'id'>) => {
        const newExpense = { ...expense, id: crypto.randomUUID() };
        setFixedExpenses(prev => [...prev, newExpense]);
    }

    const updateFixedExpense = async (updatedExpense: FixedExpense) => {
        setFixedExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    }

    const deleteFixedExpense = async (id: string) => {
        setFixedExpenses(prev => prev.filter(e => e.id !== id));
    }

    const addGoalContribution = async (contribution: Omit<GoalContribution, 'id'>) => {
        const newContribution = { ...contribution, id: crypto.randomUUID() };
        setGoalContributions(prev => [newContribution, ...prev]);

        setGoals(prevGoals => prevGoals.map(goal => {
            if (goal.id === contribution.goalId) {
                return { ...goal, currentAmount: goal.currentAmount + contribution.amount };
            }
            return goal;
        }));
    }

    const addDebtPayment = async (payment: Omit<DebtPayment, 'id'>) => {
        const newPayment = { ...payment, id: crypto.randomUUID() };
        
        let debtToUpdate: Debt | undefined;
        
        setDebts(prevDebts => prevDebts.map(debt => {
            if (debt.id === payment.debtId) {
                debtToUpdate = debt;
                const originalDueDateDay = new Date(debt.dueDate).getDate();
                const newDueDate = addMonths(new Date(debt.dueDate), 1);
                const finalDueDate = setDate(newDueDate, originalDueDateDay);

                return { 
                    ...debt, 
                    paidAmount: debt.paidAmount + payment.amount,
                    dueDate: finalDueDate,
                };
            }
            return debt;
        }));

        setDebtPayments(prev => [newPayment, ...prev]);

        if (debtToUpdate) {
            await addTransaction({
                type: 'expense',
                amount: payment.amount,
                description: `Abono a: ${debtToUpdate.name}`,
                category: 'Pago de Deuda',
                profile: debtToUpdate.profile,
                date: payment.date.toISOString(),
                accountId: payment.accountId,
            });
        }
    }
    
    const paySubscription = async (subscription: Subscription) => {
        const originalDueDateDay = new Date(subscription.dueDate).getDate();
        const newDueDate = addMonths(new Date(subscription.dueDate), 1);
        const finalDueDate = setDate(newDueDate, originalDueDateDay);

        setSubscriptions(prev => prev.map(s => 
            s.id === subscription.id 
            ? { ...s, dueDate: finalDueDate }
            : s
        ).sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime()));

        const card = bankCards.find(c => c.id === subscription.cardId);

        await addTransaction({
            type: 'expense',
            amount: subscription.amount,
            description: `Suscripción: ${subscription.name}`,
            category: 'Suscripciones',
            profile: subscription.profile,
            date: new Date().toISOString(),
            accountId: card?.accountId || '',
            cardId: card?.id
        });
    }

    const addInvestment = async (investment: Omit<Investment, 'id' | 'currentValue'>) => {
        const newInvestment = { ...investment, id: crypto.randomUUID(), currentValue: investment.initialAmount };
        setInvestments(prev => [...prev, newInvestment]);
    };

    const updateInvestment = async (updatedInvestment: Investment) => {
        setInvestments(prev => prev.map(i => (i.id === updatedInvestment.id ? updatedInvestment : i)));
    };

    const deleteInvestment = async (id: string) => {
        setInvestments(prev => prev.filter(i => i.id !== id));
        // Also delete associated contributions
        setInvestmentContributions(prev => prev.filter(c => c.investmentId !== id));
    };

    const addInvestmentContribution = async (contribution: Omit<InvestmentContribution, 'id'>) => {
        const newContribution = { ...contribution, id: crypto.randomUUID() };
        setInvestmentContributions(prev => [newContribution, ...prev]);

        setInvestments(prevInvestments =>
            prevInvestments.map(inv => {
                if (inv.id === contribution.investmentId) {
                    // When adding a contribution, it increases both the initial amount (cost basis) and current value.
                    return { 
                        ...inv, 
                        initialAmount: inv.initialAmount + contribution.amount,
                        currentValue: inv.currentValue + contribution.amount 
                    };
                }
                return inv;
            })
        );
    };

    const addBudget = async (budget: Omit<Budget, 'id'>) => {
        const newBudget = { ...budget, id: crypto.randomUUID() };
        setBudgets(prev => [...prev, newBudget]);
    };

    const updateBudget = async (updatedBudget: Budget) => {
        setBudgets(prev => prev.map(b => (b.id === updatedBudget.id ? updatedBudget : b)));
    };

    const deleteBudget = async (id: string) => {
        setBudgets(prev => prev.filter(b => b.id !== id));
    };

    const addCategory = async (category: Omit<Category, 'id'>) => {
        const newCategory = { ...category, id: crypto.randomUUID() };
        setCategories(prev => [...prev, newCategory]);
    };

    const updateCategory = async (updatedCategory: Category) => {
        setCategories(prev => prev.map(c => (c.id === updatedCategory.id ? updatedCategory : c)));
    };

    const deleteCategory = async (id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id));
    };
    
    const addBankAccount = async (account: Omit<BankAccount, 'id'>) => {
        const newAccount = { ...account, id: crypto.randomUUID() };
        setBankAccounts(prev => [...prev, newAccount]);
    };

    const updateBankAccount = async (updatedAccount: BankAccount) => {
        setBankAccounts(prev => prev.map(a => (a.id === updatedAccount.id ? updatedAccount : a)));
    };

    const deleteBankAccount = async (id: string) => {
        setBankAccounts(prev => prev.filter(a => a.id !== id));
    };

    const addBankCard = async (card: Omit<BankCard, 'id' | 'usedAmount'>) => {
        const newCard = { ...card, id: crypto.randomUUID(), usedAmount: 0 };
        setBankCards(prev => [...prev, newCard]);
    };

    const updateBankCard = async (updatedCard: BankCard) => {
        setBankCards(prev => prev.map(c => (c.id === updatedCard.id ? updatedCard : c)));
    };

    const deleteBankCard = async (id: string) => {
        setBankCards(prev => prev.filter(c => c.id !== id));
    };
    
    const addReport = async (report: MonthlyReport) => {
        setReports(prev => [...prev, report].sort((a,b) => b.generatedAt.getTime() - a.generatedAt.getTime()));
    }
    
    const deleteReport = async (id: string) => {
        setReports(prev => prev.filter(r => r.id !== id));
    };

    const getAllDataForMonth = (month: number, year: number) => {
        const monthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return getMonth(date) === month && getYear(date) === year;
        });
        return {
            transactions: monthTransactions,
            goals, // These are not time-bound in the same way
            debts, // These are not time-bound in the same way
            investments, // These are not time-bound in the same way
            budgets, // These are not time-bound in the same way
        }
    }

    return (
        <DataContext.Provider value={{ 
            transactions: filteredTransactions,
            goals: filteredGoals,
            subscriptions: filteredSubscriptions,
            debts: filteredDebts,
            fixedExpenses: filteredFixedExpenses,
            profiles,
            categories,
            goalContributions: filteredGoalContributions,
            debtPayments: filteredDebtPayments,
            investments: filteredInvestments,
            investmentContributions: filteredInvestmentContributions,
            budgets: filteredBudgets,
            bankAccounts: filteredBankAccounts,
            bankCards: filteredBankCards,
            reports,
            isLoading,
            filters,
            setFilters,
            availableYears,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addGoal,
            updateGoal,
            deleteGoal,
            addSubscription,
            updateSubscription,
            cancelSubscription,
            addDebt,
            updateDebt,
            deleteDebt,
            addFixedExpense,
            updateFixedExpense,
            deleteFixedExpense,
            addGoalContribution,
            addDebtPayment,
            paySubscription,
            addInvestment,
            updateInvestment,
            deleteInvestment,
            addInvestmentContribution,
            addBudget,
            updateBudget,
            deleteBudget,
            addCategory,
            updateCategory,
            deleteCategory,
            addBankAccount,
            updateBankAccount,
            deleteBankAccount,
            addBankCard,
            updateBankCard,
            deleteBankCard,
            addReport,
            deleteReport,
            getAllDataForMonth
        }}>
            {children}
        </DataContext.Provider>
    );
};
