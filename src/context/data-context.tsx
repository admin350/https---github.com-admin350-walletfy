
'use client';

import type { Transaction, SavingsGoal, Subscription, Profile, Category, FixedExpense, Debt } from "@/types";
import { createContext, useState, useEffect, ReactNode } from "react";
import { addDays } from "date-fns";

// MOCK DATA
const mockTransactions: Transaction[] = [
  { id: '1', type: "income", description: "Salario Mensual", amount: 2500000, category: "Sueldo", profile: 'Trabajo Fijo', date: new Date(new Date().setDate(5)).toISOString() },
  { id: '2', type: "expense", description: "Alquiler", amount: 800000, category: "Vivienda", profile: 'Personal', date: new Date(new Date().setDate(5)).toISOString() },
  { id: '3', type: "expense", description: "Compra Semanal", amount: 150750, category: "Alimentación", profile: 'Personal', date: new Date(new Date().setDate(10)).toISOString() },
  { id: '4', type: "expense", description: "Suscripción Netflix", amount: 15990, category: "Suscripciones", profile: 'Personal', date: new Date(new Date().setDate(3)).toISOString() },
  { id: '5', type: "income", description: "Proyecto Freelance", amount: 750000, category: "Negocio", profile: 'Negocio', date: new Date(new Date().setDate(15)).toISOString() },
];

const mockGoals: SavingsGoal[] = [
  { id: '1', name: "Vacaciones a Japón", currentAmount: 3500000, targetAmount: 5000000, estimatedDate: new Date('2025-12-01'), profile: 'Personal', category: 'Viaje' },
  { id: '2', name: "Nuevo Portátil", currentAmount: 800000, targetAmount: 2000000, estimatedDate: new Date('2024-10-31'), profile: 'Negocio', category: 'Tecnología' },
  { id: '3', name: "Fondo de Emergencia", currentAmount: 4500000, targetAmount: 10000000, estimatedDate: new Date('2026-01-01'), profile: 'Personal', category: 'Inversión' },
];

const mockSubscriptions: Subscription[] = [
    { id: '1', name: "Suscripción Netflix", amount: 15990, dueDate: addDays(new Date(), 3), paymentMethod: "Tarjeta de Crédito", bank: "Banco Estado" },
    { id: '4', name: "Spotify", amount: 9990, dueDate: addDays(new Date(), 12), paymentMethod: "Tarjeta de Débito", bank: "Scotiabank" },
];

const mockDebts: Debt[] = [
    { id: '2', name: "Cuota Préstamo Auto", amount: 350000, dueDate: addDays(new Date(), 7), financialInstitution: "Santander" },
    { id: '3', name: "Alquiler", amount: 800000, dueDate: addDays(new Date(), 10), financialInstitution: "Inmobiliaria" },
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
    { name: "Alimentación", type: "Gasto" },
    { name: "Transporte", type: "Gasto" },
    { name: "Vivienda", type: "Gasto" },
    { name: "Entretenimiento", type: "Gasto" },
    { name: "Suscripciones", type: "Gasto" },
    { name: "Servicios", type: "Gasto" },
    { name: "Salud", type: "Gasto" },
    { name: "Compras", type: "Gasto" },
    { name: "Inversiones", type: "Gasto" },
    { name: "Fondo de Emergencia", type: "Gasto" },
    { name: "Otros", type: "Gasto" },
    { name: "Pago de Deuda", type: "Gasto" },
    { name: "Ahorro para Meta", type: "Gasto" },
    { name: "Sueldo", type: "Ingreso" },
    { name: "Negocio", type: "Ingreso" },
    { name: "Otros Ingresos", type: "Ingreso" },
];

// CONTEXT
interface DataContextType {
    transactions: Transaction[];
    goals: SavingsGoal[];
    subscriptions: Subscription[];
    debts: Debt[];
    fixedExpenses: FixedExpense[];
    profiles: Profile[];
    categories: Category[];
    isLoading: boolean;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => Promise<void>;
    addSubscription: (subscription: Omit<Subscription, 'id'>) => Promise<void>;
    updateSubscription: (subscription: Subscription) => Promise<void>;
    deleteSubscription: (id: string) => Promise<void>;
    addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
    updateDebt: (debt: Debt) => Promise<void>;
    deleteDebt: (id: string) => Promise<void>;
    addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => Promise<void>;
    updateFixedExpense: (expense: FixedExpense) => Promise<void>;
    deleteFixedExpense: (id: string) => Promise<void>;
}

export const DataContext = createContext<DataContextType>({
    transactions: [],
    goals: [],
    subscriptions: [],
    debts: [],
    fixedExpenses: [],
    profiles: [],
    categories: [],
    isLoading: true,
    addTransaction: async () => {},
    updateTransaction: async () => {},
    deleteTransaction: async () => {},
    addGoal: async () => {},
    addSubscription: async () => {},
    updateSubscription: async () => {},
    deleteSubscription: async () => {},
    addDebt: async () => {},
    updateDebt: async () => {},
    deleteDebt: async () => {},
    addFixedExpense: async () => {},
    updateFixedExpense: async () => {},
    deleteFixedExpense: async () => {},
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
    const [isLoading, setIsLoading] = useState(true);
    
    // Simulate fetching data on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setTransactions(mockTransactions);
            setGoals(mockGoals);
            setSubscriptions(mockSubscriptions);
            setDebts(mockDebts);
            setFixedExpenses(mockFixedExpenses);
            setProfiles(mockProfiles);
            setCategories(mockCategories);
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    
    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...transaction, id: crypto.randomUUID() };
        setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const updateTransaction = async (updatedTransaction: Transaction) => {
        setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    };

    const deleteTransaction = async (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
        const newGoal = { ...goal, id: crypto.randomUUID(), currentAmount: 0 };
        setGoals(prev => [...prev, newGoal]);
    }
    
    const addSubscription = async (subscription: Omit<Subscription, 'id'>) => {
        const newSubscription = { ...subscription, id: crypto.randomUUID() };
        setSubscriptions(prev => [...prev, newSubscription].sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime()));
    }

    const updateSubscription = async (updatedSubscription: Subscription) => {
        setSubscriptions(prev => prev.map(s => s.id === updatedSubscription.id ? updatedSubscription : s));
    }

    const deleteSubscription = async (id: string) => {
        setSubscriptions(prev => prev.filter(s => s.id !== id));
    }

    const addDebt = async (debt: Omit<Debt, 'id'>) => {
        const newDebt = { ...debt, id: crypto.randomUUID() };
        setDebts(prev => [...prev, newDebt].sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime()));
    }

    const updateDebt = async (updatedDebt: Debt) => {
        setDebts(prev => prev.map(d => d.id === updatedDebt.id ? updatedDebt : d));
    }

    const deleteDebt = async (id: string) => {
        setDebts(prev => prev.filter(d => d.id !== id));
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
    

    return (
        <DataContext.Provider value={{ 
            transactions,
            goals,
            subscriptions,
            debts,
            fixedExpenses,
            profiles,
            categories,
            isLoading,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addGoal,
            addSubscription,
            updateSubscription,
            deleteSubscription,
            addDebt,
            updateDebt,
            deleteDebt,
            addFixedExpense,
            updateFixedExpense,
            deleteFixedExpense
        }}>
            {children}
        </DataContext.Provider>
    );
};
