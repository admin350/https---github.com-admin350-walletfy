
'use client';

import type { Transaction, SavingsGoal, Subscription, Profile, Category, FixedExpense, Debt, GoalContribution, DebtPayment, Investment, InvestmentContribution, Budget, BankAccount, BankCard, MonthlyReport, AppSettings, AppNotification, TaxPayment, Service } from "@/types";
import { createContext, useState, useEffect, ReactNode, useMemo, useCallback, useContext } from "react";
import { getYear, getMonth, isPast, startOfMonth, endOfMonth, subDays, isSameDay, addMonths } from "date-fns";
import { db, auth } from "@/lib/firebase";
import { collection, doc, getDocs, writeBatch, onSnapshot, Unsubscribe, DocumentData, deleteDoc, setDoc, getDoc, query, where, updateDoc, addDoc as addFirestoreDoc } from "firebase/firestore";
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

interface IFilters {
    profile: string;
    month: number; // -1 for all months
    year: number;
}

// CONTEXT
interface DataContextType {
    user: User | null;
    transactions: Transaction[];
    goals: SavingsGoal[];
    subscriptions: Subscription[];
    debts: Debt[];
    fixedExpenses: FixedExpense[];
    profiles: Profile[];
    categories: Category[];
    goalContributions: GoalContribution[];
    debtPayments: DebtPayment[];
    taxPayments: TaxPayment[];
    investments: Investment[];
    investmentContributions: InvestmentContribution[];
    budgets: Budget[];
    bankAccounts: BankAccount[];
    bankCards: BankCard[];
    reports: MonthlyReport[];
    services: Service[];
    settings: AppSettings;
    notifications: AppNotification[];
    isLoading: boolean;
    filters: IFilters;
    setFilters: React.Dispatch<React.SetStateAction<IFilters>>;
    availableYears: number[];
    login: (email: string, pass: string) => Promise<void>;
    signup: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id'> & { isInstallment?: boolean; installments?: number, paymentMethod?: string, includesTax?: boolean, taxRate?: number }) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'completionNotified'>) => Promise<string>;
    updateGoal: (goal: SavingsGoal) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    addSubscription: (subscription: Omit<Subscription, 'id' | 'status'>) => Promise<void>;
    updateSubscription: (subscription: Subscription) => Promise<void>;
    updateSubscriptionAmount: (subscriptionId: string, newAmount: number) => Promise<void>;
    cancelSubscription: (id: string) => Promise<void>;
    deleteSubscription: (id: string) => Promise<void>;
    addDebt: (debt: Omit<Debt, 'id' | 'paidAmount'>) => Promise<string>;
    updateDebt: (debt: Debt) => Promise<void>;
    deleteDebt: (id: string) => Promise<void>;
    addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => Promise<string>;
    updateFixedExpense: (expense: FixedExpense) => Promise<void>;
    deleteFixedExpense: (id: string) => Promise<void>;
    addGoalContribution: (contribution: Omit<GoalContribution, 'id'>) => Promise<void>;
    addDebtPayment: (payment: Omit<DebtPayment, 'id'>) => Promise<void>;
    paySubscription: (subscription: Subscription) => Promise<void>;
    addTaxPayment: (payment: Omit<TaxPayment, 'id'>) => Promise<void>;
    addInvestment: (investment: Omit<Investment, 'id' | 'currentValue'>) => Promise<string>;
    updateInvestment: (investment: Investment) => Promise<void>;
    deleteInvestment: (id: string) => Promise<void>;
    addInvestmentContribution: (contribution: Omit<InvestmentContribution, 'id'>) => Promise<void>;
    addBudget: (budget: Omit<Budget, 'id'>) => Promise<string>;
    updateBudget: (budget: Budget) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    addCategory: (category: Omit<Category, 'id'>) => Promise<string>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    addBankAccount: (account: Omit<BankAccount, 'id'>) => Promise<string>;
    updateBankAccount: (account: BankAccount) => Promise<void>;
    deleteBankAccount: (id: string) => Promise<void>;
    addBankCard: (card: Omit<BankCard, 'id' | 'usedAmount'>) => Promise<string>;
    updateBankCard: (card: BankCard) => Promise<void>;
    deleteBankCard: (id: string) => Promise<void>;
    addReport: (report: MonthlyReport) => Promise<void>;
    deleteReport: (id: string) => Promise<void>;
    addService: (service: Omit<Service, 'id'>) => Promise<string>;
    updateService: (service: Service) => Promise<void>;
    deleteService: (id: string) => Promise<void>;
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    addProfile: (profile: Omit<Profile, 'id'>) => Promise<string>;
    updateProfile: (profile: Profile) => Promise<void>;
    deleteProfile: (id: string) => Promise<void>;
    getAllDataForMonth: (month: number, year: number) => { transactions: Transaction[], goals: SavingsGoal[], debts: Debt[], investments: Investment[], budgets: Budget[] };
    formatCurrency: (value: number, withSymbol?: boolean, isCompact?: boolean) => string;
    previewBackground: string | null;
    setPreviewBackground: (themeId: string | null) => void;
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
    const [user, setUser] = useState<User | null>(null);
    const [uid, setUid] = useState<string | null>(null);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [allGoals, setAllGoals] = useState<SavingsGoal[]>([]);
    const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]);
    const [allDebts, setAllDebts] = useState<Debt[]>([]);
    const [allFixedExpenses, setAllFixedExpenses] = useState<FixedExpense[]>([]);
    const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [allGoalContributions, setAllGoalContributions] = useState<GoalContribution[]>([]);
    const [allDebtPayments, setAllDebtPayments] = useState<DebtPayment[]>([]);
    const [allTaxPayments, setAllTaxPayments] = useState<TaxPayment[]>([]);
    const [allInvestments, setAllInvestments] = useState<Investment[]>([]);
    const [allInvestmentContributions, setAllInvestmentContributions] = useState<InvestmentContribution[]>([]);
    const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
    const [allBankAccounts, setAllBankAccounts] = useState<BankAccount[]>([]);
    const [allBankCards, setAllBankCards] = useState<BankCard[]>([]);
    const [allReports, setAllReports] = useState<MonthlyReport[]>([]);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [settings, setSettings] = useState<AppSettings>({ currency: 'CLP', background: 'theme-gradient' });
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<IFilters>({
        profile: 'all',
        month: getMonth(new Date()),
        year: getYear(new Date()),
    });
    const [previewBackground, setPreviewBackground] = useState<string | null>(null);

    const formatCurrency = useCallback((value: number, withSymbol = true, isCompact = false) => {
        if (isNaN(value)) return '';
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
    
    
    // Subscribe to auth state changes
    useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setUid(currentUser.uid);
            } else {
                setUser(null);
                setUid(null);
                // Clear all data when user logs out
                setAllTransactions([]); setAllGoals([]); setAllSubscriptions([]); setAllDebts([]);
                setAllFixedExpenses([]); setAllProfiles([]); setAllCategories([]); setAllGoalContributions([]);
                setAllDebtPayments([]); setAllTaxPayments([]); setAllInvestments([]); setAllInvestmentContributions([]); 
                setAllBudgets([]); setAllBankAccounts([]); setAllBankCards([]); setAllReports([]); setAllServices([]);
                setSettings({ currency: 'CLP', background: 'theme-gradient' });
                setIsLoading(false);
            }
        });
        return () => authUnsubscribe();
    }, []);

    const initializeUserData = useCallback(async (newUid: string) => {
        const defaultProfiles = [ { name: "Personal", color: "#3b82f6" }, { name: "Negocio", color: "#14b8a6" }, ];
        const defaultCategories = [
            { name: "Alimentación", type: "Gasto", color: "#f97316" },
            { name: "Transporte", type: "Gasto", color: "#3b82f6" },
            { name: "Vivienda", type: "Gasto", color: "#84cc16" },
            { name: "Sueldo", type: "Ingreso", color: "#22c55e" },
            { name: "Pago de Deuda", type: "Gasto", color: "#ef4444"},
            { name: "Suscripciones", type: "Gasto", color: "#a855f7"},
            { name: "Otros Gastos", type: "Gasto", color: "#6b7280"},
            { name: "Transferencia", type: "Transferencia", color: "#06b6d4"},
            { name: "Impuestos", type: "Gasto", color: "#2dd4bf" },
        ];
        const defaultSettings = { currency: 'CLP', largeTransactionThreshold: 500000, background: 'theme-gradient' };

        const batch = writeBatch(db);
        const userDocRef = doc(db, 'users', newUid);
        batch.set(userDocRef, { createdAt: new Date(), email: auth.currentUser?.email }, { merge: true });
        
        defaultProfiles.forEach(profile => {
            const profileRef = doc(collection(db, 'users', newUid, 'profiles'));
            batch.set(profileRef, profile);
        });
        defaultCategories.forEach(category => {
            const categoryRef = doc(collection(db, 'users', newUid, 'categories'));
            batch.set(categoryRef, category);
        });
        
        const settingsDocRef = doc(db, 'users', newUid, 'settings', 'appSettings');
        batch.set(settingsDocRef, defaultSettings);

        await batch.commit();
    }, []);

    // Subscribe to user data once UID is available
    useEffect(() => {
        if (!uid) {
            setIsLoading(true); // Keep loading if no user
            return;
        }
        
        const unsubscribers: Unsubscribe[] = [];
        
        const setupListeners = async () => {
            try {
                // Check for user initialization
                const settingsDocRef = doc(db, 'users', uid, 'settings', 'appSettings');
                const settingsDocSnap = await getDoc(settingsDocRef);
    
                if (!settingsDocSnap.exists()) {
                    await initializeUserData(uid);
                }

                // Now setup all listeners
                const collections = [
                    'transactions', 'goals', 'subscriptions', 'debts', 'fixedExpenses', 'profiles', 
                    'categories', 'goalContributions', 'debtPayments', 'taxPayments', 'investments', 
                    'investmentContributions', 'budgets', 'bankAccounts', 'bankCards', 'reports', 'services'
                ];
        
                const dataSetters: { [key: string]: React.Dispatch<React.SetStateAction<any[]>> } = {
                    transactions: setAllTransactions, goals: setAllGoals, subscriptions: setAllSubscriptions,
                    debts: setAllDebts, fixedExpenses: setAllFixedExpenses, profiles: setAllProfiles,
                    categories: setAllCategories, goalContributions: setAllGoalContributions, debtPayments: setAllDebtPayments,
                    taxPayments: setAllTaxPayments, investments: setAllInvestments, investmentContributions: setAllInvestmentContributions, 
                    budgets: setAllBudgets, bankAccounts: setAllBankAccounts, bankCards: setAllBankCards, reports: setAllReports, services: setAllServices,
                };
    
                unsubscribers.push(
                    ...collections.map(collectionName => 
                        onSnapshot(collection(db, 'users', uid, collectionName), snapshot => {
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
                        })
                    )
                );
                
                unsubscribers.push(onSnapshot(settingsDocRef, (docSnap) => {
                    if(docSnap.exists()){
                        setSettings(docSnap.data() as AppSettings);
                    }
                }));

                setIsLoading(false);
            } catch (error) {
                console.error("Error setting up listeners:", error);
                setIsLoading(false);
            }
        };

        setupListeners();

        return () => {
            unsubscribers.forEach(unsub => unsub());
        }

    }, [uid, initializeUserData]);

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    }
    const signup = async (email: string, pass: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        // `initializeUserData` will be triggered by the `useEffect` hook listening to `uid` changes.
    }
    const logout = async () => {
        await signOut(auth);
    }

    const addDoc = async <T extends { id?: string }>(collectionName: string, data: Omit<T, 'id'>): Promise<string> => {
        if (!uid) throw new Error("Usuario no autenticado");
        const docRef = await addFirestoreDoc(collection(db, 'users', uid, collectionName), data);
        return docRef.id;
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


     const addTransaction = async (transaction: Omit<Transaction, 'id'> & { isInstallment?: boolean; installments?: number, paymentMethod?: string, includesTax?: boolean, taxRate?: number }) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const { isInstallment, installments, paymentMethod, includesTax, taxRate, ...formData } = transaction;

        const batch = writeBatch(db);
        const transRef = doc(collection(db, 'users', uid, 'transactions'));
        
        const transData: Omit<Transaction, 'id'> = {
            type: formData.type,
            amount: formData.amount,
            description: formData.description,
            category: formData.category,
            profile: formData.profile,
            date: formData.date,
            accountId: formData.accountId,
        };

        if (formData.type === 'transfer') {
            if (!formData.category) {
                transData.category = allCategories.find(c => c.type === 'Transferencia')?.name || 'Transferencia';
            }
            if (formData.destinationAccountId) {
                transData.destinationAccountId = formData.destinationAccountId;
            }
        } else {
            let taxDetails: Transaction['taxDetails'] | undefined = undefined;
            if (includesTax && taxRate && formData.amount) {
                const total = formData.amount;
                const taxAmount = total - (total / (1 + taxRate / 100));
                taxDetails = { rate: taxRate, amount: taxAmount };
            }
            transData.taxDetails = taxDetails;
            transData.isCreditLinePayment = paymentMethod === 'credit-line';
            const paymentIsCard = paymentMethod && paymentMethod !== 'account-balance' && paymentMethod !== 'credit-line';
            if (paymentIsCard) {
                transData.cardId = paymentMethod;
            }
        }
        
        batch.set(transRef, transData);

        const sourceAccountRef = doc(db, 'users', uid, 'bankAccounts', transData.accountId);
        const sourceAccountSnap = await getDoc(sourceAccountRef);
        if (!sourceAccountSnap.exists()) throw new Error("Cuenta de origen no encontrada.");
        const sourceAccount = sourceAccountSnap.data() as BankAccount;


        if (transData.type === 'transfer') {
            if (!transData.destinationAccountId) throw new Error("La cuenta de destino es requerida para transferencias.");
            
            batch.update(sourceAccountRef, { balance: sourceAccount.balance - transData.amount });

            const destAccountRef = doc(db, 'users', uid, 'bankAccounts', transData.destinationAccountId);
            const destAccountSnap = await getDoc(destAccountRef);
            if (!destAccountSnap.exists()) throw new Error("Cuenta de destino no encontrada.");
            const destAccount = destAccountSnap.data() as BankAccount;
            batch.update(destAccountRef, { balance: destAccount.balance + transData.amount });

        } else if (transData.type === 'income') {
            batch.update(sourceAccountRef, { balance: sourceAccount.balance + transData.amount });
        } else if (transData.type === 'expense') {
            if (paymentMethod === 'credit-line') {
                batch.update(sourceAccountRef, { creditLineUsed: (sourceAccount.creditLineUsed || 0) + transData.amount });
            } else if (transData.cardId) {
                const cardRef = doc(db, 'users', uid, 'bankCards', transData.cardId);
                const cardSnap = await getDoc(cardRef);
                if (!cardSnap.exists()) throw new Error("Tarjeta no encontrada.");
                const card = cardSnap.data() as BankCard;

                if (card.cardType === 'credit') {
                    batch.update(cardRef, { usedAmount: (card.usedAmount || 0) + transData.amount });
                    if (isInstallment && installments && installments > 1) {
                       const debtData: Omit<Debt, 'id' | 'paidAmount' | 'sourceTransactionId'> = {
                           name: `Compra: ${transData.description}`,
                           totalAmount: transData.amount,
                           monthlyPayment: transData.amount / installments,
                           installments: installments,
                           dueDate: addMonths(new Date(transData.date), 1),
                           debtType: 'credit-card',
                           profile: transData.profile,
                           accountId: transData.accountId,
                           cardId: transData.cardId,
                           financialInstitution: card.bank,
                       };
                       const debtRef = doc(collection(db, 'users', uid, 'debts'));
                       batch.set(debtRef, { ...debtData, paidAmount: 0, sourceTransactionId: transRef.id });
                   }
                } else { 
                    batch.update(sourceAccountRef, { balance: sourceAccount.balance - transData.amount });
                }
            } else { 
                 batch.update(sourceAccountRef, { balance: sourceAccount.balance - transData.amount });
            }
        }

        return batch.commit();
    };


    const updateTransaction = async (updatedTransaction: Transaction) => {
        return await setDocWithId('transactions', updatedTransaction.id, updatedTransaction);
    };

    const deleteTransaction = async (id: string) => {
         return await deleteDocById('transactions', id);
    };
    
    const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'completionNotified'>) => await addDoc('goals', { ...goal, currentAmount: 0, completionNotified: false });
    const updateGoal = async (goal: SavingsGoal) => await setDocWithId('goals', goal.id, goal);
    const deleteGoal = async (id: string) => await deleteDocById('goals', id);
    const addGoalContribution = async (contribution: Omit<GoalContribution, 'id'>) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const goal = allGoals.find(g => g.id === contribution.goalId);
        if (!goal) throw new Error("Meta no encontrada");
        const account = allBankAccounts.find(a => a.purpose === 'savings' && a.profile === goal.profile);
        if (!account) throw new Error(`No se encontró una 'Cartera de Ahorros' para el perfil '${goal.profile}'.`);

        const batch = writeBatch(db);
        const contribRef = doc(collection(db, 'users', uid, 'goalContributions'));
        batch.set(contribRef, contribution);
        
        const goalRef = doc(db, 'users', uid, 'goals', contribution.goalId);
        batch.update(goalRef, { currentAmount: goal.currentAmount + contribution.amount });
        
        const accountRef = doc(db, 'users', uid, 'bankAccounts', account.id);
        batch.update(accountRef, { balance: account.balance - contribution.amount });
        
        return batch.commit();
    };
    
    const addDebt = async (debt: Omit<Debt, 'id' | 'paidAmount'>) => {
        const debtData: Partial<Debt> = {...debt, paidAmount: 0};
        const account = allBankAccounts.find(acc => acc.id === debt.accountId);
        if (account && !debtData.financialInstitution) {
            debtData.financialInstitution = account.bank;
        } else if (!debtData.financialInstitution) {
            debtData.financialInstitution = "Institución no especificada";
        }
        return await addDoc('debts', debtData);
    };
    const updateDebt = async (debt: Debt) => await setDocWithId('debts', debt.id, debt);
    const deleteDebt = async (id: string) => await deleteDocById('debts', id);
    const addDebtPayment = async (payment: Omit<DebtPayment, 'id'>) => {
        if (!uid) throw new Error("Usuario no autenticado");
        if (!payment.accountId) throw new Error("accountId is missing");
        
        const debtRef = doc(db, 'users', uid, 'debts', payment.debtId);
        const debtSnap = await getDoc(debtRef);
        if (!debtSnap.exists()) throw new Error("Deuda no encontrada.");
        const debt = debtSnap.data() as Debt;

        await addTransaction({
            type: 'expense',
            amount: payment.amount,
            description: `Abono a: ${debt.name}`,
            category: "Pago de Deuda",
            profile: debt.profile,
            date: new Date().toISOString(),
            accountId: payment.accountId,
            includesTax: false,
        });

    };

    const addTaxPayment = async (payment: Omit<TaxPayment, 'id'>) => {
        if (!uid) throw new Error("Usuario no autenticado");
    
        const transactionsInMonth = allTransactions.filter(t => {
            const date = new Date(t.date);
            return getMonth(date) === payment.month && getYear(date) === payment.year;
        });
    
        const totalDebit = transactionsInMonth.filter(t => t.type === 'income' && t.taxDetails).reduce((sum, t) => sum + (t.taxDetails?.amount || 0), 0);
        const totalCredit = transactionsInMonth.filter(t => t.type === 'expense' && t.taxDetails).reduce((sum, t) => sum + (t.taxDetails?.amount || 0), 0);
        
        const prevPeriod = subMonths(new Date(payment.year, payment.month), 1);
        const prevMonth = getMonth(prevPeriod);
        const prevYear = getYear(prevPeriod);
        const previousPayment = allTaxPayments.find(p => p.month === prevMonth && p.year === prevYear);
        const remanenteAnterior = previousPayment?.remanente ?? 0;
    
        const netTax = totalDebit - remanenteAnterior - totalCredit;
        const finalPayment: Omit<TaxPayment, 'id'> = { ...payment };
    
        if (netTax < 0) {
            finalPayment.remanente = Math.abs(netTax);
        }
    
        await addDoc('taxPayments', finalPayment);
    
        await addTransaction({
            type: 'expense',
            amount: payment.amount,
            description: `Pago Impuesto (F29) ${payment.month + 1}/${payment.year}`,
            category: "Impuestos",
            profile: "Negocio", // Assuming tax is always business
            date: new Date().toISOString(),
            accountId: payment.sourceAccountId,
            includesTax: false,
        });
    
    };
    
    
    const addInvestment = async (investment: Omit<Investment, 'id' | 'currentValue'>) => await addDoc('investments', { ...investment, currentValue: investment.initialAmount });
    const updateInvestment = async (investment: Investment) => await setDocWithId('investments', investment.id, investment);
    const deleteInvestment = async (id: string) => await deleteDocById('investments', id);
    const addInvestmentContribution = async (contribution: Omit<InvestmentContribution, 'id'>) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const investment = allInvestments.find(i => i.id === contribution.investmentId);
        if (!investment) throw new Error("Inversión no encontrada.");
        const account = allBankAccounts.find(a => a.purpose === 'investment' && a.profile === investment.profile);
        if (!account) throw new Error(`No se encontró una 'Cartera de Inversión' para el perfil '${investment.profile}'.`);

        const batch = writeBatch(db);
        const contribRef = doc(collection(db, 'users', uid, 'investmentContributions'));
        batch.set(contribRef, contribution);
        
        const investmentRef = doc(db, 'users', uid, 'investments', contribution.investmentId);
        batch.update(investmentRef, { 
            initialAmount: investment.initialAmount + contribution.amount,
            currentValue: investment.currentValue + contribution.amount,
        });
        
        const accountRef = doc(db, 'users', uid, 'bankAccounts', account.id);
        batch.update(accountRef, { balance: account.balance - contribution.amount });
        
        return batch.commit();
    };

    const addBankAccount = async (account: Omit<BankAccount, 'id'>) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const accountData: Partial<BankAccount> = { ...account };
        if (account.accountType !== 'Cuenta Vista') {
            delete accountData.monthlyLimit;
        } else if (!accountData.monthlyLimit) {
             accountData.monthlyLimit = 0;
        }
        if (!account.hasCreditLine) {
            delete accountData.creditLineLimit;
            delete accountData.creditLineUsed;
        } else {
             if (!accountData.creditLineLimit) accountData.creditLineLimit = 0;
             if (!accountData.creditLineUsed) accountData.creditLineUsed = 0;
        }
        return await addDoc('bankAccounts', accountData);
    };

    const updateBankAccount = async (account: BankAccount) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const accountData: Partial<BankAccount> = { ...account };
         if (account.accountType !== 'Cuenta Vista') {
            delete accountData.monthlyLimit;
        }
        if (!account.hasCreditLine) {
            delete accountData.creditLineLimit;
            delete accountData.creditLineUsed;
        }
        return await setDocWithId('bankAccounts', account.id, accountData);
    };

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
        return await batch.commit();
    };

    const addBankCard = async (card: Omit<BankCard, 'id' | 'usedAmount'>): Promise<string> => {
        const cardData: Partial<BankCard> = { ...card, usedAmount: 0 };
        if (card.cardType !== 'credit') {
            delete cardData.creditLimit;
        }
        return await addDoc('bankCards', cardData);
    };
    
    const updateBankCard = async (card: BankCard) => {
        const cardData: Partial<BankCard> = { ...card };
        if (card.cardType !== 'credit') {
            delete cardData.creditLimit;
        }
        return await setDocWithId('bankCards', card.id, cardData);
    };
    const deleteBankCard = async (id: string) => await deleteDocById('bankCards', id);

    const paySubscription = async (sub: Subscription) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const today = new Date();
        const cardRef = doc(db, 'users', uid, 'bankCards', sub.cardId);
        const cardSnap = await getDoc(cardRef);
        if (!cardSnap.exists()) throw new Error("Tarjeta no encontrada para la suscripción");
        const card = cardSnap.data() as BankCard;

        await addTransaction({
            type: 'expense',
            amount: sub.amount,
            description: `Suscripción: ${sub.name}`,
            category: "Suscripciones",
            profile: sub.profile,
            date: today.toISOString(),
            accountId: card.accountId,
            paymentMethod: sub.cardId,
            includesTax: false,
        });

        const subRef = doc(db, 'users', uid, 'subscriptions', sub.id);
        await updateDoc(subRef, { 
            lastPaymentMonth: getMonth(today),
            lastPaymentYear: getYear(today)
        });
    };


    const addSubscription = async (subData: Omit<Subscription, 'id' | 'status'>) => {
        const subscriptionRecord: Omit<Subscription, 'id'> = {
            ...subData,
            status: 'active',
        };
        await addDoc('subscriptions', subscriptionRecord);
    };
    
    const updateSubscription = async (sub: Subscription) => await setDocWithId('subscriptions', sub.id, sub);
    const updateSubscriptionAmount = async (subscriptionId: string, newAmount: number) => {
        if (!uid) throw new Error("Usuario no autenticado");
        const subRef = doc(db, 'users', uid, 'subscriptions', subscriptionId);
        return await updateDoc(subRef, { amount: newAmount });
    };
    const cancelSubscription = async (id: string) => {
        const sub = allSubscriptions.find(s => s.id === id);
        if(sub) await updateSubscription({...sub, status: 'cancelled', cancellationDate: new Date()});
    };
    const deleteSubscription = async (id: string) => await deleteDocById('subscriptions', id);
    
    const addFixedExpense = async (expense: Omit<FixedExpense, 'id'>) => await addDoc('fixedExpenses', expense);
    const updateFixedExpense = async (expense: FixedExpense) => await setDocWithId('fixedExpenses', expense.id, expense);
    const deleteFixedExpense = async (id: string) => await deleteDocById('fixedExpenses', id);

    const addBudget = async (budget: Omit<Budget, 'id'>) => await addDoc('budgets', budget);
    const updateBudget = async (budget: Budget) => await setDocWithId('budgets', budget.id, budget);
    const deleteBudget = async (id: string) => await deleteDocById('budgets', id);
    
    const addCategory = async (category: Omit<Category, 'id'>) => await addDoc('categories', category);
    const updateCategory = async (category: Category) => await setDocWithId('categories', category.id, category);
    const deleteCategory = async (id: string) => await deleteDocById('categories', id);
    
    const addService = async (service: Omit<Service, 'id'>) => await addDoc('services', service);
    const updateService = async (service: Service) => await setDocWithId('services', service.id, service);
    const deleteService = async (id: string) => await deleteDocById('services', id);

    const addReport = async (report: MonthlyReport) => await setDocWithId('reports', report.id, report);
    const deleteReport = async (id: string) => await deleteDocById('reports', id);
    
    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        if (!uid) throw new Error("Usuario no autenticado");
        return await setDocWithId('settings', 'appSettings', newSettings);
    }
    
    const addProfile = async (profile: Omit<Profile, 'id'>) => await addDoc('profiles', profile);
    const updateProfile = async (profile: Profile) => await setDocWithId('profiles', profile.id, profile);
    const deleteProfile = async (id: string) => await deleteDocById('profiles', id);

    const availableYears = useMemo(() => {
        const years = new Set(allTransactions.map(t => getYear(new Date(t.date))));
        years.add(getYear(new Date())); // Ensure current year is always available
        return Array.from(years).sort((a, b) => b - a);
    }, [allTransactions]);
    
    const filteredTransactions = useMemo(() => {
        return allTransactions
            .filter(t => {
                const date = new Date(t.date);
                const profileMatch = filters.profile === 'all' || t.profile === filters.profile;
                const monthMatch = filters.month === -1 || getMonth(date) === filters.month;
                const yearMatch = getYear(date) === filters.year;
                return profileMatch && monthMatch && yearMatch;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    
    const filteredServices = useMemo(() => {
        return allServices.filter(s => filters.profile === 'all' || s.profile === filters.profile);
    }, [allServices, filters]);

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
    
    const filteredTaxPayments = useMemo(() => {
        return allTaxPayments.filter(tp => {
            const monthMatch = filters.month === -1 || tp.month === filters.month;
            const yearMatch = tp.year === filters.year;
            return monthMatch && yearMatch;
        });
    }, [allTaxPayments, filters]);

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

    const notifications: AppNotification[] = useMemo(() => {
        const newNotifications: AppNotification[] = [];
        const today = new Date();
        const currentMonthStart = startOfMonth(today);
        const currentMonthEnd = endOfMonth(today);

        // 1. Bank Account Notifications
        allBankAccounts.forEach(account => {
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
        });

        // 2. Debt Notifications
        const overdueDebtIds = new Set<string>();
        allDebts.forEach(debt => {
            if (debt.paidAmount < debt.totalAmount) {
                const dueDate = debt.dueDate;
                if (isPast(dueDate) && !isSameDay(today, dueDate)) {
                     newNotifications.push({
                        id: `debt-overdue-${debt.id}`, title: `¡Pago de Deuda Atrasado!`,
                        description: `El pago para "${debt.name}" venció el ${format(dueDate, "dd/MM/yyyy")}.`,
                        date: new Date(), read: false, type: 'error', link: `/dashboard/debts/${debt.id}`
                    });
                    overdueDebtIds.add(debt.id);
                }
            }
        });
        
        allDebts.forEach(debt => {
            if (debt.paidAmount < debt.totalAmount && !overdueDebtIds.has(debt.id)) {
                const dueDate = debt.dueDate;
                const notificationDate = subDays(dueDate, debt.dueNotificationDays || 3);
                if ((isSameDay(today, notificationDate) || (today > notificationDate && today < dueDate))) {
                    newNotifications.push({
                        id: `debt-due-${debt.id}`, title: `Deuda Próxima a Vencer`,
                        description: `Tu pago para "${debt.name}" vence el ${format(dueDate, "dd/MM/yyyy")}.`,
                        date: new Date(), read: false, type: 'warning', link: `/dashboard/debts/${debt.id}`
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

        // 6. Large Transaction Notification
        if (settings.largeTransactionThreshold) {
            allTransactions.forEach(t => {
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                if (t.amount > settings.largeTransactionThreshold! && new Date(t.date) > fiveMinutesAgo) {
                    newNotifications.push({
                        id: `large-tx-${t.id}`, title: `Transacción Grande Detectada`,
                        description: `Se registró una transacción de ${formatCurrency(t.amount)}: "${t.description}".`,
                        date: new Date(t.date), read: false, type: 'info', link: `/dashboard/transactions`
                    });
                }
            });
        }
        
        // 7. Tax Payment Notification
        const isTaxPeriodPaid = allTaxPayments.some(p => p.month === getMonth(today) && p.year === getYear(today));
        const taxPaymentDueDate = new Date(today.getFullYear(), today.getMonth() + 1, 20); // Assume F29 due date is 20th of next month
        const taxNotificationDate = subDays(taxPaymentDueDate, 5); // Notify 5 days before
        if (!isTaxPeriodPaid && today >= taxNotificationDate && today <= taxPaymentDueDate) {
             newNotifications.push({
                id: `tax-due-${getMonth(today)}`, title: `Declaración de Impuestos (F29) Próxima`,
                description: `Recuerda declarar y pagar tus impuestos antes del ${format(taxPaymentDueDate, "dd/MM/yyyy")}.`,
                date: new Date(), read: false, type: 'warning', link: `/dashboard/taxes`
            });
        }


        return newNotifications.sort((a,b) => b.date.getTime() - a.date.getTime());
    }, [allBankAccounts, allTransactions, allDebts, allSubscriptions, allGoals, allBudgets, settings, formatCurrency, allTaxPayments]);


    return (
        <DataContext.Provider value={{ 
            user,
            transactions: filteredTransactions,
            goals: filteredGoals,
            subscriptions: filteredSubscriptions,
            debts: filteredDebts,
            fixedExpenses: filteredFixedExpenses,
            services: filteredServices,
            profiles: allProfiles,
            categories: allCategories,
            goalContributions: filteredGoalContributions,
            debtPayments: filteredDebtPayments,
            taxPayments: filteredTaxPayments,
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
            login,
            signup,
            logout,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addGoal,
            updateGoal,
            deleteGoal,
            addSubscription,
            updateSubscription,
            updateSubscriptionAmount,
            cancelSubscription,
            deleteSubscription,
            addDebt,
            updateDebt,
            deleteDebt,
            addFixedExpense,
            updateFixedExpense,
            deleteFixedExpense,
            addGoalContribution,
            addDebtPayment,
            paySubscription,
            addTaxPayment,
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
            addService,
            updateService,
            deleteService,
            addProfile,
            updateProfile,
            deleteProfile,
            getAllDataForMonth,
            formatCurrency,
            previewBackground,
            setPreviewBackground,
            addBankAccount,
            updateBankAccount,
            deleteBankAccount,
            addBankCard,
            updateBankCard,
            deleteBankCard,
            addReport,
            deleteReport,
            updateSettings,
        }}>
            {children}
        </DataContext.Provider>
    );
};
