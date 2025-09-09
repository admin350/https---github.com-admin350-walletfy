
'use client';
import { useMemo } from "react";
import { useData } from "@/context/data-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ArrowDown, ArrowUp, Scale, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TaxesPage() {
    const { transactions, formatCurrency, isLoading } = useData();

    const taxData = useMemo(() => {
        const incomeWithTax = transactions.filter(t => t.type === 'income' && t.taxDetails);
        const expensesWithTax = transactions.filter(t => t.type === 'expense' && t.taxDetails);

        const totalDebit = incomeWithTax.reduce((sum, t) => sum + (t.taxDetails?.amount || 0), 0);
        const totalCredit = expensesWithTax.reduce((sum, t) => sum + (t.taxDetails?.amount || 0), 0);
        const netTax = totalDebit - totalCredit;

        return { incomeWithTax, expensesWithTax, totalDebit, totalCredit, netTax };
    }, [transactions]);

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
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Gestión Tributaria (IVA)</h1>
                <p className="text-muted-foreground">
                    Resumen de tu débito y crédito fiscal para el período seleccionado.
                </p>
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
                            iconClassName="text-red-400"
                            description="Suma del IVA de tus ingresos." 
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
                            iconClassName="text-green-400"
                            description="Suma del IVA de tus egresos." 
                        />
                        <KpiCard 
                             title={
                                <div className="flex items-center">
                                    Impuesto a Pagar / Favor
                                     <KpiTooltip content="Resultado de (Débito Fiscal - Crédito Fiscal). Si es positivo, es el monto a pagar. Si es negativo, es un saldo a tu favor para el próximo período (remanente)." />
                                </div>
                            }
                            value={<span className={taxData.netTax >= 0 ? "text-primary" : "text-green-400"}>{formatCurrency(taxData.netTax)}</span>} 
                            icon={Scale}
                            iconClassName={taxData.netTax >= 0 ? "text-primary" : "text-green-400"}
                            description={taxData.netTax >= 0 ? "Monto a pagar al fisco" : "Saldo a tu favor (remanente)"}
                        />
                    </>
                )}
            </div>

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
                                    <TableHead className="text-right">Monto Total</TableHead>
                                    <TableHead className="text-right">Monto Impuesto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {taxData.incomeWithTax.length > 0 ? (
                                    taxData.incomeWithTax.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>{format(new Date(t.date), 'dd/MM/yy')}</TableCell>
                                            <TableCell>{t.description}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(t.amount)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(t.taxDetails?.amount || 0)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">No hay ingresos con impuestos registrados.</TableCell>
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
                                    <TableHead className="text-right">Monto Total</TableHead>
                                    <TableHead className="text-right">Monto Impuesto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {taxData.expensesWithTax.length > 0 ? (
                                    taxData.expensesWithTax.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>{format(new Date(t.date), 'dd/MM/yy')}</TableCell>
                                            <TableCell>{t.description}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(t.amount)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(t.taxDetails?.amount || 0)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">No hay egresos con impuestos registrados.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
