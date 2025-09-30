
'use client';
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, PlusCircle, CreditCard, Receipt, Repeat } from "lucide-react";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { QuickAccess } from "@/components/dashboard/quick-access";
import type { Transaction } from "@/types";
import { BudgetWidget } from "@/components/budget/budget-widget";


export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const { transactions, isLoading, formatCurrency, filters, budgets } = useData();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalIncome = transactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((acc: number, t: Transaction) => acc + t.amount, 0);
    
  const totalExpenses = transactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((acc: number, t: Transaction) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const pageTitle = useMemo(() => {
    if (filters.month === -1) {
      return `Resumen Anual: ${filters.year}`;
    }
    const monthName = format(new Date(filters.year, filters.month), 'MMMM', { locale: es });
    return `Resumen de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}, ${filters.year}`;
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
            <div className="grid gap-4 md:grid-cols-3">
                {isLoading || !isClient ? (
                <>
                    <KpiCard title="Ingresos del Período" value={<KpiSkeleton />} icon={TrendingUp} description="Cargando..." />
                    <KpiCard title="Egresos del Período" value={<KpiSkeleton />} icon={TrendingDown} description="Cargando..." />
                    <KpiCard title="Balance Neto" value={<KpiSkeleton />} icon={DollarSign} description="Cargando..." />
                </>
                ) : (
                <>
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
                        title="Balance Neto" 
                        value={<span className={netBalance >= 0 ? 'text-green-500' : 'text-red-500'}>{formatCurrency(netBalance)}</span>} 
                        icon={DollarSign}
                        description="Ingresos - Egresos" 
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
