
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { Wallet, Scale, TrendingUp, TrendingDown, Landmark, Building, Briefcase } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function FinancialSummary() {
    const { 
        bankAccounts,
        bankCards,
        debts,
        investments,
        tangibleAssets,
        isLoading,
        formatCurrency,
        filters,
    } = useData();
    
    const summary = useMemo(() => {
        const profileFilter = (item: { profile: string }) => filters.profile === 'all' || item.profile === filters.profile;

        const fBankAccounts = bankAccounts.filter(profileFilter);
        const fBankCards = bankCards.filter(profileFilter);
        const fDebts = debts.filter(profileFilter);
        const fInvestments = investments.filter(profileFilter);
        const fTangibleAssets = tangibleAssets.filter(profileFilter);

        // Asset Calculation
        const totalAccountBalances = fBankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalInvestmentValues = fInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
        const totalTangibleAssetValues = fTangibleAssets.reduce((sum, asset) => sum + asset.estimatedValue, 0);
        const totalAssets = totalAccountBalances + totalInvestmentValues + totalTangibleAssetValues;

        // Liability Calculation
        const totalCreditCardDebt = fBankCards.filter(c => c.cardType === 'credit').reduce((sum, card) => sum + (card.usedAmount || 0), 0);
        const totalRemainingDebt = fDebts.reduce((sum, debt) => sum + (debt.totalAmount - debt.paidAmount), 0);
        const totalLiabilities = totalCreditCardDebt + totalRemainingDebt;

        // Net Worth
        const netWorth = totalAssets - totalLiabilities;
        
        return {
            totalAssets,
            totalLiabilities,
            netWorth,
            liquidAssets: totalAccountBalances,
            investedAssets: totalInvestmentValues,
            tangibleAssets: totalTangibleAssetValues,
        }

    }, [filters.profile, bankAccounts, bankCards, debts, investments, tangibleAssets]);


    const SummarySkeleton = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="w-full space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Resumen de Patrimonio</CardTitle>
                    <CardDescription>Activos vs. Pasivos del perfil seleccionado.</CardDescription>
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
            <CardContent className="grid gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 font-semibold text-primary">
                        <Scale className="h-5 w-5" />
                        <span>Patrimonio Neto Total</span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm">
                        <span className="text-muted-foreground">Activos - Pasivos</span>
                        <span className="font-bold text-2xl text-foreground">{formatCurrency(summary.netWorth)}</span>
                    </div>
                </div>

                 <div className="space-y-4 border-t border-border/50 pt-4">
                    <div className="flex items-center gap-3 font-semibold text-green-400">
                        <TrendingUp className="h-5 w-5" />
                        <span>Total Activos: {formatCurrency(summary.totalAssets)}</span>
                    </div>
                    <div className="pl-8 space-y-2 text-sm">
                         <div className="flex justify-between items-center">
                            <span className="flex items-center gap-2 text-muted-foreground"><Landmark className="h-4 w-4"/>Liquidez</span>
                            <span className="font-medium">{formatCurrency(summary.liquidAssets)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4"/>Invertido</span>
                            <span className="font-medium">{formatCurrency(summary.investedAssets)}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="flex items-center gap-2 text-muted-foreground"><Building className="h-4 w-4"/>Tangible</span>
                            <span className="font-medium">{formatCurrency(summary.tangibleAssets)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 border-t border-border/50 pt-4">
                    <div className="flex items-center gap-3 font-semibold text-red-400">
                        <TrendingDown className="h-5 w-5" />
                        <span>Total Pasivos: {formatCurrency(summary.totalLiabilities)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
