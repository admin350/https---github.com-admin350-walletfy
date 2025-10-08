
'use client';
import { useMemo, useState } from "react";
import { useData } from "@/context/data-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ArrowDown, ArrowUp, Scale, Info, FileDown, HandCoins } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, getMonth, getYear } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PayTaxDialog } from "@/components/transactions/pay-tax-dialog";
import type { Transaction, TaxPayment } from "@/types";
import Link from "next/link";

export default function TaxesPage() {
    const { transactions, formatCurrency, isLoading, taxPayments, bankAccounts, filters } = useData();
    const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);

    const taxAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'tax' && (filters.profile === 'all' || acc.profile === filters.profile)), [bankAccounts, filters.profile]);

    const taxData = useMemo(() => {
        const relevantTransactions = filters.profile === 'all' 
            ? transactions 
            : transactions.filter((t: Transaction) => t.profile === filters.profile);

        const incomeWithTax = relevantTransactions.filter((t: Transaction) => t.type === 'income' && t.taxDetails);
        const expensesWithTax = relevantTransactions.filter((t: Transaction) => t.type === 'expense' && t.taxDetails);

        const totalDebit = incomeWithTax.reduce((sum: number, t: Transaction) => sum + (t.taxDetails?.amount || 0), 0);
        const totalCredit = expensesWithTax.reduce((sum: number, t: Transaction) => sum + (t.taxDetails?.amount || 0), 0);
        
        // Find the last payment to get the most recent remanente
        const sortedPayments = [...taxPayments]
            .filter(p => filters.profile === 'all' || p.profile === filters.profile)
            .sort((a, b) => new Date(b.year, b.month).getTime() - new Date(a.year, a.month).getTime());
        
        const lastRelevantPayment = sortedPayments.find(p => new Date(p.year, p.month) < new Date(filters.year, filters.month));
        
        const remanente = lastRelevantPayment?.remanente ?? 0;
        
        const adjustedDebit = totalDebit - remanente;
        const netTax = adjustedDebit - totalCredit;

        return { incomeWithTax, expensesWithTax, totalDebit, totalCredit, remanente, netTax };
    }, [transactions, taxPayments, filters.profile, filters.year, filters.month]); 
    
    const isCurrentPeriodPaid = useMemo(() => {
         const currentMonth = getMonth(new Date(filters.year, filters.month));
         const currentYear = getYear(new Date(filters.year, filters.month));
         return taxPayments.some((p: TaxPayment) => p.month === currentMonth && p.year === currentYear && (filters.profile === 'all' || p.profile === filters.profile));
    }, [taxPayments, filters]);

    const KpiSkeleton = () => (
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
    
    const KpiTooltip = ({ content }: { content: string }) => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs">{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Gestión Tributaria (IVA)</h1>
                    <p className="text-muted-foreground">
                        Resumen de tu débito y crédito fiscal para el perfil <span className="text-primary font-semibold">{filters.profile === 'all' ? 'Consolidado' : filters.profile}</span>.
                    </p>
                </div>
                 <Button disabled>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar a PDF (Deshabilitado)
                </Button>
            </div>
            
             <div className="grid gap-4 md:grid-cols-3">
                {isLoading ? (
                    <>
                        <KpiCard title="Débito Fiscal (Ventas)" value={<KpiSkeleton />} icon={ArrowUp} description="Cargando..." />
                        <KpiCard title="Crédito Fiscal (Compras)" value={<KpiSkeleton />} icon={ArrowDown} description="Cargando..." />
                        <KpiCard title="Impuesto a Pagar / Favor" value={<KpiSkeleton />} icon={Scale} description="Cargando..." />
                    </>
                ) : (
                    <>
                        <KpiCard 
                            title={
                                <div className="flex items-center">
                                    Débito Fiscal (Ventas)
                                    <KpiTooltip content="Es el impuesto (IVA) que has cobrado a tus clientes en tus ventas. Este es el dinero que le debes al fisco." />
                                </div>
                            }
                            value={<span className="text-red-400">{formatCurrency(taxData.totalDebit)}</span>} 
                            icon={ArrowUp} 
                            description={taxData.remanente > 0 ? `Remanente mes anterior: -${formatCurrency(taxData.remanente)}` : "Suma del IVA de tus ingresos."} 
                        />
                        <KpiCard 
                             title={
                                <div className="flex items-center">
                                    Crédito Fiscal (Compras)
                                    <KpiTooltip content="Es el impuesto (IVA) que has pagado en tus compras y gastos necesarios para operar. Puedes usarlo para descontar del Débito Fiscal." />
                                </div>
                            }
                            value={<span className="text-green-400">{formatCurrency(taxData.totalCredit)}</span>} 
                            icon={ArrowDown}
                            description="Suma del IVA de tus egresos." 
                        />
                        <KpiCard 
                             title={
                                <div className="flex items-center">
                                    Impuesto a Pagar / Favor
                                     <KpiTooltip content="Resultado de (Débito Fiscal - Crédito Fiscal - Remanente). Si es positivo, es el monto a pagar. Si es negativo, es un saldo a tu favor para el próximo período (remanente)." />
                                </div>
                            }
                            value={isCurrentPeriodPaid ? (
                                <span className="text-blue-400">Período Pagado</span>
                            ) : (
                               <span className={taxData.netTax >= 0 ? "text-primary" : "text-green-400"}>{formatCurrency(taxData.netTax)}</span>
                            )} 
                            icon={Scale}
                            description={isCurrentPeriodPaid ? "El impuesto de este período ya fue declarado." : (taxData.netTax >= 0 ? "Monto a pagar al fisco" : "Saldo a tu favor (remanente)")}
                        />
                    </>
                )}
            </div>

             {taxData.netTax > 0 && !isCurrentPeriodPaid && (
                 <Card className="bg-card/80 border-border/80">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                             <CardTitle>Declaración de Impuesto (F29)</CardTitle>
                            <CardDescription>
                                ¿Listo para pagar el impuesto de este período desde tu cartera tributaria?
                            </CardDescription>
                        </div>
                        <Button disabled={!taxAccount || (taxAccount.balance < taxData.netTax)} onClick={() => setIsPayDialogOpen(true)}>
                             <HandCoins className="mr-2 h-4 w-4" />
                            Pagar Impuesto (F29)
                        </Button>
                    </CardHeader>
                     {!taxAccount && (
                        <CardContent>
                             <p className="text-xs text-amber-400/80">Para pagar, primero debes configurar una <Link href="/dashboard/bank-accounts" className="underline">Cartera Tributaria</Link> para este perfil.</p>
                        </CardContent>
                    )}
                     {taxAccount && taxAccount.balance < taxData.netTax && (
                         <CardContent>
                             <p className="text-xs text-amber-400/80">Saldo insuficiente en Cartera Tributaria. Saldo actual: {formatCurrency(taxAccount.balance)}</p>
                        </CardContent>
                    )}
                 </Card>
             )}


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalle de Débito Fiscal (Ingresos)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Monto Neto</TableHead>
                                    <TableHead className="text-right">Monto Impuesto</TableHead>
                                    <TableHead className="text-right">Monto Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {taxData.incomeWithTax.length > 0 ? (
                                    taxData.incomeWithTax.map((t: Transaction) => {
                                        const netAmount = t.amount - (t.taxDetails?.amount || 0);
                                        return (
                                            <TableRow key={t.id}>
                                                <TableCell>{format(new Date(t.date), 'dd/MM/yy')}</TableCell>
                                                <TableCell>{t.description}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(netAmount)}</TableCell>
                                                <TableCell className="text-right font-medium text-red-400">{formatCurrency(t.taxDetails?.amount || 0)}</TableCell>
                                                <TableCell className="text-right font-semibold">{formatCurrency(t.amount)}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">No hay ingresos con impuestos registrados.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Detalle de Crédito Fiscal (Egresos)</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Monto Neto</TableHead>
                                    <TableHead className="text-right">Monto Impuesto</TableHead>
                                    <TableHead className="text-right">Monto Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {taxData.expensesWithTax.length > 0 ? (
                                    taxData.expensesWithTax.map((t: Transaction) => {
                                        const netAmount = t.amount - (t.taxDetails?.amount || 0);
                                        return (
                                            <TableRow key={t.id}>
                                                <TableCell>{format(new Date(t.date), 'dd/MM/yy')}</TableCell>
                                                <TableCell>{t.description}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(netAmount)}</TableCell>
                                                <TableCell className="text-right font-medium text-green-400">{formatCurrency(t.taxDetails?.amount || 0)}</TableCell>
                                                <TableCell className="text-right font-semibold">{formatCurrency(t.amount)}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">No hay egresos con impuestos registrados.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            {taxAccount && (
                 <PayTaxDialog 
                    open={isPayDialogOpen}
                    onOpenChange={setIsPayDialogOpen}
                    taxAccount={taxAccount}
                    amountToPay={taxData.netTax}
                    profile={filters.profile}
                    period={{ month: getMonth(new Date(filters.year, filters.month)), year: getYear(new Date(filters.year, filters.month)) }}
                 />
            )}
        </div>
    )
}
