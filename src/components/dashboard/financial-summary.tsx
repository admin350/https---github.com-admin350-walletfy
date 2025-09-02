
'use client';
import { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataContext } from '@/context/data-context';
import { CreditCard, Landmark, Repeat, TrendingDown } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';

export function FinancialSummary() {
    const { debts, transactions, goalContributions, subscriptions, isLoading } = useContext(DataContext);

    // Debt calculations
    const totalOwed = debts.reduce((acc, debt) => acc + debt.totalAmount, 0);
    const totalPaid = debts.reduce((acc, debt) => acc + debt.paidAmount, 0);
    const remainingDebt = totalOwed - totalPaid;
    const debtProgress = totalOwed > 0 ? (totalPaid / totalOwed) * 100 : 0;

    // Savings calculations
    const savingsTransactions = transactions.filter(t => t.type === 'transfer');
    const totalSavings = savingsTransactions.reduce((acc, t) => acc + t.amount, 0);
    const totalContributedToGoals = goalContributions.reduce((acc, c) => acc + c.amount, 0);
    const availableSavings = totalSavings - totalContributedToGoals;
    const savingsProgress = totalSavings > 0 ? (totalContributedToGoals / totalSavings) * 100 : 0;

    // Subscription calculations
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const totalMonthlyCost = activeSubscriptions.reduce((acc, sub) => acc + sub.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const expenseParticipation = totalExpenses > 0 ? (totalMonthlyCost / totalExpenses) * 100 : 0;

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
            <div className="flex justify-between text-sm">
                 <Skeleton className="h-4 w-1/2" />
                 <Skeleton className="h-4 w-1/3" />
            </div>
        </div>
    )

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
        )
    }


    return (
        <Card className="bg-card/50 border-border/50">
            <CardHeader>
                <CardTitle>Resumen Financiero</CardTitle>
                <CardDescription>Una vista consolidada de tus finanzas.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {/* Debts Summary */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-red-400">
                        <CreditCard className="h-5 w-5" />
                        <span>Resumen de Deudas</span>
                    </div>
                    <div>
                         <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Pagado</span>
                            <span>{debtProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={debtProgress} className="h-2 [&>div]:bg-red-400" />
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pagado: <span className="font-medium text-foreground">${totalPaid.toLocaleString('es-CL')}</span></span>
                        <span className="text-muted-foreground">Restante: <span className="font-medium text-foreground">${remainingDebt.toLocaleString('es-CL')}</span></span>
                    </div>
                </div>

                {/* Savings Summary */}
                <div className="space-y-2">
                     <div className="flex items-center gap-2 font-semibold text-emerald-400">
                        <Landmark className="h-5 w-5" />
                        <span>Resumen de Ahorros</span>
                    </div>
                     <div>
                         <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Aportado a Metas</span>
                            <span>{savingsProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={savingsProgress} className="h-2 [&>div]:bg-emerald-400" />
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Aportado: <span className="font-medium text-foreground">${totalContributedToGoals.toLocaleString('es-CL')}</span></span>
                        <span className="text-muted-foreground">Disponible: <span className="font-medium text-foreground">${availableSavings.toLocaleString('es-CL')}</span></span>
                    </div>
                </div>

                {/* Subscriptions Summary */}
                <div className="space-y-2">
                     <div className="flex items-center gap-2 font-semibold text-purple-400">
                        <Repeat className="h-5 w-5" />
                        <span>Resumen de Suscripciones</span>
                    </div>
                    <div className='bg-muted/50 p-3 rounded-lg flex items-start justify-between'>
                        <div>
                             <p className="text-sm text-muted-foreground">Gasto Mensual</p>
                             <p className="text-xl font-bold">${totalMonthlyCost.toLocaleString('es-CL')}</p>
                        </div>
                         <div>
                             <p className="text-sm text-muted-foreground text-right">Participación en Egresos</p>
                             <p className="text-xl font-bold text-right">{expenseParticipation.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
