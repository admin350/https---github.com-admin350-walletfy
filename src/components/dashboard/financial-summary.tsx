

'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { Landmark, Wallet, CreditCard, Banknote, TrendingUp, Scale, Library, Building } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import type { BankAccount, BankCard, Debt, GoalContribution, InvestmentContribution, Subscription, TangibleAsset, Transaction } from '@/types';

export function FinancialSummary() {
    const { 
        bankAccounts,
        bankCards,
        debts,
        goals,
        investments,
        subscriptions,
        tangibleAssets,
        isLoading,
        formatCurrency,
        filters,
    } = useData();
    
    const filteredData = useMemo(() => {
        const profileFilter = (item: { profile: string }) => filters.profile === 'all' || item.profile === filters.profile;

        const fBankAccounts = bankAccounts.filter(profileFilter);
        const fBankCards = bankCards.filter(profileFilter);
        const fDebts = debts.filter(profileFilter);
        const fGoals = goals.filter(profileFilter);
        const fInvestments = investments.filter(profileFilter);
        const fSubscriptions = subscriptions.filter(profileFilter);
        const fTangibleAssets = tangibleAssets.filter(profileFilter);

        // Bank Accounts (main purpose)
        const mainAccounts = fBankAccounts.filter(acc => acc.purpose === 'main');
        const mainBalance = mainAccounts.reduce((acc, account) => acc + account.balance, 0);

        // Credit Cards
        const creditCards = fBankCards.filter(c => c.cardType === 'credit');
        const totalUsedOnCards = creditCards.reduce((acc, card) => acc + (card.usedAmount || 0), 0);

        // Debts
        const remainingDebt = fDebts.reduce((acc, debt) => acc + (debt.totalAmount - debt.paidAmount), 0);
        
        // Tangible Assets
        const totalAssetValue = fTangibleAssets.reduce((acc, asset) => acc + asset.estimatedValue, 0);

        // Investments
        const totalInvested = fInvestments.filter(i => i.purpose === 'investment').reduce((acc, inv) => acc + inv.currentValue, 0);
        
        // Savings
        const savingsAccounts = fBankAccounts.filter(acc => acc.purpose === 'savings');
        const savingsBalance = savingsAccounts.reduce((acc, account) => acc + account.balance, 0);
        const totalSavedInGoals = fGoals.reduce((acc, goal) => acc + goal.currentAmount, 0);
        const totalSavedInInstruments = fInvestments.filter(i => i.purpose === 'saving').reduce((acc, inv) => acc + inv.currentValue, 0);

        // Total Net Worth
        const totalAssets = mainBalance + totalAssetValue + totalInvested + savingsBalance + totalSavedInInstruments;
        const totalLiabilities = totalUsedOnCards + remainingDebt;
        const netWorth = totalAssets - totalLiabilities;
        
        return {
            mainBalance,
            netWorth,
        }

    }, [filters.profile, bankAccounts, bankCards, debts, goals, investments, subscriptions, tangibleAssets]);


    const SummarySkeleton = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-32" />
            </div>
            <div className='space-y-2'>
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Resumen Financiero</CardTitle>
                    <CardDescription>Una vista consolidada de tus finanzas.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <SummarySkeleton />
                    <SummarySkeleton />
                    <SummarySkeleton />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumen de Patrimonio</CardTitle>
                <CardDescription>Activos vs. Pasivos del perfil seleccionado.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                 {/* Total Net Worth */}
                 <div className="space-y-2 border-b pb-4">
                    <div className="flex items-center gap-2 font-semibold text-primary">
                        <Scale className="h-5 w-5" />
                        <span>Patrimonio Neto Total</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Activos - Pasivos</span>
                        <span className="font-medium text-foreground">{formatCurrency(filteredData.netWorth)}</span>
                    </div>
                </div>

                 {/* Cash */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-sky-400">
                        <Wallet className="h-5 w-5" />
                        <span>Dinero en Cuentas (Uso Principal)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Balance Disponible:</span>
                        <span className="font-medium text-foreground">{formatCurrency(filteredData.mainBalance)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
