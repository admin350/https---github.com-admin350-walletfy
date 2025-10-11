

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
    Timestamp,
    orderBy,
    runTransaction
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
    Budget, 
    DebtPayment,
    GoalContribution,
    InvestmentContribution,
    TaxPayment,
    AppSettings,
    AppNotification,
    Service,
    TangibleAsset
} from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getMonth, getYear, startOfMonth, endOfMonth, addMonths, isPast, subDays } from 'date-fns';

type DataFilters = {
    profile: string;
    month: number; // -1 for all year, -2 for Q1, -3 for Q2, etc.
    year: number;
};

// Helper function to remove undefined properties from an object
const cleanupUndefineds = (obj: Record<string, unknown>) => {
    const newObj: Record<string, unknown> = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
};

// Default data for new users moved from Cloud Functions
const defaultProfiles = [
    { name: 'Personal', color: '#3b82f6' },
    { name: 'Negocio', color: '#14b8a6' },
];

const defaultCategories = [
    { name: 'Sueldo', type: 'Ingreso', color: '#22c55e' },
    { name: 'Ventas', type: 'Ingreso', color: '#84cc16' },
    { name: 'Supermercado', type: 'Gasto', color: '#ef4444' },
    { name: 'Transporte', type: 'Gasto', color: '#f97316' },
    { name: 'Cuentas', type: 'Gasto', color: '#d946ef' },
    { name: 'Restaurantes', type: 'Gasto', color: '#eab308' },
    { name: 'Transferencia Interna', type: 'Transferencia', color: '#6366f1' },
    { name: 'Venta de Activos', type: 'Ingreso', color: '#10b981' },
    { name: 'Ahorro para Metas', type: 'Gasto', color: '#f59e0b' },
    { name: 'Inversiones y Ahorros', type: 'Gasto', color: '#0ea5e9' },
    { name: 'Ingresos por Inversión', type: 'Ingreso', color: '#14b8a6' },
    { name: 'Pago de Deuda', type: 'Gasto', color: '#f43f5e'},
    { name: 'Suscripciones', type: 'Gasto', color: '#8b5cf6'},
    { name: 'Impuestos', type: 'Gasto', color: '#0d9488' }
];


interface DataContextType {
    user: User | null;
    uid: string | null;
    isLoading: boolean;
    
    // Data
    allTransactions: Transaction[];
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
    taxPayments: TaxPayment[];
    services: Service[];
    tangibleAssets: TangibleAsset[];
    settings: AppSettings;
    notifications: AppNotification[];
    
    // Filters
    filters: DataFilters;
    setFilters: React.Dispatch<React.SetStateAction<DataFilters>>;
    availableYears: number[];

    // Auth functions
    signup: (email: string, pass: string) => Promise<void>;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;

    // CRUD Functions
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (transaction: Partial<Transaction> & {id: string}) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    
    addBankAccount: (account: Omit<BankAccount, 'id' | 'balance' | 'creditLineUsed'>) => Promise<void>;
    updateBankAccount: (account: Partial<BankAccount> & {id: string}) => Promise<void>;
    deleteBankAccount: (id: string) => Promise<void>;

    addBankCard: (card: Omit<BankCard, 'id'| 'usedAmount'>) => Promise<void>;
    updateBankCard: (card: Partial<BankCard> & { id: string }) => Promise<void>;
    deleteBankCard: (id: string) => Promise<void>;
    
    addDebt: (debt: Omit<Debt, 'id' | 'paidAmount'>) => Promise<void>;
    updateDebt: (debt: Partial<Debt> & {id: string}) => Promise<void>;
    deleteDebt: (id: string) => Promise<void>;
    addDebtPayment: (payment: Omit<DebtPayment, 'id'>) => Promise<void>;
    
    addSubscription: (subscription: Omit<Subscription, 'id' | 'status'>) => Promise<void>;
    updateSubscription: (subscription: Partial<Subscription> & { id: string }) => Promise<void>;
    paySubscription: (subscription: Subscription, paymentDetails?: { accountId?: string; cardId?: string; taxDetails?: unknown }) => Promise<void>;
    cancelSubscription: (id: string) => Promise<void>;
    deleteSubscription: (id: string) => Promise<void>;

    addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => Promise<void>;
    updateFixedExpense: (expense: Partial<FixedExpense> & {id: string}) => Promise<void>;
    deleteFixedExpense: (id: string) => Promise<void>;

    addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => Promise<void>;
    updateGoal: (goal: Partial<SavingsGoal> & {id: string}) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    addGoalContribution: (contribution: Omit<GoalContribution, 'id'>) => Promise<void>;
    
    addInvestment: (investment: Omit<Investment, 'id' | 'currentValue'>) => Promise<void>;
    updateInvestment: (investment: Partial<Investment> & {id: string}) => Promise<void>;
    deleteInvestment: (id: string) => Promise<void>;
    addInvestmentContribution: (contribution: Omit<InvestmentContribution, 'id'>) => Promise<void>;
    closeInvestment: (investmentId: string, finalValue: number) => Promise<void>;

    addTangibleAsset: (asset: Omit<TangibleAsset, 'id'>) => Promise<void>;
    updateTangibleAsset: (asset: Partial<TangibleAsset> & {id: string}) => Promise<void>;
    deleteTangibleAsset: (id: string) => Promise<void>;
    sellTangibleAsset: (assetId: string, salePrice: number, destinationAccountId: string) => Promise<void>;
    
    addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
    updateBudget: (budget: Partial<Budget> & {id: string}) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    setFavoriteBudget: (budgetId: string) => Promise<void>;

    addProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
    updateProfile: (profile: Partial<Profile> & {id: string}) => Promise<void>;
    deleteProfile: (id: string) => Promise<void>;

    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (category: Partial<Category> & {id: string}) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    
    addTaxPayment: (payment: Omit<TaxPayment, 'id'>) => Promise<void>;

    addService: (service: Omit<Service, 'id'>) => Promise<void>;
    updateService: (service: Partial<Service> & {id: string}) => Promise<void>;
    deleteService: (id: string) => Promise<void>;
    
    // Settings
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    previewBackground: string | null;
    setPreviewBackground: (theme: string | null) => void;

    // Utils
    formatCurrency: (amount: number, withDecimals?: boolean, compact?: boolean) => string;
    getAllDataForMonth: (month: number, year: number) => { transactions: Transaction[], debts: Debt[], goals: SavingsGoal[], investments: Investment[] };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
    currency: 'CLP',
    largeTransactionThreshold: 500000,
    background: 'theme-gradient',
    showSensitiveData: true,
};

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
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [taxPayments, setTaxPayments] = useState<TaxPayment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [tangibleAssets, setTangibleAssets] = useState<TangibleAsset[]>([]);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [previewBackground, setPreviewBackground] = useState<string | null>(null);

    const [filters, setFilters] = useState<DataFilters>({
        profile: 'all',
        month: getMonth(new Date()),
        year: getYear(new Date()),
    });

    const fetchData = useCallback(async (collectionName: string, uid: string) => {
        let q;
        if (collectionName === 'transactions') {
            q = query(collection(db, `users/${uid}/${collectionName}`), orderBy('date', 'desc'));
        } else {
            q = query(collection(db, `users/${uid}/${collectionName}`));
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamps to JS Dates for specific fields
            const dateFields = ['date', 'dueDate', 'estimatedDate', 'generatedAt', 'cancellationDate', 'purchaseDate', 'startDate'];
            for (const field of dateFields) {
                if (data[field] && data[field] instanceof Timestamp) {
                    data[field] = data[field].toDate();
                } else if (data[field] && typeof data[field] === 'string') { // Also handle string dates
                    const parsedDate = new Date(data[field]);
                    if (!isNaN(parsedDate.getTime())) {
                        data[field] = parsedDate;
                    }
                }
            }
            return { id: doc.id, ...data };
        });
    }, []);

    const checkAndCreateInitialData = useCallback(async (userId: string) => {
        const profilesCollection = collection(db, `users/${userId}/profiles`);
        const profilesSnapshot = await getDocs(query(profilesCollection));

        if (profilesSnapshot.empty) {
            console.log(`No initial data found for user ${userId}. Creating defaults.`);
            const batch = writeBatch(db);

            defaultProfiles.forEach(profile => {
                const docRef = doc(profilesCollection);
                batch.set(docRef, profile);
            });

            const categoriesCollection = collection(db, `users/${userId}/categories`);
            defaultCategories.forEach(category => {
                const docRef = doc(categoriesCollection);
                batch.set(docRef, category);
            });

            await batch.commit();
            console.log(`Default data created for user ${userId}.`);
             const [newProfiles, newCategories] = await Promise.all([
                fetchData('profiles', userId),
                fetchData('categories', userId),
            ]);
            setProfiles(newProfiles as Profile[]);
            setCategories(newCategories as Category[]);
        }
    }, [fetchData]);

    // #region Auth Functions
    const signup = async (email: string, pass: string): Promise<void> => {
        // The onAuthStateChanged listener will handle creating initial data
        await createUserWithEmailAndPassword(auth, email, pass);
    };
    const login = (email: string, pass: string): Promise<void> => signInWithEmailAndPassword(auth, email, pass).then(() => {});
    const logout = (): Promise<void> => signOut(auth);
    const sendPasswordReset = (email: string): Promise<void> => sendPasswordResetEmail(auth, email);
    // #endregion

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setIsLoading(true);
            setUser(currentUser);
            setUid(currentUser ? currentUser.uid : null);

            if (currentUser) {
                try {
                    await checkAndCreateInitialData(currentUser.uid);

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
                        fetchData('taxPayments', currentUser.uid),       // 14
                        fetchData('services', currentUser.uid),          // 15
                        fetchData('tangibleAssets', currentUser.uid),    // 16
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
                    setTaxPayments(results[14] as TaxPayment[]);
                    setServices(results[15] as Service[]);
                    setTangibleAssets(results[16] as TangibleAsset[]);
                    
                    if (settingsDoc.exists()) {
                        setSettings({ ...defaultSettings, ...settingsDoc.data() } as AppSettings);
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
                setProfiles([]);
                setCategories([]);
                setDebtPayments([]);
                setGoalContributions([]);
                setInvestmentContributions([]);
                setTaxPayments([]);
                setServices([]);
                setTangibleAssets([]);
                setSettings(defaultSettings);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [toast, fetchData, checkAndCreateInitialData]);
    
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
                if(uid) {
                    updateDoc(doc(db, `users/${uid}/goals`, goal.id), { completionNotified: true });
                }
            }
        })
        
        setNotifications(newNotifications);
    }, [debts, subscriptions, goals, uid]);
    
    useEffect(() => {
        if (uid) {
            generateNotifications();
        }
    }, [uid, generateNotifications]);

    useEffect(() => {
    // Reset the paidThisPeriod flag when the month changes
    const currentMonth = getMonth(new Date());
    const needsReset = subscriptions.some(s => s.paidThisPeriod && (s.lastPaymentMonth !== currentMonth));

    if (needsReset && uid) {
        const batch = writeBatch(db);
        const updatedSubs: Subscription[] = [];
        subscriptions.forEach(s => {
            if (s.paidThisPeriod && s.lastPaymentMonth !== currentMonth) {
                const subRef = doc(db, `users/${uid}/subscriptions`, s.id);
                batch.update(subRef, { paidThisPeriod: false });
                updatedSubs.push({ ...s, paidThisPeriod: false });
            } else {
                updatedSubs.push(s);
            }
        });
        batch.commit().then(() => {
            setSubscriptions(updatedSubs);
        });
    }
    }, [filters.month, filters.year, subscriptions, uid]);


    // #region Memoized Filtered Data
    const transactions = useMemo(() => {
        const filteredByProfile = allTransactions.filter(t => filters.profile === 'all' || t.profile === filters.profile);

        return filteredByProfile.filter(t => {
            const transactionDate = new Date(t.date);
            const transactionMonth = getMonth(transactionDate);
            const matchesYear = getYear(transactionDate) === filters.year;
    
            if (!matchesYear) return false;
    
            switch (filters.month) {
                case -1: return true; // Whole year
                case -2: return [0, 1, 2].includes(transactionMonth); // Q1
                case -3: return [3, 4, 5].includes(transactionMonth); // Q2
                case -4: return [6, 7, 8].includes(transactionMonth); // Q3
                case -5: return [9, 10, 11].includes(transactionMonth); // Q4
                default: return transactionMonth === filters.month; // Specific month
            }
        });
    }, [allTransactions, filters]);
    
    const availableYears = useMemo(() => {
        const years = new Set(allTransactions.map(t => getYear(new Date(t.date))));
        const currentYear = getYear(new Date());
        if (!years.has(currentYear)) {
            years.add(currentYear);
        }
        return Array.from(years).filter(year => !isNaN(year)).sort((a, b) => b - a);
    }, [allTransactions]);
    
     const getAllDataForMonth = useCallback((month: number, year: number) => {
        const monthStart = startOfMonth(new Date(year, month));
        const monthEnd = endOfMonth(new Date(year, month));

        const filterByDate = (item: { date?: Date, dueDate?: Date }) => {
            const itemDate = new Date(item.date || item.dueDate || '');
            return itemDate >= monthStart && itemDate <= monthEnd;
        };

        return {
            transactions: allTransactions.filter(t => {
                const tDate = new Date(t.date);
                return getYear(tDate) === year && getMonth(tDate) === month;
            }),
            debts: debts.filter(filterByDate),
            goals: goals.filter(g => new Date(g.estimatedDate) >= monthStart && new Date(g.estimatedDate) <= monthEnd),
            investments, // Investments are not tied to a month
        };
    }, [allTransactions, debts, goals, investments]);
    
    const formatCurrency = useCallback((amount: number, withDecimals = false, compact = false) => {
        if (!settings.showSensitiveData) {
            return '$ •••••'
        }
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
    }, [settings.currency, settings.showSensitiveData]);
    

    // #region Generic CRUD Functions
    const addDocToCollection = async (collectionName: string, data: Record<string, unknown>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const cleanedData = cleanupUndefineds(data);
        const docRef = await addDoc(collection(db, `users/${uid}/${collectionName}`), cleanedData);
        
        // Fetch the doc to get Firestore-generated fields and convert timestamps
        const newDocSnap = await getDoc(docRef);
        const newDocData = newDocSnap.data();
        if (!newDocData) throw new Error("Failed to fetch newly created document.");

        const dateFields = ['date', 'dueDate', 'estimatedDate', 'generatedAt', 'cancellationDate', 'purchaseDate', 'startDate'];
        for (const field of dateFields) {
            if (newDocData[field] && newDocData[field] instanceof Timestamp) {
                newDocData[field] = (newDocData[field] as Timestamp).toDate();
            }
        }
        
        return { id: docRef.id, ...newDocData };
    };

    const updateDocInCollection = async (collectionName: string, id: string, data: Record<string, unknown>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const cleanedData = cleanupUndefineds(data);
        await updateDoc(doc(db, `users/${uid}/${collectionName}`, id), cleanedData);
    };

    const deleteDocFromCollection = async (collectionName: string, id: string) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        await deleteDoc(doc(db, `users/${uid}/${collectionName}`, id));
    };
    // #endregion
    
    const crudOperations = <T extends {id: string}>(collectionName: string, setData: React.Dispatch<React.SetStateAction<T[]>>) => ({
        add: async (data: Omit<T, 'id'>) => {
            const dataToSave = { ...data } as Record<string, unknown>;
            if('date' in dataToSave && dataToSave.date instanceof Date) dataToSave.date = Timestamp.fromDate(dataToSave.date);
            if('dueDate' in dataToSave && dataToSave.dueDate instanceof Date) dataToSave.dueDate = Timestamp.fromDate(dataToSave.dueDate);
            if('estimatedDate' in dataToSave && dataToSave.estimatedDate instanceof Date) dataToSave.estimatedDate = Timestamp.fromDate(dataToSave.estimatedDate);
            if('cancellationDate' in dataToSave && dataToSave.cancellationDate instanceof Date) dataToSave.cancellationDate = Timestamp.fromDate(dataToSave.cancellationDate);
            if('generatedAt' in dataToSave && dataToSave.generatedAt instanceof Date) dataToSave.generatedAt = Timestamp.fromDate(dataToSave.generatedAt);
            if('purchaseDate' in dataToSave && dataToSave.purchaseDate instanceof Date) dataToSave.purchaseDate = Timestamp.fromDate(dataToSave.purchaseDate);
            if('startDate' in dataToSave && dataToSave.startDate instanceof Date) dataToSave.startDate = Timestamp.fromDate(dataToSave.startDate);
            
            const newDoc = await addDocToCollection(collectionName, dataToSave);
            setData((prev: T[]) => [...prev, newDoc as T]);
        },
        update: async (data: Partial<T> & {id: string}) => {
            const dataToSave = { ...data } as Record<string, unknown>;
            if('date' in dataToSave && dataToSave.date instanceof Date) dataToSave.date = Timestamp.fromDate(dataToSave.date);
            if('dueDate' in dataToSave && dataToSave.dueDate instanceof Date) dataToSave.dueDate = Timestamp.fromDate(dataToSave.dueDate);
            if('estimatedDate' in dataToSave && dataToSave.estimatedDate instanceof Date) dataToSave.estimatedDate = Timestamp.fromDate(dataToSave.estimatedDate);
            if('cancellationDate' in dataToSave && dataToSave.cancellationDate instanceof Date) dataToSave.cancellationDate = Timestamp.fromDate(dataToSave.cancellationDate);
            if('generatedAt' in dataToSave && dataToSave.generatedAt instanceof Date) dataToSave.generatedAt = Timestamp.fromDate(dataToSave.generatedAt);
            if('purchaseDate' in dataToSave && dataToSave.purchaseDate instanceof Date) dataToSave.purchaseDate = Timestamp.fromDate(dataToSave.purchaseDate);
            if('startDate' in dataToSave && dataToSave.startDate instanceof Date) dataToSave.startDate = Timestamp.fromDate(dataToSave.startDate);

            await updateDocInCollection(collectionName, data.id, dataToSave);
            setData((prev: T[]) => prev.map(item => item.id === data.id ? {...item, ...data} : item));
        },
        delete: async (id: string) => {
            await deleteDocFromCollection(collectionName, id);
            setData((prev: T[]) => prev.filter(item => item.id !== id));
        },
    });

    const profilesCrud = crudOperations<Profile>('profiles', setProfiles);
    const categoriesCrud = crudOperations<Category>('categories', setCategories);
    const fixedExpensesCrud = crudOperations<FixedExpense>('fixedExpenses', setFixedExpenses);
    const investmentsCrud = crudOperations<Investment>('investments', setInvestments);
    const budgetsCrud = crudOperations<Budget>('budgets', setBudgets);
    const goalsCrud = crudOperations<SavingsGoal>('goals', setGoals);
    const servicesCrud = crudOperations<Service>('services', setServices);
    const tangibleAssetsCrud = crudOperations<TangibleAsset>('tangibleAssets', setTangibleAssets);
    
    // #region Specific CRUD implementations
    
    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const settingsRef = doc(db, `users/${uid}/app/settings`);
        await setDoc(settingsRef, newSettings, { merge: true });
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
    
        await runTransaction(db, async (tx) => {
            // READS FIRST
            const readPromises: Promise<any>[] = [];
            const refs: Record<string, any> = {};
    
            if (transaction.type === 'income') {
                refs.accountRef = doc(db, `users/${uid}/bankAccounts`, transaction.accountId);
                readPromises.push(tx.get(refs.accountRef));
            } else if (transaction.type === 'expense') {
                if (transaction.cardId) {
                    refs.cardRef = doc(db, `users/${uid}/bankCards`, transaction.cardId);
                    readPromises.push(tx.get(refs.cardRef));
                }
                // Always get the account for debit cards or direct expenses
                refs.accountRef = doc(db, `users/${uid}/bankAccounts`, transaction.accountId);
                readPromises.push(tx.get(refs.accountRef));
            } else if (transaction.type === 'transfer' && transaction.destinationAccountId) {
                refs.sourceRef = doc(db, `users/${uid}/bankAccounts`, transaction.accountId);
                refs.destRef = doc(db, `users/${uid}/bankAccounts`, transaction.destinationAccountId);
                readPromises.push(tx.get(refs.sourceRef), tx.get(refs.destRef));
            }
    
            const snapshots = await Promise.all(readPromises);
            let snapshotIndex = 0;
    
            // WRITES
            const transactionData: Omit<Transaction, 'id'> = { ...transaction };
            if (transactionData.type === 'transfer') {
                const transferCategory = categories.find(c => c.type === 'Transferencia');
                transactionData.category = transferCategory?.name || 'Transferencia Interna';
            } else {
                delete (transactionData as Partial<Transaction>).destinationAccountId;
            }
    
            const transactionToSave = cleanupUndefineds({
                ...transactionData,
                date: Timestamp.fromDate(transactionData.date)
            });
    
            const newTransactionRef = doc(collection(db, `users/${uid}/transactions`));
            tx.set(newTransactionRef, transactionToSave);
    
            // Perform accounting updates based on PRE-READ data
            if (transaction.type === 'income') {
                const accountSnap = snapshots[snapshotIndex++];
                const currentBalance = accountSnap.data()?.balance || 0;
                tx.update(refs.accountRef, { balance: currentBalance + transaction.amount });
            } else if (transaction.type === 'expense') {
                const cardSnap = transaction.cardId ? snapshots[snapshotIndex++] : null;
                const accountSnap = snapshots[snapshotIndex++];
    
                if (transaction.cardId && cardSnap) {
                    const cardData = cardSnap.data();
                    if (cardData?.cardType === 'credit') {
                        const newUsedAmount = (cardData.usedAmount || 0) + transaction.amount;
                        tx.update(refs.cardRef, { usedAmount: newUsedAmount });
                    } else { // Debit or Prepaid
                        const currentBalance = accountSnap.data()?.balance || 0;
                        tx.update(refs.accountRef, { balance: currentBalance - transaction.amount });
                    }
                } else if (transaction.isCreditLinePayment) {
                    const newCreditLineUsed = (accountSnap.data()?.creditLineUsed || 0) + transaction.amount;
                    tx.update(refs.accountRef, { creditLineUsed: newCreditLineUsed });
                } else { // Direct account expense
                    const currentBalance = accountSnap.data()?.balance || 0;
                    tx.update(refs.accountRef, { balance: currentBalance - transaction.amount });
                }
            } else if (transaction.type === 'transfer' && transaction.destinationAccountId) {
                const sourceSnap = snapshots[snapshotIndex++];
                const destSnap = snapshots[snapshotIndex++];
    
                const sourceBalance = sourceSnap.data()?.balance || 0;
                tx.update(refs.sourceRef, { balance: sourceBalance - transaction.amount });
    
                const destBalance = destSnap.data()?.balance || 0;
                tx.update(refs.destRef, { balance: destBalance + transaction.amount });
            }
        });
    
        // Refetch data after transaction to ensure UI consistency
        const [newTransactions, newAccounts, newCards] = await Promise.all([
            fetchData('transactions', uid),
            fetchData('bankAccounts', uid),
            fetchData('bankCards', uid),
        ]);
    
        setAllTransactions(newTransactions as Transaction[]);
        setBankAccounts(newAccounts as BankAccount[]);
        setBankCards(newCards as BankCard[]);
    };
    
    const updateTransaction = async (transaction: Partial<Transaction> & {id: string}) => {
        // This is complex as it requires reverting the old transaction and applying the new one.
        // For now, we will just update the data, assuming amounts don't change, which is safer.
        // A full implementation would require a dedicated cloud function.
        const dataToSave: Record<string, unknown> = { ...transaction };
        if (transaction.date) {
            dataToSave.date = Timestamp.fromDate(transaction.date as Date);
        }
        await updateDocInCollection('transactions', transaction.id, dataToSave);
        setAllTransactions(prev => prev.map(t => t.id === transaction.id ? { ...t, ...transaction } as Transaction : t));
    };

    const deleteTransaction = async (id: string) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        // This is complex, a cloud function would be better. For now, refetching is a safe bet for UI consistency.
        await deleteDocFromCollection('transactions', id);
        
        const [newTransactions, newAccounts, newCards] = await Promise.all([
            fetchData('transactions', uid),
            fetchData('bankAccounts', uid),
            fetchData('bankCards', uid),
        ]);
        setAllTransactions(newTransactions as Transaction[]);
        setBankAccounts(newAccounts as BankAccount[]);
        setBankCards(newCards as BankCard[]);
    };
    
    const addBankAccount = async (account: Omit<BankAccount, 'id' | 'balance' | 'creditLineUsed'>) => {
        const newAccount = { ...account, balance: 0, creditLineUsed: 0 };
        const savedDoc = await addDocToCollection('bankAccounts', newAccount);
        setBankAccounts(prev => [...prev, savedDoc as BankAccount]);
    };
    
    const deleteBankAccount = async (id: string) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const batch = writeBatch(db);
        const cardsQuery = query(collection(db, `users/${uid}/bankCards`), where("accountId", "==", id));
        const cardsSnapshot = await getDocs(cardsQuery);
        cardsSnapshot.forEach(doc => batch.delete(doc.ref));
        const debtsQuery = query(collection(db, `users/${uid}/debts`), where("accountId", "==", id));
        const debtsSnapshot = await getDocs(debtsQuery);
        debtsSnapshot.forEach(doc => batch.delete(doc.ref));
        const accountRef = doc(db, `users/${uid}/bankAccounts`, id);
        batch.delete(accountRef);
        await batch.commit();
        setBankAccounts(prev => prev.filter(acc => acc.id !== id));
        setBankCards(prev => prev.filter(card => card.accountId !== id));
        setDebts(prev => prev.filter(debt => debt.accountId !== id));
    }
    
    const addBankCard = async (card: Omit<BankCard, 'id'| 'usedAmount'>) => {
        const newCard = { ...card, usedAmount: 0 };
        const savedDoc = await addDocToCollection('bankCards', newCard);
        setBankCards(prev => [...prev, savedDoc as BankCard]);
    };

    const deleteBankCard = async (id: string) => {
         if (!uid) throw new Error("No hay un usuario autenticado.");
        const subsQuery = query(collection(db, `users/${uid}/subscriptions`), where("cardId", "==", id));
        const subsSnap = await getDocs(subsQuery);
        if(!subsSnap.empty) {
            throw new Error("No se puede eliminar. La tarjeta está siendo usada por una o más suscripciones activas.");
        }
        await deleteDocFromCollection('bankCards', id);
        setBankCards(prev => prev.filter(card => card.id !== id));
    }
    
    const addDebt = async (debt: Omit<Debt, 'id' | 'paidAmount'>) => {
        const dataToSave = { ...debt, dueDate: Timestamp.fromDate(debt.dueDate), paidAmount: 0 };
        const savedDoc = await addDocToCollection('debts', dataToSave);
        setDebts(prev => [...prev, { ...savedDoc, dueDate: debt.dueDate } as Debt]);
    };

    const updateDebt = async (debt: Partial<Debt> & {id: string}) => {
        const dataToSave: Record<string, unknown> = { ...debt };
        if (debt.dueDate) {
            dataToSave.dueDate = Timestamp.fromDate(debt.dueDate);
        }
        await updateDocInCollection('debts', debt.id, dataToSave);
        setDebts(prev => prev.map(d => d.id === debt.id ? { ...d, ...debt } : d));
    };
    
    const deleteDebt = async (id: string) => {
        await deleteDocFromCollection('debts', id);
        setDebts(prev => prev.filter(d => d.id !== id));
    };
    
    const addDebtPayment = async (payment: Omit<DebtPayment, 'id'>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        
        await runTransaction(db, async (tx) => {
            const debtRef = doc(db, `users/${uid}/debts`, payment.debtId);
            const debtSnap = await tx.get(debtRef);
            if (!debtSnap.exists()) throw new Error("La deuda no existe.");
            const debtData = debtSnap.data() as Debt;
            
            const newPaidAmount = (debtData.paidAmount || 0) + payment.amount;
            const nextDueDate = addMonths(new Date(debtData.dueDate), 1);

            // This will run the atomic addTransaction logic
            await addTransaction({
                type: 'expense' as const,
                amount: payment.amount,
                description: `Abono a ${payment.debtName}`,
                category: 'Pago de Deuda',
                profile: debtData.profile,
                date: payment.date,
                accountId: payment.accountId,
                taxDetails: payment.taxDetails
            });

            tx.update(debtRef, { paidAmount: newPaidAmount, dueDate: Timestamp.fromDate(nextDueDate) });
            
            const newPaymentRef = doc(collection(db, `users/${uid}/debtPayments`));
            tx.set(newPaymentRef, { ...payment, date: Timestamp.fromDate(payment.date) });
        });
        
        const [newDebts, newDebtPayments] = await Promise.all([
            fetchData('debts', uid),
            fetchData('debtPayments', uid)
        ]);
        setDebts(newDebts as Debt[]);
        setDebtPayments(newDebtPayments as DebtPayment[]);
    };
    
    const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
        const newGoal = { ...goal, currentAmount: 0, completionNotified: false };
        const dataToSave = { ...newGoal, estimatedDate: Timestamp.fromDate(newGoal.estimatedDate) };
        const savedDoc = await addDocToCollection('goals', dataToSave);
        setGoals(prev => [...prev, { ...savedDoc } as SavingsGoal]);
    };

    const addGoalContribution = async (contribution: Omit<GoalContribution, 'id'>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");

        await runTransaction(db, async (tx) => {
            const goalRef = doc(db, `users/${uid}/goals`, contribution.goalId);
            const goalSnap = await tx.get(goalRef);
            const goalData = goalSnap.data() as SavingsGoal;
            if(!goalData) throw new Error("Meta no encontrada.");

            const accountRef = doc(db, `users/${uid}/bankAccounts`, contribution.sourceAccountId);
            const accountSnap = await tx.get(accountRef);
            const accountData = accountSnap.data() as BankAccount;
            if(!accountData) throw new Error("Cuenta de ahorros no encontrada.");

            if(contribution.amount > accountData.balance) throw new Error("Saldo insuficiente.");

            const newCurrentAmount = (goalData.currentAmount || 0) + contribution.amount;
            tx.update(goalRef, { currentAmount: newCurrentAmount });

            // Use the robust addTransaction
            await addTransaction({
                type: 'expense' as const,
                amount: contribution.amount,
                description: `Aporte a meta: ${contribution.goalName}`,
                category: 'Ahorro para Metas',
                profile: accountData.profile,
                date: contribution.date,
                accountId: accountData.id,
            });
            
            const contributionRef = doc(collection(db, `users/${uid}/goalContributions`));
            tx.set(contributionRef, { ...contribution, date: Timestamp.fromDate(contribution.date) });
        });

        const [newGoals, newContributions] = await Promise.all([
            fetchData('goals', uid),
            fetchData('goalContributions', uid)
        ]);
        setGoals(newGoals as SavingsGoal[]);
        setGoalContributions(newContributions as GoalContribution[]);
    };
    
    const addInvestmentContribution = async (contribution: Omit<InvestmentContribution, 'id'>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        
        await runTransaction(db, async (tx) => {
            const investmentRef = doc(db, `users/${uid}/investments`, contribution.investmentId);
            const investmentSnap = await tx.get(investmentRef);
            const investmentData = investmentSnap.data() as Investment;
            if(!investmentData) throw new Error("Activo no encontrado.");

            const portfolioAccountQuery = query(collection(db, `users/${uid}/bankAccounts`), where("profile", "==", investmentData.profile), where("purpose", "==", investmentData.purpose));
            const portfolioAccountSnap = (await getDocs(portfolioAccountQuery)).docs[0];
            
            if(!portfolioAccountSnap) throw new Error(`Cartera de ${investmentData.purpose === 'investment' ? 'Inversión' : 'Ahorro'} no encontrada para este perfil.`);
            const portfolioAccountData = portfolioAccountSnap.data() as BankAccount;
            
            if (contribution.amount > portfolioAccountData.balance) throw new Error("Saldo insuficiente en la cartera.");

            const newCurrentValue = (investmentData.currentValue || investmentData.initialAmount) + contribution.amount;
            const newInitialAmount = investmentData.initialAmount + contribution.amount;
            tx.update(investmentRef, { currentValue: newCurrentValue, initialAmount: newInitialAmount });

             await addTransaction({
                type: 'expense',
                amount: contribution.amount,
                description: `Aporte a ${investmentData.purpose === 'investment' ? 'inversión' : 'ahorro'}: ${investmentData.name}`,
                category: 'Inversiones y Ahorros',
                profile: investmentData.profile,
                date: contribution.date,
                accountId: portfolioAccountSnap.id,
            });

            const contributionRef = doc(collection(db, `users/${uid}/investmentContributions`));
            tx.set(contributionRef, { ...contribution, date: Timestamp.fromDate(contribution.date), purpose: investmentData.purpose });
        });
        
        const [newInvestments, newContributions] = await Promise.all([
            fetchData('investments', uid),
            fetchData('investmentContributions', uid),
        ]);
        setInvestments(newInvestments as Investment[]);
        setInvestmentContributions(newContributions as InvestmentContribution[]);
    };

    const addInvestment = async (investment: Omit<Investment, 'id' | 'currentValue'>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const newInvestment = { ...investment, currentValue: investment.initialAmount, startDate: investment.startDate || new Date() };
        
        const dataToSave = { ...newInvestment, startDate: Timestamp.fromDate(newInvestment.startDate) };
        const savedDoc = await addDocToCollection('investments', dataToSave);
        
        await addInvestmentContribution({
            investmentId: savedDoc.id as string,
            investmentName: newInvestment.name,
            amount: newInvestment.initialAmount,
            date: newInvestment.startDate,
            purpose: newInvestment.purpose,
        });
        
        const newInvestments = await fetchData('investments', uid as string);
        setInvestments(newInvestments as Investment[]);
    };

     const closeInvestment = async (investmentId: string, finalValue: number) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        
        await runTransaction(db, async(tx) => {
            const investmentRef = doc(db, `users/${uid}/investments`, investmentId);
            const investmentSnap = await tx.get(investmentRef);
            const investment = investmentSnap.data() as Investment;
            if (!investment) throw new Error("Inversión no encontrada.");

            const portfolioAccountQuery = query(collection(db, `users/${uid}/bankAccounts`), where("profile", "==", investment.profile), where("purpose", "==", investment.purpose));
            const portfolioAccountSnap = (await getDocs(portfolioAccountQuery)).docs[0];
            if (!portfolioAccountSnap) throw new Error("Cartera no encontrada.");
            
            await addTransaction({
                type: 'income',
                amount: finalValue,
                description: `Liquidación de ${investment.purpose === 'investment' ? 'inversión' : 'ahorro'}: ${investment.name}`,
                category: 'Ingresos por Inversión',
                profile: investment.profile,
                date: new Date(),
                accountId: portfolioAccountSnap.id,
            });
            
            tx.delete(investmentRef);
        });

        const newInvestments = await fetchData('investments', uid);
        setInvestments(newInvestments as Investment[]);
    };
    
    const addSubscription = async (subscription: Omit<Subscription, 'id' | 'status'>) => {
        const newSub = { ...subscription, status: 'active' as const, dueDate: subscription.dueDate };
        const savedDoc = await addDocToCollection('subscriptions', { ...newSub, dueDate: Timestamp.fromDate(newSub.dueDate) });
        setSubscriptions(prev => [...prev, { ...savedDoc, dueDate: subscription.dueDate } as Subscription]);
    };
    
    const updateSubscription = async (subscription: Partial<Subscription> & {id: string}) => {
        const dataToSave: Record<string, unknown> = { ...subscription };
        if (subscription.dueDate) {
            dataToSave.dueDate = Timestamp.fromDate(subscription.dueDate);
        }
        await updateDocInCollection('subscriptions', subscription.id, dataToSave);
        setSubscriptions(prev => prev.map(s => s.id === subscription.id ? { ...s, ...subscription } : s));
    };

    const paySubscription = async (subscription: Subscription, paymentDetails?: { accountId?: string; cardId?: string; taxDetails?: unknown }) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        
        const accountId = paymentDetails?.accountId || bankCards.find(c => c.id === subscription.cardId)?.accountId;
        const cardId = paymentDetails?.cardId; 

        if (!accountId) throw new Error("Cuenta de pago no encontrada.");

        await addTransaction({
            type: 'expense' as const,
            amount: subscription.amount,
            description: `Pago ${subscription.name}`,
            category: 'Suscripciones',
            profile: subscription.profile,
            date: new Date(),
            accountId: accountId,
            cardId: cardId,
            taxDetails: paymentDetails?.taxDetails as Transaction['taxDetails'],
        }); 

        const subRef = doc(db, `users/${uid}/subscriptions`, subscription.id);
        const nextDueDate = addMonths(subscription.dueDate, 1);
        const updateData = { 
            dueDate: Timestamp.fromDate(nextDueDate),
            lastPaymentMonth: getMonth(new Date()),
            lastPaymentYear: getYear(new Date()),
            paidThisPeriod: true
        };
        await updateDoc(subRef, updateData);

        setSubscriptions(prev => prev.map(s => s.id === subscription.id ? { ...s, ...updateData, dueDate: nextDueDate } : s));
    };
    
    const cancelSubscription = async (id: string) => {
        const subData = { status: 'cancelled' as const, cancellationDate: Timestamp.fromDate(new Date()) };
        await updateDocInCollection('subscriptions', id, subData);
        setSubscriptions(prev => prev.map(s => s.id === id ? {...s, status: 'cancelled', cancellationDate: new Date()} : s));
    };

    const deleteSubscription = async (id: string) => {
         await deleteDocFromCollection('subscriptions', id);
         setSubscriptions(prev => prev.filter(s => s.id !== id));
    };
    
    const addTaxPayment = async (payment: Omit<TaxPayment, 'id'>) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");

        await runTransaction(db, async(tx) => {
            const finalPayment = { ...payment, date: Timestamp.fromDate(payment.date) };
            const paymentRef = doc(collection(db, `users/${uid}/taxPayments`));
            tx.set(paymentRef, finalPayment);

            const transactionData: Omit<Transaction, 'id'> = {
                type: 'expense' as const,
                amount: payment.amount,
                description: `Pago de Impuestos (F29) ${payment.month + 1}/${payment.year}`,
                category: 'Impuestos',
                profile: payment.profile,
                date: payment.date,
                accountId: payment.sourceAccountId,
            };
             await addTransaction(transactionData);
        });

        const newTaxPayments = await fetchData('taxPayments', uid);
        setTaxPayments(newTaxPayments as TaxPayment[]);
    };

    const sellTangibleAsset = async (assetId: string, salePrice: number, destinationAccountId: string) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const asset = tangibleAssets.find(a => a.id === assetId);
        if (!asset) throw new Error("Activo no encontrado.");

        await runTransaction(db, async (tx) => {
            const assetRef = doc(db, `users/${uid}/tangibleAssets`, assetId);
            tx.delete(assetRef);
            
            await addTransaction({
                type: 'income',
                amount: salePrice,
                description: `Venta de activo: ${asset.name}`,
                category: 'Venta de Activos',
                profile: asset.profile,
                date: new Date(),
                accountId: destinationAccountId,
            });
        });

        const newTangibleAssets = await fetchData('tangibleAssets', uid);
        setTangibleAssets(newTangibleAssets as TangibleAsset[]);
    };
    
    const setFavoriteBudget = async (budgetId: string) => {
        if (!uid) throw new Error("No hay un usuario autenticado.");
        const batch = writeBatch(db);
        
        const updatedBudgets = budgets.map(b => {
            const isFavorite = b.id === budgetId;
            if (b.isFavorite !== isFavorite) {
                const budgetRef = doc(db, `users/${uid}/budgets`, b.id);
                batch.update(budgetRef, { isFavorite });
            }
            return { ...b, isFavorite };
        });

        await batch.commit();
        setBudgets(updatedBudgets);
    };

    // #endregion

    const value: DataContextType = {
        user,
        uid,
        isLoading,
        allTransactions,
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
        taxPayments,
        services,
        tangibleAssets,
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
        updateBankAccount: crudOperations<BankAccount>('bankAccounts', setBankAccounts).update,
        deleteBankAccount,
        addBankCard,
        updateBankCard: crudOperations<BankCard>('bankCards', setBankCards).update,
        deleteBankCard,
        addDebt,
        updateDebt,
        deleteDebt,
        addDebtPayment,
        addSubscription,
        updateSubscription,
        paySubscription,
        cancelSubscription,
        deleteSubscription,
        addFixedExpense: fixedExpensesCrud.add,
        updateFixedExpense: fixedExpensesCrud.update,
        deleteFixedExpense: fixedExpensesCrud.delete,
        addGoal,
        updateGoal: goalsCrud.update,
        deleteGoal: goalsCrud.delete,
        addGoalContribution,
        addInvestment,
        updateInvestment: investmentsCrud.update,
        deleteInvestment: investmentsCrud.delete,
        addInvestmentContribution,
        closeInvestment,
        addTangibleAsset: tangibleAssetsCrud.add,
        updateTangibleAsset: tangibleAssetsCrud.update,
        deleteTangibleAsset: tangibleAssetsCrud.delete,
        sellTangibleAsset,
        addBudget: budgetsCrud.add,
        updateBudget: budgetsCrud.update,
        deleteBudget: budgetsCrud.delete,
        setFavoriteBudget,
        addProfile: profilesCrud.add,
        updateProfile: profilesCrud.update,
        deleteProfile: profilesCrud.delete,
        addCategory: categoriesCrud.add,
        updateCategory: categoriesCrud.update,
        deleteCategory: categoriesCrud.delete,
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

    



    



