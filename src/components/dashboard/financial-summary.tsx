
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { Landmark, Wallet, ArrowRightLeft, CreditCard, Repeat, Banknote, TrendingUp, Scale, Library, Building } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import type { Transaction, Debt, Subscription, GoalContribution, InvestmentContribution, BankAccount, BankCard, TangibleAsset } from '@/types';

export function FinancialSummary() {
    const { 
        bankAccounts,
        bankCards,
        goalContributions, 
        investmentContributions,
        debts,
        subscriptions,
        transactions,
        tangibleAssets,
        isLoading,
        formatCurrency
    } = useData();
    
    const savingsAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'savings'), [bankAccounts]);
    const investmentAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'investment'), [bankAccounts]);

    // Bank Accounts Calculation
    const totalBalance = bankAccounts.reduce((acc: number, account: BankAccount) => acc + account.balance, 0);

    // Bank Cards Calculation
    const creditCards = bankCards.filter((c: BankCard) => c.cardType === 'credit');
    const totalUsedAmountOnCards = creditCards.reduce((acc: number, card: BankCard) => acc + (card.usedAmount || 0), 0);
    const totalAvailableCreditOnCards = creditCards.reduce((acc: number, card: BankCard) => acc + ((card.creditLimit || 0) - (card.usedAmount || 0)), 0);

    // Credit Lines Calculation
    const accountsWithCreditLine = bankAccounts.filter((acc: BankAccount) => acc.hasCreditLine);
    const totalCreditLineUsed = accountsWithCreditLine.reduce((acc: number, account: BankAccount) => acc + (account.creditLineUsed || 0), 0);
    const totalCreditLineLimit = accountsWithCreditLine.reduce((acc: number, account: BankAccount) => acc + (account.creditLineLimit || 0), 0);
    const totalAvailableCreditLine = totalCreditLineLimit - totalCreditLineUsed;


    // Savings & Investment Calculations
    const totalSavings = savingsAccount?.balance ?? 0;
    const totalContributedToGoals = goalContributions.reduce((acc: number, c: GoalContribution) => acc + c.amount, 0);
    const availableSavings = totalSavings - totalContributedToGoals;

    const totalTransferredToInvestment = investmentAccount?.balance ?? 0;
    const totalContributedToAssets = investmentContributions.reduce((acc: number, c: InvestmentContribution) => acc + c.amount, 0);
    const availableToInvest = totalTransferredToInvestment - totalContributedToAssets;

    // Debts & Subscriptions Calculations
    const remainingDebt = debts.reduce((acc: number, debt: Debt) => acc + (debt.totalAmount - debt.paidAmount), 0);
    const totalMonthlySubscriptionCost = subscriptions
        .filter((s: Subscription) => s.status === 'active')
        .reduce((acc: number, sub: Subscription) => acc + sub.amount, 0);
        
    // Tangible Assets
    const totalAssetValue = tangibleAssets.reduce((acc: number, asset: TangibleAsset) => acc + asset.estimatedValue, 0);

    // Tax Calculation
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
                
                 {/* Bank Accounts */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-primary">
                        <Wallet className="h-5 w-5" />
                        <span>Cuentas Bancarias</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Balance Total:</span>
                        <span className="font-medium text-foreground">{formatCurrency(totalBalance)}</span>
                    </div>
                </div>

                {/* Tangible Assets */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-fuchsia-400">
                        <Building className="h-5 w-5" />
                        <span>Activos Tangibles</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valor Total de Activos:</span>
                        <span className="font-medium text-foreground">{formatCurrency(totalAssetValue)}</span>
                    </div>
                </div>


                {/* Bank Cards */}
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-orange-400">
                        <CreditCard className="h-5 w-5" />
                        <span>Tarjetas de Crédito</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Deuda Total:</span>
                        <span className="font-medium text-foreground">{formatCurrency(totalUsedAmountOnCards)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Crédito Disponible:</span>
                        <span className="font-medium text-foreground">{formatCurrency(totalAvailableCreditOnCards)}</span>
                    </div>
                </div>
                
                {/* Credit Lines */}
                {accountsWithCreditLine.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-amber-400">
                            <Library className="h-5 w-5" />
                            <span>Líneas de Crédito</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Cupo Utilizado Total:</span>
                            <span className="font-medium text-foreground">{formatCurrency(totalCreditLineUsed)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Cupo Disponible Total:</span>
                            <span className="font-medium text-foreground">{formatCurrency(totalAvailableCreditLine)}</span>
                        </div>
                    </div>
                )}

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
