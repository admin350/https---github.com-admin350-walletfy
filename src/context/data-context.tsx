

'use client';

import type { Transaction, SavingsGoal, Subscription, Profile, Category, FixedExpense, Debt, GoalContribution, DebtPayment, Investment, InvestmentContribution, Budget, BankAccount, BankCard, MonthlyReport, AppSettings, AppNotification } from "@/types";
import { createContext, useState, useEffect, ReactNode, useMemo, useCallback, useContext } from "react";
import { getYear, getMonth, isPast, startOfMonth, endOfMonth, subDays, isSameDay, addMonths } from "date-fns";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, writeBatch, onSnapshot, Unsubscribe, DocumentData, deleteDoc, setDoc, getDoc, query, where, updateDoc, addDoc as addFirestoreDoc } from "firebase/firestore";

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
    notifications: AppNotification[];
    isLoading: boolean;
    filters: IFilters;
    setFilters: React.Dispatch<React.SetStateAction<IFilters>>;
    availableYears: number[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'completionNotified'>) => Promise<void>;
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
    addGoalContribution: (contribution: Omit<GoalContribution, 'id' | 'sourceAccountId'> & { sourceAccountId: string }) => Promise<void>;
    addDebtPayment: (payment: Omit<DebtPayment, 'id'>) => Promise<void>;
    paySubscription: (subscription: Subscription) => Promise<void>;
    addInvestment: (investment: Omit<Investment, 'id' | 'currentValue'>) => Promise<void>;
    updateInvestment: (investment: Investment) => Promise<void>;
    deleteInvestment: (id: string) => Promise<void>;
    addInvestmentContribution: (contribution: Omit<InvestmentContribution, 'id' | 'sourceAccountId'> & { sourceAccountId: string }) => Promise<void>;
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
    addProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
    updateProfile: (profile: Profile) => Promise<void>;
    deleteProfile: (id: string) => Promise<void>;
    getAllDataForMonth: (month: number, year: number) => { transactions: Transaction[], goals: SavingsGoal[], debts: Debt[], investments: Investment[], budgets: Budget[] };
    formatCurrency: (value: number, withSymbol?: boolean, isCompact?: boolean) => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};


// PROVIDER
export const DataProvider = ({ children }: { children: ReactNode }) => {
    const uid = "guest_user";

    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [allGoals, setAllGoals] = useState<SavingsGoal[]>([]);
    const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]);
    const [allDebts, setAllDebts] = useState<Debt[]>([]);
    const [allFixedExpenses, setAllFixedExpenses] = useState<FixedExpense[]>([]);
    const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [allGoalContributions, setAllGoalContributions] = useState<GoalContribution[]>([]);
    const [allDebtPayments, setAllDebtPayments] = useState<DebtPayment[]>([]);
    const [allInvestments, setAllInvestments] = useState<Investment[]>([]);
    const [allInvestmentContributions, setAllInvestmentContributions] = useState<InvestmentContribution[]>([]);
    const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
    const [allBankAccounts, setAllBankAccounts] = useState<BankAccount[]>([]);
    const [allBankCards, setAllBankCards] = useState<BankCard[]>([]);
    const [allReports, setAllReports] = useState<MonthlyReport[]>([]);
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
            return;
        }

        setIsLoading(true);

        const collections = [
            'transactions', 'goals', 'subscriptions', 'debts', 'fixedExpenses', 'profiles', 
            'categories', 'goalContributions', 'debtPayments', 'investments', 
            'investmentContributions', 'budgets', 'bankAccounts', 'bankCards', 'reports'
        ];

        const dataSetters: { [key: string]: React.Dispatch<React.SetStateAction<any[]>> } = {
            transactions: setAllTransactions, goals: setAllGoals, subscriptions: setAllSubscriptions,
            debts: setAllDebts, fixedExpenses: setAllFixedExpenses, profiles: setAllProfiles,
            categories: setAllCategories, goalContributions: setAllGoalContributions, debtPayments: setAllDebtPayments,
            investments: setAllInvestments, investmentContributions: setAllInvestmentContributions, budgets: setAllBudgets,
            bankAccounts: setAllBankAccounts, bankCards: setAllBankCards, reports: setAllReports,
        };

        const unsubscribers = collections.map(collectionName => {
            const collRef = collection(db, 'users', uid, collectionName);
            return onSnapshot(collRef, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const processedData = data.map(item => {
                    const newItem: DocumentData = { ...item };
                    for (const key in newItem) {
                        if (newItem[key] && typeof newItem[key].toDate === 'function') {
                            newItem[key] = newItem[key].toDate();
                        }
                    }
                    return newItem;
                });
                dataSetters[collectionName]?.(processedData as any);
            }, (error) => {
                console.error(`Error fetching ${collectionName}: `, error);
            });
        });
        
        const settingsRef = doc(db, 'users', uid, 'settings', 'appSettings');
        const unsubSettings = onSnapshot(settingsRef, (doc) => {
            if(doc.exists()){
                setSettings(doc.data() as AppSettings);
            } else {
                const defaultProfiles = [
                    { name: "Personal", color: "#3b82f6" },
                    { name: "Negocio", color: "#14b8a6" },
                ];
                const defaultCategories = [
                    { name: "Alimentación", type: "Gasto", color: "#f97316" },
                    { name: "Transporte", type: "Gasto", color: "#3b82f6" },
                    { name: "Vivienda", type: "Gasto", color: "#84cc16" },
                    { name: "Sueldo", type: "Ingreso", color: "#22c55e" },
                    { name: "Pago de Deuda", type: "Gasto", color: "#ef4444"},
                    { name: "Suscripciones", type: "Gasto", color: "#a855f7"},
                    { name: "Otros Gastos", type: "Gasto", color: "#6b7280"},
                    { name: "Transferencia", type: "Transferencia", color: "#06b6d4"},
                ];
                const defaultSettings = { currency: 'CLP', largeTransactionThreshold: 500000 };

                const batch = writeBatch(db);
                const userDocRef = doc(db, 'users', uid);
                batch.set(userDocRef, { initialized: true }, { merge: true });

                defaultProfiles.forEach(profile => {
                    const profileRef = doc(collection(db, 'users', uid, 'profiles'));
                    batch.set(profileRef, profile);
                });
                defaultCategories.forEach(category => {
                    const categoryRef = doc(collection(db, 'users', uid, 'categories'));
                    batch.set(categoryRef, category);
                });
                const newSettingsRef = doc(db, 'users', uid, 'settings', 'appSettings');
                batch.set(newSettingsRef, defaultSettings);

                batch.commit().catch(e => console.error("Error committing initial batch:", e));
            }
        });
        unsubscribers.push(unsubSettings);

        setIsLoading(false);

        return () => unsubscribers.forEach(unsub => unsub());

    }, [uid]);


    const addDoc = async <T extends { id?: string }>(collectionName: string, data: Omit<T, 'id'>): Promise<void> => {
        if (!uid) throw new Error("Usuario no autenticado");
        await addFirestoreDoc(collection(db, 'users', uid, collectionName), data);
    };

    const setDocWithId = async <T>(collectionName: string, id: string, data: T): Promise<void> => {
        if (!uid) throw new Error("Usuario no autenticado");
        const docRef = doc(db, 'users', uid, collectionName, id);
        await setDoc(docRef, data, { merge: true });
    };

    const deleteDocById = async (collectionName: string, id: string): Promise<void> => {
        if (!uid) throw new Error("Usuario no autenticado");
        await deleteDoc(doc(db, 'users', uid, collectionName, id));
    };


    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const batch = writeBatch(db);
        
        const transRef = doc(collection(db, 'users', uid, 'transactions'));
        batch.set(transRef, transaction);
    
        if (transaction.type === 'transfer') {
            const sourceAccountRef = doc(db, 'users', uid, 'bankAccounts', transaction.accountId);
            const sourceAccountSnap = await getDoc(sourceAccountRef);
            if (sourceAccountSnap.exists()) {
                const sourceAccount = sourceAccountSnap.data() as BankAccount;
                batch.update(sourceAccountRef, { balance: sourceAccount.balance - transaction.amount });
            }
    
            if (transaction.destinationAccountId) {
                const destAccountRef = doc(db, 'users', uid, 'bankAccounts', transaction.destinationAccountId);
                const destAccountSnap = await getDoc(destAccountRef);
                if (destAccountSnap.exists()) {
                    const destAccount = destAccountSnap.data() as BankAccount;
                    batch.update(destAccountRef, { balance: destAccount.balance + transaction.amount });
                }
            }
        } else {
            const accountRef = doc(db, 'users', uid, 'bankAccounts', transaction.accountId);
            const accountSnap = await getDoc(accountRef);
            if (accountSnap.exists()) {
                const account = accountSnap.data() as BankAccount;
                const newBalance = transaction.type === 'income' ? account.balance + transaction.amount : account.balance - transaction.amount;
                batch.update(accountRef, { balance: newBalance });
            }
            
            if (transaction.type === 'expense' && transaction.cardId) {
                const cardRef = doc(db, 'users', uid, 'bankCards', transaction.cardId);
                const cardSnap = await getDoc(cardRef);
                if (cardSnap.exists()) {
                    const card = cardSnap.data() as BankCard;
                    if (card.cardType === 'credit') {
                        batch.update(cardRef, { usedAmount: (card.usedAmount || 0) + transaction.amount });
                    }
                }
            }
        }
        
        // Large transaction notification
        if (settings.largeTransactionThreshold && transaction.amount > settings.largeTransactionThreshold) {
            const notifRef = doc(collection(db, 'users', uid, 'notifications'));
            const notif: Omit<AppNotification, 'id'|'read'> = {
                title: `Transacción Grande Detectada`,
                description: `Se registró una transacción de ${formatCurrency(transaction.amount)}: "${transaction.description}".`,
                date: new Date(),
                type: 'info',
                link: `/dashboard/transactions`
            }
             // This is not ideal as it doesn't get the new transaction ID, but it will work for now
            // A better solution would be a cloud function.
        }

        await batch.commit();
    };

    const updateTransaction = async (updatedTransaction: Transaction) => {
        await setDocWithId('transactions', updatedTransaction.id, updatedTransaction);
    };

    const deleteTransaction = async (id: string) => {
         await deleteDocById('transactions', id);
    };
    
    // GOAL FUNCTIONS
    const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'completionNotified'>) => await addDoc('goals', { ...goal, currentAmount: 0, completionNotified: false });
    const updateGoal = async (goal: SavingsGoal) => await setDocWithId('goals', goal.id, goal);
    const deleteGoal = async (id: string) => await deleteDocById('goals', id);
    const addGoalContribution = async (contribution: Omit<GoalContribution, 'id' | 'sourceAccountId'> & { sourceAccountId: string }) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const batch = writeBatch(db);
        const contribRef = doc(collection(db, 'users', uid, 'goalContributions'));
        batch.set(contribRef, contribution);
        const goalRef = doc(db, 'users', uid, 'goals', contribution.goalId);
        const goalSnap = await getDoc(goalRef);
        if (goalSnap.exists()) {
            const goal = goalSnap.data() as SavingsGoal;
            batch.update(goalRef, { currentAmount: goal.currentAmount + contribution.amount });
        }
        const accountRef = doc(db, 'users', uid, 'bankAccounts', contribution.sourceAccountId);
        const accountSnap = await getDoc(accountRef);
        if(accountSnap.exists()) {
            const account = accountSnap.data() as BankAccount;
            batch.update(accountRef, { balance: account.balance - contribution.amount });
        }
        await batch.commit();
    };
    
    // DEBT FUNCTIONS
    const addDebt = async (debt: Omit<Debt, 'id' | 'paidAmount'>) => await addDoc('debts', { ...debt, paidAmount: 0 });
    const updateDebt = async (debt: Debt) => await setDocWithId('debts', debt.id, debt);
    const deleteDebt = async (id: string) => await deleteDocById('debts', id);
    const addDebtPayment = async (payment: Omit<DebtPayment, 'id'>) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const batch = writeBatch(db);
        const paymentRef = doc(collection(db, 'users', uid, 'debtPayments'));
        batch.set(paymentRef, payment);

        const debt = allDebts.find(d => d.id === payment.debtId);
        if (debt) {
            const debtRef = doc(db, 'users', uid, 'debts', debt.id);
            const newPaidAmount = debt.paidAmount + payment.amount;
            batch.update(debtRef, { paidAmount: newPaidAmount });

            // Create a corresponding transaction
            const debtCategory = allCategories.find(c => c.name === "Pago de Deuda") ? "Pago de Deuda" : "Otros Gastos";
            const transactionRef = doc(collection(db, 'users', uid, 'transactions'));
            const transactionData: Omit<Transaction, 'id'> = {
                type: 'expense',
                amount: payment.amount,
                description: `Abono a: ${debt.name}`,
                category: debtCategory,
                profile: debt.profile,
                date: new Date().toISOString(),
                accountId: payment.accountId,
            };
            batch.set(transactionRef, transactionData);
            
            // Deduct from bank account
            const accountRef = doc(db, 'users', uid, 'bankAccounts', payment.accountId);
            const accountSnap = await getDoc(accountRef);
            if(accountSnap.exists()){
                const account = accountSnap.data() as BankAccount;
                batch.update(accountRef, {balance: account.balance - payment.amount});
            }
        }
         await batch.commit();
    };
    
    // INVESTMENT FUNCTIONS
    const addInvestment = async (investment: Omit<Investment, 'id' | 'currentValue'>) => await addDoc('investments', { ...investment, currentValue: investment.initialAmount });
    const updateInvestment = async (investment: Investment) => await setDocWithId('investments', investment.id, investment);
    const deleteInvestment = async (id: string) => await deleteDocById('investments', id);
    const addInvestmentContribution = async (contribution: Omit<InvestmentContribution, 'id' | 'sourceAccountId'> & { sourceAccountId: string }) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const batch = writeBatch(db);
        const contribRef = doc(collection(db, 'users', uid, 'investmentContributions'));
        batch.set(contribRef, contribution);
        const investmentRef = doc(db, 'users', uid, 'investments', contribution.investmentId);
        const investmentSnap = await getDoc(investmentRef);
        if (investmentSnap.exists()) {
            const investment = investmentSnap.data() as Investment;
            batch.update(investmentRef, { 
                initialAmount: investment.initialAmount + contribution.amount,
                currentValue: investment.currentValue + contribution.amount,
            });
        }
        const accountRef = doc(db, 'users', uid, 'bankAccounts', contribution.sourceAccountId);
        const accountSnap = await getDoc(accountRef);
        if(accountSnap.exists()) {
            const account = accountSnap.data() as BankAccount;
            batch.update(accountRef, { balance: account.balance - contribution.amount });
        }
        await batch.commit();
    };

    // BANK ACCOUNT/CARD FUNCTIONS
    const addBankAccount = async (account: Omit<BankAccount, 'id'>) => await addDoc('bankAccounts', account);
    const updateBankAccount = async (account: BankAccount) => await setDocWithId('bankAccounts', account.id, account);
    const deleteBankAccount = async (id: string) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const batch = writeBatch(db);
        const cardsQuery = query(collection(db, 'users', uid, 'bankCards'), where('accountId', '==', id));
        const cardsSnapshot = await getDocs(cardsQuery);
        cardsSnapshot.forEach(doc => batch.delete(doc.ref));
        const debtsQuery = query(collection(db, 'users', uid, 'debts'), where('accountId', '==', id));
        const debtsSnapshot = await getDocs(debtsQuery);
        debtsSnapshot.forEach(doc => batch.delete(doc.ref));
        const accountRef = doc(db, 'users', uid, 'bankAccounts', id);
        batch.delete(accountRef);
        await batch.commit();
    };

    const addBankCard = async (card: Omit<BankCard, 'id'|'usedAmount'>) => await addDoc('bankCards', {...card, usedAmount: 0});
    const updateBankCard = async (card: BankCard) => await setDocWithId('bankCards', card.id, card);
    const deleteBankCard = async (id: string) => await deleteDocById('bankCards', id);

    // SUBSCRIPTION FUNCTIONS
    const addSubscription = async (sub: Omit<Subscription, 'id'|'status'>) => await addDoc('subscriptions', {...sub, status: 'active'});
    const updateSubscription = async (sub: Subscription) => await setDocWithId('subscriptions', sub.id, sub);
    const cancelSubscription = async (id: string) => {
        const sub = allSubscriptions.find(s => s.id === id);
        if(sub) await updateSubscription({...sub, status: 'cancelled', cancellationDate: new Date()});
    };
    const paySubscription = async (sub: Subscription) => {
        const subscriptionCategory = allCategories.find(c => c.name === "Suscripciones") ? "Suscripciones" : "Otros Gastos";
        await addTransaction({
            type: 'expense',
            amount: sub.amount,
            description: `Suscripción: ${sub.name}`,
            category: subscriptionCategory,
            profile: sub.profile,
            date: new Date().toISOString(),
            accountId: allBankCards.find(c => c.id === sub.cardId)?.accountId || '',
            cardId: sub.cardId,
        });
        const nextDueDate = addMonths(sub.dueDate, 1);
        await updateSubscription({ ...sub, dueDate: nextDueDate });
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
    
    const addProfile = async (profile: Omit<Profile, 'id'>) => await addDoc('profiles', profile);
    const updateProfile = async (profile: Profile) => await setDocWithId('profiles', profile.id, profile);
    const deleteProfile = async (id: string) => await deleteDocById('profiles', id);

    const availableYears = useMemo(() => {
        const years = new Set(allTransactions.map(t => getYear(new Date(t.date))));
        years.add(getYear(new Date())); // Ensure current year is always available
        return Array.from(years).sort((a, b) => b - a);
    }, [allTransactions]);
    
    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(t => {
            const date = new Date(t.date);
            const profileMatch = filters.profile === 'all' || t.profile === filters.profile;
            const monthMatch = filters.month === -1 || getMonth(date) === filters.month;
            const yearMatch = getYear(date) === filters.year;
            return profileMatch && monthMatch && yearMatch;
        });
    }, [allTransactions, filters]);
    
    const filteredBankAccounts = useMemo(() => {
        return allBankAccounts.filter(acc => filters.profile === 'all' || acc.profile === filters.profile);
    }, [allBankAccounts, filters]);

    const filteredBankCards = useMemo(() => {
        return allBankCards.filter(card => filters.profile === 'all' || card.profile === filters.profile);
    }, [allBankCards, filters]);

    const filteredDebts = useMemo(() => {
        return allDebts.filter(d => filters.profile === 'all' || d.profile === filters.profile);
    }, [allDebts, filters]);
    
    const filteredSubscriptions = useMemo(() => {
        return allSubscriptions.filter(s => {
            const profileMatch = filters.profile === 'all' || s.profile === filters.profile;
            return profileMatch;
        });
    }, [allSubscriptions, filters]);

    const filteredGoals = useMemo(() => {
        return allGoals.filter(g => filters.profile === 'all' || g.profile === filters.profile);
    }, [allGoals, filters]);
    
    const filteredFixedExpenses = useMemo(() => {
        return allFixedExpenses.filter(fe => filters.profile === 'all' || fe.profile === filters.profile);
    }, [allFixedExpenses, filters]);

    const filteredGoalContributions = useMemo(() => {
        return allGoalContributions.filter(gc => {
            const goal = allGoals.find(g => g.id === gc.goalId);
            if (!goal) return false;
            const profileMatch = filters.profile === 'all' || goal.profile === filters.profile;
            const date = new Date(gc.date);
            const monthMatch = filters.month === -1 || getMonth(date) === filters.month;
            const yearMatch = getYear(date) === filters.year;
            return profileMatch && monthMatch && yearMatch;
        });
    }, [allGoalContributions, allGoals, filters]);

     const filteredDebtPayments = useMemo(() => {
        return allDebtPayments.filter(dp => {
            const debt = allDebts.find(d => d.id === dp.debtId);
            if (!debt) return false;
            const profileMatch = filters.profile === 'all' || debt.profile === filters.profile;
            const date = new Date(dp.date);
            const monthMatch = filters.month === -1 || getMonth(date) === filters.month;
            const yearMatch = getYear(date) === filters.year;
            return profileMatch && monthMatch && yearMatch;
        });
    }, [allDebtPayments, allDebts, filters]);

    const filteredInvestments = useMemo(() => {
        return allInvestments.filter(i => filters.profile === 'all' || i.profile === filters.profile);
    }, [allInvestments, filters]);

    const filteredInvestmentContributions = useMemo(() => {
        return allInvestmentContributions.filter(ic => {
            const investment = allInvestments.find(i => i.id === ic.investmentId);
            if (!investment) return false;
            const profileMatch = filters.profile === 'all' || investment.profile === filters.profile;
            const date = new Date(ic.date);
            const monthMatch = filters.month === -1 || getMonth(date) === filters.month;
            const yearMatch = getYear(date) === filters.year;
            return profileMatch && monthMatch && yearMatch;
        });
    }, [allInvestmentContributions, allInvestments, filters]);
    
     const filteredBudgets = useMemo(() => {
        return allBudgets.filter(b => filters.profile === 'all' || b.profile === filters.profile);
    }, [allBudgets, filters]);

    const getAllDataForMonth = useCallback((month: number, year: number) => {
        const monthTransactions = allTransactions.filter(t => {
            const date = new Date(t.date);
            return getMonth(date) === month && getYear(date) === year;
        });
        return {
            transactions: monthTransactions,
            goals: allGoals,
            debts: allDebts,
            investments: allInvestments,
            budgets: allBudgets,
        }
    }, [allTransactions, allGoals, allDebts, allInvestments, allBudgets]);

    const notifications = useMemo(() => {
        const newNotifications: AppNotification[] = [];
        const today = new Date();
        const currentMonthStart = startOfMonth(today);
        const currentMonthEnd = endOfMonth(today);

        // 1. Bank Account Notifications
        allBankAccounts.forEach(account => {
            // 1.1. Cuenta Vista Limit
            if (account.accountType === 'Cuenta Vista' && account.monthlyLimit && account.monthlyLimit > 0) {
                const monthlyIncome = allTransactions
                    .filter(t => (t.type === 'income' && t.accountId === account.id) || (t.type === 'transfer' && t.destinationAccountId === account.id))
                    .filter(t => {
                        const transactionDate = new Date(t.date);
                        return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd;
                    })
                    .reduce((sum, t) => sum + t.amount, 0);
                const usage = (monthlyIncome / account.monthlyLimit) * 100;
                if (usage >= 80) {
                    newNotifications.push({
                        id: `limit-${account.id}`, title: `Límite de Cuenta Cercano`,
                        description: `La cuenta "${account.name}" ha utilizado el ${usage.toFixed(0)}% de su cupo mensual.`,
                        date: new Date(), read: false, type: 'warning', link: `/dashboard/bank-accounts/${account.id}`
                    });
                }
            }
            // 1.2. Low Balance
            if (account.lowBalanceThreshold && account.balance < account.lowBalanceThreshold) {
                newNotifications.push({
                    id: `low-balance-${account.id}`, title: `Alerta de Saldo Bajo`,
                    description: `El saldo de tu cuenta "${account.name}" es inferior a ${formatCurrency(account.lowBalanceThreshold)}.`,
                    date: new Date(), read: false, type: 'warning', link: `/dashboard/bank-accounts/${account.id}`
                });
            }
        });

        // 2. Debt Notifications
        allDebts.forEach(debt => {
            if (debt.paidAmount < debt.totalAmount) {
                const dueDate = debt.dueDate;
                const notificationDate = subDays(dueDate, debt.dueNotificationDays || 3);
                // 2.1. Due Soon
                if (isSameDay(today, notificationDate) || (today > notificationDate && today < dueDate)) {
                    newNotifications.push({
                        id: `debt-due-${debt.id}`, title: `Deuda Próxima a Vencer`,
                        description: `Tu pago para "${debt.name}" vence el ${format(dueDate, "dd/MM/yyyy")}.`,
                        date: new Date(), read: false, type: 'warning', link: `/dashboard/debts/${debt.id}`
                    });
                }
                // 2.2. Overdue
                if (isPast(dueDate)) {
                     newNotifications.push({
                        id: `debt-overdue-${debt.id}`, title: `¡Pago de Deuda Atrasado!`,
                        description: `El pago para "${debt.name}" venció el ${format(dueDate, "dd/MM/yyyy")}.`,
                        date: new Date(), read: false, type: 'error', link: `/dashboard/debts/${debt.id}`
                    });
                }
            }
        });

        // 3. Subscription Notifications
        allSubscriptions.forEach(sub => {
            if (sub.status === 'active') {
                const dueDate = sub.dueDate;
                const notificationDate = subDays(dueDate, 2);
                 if (isSameDay(today, notificationDate) || (today > notificationDate && today < dueDate)) {
                     newNotifications.push({
                        id: `sub-due-${sub.id}`, title: `Suscripción Próxima a Renovar`,
                        description: `Tu suscripción a "${sub.name}" se renovará pronto.`,
                        date: new Date(), read: false, type: 'info', link: `/dashboard/subscriptions`
                    });
                 }
            }
        });
        
        // 4. Goal Notifications
        allGoals.forEach(goal => {
            if (goal.currentAmount >= goal.targetAmount && !goal.completionNotified) {
                 newNotifications.push({
                    id: `goal-complete-${goal.id}`, title: `¡Meta Completada!`,
                    description: `¡Felicidades! Has alcanzado tu meta de ahorro para "${goal.name}".`,
                    date: new Date(), read: false, type: 'success', link: `/dashboard/goals`
                });
                // This should be followed by an update to the goal to set completionNotified to true
                // updateGoal({ ...goal, completionNotified: true }); // This would cause a loop, needs to be handled carefully
            }
        });

        // 5. Budget Notifications
        allBudgets.forEach(budget => {
            const totalIncome = allTransactions
                .filter(t => t.profile === budget.profile && t.type === 'income' && getMonth(new Date(t.date)) === getMonth(today) && getYear(new Date(t.date)) === getYear(today))
                .reduce((sum, t) => sum + t.amount, 0);

            budget.items.forEach(item => {
                const budgetedAmount = totalIncome * (item.percentage / 100);
                const spentAmount = allTransactions
                    .filter(t => t.profile === budget.profile && t.category === item.category && t.type === 'expense' && getMonth(new Date(t.date)) === getMonth(today) && getYear(new Date(t.date)) === getYear(today))
                    .reduce((sum, t) => sum + t.amount, 0);
                
                if (budgetedAmount > 0 && (spentAmount / budgetedAmount) >= 0.9) {
                     newNotifications.push({
                        id: `budget-limit-${budget.id}-${item.category}`, title: `Límite de Presupuesto Cercano`,
                        description: `Has gastado más del 90% de tu presupuesto para "${item.category}".`,
                        date: new Date(), read: false, type: 'warning', link: `/dashboard/budget`
                    });
                }
            });
        });


        return newNotifications;
    }, [allBankAccounts, allTransactions, allDebts, allSubscriptions, allGoals, allBudgets, settings, formatCurrency]);


    return (
        <DataContext.Provider value={{ 
            transactions: filteredTransactions,
            goals: filteredGoals,
            subscriptions: filteredSubscriptions,
            debts: filteredDebts,
            fixedExpenses: filteredFixedExpenses,
            profiles: allProfiles,
            categories: allCategories,
            goalContributions: filteredGoalContributions,
            debtPayments: filteredDebtPayments,
            investments: filteredInvestments,
            investmentContributions: filteredInvestmentContributions,
            budgets: filteredBudgets,
            bankAccounts: filteredBankAccounts,
            bankCards: filteredBankCards,
            reports: allReports,
            settings,
            notifications,
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
            addProfile,
            updateProfile,
            deleteProfile,
            getAllDataForMonth,
            formatCurrency,
        }}>
            {children}
        </DataContext.Provider>
    );
};
