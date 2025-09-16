
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { Landmark, Wallet, ArrowRightLeft, CreditCard, Repeat, Banknote, TrendingUp, Scale } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import type { Transaction, Debt, Subscription, GoalContribution, InvestmentContribution } from '@/types';

export function FinancialSummary() {
    const { 
        bankAccounts,
        goalContributions, 
        investmentContributions,
        debts,
        subscriptions,
        transactions,
        isLoading,
        formatCurrency
    } = useData();
    
    const savingsAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'savings'), [bankAccounts]);
    const investmentAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'investment'), [bankAccounts]);

    // Calculations now respect filters as they use filtered data from context
    const totalSavings = savingsAccount?.balance ?? 0;
    const totalContributedToGoals = goalContributions.reduce((acc: number, c: GoalContribution) => acc + c.amount, 0);
    const availableSavings = totalSavings - totalContributedToGoals;

    const totalTransferredToInvestment = investmentAccount?.balance ?? 0;
    const totalContributedToAssets = investmentContributions.reduce((acc: number, c: InvestmentContribution) => acc + c.amount, 0);
    const availableToInvest = totalTransferredToInvestment - totalContributedToAssets;

    const remainingDebt = debts.reduce((acc: number, debt: Debt) => acc + (debt.totalAmount - debt.paidAmount), 0);
    const totalMonthlySubscriptionCost = subscriptions
        .filter((s: Subscription) => s.status === 'active')
        .reduce((acc: number, sub: Subscription) => acc + sub.amount, 0);
        
    const taxData = useMemo(() => {
        const incomeWithTax = transactions.filter((t: Transaction) => t.type === 'income' && t.taxDetails);
        const expensesWithTax = transactions.filter((t: Transaction) => t.type === 'expense' && t.taxDetails);

        const totalDebit = incomeWithTax.reduce((sum: number, t: Transaction) => sum + (t.taxDetails?.amount || 0), 0);
        const totalCredit = expensesWithTax.reduce((sum: number, t: Transaction) => sum + (t.taxDetails?.amount || 0), 0);
        const netTax = totalDebit - totalCredit;

        return { totalDebit, totalCredit, netTax };
    }, [transactions]);


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
                {savingsAccount && (
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
                )}

                {/* Investment Portfolio */}
                {investmentAccount && (
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
                )}

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

                {/* Taxes Summary */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-teal-400">
                        <Scale className="h-5 w-5" />
                        <span>Resumen de Impuestos (IVA)</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Débito Fiscal (Ventas):</span>
                        <span className="font-medium text-foreground">{formatCurrency(taxData.totalDebit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Crédito Fiscal (Compras):</span>
                        <span className="font-medium text-foreground">{formatCurrency(taxData.totalCredit)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                        <span className="text-muted-foreground">{taxData.netTax >= 0 ? 'Impuesto a Pagar:' : 'Saldo a Favor:'}</span>
                        <span className={taxData.netTax >= 0 ? 'text-primary' : 'text-green-400'}>
                            {formatCurrency(Math.abs(taxData.netTax))}
                        </span>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
