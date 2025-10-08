
'use client';
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, PlusCircle, CreditCard, Receipt, Repeat, History } from "lucide-react";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddDebtDialog } from "@/components/transactions/add-debt-dialog";
import { AddSubscriptionDialog } from "@/components/transactions/add-subscription-dialog";
import { useState, useEffect, useMemo } from "react";
import { AddFixedExpenseDialog } from "@/components/transactions/add-fixed-expense-dialog";
import { useData } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { DebtsOverviewChart } from "@/components/dashboard/debts-overview-chart";
import { GoalsSummaryChart } from "@/components/dashboard/goals-summary-chart";
import { format, startOfYear, getYear, getMonth } from "date-fns";
import { es } from "date-fns/locale";
import { QuickAccess } from "@/components/dashboard/quick-access";
import type { Transaction, BankAccount } from "@/types";
import { BudgetWidget } from "@/components/budget/budget-widget";


export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const { transactions, allTransactions, isLoading, formatCurrency, filters, budgets, bankAccounts } = useData();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { totalIncome, totalExpenses, previousBalance } = useMemo(() => {
    const income = transactions
      .filter((t: Transaction) => t.type === 'income')
      .reduce((acc: number, t: Transaction) => acc + t.amount, 0);
      
    const expenses = transactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((acc: number, t: Transaction) => acc + t.amount, 0);

    const getPeriodStartDate = () => {
        const now = new Date();
        const year = filters.year ?? getYear(now);
        const month = filters.month ?? getMonth(now);

        if (month >= 0) {
            return new Date(year, month, 1);
        }
        if (month === -1) { // Whole year
            return startOfYear(new Date(year, 0));
        }
        // Quarters
        if (month === -2) return new Date(year, 0, 1); // Q1
        if (month === -3) return new Date(year, 3, 1); // Q2
        if (month === -4) return new Date(year, 6, 1); // Q3
        if (month === -5) return new Date(year, 9, 1); // Q4
        return new Date(year, 0, 1); // Default to start of year
    };
    
    const periodStartDate = getPeriodStartDate();
    
    const filteredProfiles = filters.profile === 'all' 
      ? null 
      : filters.profile;

    const priorTransactions = allTransactions.filter(t => {
      const isBefore = new Date(t.date) < periodStartDate;
      const matchesProfile = !filteredProfiles || t.profile === filteredProfiles;
      return isBefore && matchesProfile && t.type !== 'transfer';
    });
    
    const prevBalance = priorTransactions.reduce((acc, t) => {
        if (t.type === 'income') return acc + t.amount;
        if (t.type === 'expense') return acc - t.amount;
        return acc;
    }, 0);

    return { totalIncome: income, totalExpenses: expenses, previousBalance: prevBalance };
  }, [transactions, allTransactions, filters]);
  
  const accumulatedBalance = bankAccounts
      .filter(acc => filters.profile === 'all' || acc.profile === filters.profile)
      .reduce((acc: number, account: BankAccount) => acc + account.balance, 0);


  const pageTitle = useMemo(() => {
    const year = filters.year;
    switch (filters.month) {
        case -1: return `Resumen Anual: ${year}`;
        case -2: return `Resumen Q1 (Ene-Mar), ${year}`;
        case -3: return `Resumen Q2 (Abr-Jun), ${year}`;
        case -4: return `Resumen Q3 (Jul-Sep), ${year}`;
        case -5: return `Resumen Q4 (Oct-Dic), ${year}`;
        default:
            const monthName = format(new Date(year, filters.month), 'MMMM', { locale: es });
            return `Resumen de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}, ${year}`;
    }
}, [filters]);


  const favoriteBudget = useMemo(() => {
    if (!budgets || budgets.length === 0) return null;
    const fav = budgets.find(b => b.isFavorite);
    return fav ? [fav] : [budgets[0]]; // Show first if no favorite is set
  }, [budgets]);

  const KpiSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">{pageTitle}</h1>
          </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-1 space-y-6">
            <FinancialSummary />
            <Card>
                <CardHeader>
                  <CardTitle>Resumen de Deudas</CardTitle>
                  <CardDescription>
                    Visualización del monto total de tus deudas activas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DebtsOverviewChart />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Metas</CardTitle>
                  <CardDescription>
                    Visualización del progreso de tus metas de ahorro activas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GoalsSummaryChart />
                </CardContent>
              </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading || !isClient ? (
                  Array.from({ length: 4 }).map((_, i) => <KpiCard key={i} title={<Skeleton className="h-4 w-20"/>} value={<KpiSkeleton />} icon={DollarSign} description="" />)
                ) : (
                <>
                    <KpiCard
                        title="Saldo Período Anterior"
                        value={<span className={previousBalance >= 0 ? 'text-gray-400' : 'text-orange-400'}>{formatCurrency(previousBalance)}</span>} 
                        icon={History}
                        description="Balance neto de períodos pasados."
                    />
                    <KpiCard 
                        title="Ingresos del Período" 
                        value={<span className="text-green-500">{formatCurrency(totalIncome)}</span>} 
                        icon={TrendingUp} 
                        description="Suma de ingresos en el período." 
                    />
                    <KpiCard 
                        title="Egresos del Período" 
                        value={<span className="text-red-500">{formatCurrency(totalExpenses)}</span>} 
                        icon={TrendingDown}
                        description={`${totalIncome > 0 ? ((totalExpenses/totalIncome)*100).toFixed(1) : 0}% del ingreso`} 
                    />
                    <KpiCard 
                        title="Balance Acumulado" 
                        value={<span className={accumulatedBalance >= 0 ? 'text-primary' : 'text-red-500'}>{formatCurrency(accumulatedBalance)}</span>} 
                        icon={DollarSign}
                        description="Balance total real de todas tus cuentas" 
                    />
                </>
                )}
            </div>
            
            <QuickAccess />

            <Card>
                <CardHeader>
                    <CardTitle>Destino Real de tus Ingresos (Período Actual)</CardTitle>
                    <CardDescription>
                        Ingresos del período: <span className="font-bold text-primary">{formatCurrency(totalIncome)}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ExpenseChart />
                </CardContent>
            </Card>

              <CashflowChart />

          </div>

          <div className="lg:col-span-1 space-y-6">
              {favoriteBudget && (
                 <Card className="bg-card/80 border-border/80">
                   <CardHeader>
                      <CardTitle>Seguimiento de Presupuesto Favorito</CardTitle>
                      <CardDescription>
                          Un vistazo rápido a tu plan presupuestario principal para el período actual.
                      </CardDescription>
                  </CardHeader>
                   <CardContent>
                      <BudgetWidget budgets={favoriteBudget} isLoading={isLoading} />
                   </CardContent>
                 </Card>
              )}
              <RecentTransactions />
          </div>
        </div>


        <div className="fixed bottom-6 right-6">
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button size="lg" className="rounded-full shadow-lg h-16 w-16">
                      <PlusCircle className="h-8 w-8" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mb-2">
                  <AddTransactionDialog>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Receipt className="mr-2 h-4 w-4" />
                          Añadir Transacción
                      </DropdownMenuItem>
                  </AddTransactionDialog>
                  <AddDebtDialog>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Añadir Deuda
                      </DropdownMenuItem>
                  </AddDebtDialog>
                  <AddSubscriptionDialog>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <PiggyBank className="mr-2 h-4w-4" />
                          Añadir Suscripción
                      </DropdownMenuItem>
                  </AddSubscriptionDialog>
                  <AddFixedExpenseDialog>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Repeat className="mr-2 h-4 w-4" />
                          Añadir Gasto Fijo
                      </DropdownMenuItem>
                  </AddFixedExpenseDialog>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
