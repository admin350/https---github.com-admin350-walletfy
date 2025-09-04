'use client';

import type { Transaction, SavingsGoal, Subscription, Profile, Category, FixedExpense, Debt, GoalContribution, DebtPayment, Investment, InvestmentContribution, Budget, BankAccount, BankCard, MonthlyReport, AppSettings } from "@/types";
import { createContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { getYear, getMonth, isPast } from "date-fns";
import { useAuth } from "./auth-context";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, writeBatch, onSnapshot, Unsubscribe, DocumentData, deleteDoc, setDoc, getDoc } from "firebase/firestore";


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
    settings: AppSettings;
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
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    getAllDataForMonth: (month: number, year: number) => { transactions: Transaction[], goals: SavingsGoal[], debts: Debt[], investments: Investment[], budgets: Budget[] };
    formatCurrency: (value: number, withSymbol?: boolean, isCompact?: boolean) => string;
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
    settings: { currency: 'CLP' },
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
    updateSettings: async () => {},
    getAllDataForMonth: () => ({ transactions: [], goals: [], debts: [], investments: [], budgets: [] }),
    formatCurrency: () => '',
});

// PROVIDER
export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const uid = user?.uid;

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
    const [settings, setSettings] = useState<AppSettings>({ currency: 'CLP' });
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<IFilters>({
        profile: 'all',
        month: getMonth(new Date()),
        year: getYear(new Date()),
    });

    const formatCurrency = useCallback((value: number, withSymbol = true, isCompact = false) => {
        const options: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: settings.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        };

        if (!withSymbol) {
            options.style = 'decimal';
        }
        
        if (isCompact) {
             options.notation = 'compact';
             options.compactDisplay = 'short';
        }

        const locale = settings.currency === 'CLP' ? 'es-CL' : settings.currency === 'USD' ? 'en-US' : 'de-DE';
        
        return new Intl.NumberFormat(locale, options).format(value);
    }, [settings.currency]);
    
    
    // Subscribe to all data collections for the logged-in user
    useEffect(() => {
        if (!uid) {
            setIsLoading(false);
            // Clear all data when user logs out
            setTransactions([]);
            setGoals([]);
            setSubscriptions([]);
            setDebts([]);
            setFixedExpenses([]);
            setProfiles([]);
            setCategories([]);
            setGoalContributions([]);
            setDebtPayments([]);
            setInvestments([]);
            setInvestmentContributions([]);
            setBudgets([]);
            setBankAccounts([]);
            setBankCards([]);
            setReports([]);
            setSettings({ currency: 'CLP' });
            return;
        }

        setIsLoading(true);

        const collections = [
            'transactions', 'goals', 'subscriptions', 'debts', 'fixedExpenses', 'profiles', 
            'categories', 'goalContributions', 'debtPayments', 'investments', 
            'investmentContributions', 'budgets', 'bankAccounts', 'bankCards', 'reports'
        ];

        const unsubscribers: Unsubscribe[] = [];

        const dataSetters: { [key: string]: React.Dispatch<React.SetStateAction<any[]>> } = {
            transactions: setTransactions,
            goals: setGoals,
            subscriptions: setSubscriptions,
            debts: setDebts,
            fixedExpenses: setFixedExpenses,
            profiles: setProfiles,
            categories: setCategories,
            goalContributions: setGoalContributions,
            debtPayments: setDebtPayments,
            investments: setInvestments,
            investmentContributions: setInvestmentContributions,
            budgets: setBudgets,
            bankAccounts: setBankAccounts,
            bankCards: setBankCards,
            reports: setReports,
        };

        const fetchData = async () => {
            // Check if user has data, if not, create default data
            const userDocRef = doc(db, 'users', uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                const batch = writeBatch(db);
                
                const defaultProfiles: Profile[] = [
                    { name: "Personal", color: "#3b82f6" },
                    { name: "Negocio", color: "#14b8a6" },
                ];
                defaultProfiles.forEach(p => {
                    const profileRef = doc(db, 'users', uid, 'profiles', p.name);
                    batch.set(profileRef, p);
                });

                const defaultCategories: Category[] = [
                    { id: '1', name: "Alimentación", type: "Gasto", color: "#f97316" },
                    { id: '2', name: "Transporte", type: "Gasto", color: "#3b82f6" },
                    { id: '3', name: "Vivienda", type: "Gasto", color: "#84cc16" },
                    { id: '4', name: "Sueldo", type: "Ingreso", color: "#22c55e" },
                    { id: '5', name: "Pago de Deuda", type: "Gasto", color: "#ef4444"},
                    { id: '6', name: "Suscripciones", type: "Gasto", color: "#a855f7"},
                    { id: '7', name: "Otros Gastos", type: "Gasto", color: "#6b7280"},
                ];

                defaultCategories.forEach(c => {
                    const categoryRef = doc(collection(db, 'users', uid, 'categories'));
                    batch.set(categoryRef, c);
                });
                
                const settingsRef = doc(db, 'users', uid, 'settings', 'appSettings');
                batch.set(settingsRef, { currency: 'CLP' });

                await batch.commit();
            }

            // Set up listeners
            collections.forEach(collectionName => {
                const collRef = collection(db, 'users', uid, collectionName);
                const unsubscribe = onSnapshot(collRef, (snapshot) => {
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    
                    // Firestore timestamps need to be converted to JS Dates
                    const processedData = data.map(item => {
                        const newItem: DocumentData = { ...item };
                        for (const key in newItem) {
                            if (newItem[key] && typeof newItem[key].toDate === 'function') {
                                newItem[key] = newItem[key].toDate();
                            }
                        }
                        return newItem;
                    });
                    
                    if (dataSetters[collectionName]) {
                        dataSetters[collectionName](processedData as any);
                    }
                });
                unsubscribers.push(unsubscribe);
            });
            
             const settingsRef = doc(db, 'users', uid, 'settings', 'appSettings');
             const unsubSettings = onSnapshot(settingsRef, (doc) => {
                if(doc.exists()){
                    setSettings(doc.data() as AppSettings);
                }
             });
             unsubscribers.push(unsubSettings);
        };

        fetchData().finally(() => setIsLoading(false));

        // Cleanup subscriptions on unmount
        return () => unsubscribers.forEach(unsub => unsub());

    }, [uid]);


    const addDoc = async <T extends { id?: string }>(collectionName: string, data: T) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const docRef = doc(collection(db, 'users', uid, collectionName));
        await setDoc(docRef, { ...data, id: docRef.id });
        return { ...data, id: docRef.id };
    };

    const setDocWithId = async <T>(collectionName: string, id: string, data: T) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const docRef = doc(db, 'users', uid, collectionName, id);
        await setDoc(docRef, data);
    };

    const deleteDocById = async (collectionName: string, id: string) => {
        if (!uid) throw new Error("Usuario no autenticado");
        await deleteDoc(doc(db, 'users', uid, collectionName, id));
    };


    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        await addDoc('transactions', transaction);
        // Balance updates are now handled via a cloud function or need to be triggered here.
        // For simplicity, let's update balance here.
        const card = bankCards.find(c => c.id === transaction.cardId);
        if (transaction.type === 'expense' && card && card.cardType === 'credit') {
            await updateBankCard({ ...card, usedAmount: (card.usedAmount || 0) + transaction.amount });
        } else {
            const account = bankAccounts.find(a => a.id === transaction.accountId);
            if (account) {
                const newBalance = transaction.type === 'income' ? account.balance + transaction.amount : account.balance - transaction.amount;
                await updateBankAccount({ ...account, balance: newBalance });
            }
        }
    };

    const updateTransaction = async (updatedTransaction: Transaction) => {
        const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
        if (originalTransaction) {
            // Revert old balance change
            const originalAccount = bankAccounts.find(a => a.id === originalTransaction.accountId);
            if(originalAccount) {
                 const revertedBalance = originalTransaction.type === 'income' ? originalAccount.balance - originalTransaction.amount : originalAccount.balance + originalTransaction.amount;
                 await updateBankAccount({...originalAccount, balance: revertedBalance});
            }
            // Apply new balance change
            const newAccount = bankAccounts.find(a => a.id === updatedTransaction.accountId);
            if (newAccount) {
                const newBalance = updatedTransaction.type === 'income' ? newAccount.balance + updatedTransaction.amount : newAccount.balance - updatedTransaction.amount;
                await updateBankAccount({...newAccount, balance: newBalance});
            }
        }
        await setDocWithId('transactions', updatedTransaction.id, updatedTransaction);
    };

    const deleteTransaction = async (id: string) => {
         const transactionToDelete = transactions.find(t => t.id === id);
         if (transactionToDelete) {
            const account = bankAccounts.find(a => a.id === transactionToDelete.accountId);
            if (account) {
                 const newBalance = transactionToDelete.type === 'income' ? account.balance - transactionToDelete.amount : account.balance + transactionToDelete.amount;
                 await updateBankAccount({...account, balance: newBalance});
            }
            const card = bankCards.find(c => c.id === transactionToDelete.cardId);
            if(card && card.cardType === 'credit') {
                await updateBankCard({...card, usedAmount: (card.usedAmount || 0) - transactionToDelete.amount});
            }
         }
         await deleteDocById('transactions', id);
    };
    
    // GOAL FUNCTIONS
    const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => await addDoc('goals', { ...goal, currentAmount: 0 });
    const updateGoal = async (goal: SavingsGoal) => await setDocWithId('goals', goal.id, goal);
    const deleteGoal = async (id: string) => await deleteDocById('goals', id);
    const addGoalContribution = async (contribution: Omit<GoalContribution, 'id'>) => {
        await addDoc('goalContributions', contribution);
        const goal = goals.find(g => g.id === contribution.goalId);
        if (goal) {
            await updateGoal({ ...goal, currentAmount: goal.currentAmount + contribution.amount });
        }
    };
    
    // DEBT FUNCTIONS
    const addDebt = async (debt: Omit<Debt, 'id' | 'paidAmount'>) => await addDoc('debts', { ...debt, paidAmount: 0 });
    const updateDebt = async (debt: Debt) => await setDocWithId('debts', debt.id, debt);
    const deleteDebt = async (id: string) => await deleteDocById('debts', id);
    const addDebtPayment = async (payment: Omit<DebtPayment, 'id'>) => {
        await addDoc('debtPayments', payment);
        const debt = debts.find(d => d.id === payment.debtId);
        if (debt) {
            await updateDebt({ ...debt, paidAmount: debt.paidAmount + payment.amount });
            const debtCategory = categories.find(c => c.name === "Pago de Deuda") ? "Pago de Deuda" : "Otros Gastos";
            await addTransaction({
                type: 'expense',
                amount: payment.amount,
                description: `Abono a: ${debt.name}`,
                category: debtCategory,
                profile: debt.profile,
                date: new Date().toISOString(),
                accountId: payment.accountId,
            });
        }
    };
    
    // INVESTMENT FUNCTIONS
    const addInvestment = async (investment: Omit<Investment, 'id' | 'currentValue'>) => await addDoc('investments', { ...investment, currentValue: investment.initialAmount });
    const updateInvestment = async (investment: Investment) => await setDocWithId('investments', investment.id, investment);
    const deleteInvestment = async (id: string) => await deleteDocById('investments', id);
    const addInvestmentContribution = async (contribution: Omit<InvestmentContribution, 'id'>) => {
        await addDoc('investmentContributions', contribution);
        const investment = investments.find(i => i.id === contribution.investmentId);
        if(investment) {
            await updateInvestment({
                ...investment,
                initialAmount: investment.initialAmount + contribution.amount,
                currentValue: investment.currentValue + contribution.amount,
            });
        }
    };

    // BANK ACCOUNT/CARD FUNCTIONS
    const addBankAccount = async (account: Omit<BankAccount, 'id'>) => await addDoc('bankAccounts', account);
    const updateBankAccount = async (account: BankAccount) => await setDocWithId('bankAccounts', account.id, account);
    const deleteBankAccount = async (id: string) => await deleteDocById('bankAccounts', id);
    const addBankCard = async (card: Omit<BankCard, 'id'|'usedAmount'>) => await addDoc('bankCards', {...card, usedAmount: 0});
    const updateBankCard = async (card: BankCard) => await setDocWithId('bankCards', card.id, card);
    const deleteBankCard = async (id: string) => await deleteDocById('bankCards', id);

    // SUBSCRIPTION FUNCTIONS
    const addSubscription = async (sub: Omit<Subscription, 'id'|'status'>) => await addDoc('subscriptions', {...sub, status: 'active'});
    const updateSubscription = async (sub: Subscription) => await setDocWithId('subscriptions', sub.id, sub);
    const cancelSubscription = async (id: string) => {
        const sub = subscriptions.find(s => s.id === id);
        if(sub) await updateSubscription({...sub, status: 'cancelled', cancellationDate: new Date()});
    };
    const paySubscription = async (sub: Subscription) => {
        const subscriptionCategory = categories.find(c => c.name === "Suscripciones") ? "Suscripciones" : "Otros Gastos";
        await addTransaction({
            type: 'expense',
            amount: sub.amount,
            description: `Suscripción: ${sub.name}`,
            category: subscriptionCategory,
            profile: sub.profile,
            date: new Date().toISOString(),
            accountId: bankCards.find(c => c.id === sub.cardId)?.accountId || '',
            cardId: sub.cardId,
        });
    };
    
    // OTHER ENTITIES
    const addFixedExpense = async (expense: Omit<FixedExpense, 'id'>) => await addDoc('fixedExpenses', expense);
    const updateFixedExpense = async (expense: FixedExpense) => await setDocWithId('fixedExpenses', expense.id, expense);
    const deleteFixedExpense = async (id: string) => await deleteDocById('fixedExpenses', id);

    const addBudget = async (budget: Omit<Budget, 'id'>) => await addDoc('budgets', budget);
    const updateBudget = async (budget: Budget) => await setDocWithId('budgets', budget.id, budget);
    const deleteBudget = async (id: string) => await deleteDocById('budgets', id);
    
    const addCategory = async (category: Omit<Category, 'id'>) => await addDoc('categories', category);
    const updateCategory = async (category: Category) => await setDocWithId('categories', category.id, category);
    const deleteCategory = async (id: string) => await deleteDocById('categories', id);
    
    const addReport = async (report: MonthlyReport) => await setDocWithId('reports', report.id, report);
    const deleteReport = async (id: string) => await deleteDocById('reports', id);
    
    const updateSettings = async (newSettings: Partial<AppSettings>) => await setDocWithId('settings', 'appSettings', newSettings);
    
    const availableYears = useMemo(() => {
        const years = new Set(transactions.map(t => getYear(new Date(t.date))));
        years.add(getYear(new Date())); // Ensure current year is always available
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

    const getAllDataForMonth = (month: number, year: number) => {
        const monthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return getMonth(date) === month && getYear(date) === year;
        });
        return {
            transactions: monthTransactions,
            goals,
            debts,
            investments,
            budgets,
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
            settings,
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
            updateSettings,
            getAllDataForMonth,
            formatCurrency,
        }}>
            {children}
        </DataContext.Provider>
    );
};
