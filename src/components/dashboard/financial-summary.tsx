
'use client';
import { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataContext } from '@/context/data-context';
import { Landmark, Wallet, ArrowRightLeft, CreditCard, Repeat, Banknote, TrendingUp } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function FinancialSummary() {
    const { 
        transactions, 
        goalContributions, 
        investmentContributions,
        debts,
        subscriptions,
        isLoading,
        formatCurrency
    } = useContext(DataContext);

    // Calculations now respect filters as they use filtered data from context
    const totalSavings = transactions.filter(t => t.type === 'transfer').reduce((acc, t) => acc + t.amount, 0);
    const totalContributedToGoals = goalContributions.reduce((acc, c) => acc + c.amount, 0);
    const availableSavings = totalSavings - totalContributedToGoals;

    const totalTransferredToInvestment = transactions.filter(t => t.type === 'transfer-investment').reduce((acc, t) => acc + t.amount, 0);
    const totalContributedToAssets = investmentContributions.reduce((acc, c) => acc + c.amount, 0);
    const availableToInvest = totalTransferredToInvestment - totalContributedToAssets;

    const remainingDebt = debts.reduce((acc, debt) => acc + (debt.totalAmount - debt.paidAmount), 0);
    const totalMonthlySubscriptionCost = subscriptions
        .filter(s => s.status === 'active')
        .reduce((acc, sub) => acc + sub.amount, 0);

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
            <Card className="bg-card/50 border-border/50">
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
        <Card className="bg-card/50 border-border/50">
            <CardHeader>
                <CardTitle>Resúmenes Clave</CardTitle>
                <CardDescription>Vistas consolidadas de tus carteras, deudas y suscripciones.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                
                {/* Savings Portfolio */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-emerald-400">
                        <Landmark className="h-5 w-5" />
                        <span>Cartera de Ahorro</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Disponible:</span>
                        <span className="font-medium text-foreground">{formatCurrency(availableSavings)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Destinado a Metas:</span>
                        <span className="font-medium text-foreground">{formatCurrency(totalContributedToGoals)}</span>
                    </div>
                </div>

                {/* Investment Portfolio */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-blue-400">
                        <TrendingUp className="h-5 w-5" />
                        <span>Cartera de Inversión</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Disponible:</span>
                        <span className="font-medium text-foreground">{formatCurrency(availableToInvest)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Invertido en Activos:</span>
                        <span className="font-medium text-foreground">{formatCurrency(totalContributedToAssets)}</span>
                    </div>
                </div>

                {/* Debts & Subscriptions */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-red-400">
                        <Banknote className="h-5 w-5" />
                        <span>Deudas y Suscripciones</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Deuda Restante:</span>
                        <span className="font-medium text-foreground">{formatCurrency(remainingDebt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gasto Mensual en Suscripciones:</span>
                        <span className="font-medium text-foreground">{formatCurrency(totalMonthlySubscriptionCost)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
