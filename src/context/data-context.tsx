
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { 
    onAuthStateChanged, 
    User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { 
    collection, 
    doc, 
    getDocs, 
    writeBatch, 
    query, 
    where, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc,
    setDoc,
    Timestamp
} from 'firebase/firestore';
import type { 
    Transaction, 
    BankAccount, 
    BankCard, 
    SavingsGoal, 
    Debt,
    Subscription,
    FixedExpense,
    Investment,
    Profile, 
    Category, 
    BudgetItem, 
    Budget, 
    DebtPayment,
    GoalContribution,
    InvestmentContribution,
    MonthlyReport,
    TaxPayment,
    AppSettings,
    AppNotification,
    Service
} from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getMonth, getYear, startOfMonth, endOfMonth, addMonths, isPast, subDays } from 'date-fns';

type DataFilters = {
    profile: string;
    month: number; // -1 for all year
    year: number;
};

interface DataContextType {
    user: User | null;
    uid: string | null;
    isLoading: boolean;
    
    // Data
    transactions: Transaction[];
    bankAccounts: BankAccount[];
    bankCards: BankCard[];
    debts: Debt[];
    debtPayments: DebtPayment[];
    goals: SavingsGoal[];
    goalContributions: GoalContribution[];
    investments: Investment[];
    investmentContributions: InvestmentContribution[];
    subscriptions: Subscription[];
    fixedExpenses: FixedExpense[];
    budgets: Budget[];
    profiles: Profile[];
    categories: Category[];
    reports: MonthlyReport[];
    taxPayments: TaxPayment[];
    services: Service[];
    settings: AppSettings;
    notifications: AppNotification[];
    
    // Filters
    filters: DataFilters;
    setFilters: React.Dispatch<React.SetStateAction<DataFilters>>;
    availableYears: number[];

    // Auth functions
    signup: (email: string, pass: string) => Promise<any>;
    login: (email: string, pass: string) => Promise<any>;
    logout: () => Promise<any>;
    sendPasswordReset: (email: string) => Promise<void>;

    // CRUD Functions
    addTransaction: (transaction: Omit<Transaction, 'id' | 'date'> & { date: Date | string }) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    
    addBankAccount: (account: Omit<BankAccount, 'id' | 'balance' | 'creditLineUsed'> & {balance?: number}) => Promise<void>;
    updateBankAccount: (account: BankAccount) => Promise<void>;
    deleteBankAccount: (id: string) => Promise<void>;

    addBankCard: (card: Omit<BankCard, 'id'| 'usedAmount'>) => Promise<void>;
    updateBankCard: (card: BankCard) => Promise<void>;
    deleteBankCard: (id: string) => Promise<void>;
    
    addDebt: (debt: Omit<Debt, 'id' | 'paidAmount'>) => Promise<void>;
    updateDebt: (debt: Debt) => Promise<void>;
    deleteDebt: (id: string) => Promise<void>;
    addDebtPayment: (payment: Omit<DebtPayment, 'id'>) => Promise<void>;
    
    addSubscription: (subscription: Omit<Subscription, 'id' | 'status'>) => Promise<void>;
    paySubscription: (subscription: Subscription) => Promise<void>;
    cancelSubscription: (id: string) => Promise<void>;
    deleteSubscription: (id: string) => Promise<void>;
    updateSubscriptionAmount: (id: string, newAmount: number) => Promise<void>;

    addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => Promise<void>;
    updateFixedExpense: (expense: FixedExpense) => Promise<void>;
    deleteFixedExpense: (id: string) => Promise<void>;

    addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => Promise<void>;
    updateGoal: (goal: SavingsGoal) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    addGoalContribution: (contribution: Omit<GoalContribution, 'id'>) => Promise<void>;
    
    addInvestment: (investment: Omit<Investment, 'id' | 'currentValue'>) => Promise<void>;
    updateInvestment: (investment: Investment) => Promise<void>;
    deleteInvestment: (id: string) => Promise<void>;
    addInvestmentContribution: (contribution: Omit<InvestmentContribution, 'id'>) => Promise<void>;
    
    addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
    updateBudget: (budget: Budget) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;

    addProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
    updateProfile: (profile: Profile) => Promise<void>;
    deleteProfile: (id: string) => Promise<void>;

    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    
    addReport: (report: MonthlyReport) => Promise<void>;
    deleteReport: (id: string) => Promise<void>;

    addTaxPayment: (payment: Omit<TaxPayment, 'id'>) => Promise<void>;

    addService: (service: Omit<Service, 'id'>) => Promise<void>;
    updateService: (service: Service) => Promise<void>;
    deleteService: (id: string) => Promise<void>;
    
    // Settings
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    previewBackground: string | null;
    setPreviewBackground: (theme: string | null) => void;

    // Utils
    formatCurrency: (amount: number, withDecimals?: boolean, compact?: boolean) => string;
    getAllDataForMonth: (month: number, year: number) => any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
    currency: 'CLP',
    largeTransactionThreshold: 500000,
    background: 'theme-gradient'
};

const defaultProfiles: Profile[] = [
    { id: '1', name: 'Personal', color: '#3b82f6' },
    { id: '2', name: 'Negocio', color: '#14b8a6' },
];

const defaultCategories: Category[] = [
    { id: '1', name: 'Sueldo', type: 'Ingreso', color: '#22c55e' },
    { id: '2', name: 'Ventas', type: 'Ingreso', color: '#84cc16' },
    { id: '3', name: 'Supermercado', type: 'Gasto', color: '#ef4444' },
    { id: '4', name: 'Transporte', type: 'Gasto', color: '#f97316' },
    { id: '5', name: 'Cuentas', type: 'Gasto', color: '#d946ef' },
    { id: '6', name: 'Restaurantes', type: 'Gasto', color: '#eab308' },
    { id: '7', name: 'Transferencia', type: 'Transferencia', color: '#6366f1' }
];

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [uid, setUid] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [bankCards, setBankCards] = useState<BankCard[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [goalContributions, setGoalContributions] = useState<GoalContribution[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [investmentContributions, setInvestmentContributions] = useState<InvestmentContribution[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>(defaultProfiles);
    const [categories, setCategories] = useState<Category[]>(defaultCategories);
    const [reports, setReports] = useState<MonthlyReport[]>([]);
    const [taxPayments, setTaxPayments] = useState<TaxPayment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [previewBackground, setPreviewBackground] = useState<string | null>(null);

    const [filters, setFilters] = useState<DataFilters>({
        profile: 'all',
        month: getMonth(new Date()),
        year: getYear(new Date()),
    });

    // #region Auth Functions
    const signup = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
    const login = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
    const logout = () => signOut(auth);
    const sendPasswordReset = (email: string) => sendPasswordResetEmail(auth, email);
    // #endregion
    
    const fetchData = useCallback(async (collectionName: string, uid: string) => {
        const q = query(collection(db, `users/${uid}/${collectionName}`));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamps to JS Dates for specific fields
            const dateFields = ['date', 'dueDate', 'estimatedDate', 'generatedAt', 'cancellationDate'];
            for (const field of dateFields) {
                if (data[field] && data[field] instanceof Timestamp) {
                    data[field] = data[field].toDate();
                }
            }
            return { id: doc.id, ...data };
        });
    }, []);

    const setupInitialData = async (uid: string) => {
        const profilesRef = collection(db, `users/${uid}/profiles`);
        const profilesSnap = await getDocs(profilesRef);
        if (profilesSnap.empty) {
            const batch = writeBatch(db);
            defaultProfiles.forEach(p => {
                const docRef = doc(db, `users/${uid}/profiles`, p.name);
                batch.set(docRef, { name: p.name, color: p.color });
            });
            await batch.commit();
            setProfiles(defaultProfiles.map(p => ({ ...p, id: p.name })));
        }

        const categoriesRef = collection(db, `users/${uid}/categories`);
        const categoriesSnap = await getDocs(categoriesRef);
        if (categoriesSnap.empty) {
            const batch = writeBatch(db);
            defaultCategories.forEach(c => {
                const docRef = doc(db, `users/${uid}/categories`, c.name);
                batch.set(docRef, { name: c.name, type: c.type, color: c.color });
            });
            await batch.commit();
            setCategories(defaultCategories.map(c => ({...c, id: c.name})));
        }
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setIsLoading(true);
            setUser(currentUser);
            setUid(currentUser ? currentUser.uid : null);

            if (currentUser) {
                try {
                    await setupInitialData(currentUser.uid);
                    
                    const dataPromises = [
                        fetchData('transactions', currentUser.uid),      // 0
                        fetchData('bankAccounts', currentUser.uid),      // 1
                        fetchData('bankCards', currentUser.uid),         // 2
                        fetchData('debts', currentUser.uid),             // 3
                        fetchData('goals', currentUser.uid),             // 4
                        fetchData('subscriptions', currentUser.uid),     // 5
                        fetchData('fixedExpenses', currentUser.uid),     // 6
                        fetchData('investments', currentUser.uid),       // 7
                        fetchData('budgets', currentUser.uid),           // 8
                        fetchData('profiles', currentUser.uid),          // 9
                        fetchData('categories', currentUser.uid),        // 10
                        fetchData('debtPayments', currentUser.uid),      // 11
                        fetchData('goalContributions', currentUser.uid), // 12
                        fetchData('investmentContributions', currentUser.uid), // 13
                        fetchData('reports', currentUser.uid),           // 14
                        fetchData('taxPayments', currentUser.uid),       // 15
                        fetchData('services', currentUser.uid),          // 16
                    ];
                    
                    const settingsDoc = await getDoc(doc(db, `users/${currentUser.uid}/app/settings`));
                    
                    const results = await Promise.all(dataPromises);

                    setAllTransactions(results[0] as Transaction[]);
                    setBankAccounts(results[1] as BankAccount[]);
                    setBankCards(results[2] as BankCard[]);
                    setDebts(results[3] as Debt[]);
                    setGoals(results[4] as SavingsGoal[]);
                    setSubscriptions(results[5] as Subscription[]);
                    setFixedExpenses(results[6] as FixedExpense[]);
                    setInvestments(results[7] as Investment[]);
                    setBudgets(results[8] as Budget[]);
                    setProfiles(results[9] as Profile[]);
                    setCategories(results[10] as Category[]);
                    setDebtPayments(results[11] as DebtPayment[]);
                    setGoalContributions(results[12] as GoalContribution[]);
                    setInvestmentContributions(results[13] as InvestmentContribution[]);
                    setReports(results[14] as MonthlyReport[]);
                    setTaxPayments(results[15] as TaxPayment[]);
                    setServices(results[16] as Service[]);
                    
                    if (settingsDoc.exists()) {
                        setSettings(settingsDoc.data() as AppSettings);
                    } else {
                        setSettings(defaultSettings);
                    }
                    
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    toast({ title: "Error", description: "No se pudieron cargar tus datos.", variant: "destructive"});
                }

            } else {
                // Clear data on logout
                setAllTransactions([]);
                setBankAccounts([]);
                setBankCards([]);
                setDebts([]);
                setGoals([]);
                setSubscriptions([]);
                setFixedExpenses([]);
                setInvestments([]);
                setBudgets([]);
                setProfiles(defaultProfiles);
                setCategories(defaultCategories);
                setDebtPayments([]);
                setGoalContributions([]);
                setInvestmentContributions([]);
                setReports([]);
                setTaxPayments([]);
                setServices([]);
                setSettings(defaultSettings);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [toast, fetchData]);
    
     const generateNotifications = useCallback(() => {
        const newNotifications: AppNotification[] = [];
        const today = new Date();

        // Overdue debts
        debts.forEach(debt => {
            if (debt.paidAmount < debt.totalAmount && isPast(new Date(debt.dueDate))) {
                newNotifications.push({
                    id: `debt-${debt.id}`,
                    title: 'Deuda Vencida',
                    description: `El pago de tu deuda "${debt.name}" está atrasado.`,
                    date: new Date(),
                    read: false,
                    type: 'error',
                    link: `/dashboard/debts/${debt.id}`
                });
            } else if (debt.paidAmount < debt.totalAmount && new Date(debt.dueDate) <= addMonths(today,1) && new Date(debt.dueDate) >= subDays(today, debt.dueNotificationDays || 3)) {
                newNotifications.push({
                    id: `debt-due-${debt.id}`,
                    title: 'Próximo Vencimiento de Deuda',
                    description: `Tu deuda "${debt.name}" vence pronto.`,
                    date: new Date(),
                    read: false,
                    type: 'warning',
                    link: `/dashboard/debts/${debt.id}`
                });
            }
        });

        // Upcoming subscriptions
        subscriptions.forEach(sub => {
            const isPaidThisMonth = sub.lastPaymentMonth === getMonth(today) && sub.lastPaymentYear === getYear(today);
            if (sub.status === 'active' && !isPaidThisMonth && isPast(new Date(sub.dueDate))) {
                newNotifications.push({
                    id: `sub-overdue-${sub.id}`,
                    title: 'Suscripción Vencida',
                    description: `El pago de "${sub.name}" está pendiente.`,
                    date: new Date(),
                    read: false,
                    type: 'error',
                    link: `/dashboard/subscriptions`
                });
            }
        });
        
        // Goal reached
        goals.forEach(goal => {
            if (goal.currentAmount >= goal.targetAmount && !goal.completionNotified) {
                 newNotifications.push({
                    id: `goal-${goal.id}`,
                    title: '¡Meta Alcanzada!',
                    description: `Felicidades, has completado tu meta "${goal.name}".`,
                    date: new Date(),
                    read: false,
                    type: 'success',
                    link: `/dashboard/goals`
                });
                updateDoc(doc(db, `users/${uid}/goals`, goal.id), { completionNotified: true });
            }
        })
        
        setNotifications(newNotifications);
    }, [debts, subscriptions, goals, uid]);
    
    useEffect(() => {
        if (uid) {
            generateNotifications();
        }
    }, [uid, generateNotifications]);


    // #region Memoized Filtered Data
    const transactions = useMemo(() => {
        return allTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            const matchesProfile = filters.profile === 'all' || t.profile === filters.profile;
            const matchesYear = getYear(transactionDate) === filters.year;
            const matchesMonth = filters.month === -1 || getMonth(transactionDate) === filters.month;
            return matchesProfile && matchesYear && matchesMonth;
        });
    }, [allTransactions, filters]);
    // #endregion

    const availableYears = useMemo(() => {
        const years = new Set(allTransactions.map(t => getYear(new Date(t.date))));
        const currentYear = getYear(new Date());
        if (!years.has(currentYear)) {
            years.add(currentYear);
        }
        return Array.from(years).sort((a, b) => b - a);
    }, [allTransactions]);
    
     const getAllDataForMonth = useCallback((month: number, year: number) => {
        const monthStart = startOfMonth(new Date(year, month));
        const monthEnd = endOfMonth(new Date(year, month));

        const filterByDate = (item: { date?: any, dueDate?: any }) => {
            const itemDate = new Date(item.date || item.dueDate);
            return itemDate >= monthStart && itemDate <= monthEnd;
        };

        return {
            transactions: allTransactions.filter(t => {
                const tDate = new Date(t.date);
                return getYear(tDate) === year && getMonth(tDate) === month;
            }),
            debts: debts.filter(filterByDate),
            goals: goals.filter(g => g.estimatedDate >= monthStart && g.estimatedDate <= monthEnd),
            investments, // Investments are not tied to a month
        };
    }, [allTransactions, debts, goals, investments]);
    
    const formatCurrency = useCallback((amount: number, withDecimals = false, compact = false) => {
        const options: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: settings.currency || 'CLP',
            minimumFractionDigits: withDecimals ? 2 : 0,
            maximumFractionDigits: withDecimals ? 2 : 0,
        };
        if (compact) {
            options.notation = "compact";
            options.compactDisplay = "short";
        }
        return new Intl.NumberFormat('es-CL', options).format(amount);
    }, [settings.currency]);
    

    // #region Generic CRUD Functions
    const addDocToCollection = async (collectionName: string, data: any) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const docRef = await addDoc(collection(db, `users/${uid}/${collectionName}`), data);
        return { id: docRef.id, ...data };
    };

    const updateDocInCollection = async (collectionName: string, id: string, data: any) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        await updateDoc(doc(db, `users/${uid}/${collectionName}`, id), data);
    };

    const deleteDocFromCollection = async (collectionName: string, id: string) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        await deleteDoc(doc(db, `users/${uid}/${collectionName}`, id));
    };
    // #endregion
    
    const crudOperations = (collectionName: string, setData: React.Dispatch<any>) => ({
        add: async (data: any) => {
            const newDoc = await addDocToCollection(collectionName, data);
            setData((prev: any[]) => [...prev, newDoc]);
        },
        update: async (data: any) => {
            await updateDocInCollection(collectionName, data.id, data);
            setData((prev: any[]) => prev.map(item => item.id === data.id ? data : item));
        },
        delete: async (id: string) => {
            await deleteDocFromCollection(collectionName, id);
            setData((prev: any[]) => prev.filter(item => item.id !== id));
        },
    });

    const profilesCrud = crudOperations('profiles', setProfiles);
    const categoriesCrud = crudOperations('categories', setCategories);
    const fixedExpensesCrud = crudOperations('fixedExpenses', setFixedExpenses);
    const goalsCrud = crudOperations('goals', setGoals);
    const investmentsCrud = crudOperations('investments', setInvestments);
    const budgetsCrud = crudOperations('budgets', setBudgets);
    const servicesCrud = crudOperations('services', setServices);
    
    // #region Specific CRUD implementations
    
    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const settingsRef = doc(db, `users/${uid}/app/settings`);
        await setDoc(settingsRef, newSettings, { merge: true });
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id'|'date'> & { date: Date | string }) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        
        const date = typeof transaction.date === 'string' ? transaction.date : transaction.date.toISOString();

        const finalTransaction = {
            ...transaction,
            date
        };
        
        const newDoc = await addDocToCollection('transactions', finalTransaction);
        setAllTransactions(prev => [...prev, newDoc]);

        const batch = writeBatch(db);

        // Update account balances
        const sourceAccountRef = doc(db, `users/${uid}/bankAccounts`, finalTransaction.accountId);
        const sourceAccountSnap = await getDoc(sourceAccountRef);
        if (!sourceAccountSnap.exists()) throw new Error("La cuenta de origen no existe.");
        const sourceAccountData = sourceAccountSnap.data() as BankAccount;
        
        let newSourceBalance = sourceAccountData.balance;

        if (finalTransaction.type === 'expense' || finalTransaction.type === 'transfer') {
            newSourceBalance -= finalTransaction.amount;
        } else if (finalTransaction.type === 'income') {
            newSourceBalance += finalTransaction.amount;
        }
        batch.update(sourceAccountRef, { balance: newSourceBalance });
        
        if (finalTransaction.type === 'transfer' && finalTransaction.destinationAccountId) {
            const destAccountRef = doc(db, `users/${uid}/bankAccounts`, finalTransaction.destinationAccountId);
            const destAccountSnap = await getDoc(destAccountRef);
             if (!destAccountSnap.exists()) throw new Error("La cuenta de destino no existe.");
            const destAccountData = destAccountSnap.data() as BankAccount;
            batch.update(destAccountRef, { balance: destAccountData.balance + finalTransaction.amount });
        }
        
        // Update card used amount
        if (finalTransaction.type === 'expense' && finalTransaction.cardId) {
             const cardRef = doc(db, `users/${uid}/bankCards`, finalTransaction.cardId);
             const cardSnap = await getDoc(cardRef);
             if(cardSnap.exists() && cardSnap.data().cardType === 'credit') {
                 const cardData = cardSnap.data() as BankCard;
                 batch.update(cardRef, { usedAmount: (cardData.usedAmount || 0) + finalTransaction.amount });
             }
        }
        
        await batch.commit();

        // Manually update local state to reflect balance changes
        setBankAccounts(prev => prev.map(acc => {
            if (acc.id === finalTransaction.accountId) return { ...acc, balance: newSourceBalance };
            if (finalTransaction.type === 'transfer' && acc.id === finalTransaction.destinationAccountId) {
                return { ...acc, balance: acc.balance + finalTransaction.amount };
            }
            return acc;
        }));
        
        if (finalTransaction.type === 'expense' && finalTransaction.cardId) {
            setBankCards(prev => prev.map(card => {
                if (card.id === finalTransaction.cardId && card.cardType === 'credit') {
                    return { ...card, usedAmount: (card.usedAmount || 0) + finalTransaction.amount };
                }
                return card;
            }));
        }
    };
    
    // updateTransaction and deleteTransaction would need to handle balance rollbacks, which is complex.
    // For now, we'll just update/delete the transaction document.
    const updateTransaction = async (transaction: Transaction) => {
        await updateDocInCollection('transactions', transaction.id, transaction);
        setAllTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    };

    const deleteTransaction = async (id: string) => {
        // A full implementation would require calculating the impact on balances and reversing it.
        // This is complex and can be added later. For now, just delete the doc.
        await deleteDocFromCollection('transactions', id);
        setAllTransactions(prev => prev.filter(t => t.id !== id));
    };
    
    const addBankAccount = async (account: Omit<BankAccount, 'id' | 'balance' | 'creditLineUsed'> & {balance?: number}) => {
        const newAccount = { ...account, balance: account.balance || 0, creditLineUsed: 0 };
        await crudOperations('bankAccounts', setBankAccounts).add(newAccount);
    };
    
    const deleteBankAccount = async (id: string) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");

        const batch = writeBatch(db);

        // Delete associated cards
        const cardsQuery = query(collection(db, `users/${uid}/bankCards`), where("accountId", "==", id));
        const cardsSnapshot = await getDocs(cardsQuery);
        cardsSnapshot.forEach(doc => batch.delete(doc.ref));

        // Delete associated debts
        const debtsQuery = query(collection(db, `users/${uid}/debts`), where("accountId", "==", id));
        const debtsSnapshot = await getDocs(debtsQuery);
        debtsSnapshot.forEach(doc => batch.delete(doc.ref));

        // Delete the bank account itself
        const accountRef = doc(db, `users/${uid}/bankAccounts`, id);
        batch.delete(accountRef);

        await batch.commit();

        // Update local state
        setBankAccounts(prev => prev.filter(acc => acc.id !== id));
        setBankCards(prev => prev.filter(card => card.accountId !== id));
        setDebts(prev => prev.filter(debt => debt.accountId !== id));
    }
    
    const addBankCard = async (card: Omit<BankCard, 'id'| 'usedAmount'>) => {
        const newCard = { ...card, usedAmount: 0 };
        await crudOperations('bankCards', setBankCards).add(newCard);
    };

    const deleteBankCard = async (id: string) => {
         if (!uid) throw new Error("No hay un usuario autenticado.");
        // We should check if this card is being used by subscriptions
        const subsQuery = query(collection(db, `users/${uid}/subscriptions`), where("cardId", "==", id));
        const subsSnap = await getDocs(subsQuery);
        if(!subsSnap.empty) {
            throw new Error("No se puede eliminar. La tarjeta está siendo usada por una o más suscripciones activas.");
        }
        await crudOperations('bankCards', setBankCards).delete(id);
    }
    
    const addDebt = async (debt: Omit<Debt, 'id'|'paidAmount'>) => {
        const newDebt = {...debt, paidAmount: 0};
        await crudOperations('debts', setDebts).add(newDebt);
    };
    
    const addDebtPayment = async (payment: Omit<DebtPayment, 'id'>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const batch = writeBatch(db);
        
        // 1. Add debt payment record
        const paymentRef = doc(collection(db, `users/${uid}/debtPayments`));
        batch.set(paymentRef, payment);
        
        // 2. Add corresponding expense transaction
        const transactionRef = doc(collection(db, `users/${uid}/transactions`));
        const expenseCategory = categories.find(c => c.name.toLowerCase().includes('deudas') || c.name.toLowerCase().includes('préstamos'))?.name || 'Pago de Deuda';
        const accountProfile = bankAccounts.find(acc => acc.id === payment.accountId)?.profile;
        if (!accountProfile) throw new Error("Perfil de cuenta no encontrado.");

        batch.set(transactionRef, {
            type: 'expense',
            amount: payment.amount,
            description: `Abono a ${payment.debtName}`,
            category: expenseCategory,
            profile: accountProfile,
            date: payment.date.toISOString(),
            accountId: payment.accountId,
        });
        
        // 3. Update debt's paidAmount
        const debtRef = doc(db, `users/${uid}/debts`, payment.debtId);
        const debtSnap = await getDoc(debtRef);
        if (!debtSnap.exists()) throw new Error("La deuda no existe.");
        const debtData = debtSnap.data() as Debt;
        const newPaidAmount = (debtData.paidAmount || 0) + payment.amount;
        const nextDueDate = addMonths(new Date(debtData.dueDate), 1);
        batch.update(debtRef, { paidAmount: newPaidAmount, dueDate: nextDueDate });
        
        // 4. Update bank account balance
        const accountRef = doc(db, `users/${uid}/bankAccounts`, payment.accountId);
        const accountSnap = await getDoc(accountRef);
        if (!accountSnap.exists()) throw new Error("La cuenta bancaria no existe.");
        const newBalance = accountSnap.data().balance - payment.amount;
        batch.update(accountRef, { balance: newBalance });

        await batch.commit();

        // Update local state
        setDebtPayments(prev => [...prev, {id: paymentRef.id, ...payment}]);
        setAllTransactions(prev => [...prev, {id: transactionRef.id, type: 'expense', amount: payment.amount, description: `Abono a ${payment.debtName}`, category: expenseCategory, profile: accountProfile, date: payment.date.toISOString(), accountId: payment.accountId} as Transaction]);
        setDebts(prev => prev.map(d => d.id === payment.debtId ? {...d, paidAmount: newPaidAmount, dueDate: nextDueDate} : d));
        setBankAccounts(prev => prev.map(acc => acc.id === payment.accountId ? {...acc, balance: newBalance} : acc));
    };
    
    const addGoalContribution = async (contribution: Omit<GoalContribution, 'id'>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const batch = writeBatch(db);
        
        const contributionRef = doc(collection(db, `users/${uid}/goalContributions`));
        batch.set(contributionRef, contribution);
        
        const goalRef = doc(db, `users/${uid}/goals`, contribution.goalId);
        const goalSnap = await getDoc(goalRef);
        if (!goalSnap.exists()) throw new Error("La meta no existe.");
        const goalData = goalSnap.data() as SavingsGoal;
        const newCurrentAmount = (goalData.currentAmount || 0) + contribution.amount;
        batch.update(goalRef, { currentAmount: newCurrentAmount });

        await batch.commit();
        
        setGoalContributions(prev => [...prev, {id: contributionRef.id, ...contribution}]);
        setGoals(prev => prev.map(g => g.id === contribution.goalId ? {...g, currentAmount: newCurrentAmount} : g));
    };
    
    const addInvestmentContribution = async (contribution: Omit<InvestmentContribution, 'id'>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const batch = writeBatch(db);
        
        const contributionRef = doc(collection(db, `users/${uid}/investmentContributions`));
        batch.set(contributionRef, contribution);
        
        const investmentRef = doc(db, `users/${uid}/investments`, contribution.investmentId);
        const investmentSnap = await getDoc(investmentRef);
        if (!investmentSnap.exists()) throw new Error("La inversión no existe.");
        const investmentData = investmentSnap.data() as Investment;
        const newCurrentValue = (investmentData.currentValue || investmentData.initialAmount) + contribution.amount;
        const newInitialAmount = investmentData.initialAmount + contribution.amount;
        batch.update(investmentRef, { currentValue: newCurrentValue, initialAmount: newInitialAmount });

        await batch.commit();
        
        setInvestmentContributions(prev => [...prev, {id: contributionRef.id, ...contribution}]);
        setInvestments(prev => prev.map(i => i.id === contribution.investmentId ? {...i, currentValue: newCurrentValue, initialAmount: newInitialAmount } : i));
    };

    const addSubscription = async (subscription: Omit<Subscription, 'id' | 'status'>) => {
        const newSub = { ...subscription, status: 'active' as const };
        await crudOperations('subscriptions', setSubscriptions).add(newSub);
    };

    const paySubscription = async (subscription: Subscription) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");

        const card = bankCards.find(c => c.id === subscription.cardId);
        if (!card) throw new Error("Tarjeta asociada no encontrada");

        const batch = writeBatch(db);

        // 1. Create the expense transaction
        const transactionRef = doc(collection(db, `users/${uid}/transactions`));
        const expenseCategory = categories.find(c => c.name.toLowerCase() === 'suscripciones' || c.name.toLowerCase() === 'cuentas')?.name || 'Suscripciones';
        batch.set(transactionRef, {
            type: 'expense',
            amount: subscription.amount,
            description: `Pago ${subscription.name}`,
            category: expenseCategory,
            profile: subscription.profile,
            date: new Date().toISOString(),
            accountId: card.accountId,
            cardId: subscription.cardId
        });

        // 2. Update subscription
        const subRef = doc(db, `users/${uid}/subscriptions`, subscription.id);
        const nextDueDate = addMonths(new Date(subscription.dueDate), 1);
        batch.update(subRef, { 
            dueDate: nextDueDate,
            lastPaymentMonth: getMonth(new Date()),
            lastPaymentYear: getYear(new Date())
        });
        
        // 3. Update card balance/used amount
        if (card.cardType === 'credit') {
            const cardRef = doc(db, `users/${uid}/bankCards`, card.id);
            const newUsedAmount = (card.usedAmount || 0) + subscription.amount;
            batch.update(cardRef, { usedAmount: newUsedAmount });
        } else {
            const accountRef = doc(db, `users/${uid}/bankAccounts`, card.accountId);
            const accountSnap = await getDoc(accountRef);
            if (!accountSnap.exists()) throw new Error("Cuenta bancaria no encontrada");
            const newBalance = accountSnap.data().balance - subscription.amount;
            batch.update(accountRef, { balance: newBalance });
        }
        
        await batch.commit();

        // Update local state
        setAllTransactions(prev => [...prev, {
            id: transactionRef.id,
            type: 'expense',
            amount: subscription.amount,
            description: `Pago ${subscription.name}`,
            category: expenseCategory,
            profile: subscription.profile,
            date: new Date().toISOString(),
            accountId: card.accountId,
            cardId: subscription.cardId
        } as Transaction]);

        setSubscriptions(prev => prev.map(s => s.id === subscription.id ? { ...s, dueDate: nextDueDate, lastPaymentMonth: getMonth(new Date()), lastPaymentYear: getYear(new Date()) } : s));

        if (card.cardType === 'credit') {
            setBankCards(prev => prev.map(c => c.id === card.id ? { ...c, usedAmount: (c.usedAmount || 0) + subscription.amount } : c));
        } else {
            setBankAccounts(prev => prev.map(acc => acc.id === card.accountId ? { ...acc, balance: acc.balance - subscription.amount } : acc));
        }
    };
    
    const cancelSubscription = async (id: string) => {
        const subData = { status: 'cancelled' as const, cancellationDate: new Date() };
        await updateDocInCollection('subscriptions', id, subData);
        setSubscriptions(prev => prev.map(s => s.id === id ? {...s, ...subData} : s));
    };

    const deleteSubscription = async (id: string) => {
         await deleteDocFromCollection('subscriptions', id);
         setSubscriptions(prev => prev.filter(s => s.id !== id));
    };

    const updateSubscriptionAmount = async (id: string, newAmount: number) => {
         await updateDocInCollection('subscriptions', id, { amount: newAmount });
         setSubscriptions(prev => prev.map(s => s.id === id ? {...s, amount: newAmount} : s));
    };
    
    const addReport = async (report: MonthlyReport) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const reportRef = doc(db, `users/${uid}/reports`, report.id);
        await setDoc(reportRef, report);
        setReports(prev => [...prev.filter(r => r.id !== report.id), report]);
    };
    
    const deleteReport = async (id: string) => {
        await deleteDocFromCollection('reports', id);
        setReports(prev => prev.filter(r => r.id !== id));
    };
    
    const addTaxPayment = async (payment: Omit<TaxPayment, 'id'>) => {
         if (!uid) throw new Error("No hay un usuario autenticado.");
         const batch = writeBatch(db);

        // 1. Add tax payment record
        const paymentRef = doc(collection(db, `users/${uid}/taxPayments`));
        batch.set(paymentRef, payment);

        // 2. Create expense transaction
        const transactionRef = doc(collection(db, `users/${uid}/transactions`));
        const account = bankAccounts.find(acc => acc.id === payment.sourceAccountId);
        if (!account) throw new Error("No se encontró la cuenta de cartera tributaria.");
        
        batch.set(transactionRef, {
            type: 'expense',
            amount: payment.amount,
            description: `Pago de Impuestos (F29) ${payment.month + 1}/${payment.year}`,
            category: 'Impuestos',
            profile: account.profile,
            date: payment.date.toISOString(),
            accountId: payment.sourceAccountId,
        });

        // 3. Update tax account balance
        const newBalance = account.balance - payment.amount;
        batch.update(doc(db, `users/${uid}/bankAccounts`, payment.sourceAccountId), { balance: newBalance });

        await batch.commit();

        // Update local state
        setTaxPayments(prev => [...prev, {id: paymentRef.id, ...payment}]);
        setBankAccounts(prev => prev.map(acc => acc.id === payment.sourceAccountId ? { ...acc, balance: newBalance } : acc));
        setAllTransactions(prev => [...prev, {id: transactionRef.id, type: 'expense', amount: payment.amount, description: `Pago de Impuestos (F29) ${payment.month + 1}/${payment.year}`, category: 'Impuestos', profile: account.profile, date: payment.date.toISOString(), accountId: payment.sourceAccountId} as Transaction]);
    };


    // #endregion

    const value: DataContextType = {
        user,
        uid,
        isLoading,
        transactions,
        bankAccounts,
        bankCards,
        debts,
        debtPayments,
        goals,
        goalContributions,
        investments,
        investmentContributions,
        subscriptions,
        fixedExpenses,
        budgets,
        profiles,
        categories,
        reports,
        taxPayments,
        services,
        settings,
        notifications,
        filters,
        setFilters,
        availableYears,
        signup,
        login,
        logout,
        sendPasswordReset,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBankAccount,
        updateBankAccount: crudOperations('bankAccounts', setBankAccounts).update,
        deleteBankAccount,
        addBankCard,
        updateBankCard: crudOperations('bankCards', setBankCards).update,
        deleteBankCard,
        addDebt,
        updateDebt: crudOperations('debts', setDebts).update,
        deleteDebt: crudOperations('debts', setDebts).delete,
        addDebtPayment,
        addSubscription,
        paySubscription,
        cancelSubscription,
        deleteSubscription,
        updateSubscriptionAmount,
        addFixedExpense: fixedExpensesCrud.add,
        updateFixedExpense: fixedExpensesCrud.update,
        deleteFixedExpense: fixedExpensesCrud.delete,
        addGoal: goalsCrud.add,
        updateGoal: goalsCrud.update,
        deleteGoal: goalsCrud.delete,
        addGoalContribution,
        addInvestment: investmentsCrud.add,
        updateInvestment: investmentsCrud.update,
        deleteInvestment: investmentsCrud.delete,
        addInvestmentContribution,
        addBudget: budgetsCrud.add,
        updateBudget: budgetsCrud.update,
        deleteBudget: budgetsCrud.delete,
        addProfile: profilesCrud.add,
        updateProfile: profilesCrud.update,
        deleteProfile: profilesCrud.delete,
        addCategory: categoriesCrud.add,
        updateCategory: categoriesCrud.update,
        deleteCategory: categoriesCrud.delete,
        addReport,
        deleteReport,
        addTaxPayment,
        addService: servicesCrud.add,
        updateService: servicesCrud.update,
        deleteService: servicesCrud.delete,
        updateSettings,
        previewBackground,
        setPreviewBackground,
        formatCurrency,
        getAllDataForMonth,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData debe ser usado dentro de un DataProvider');
    }
    return context;
};

    