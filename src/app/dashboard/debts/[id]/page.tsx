
'use client';
import { useParams } from 'next/navigation';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Banknote, HandCoins, Landmark, Percent, Scale } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function DebtDetailPage() {
    const { id } = useParams();
    const { debts, debtPayments, isLoading, formatCurrency } = useData();

    const debt = debts.find(d => d.id === id);
    const payments = debtPayments.filter(p => p.debtId === id);

    if (isLoading) {
        return <div>Cargando...</div>
    }

    if (!debt) {
        return <div>Deuda no encontrada</div>
    }

    const progress = (debt.paidAmount / debt.totalAmount) * 100;
    const remainingAmount = debt.totalAmount - debt.paidAmount;
    const paidInstallments = Math.floor(debt.paidAmount / debt.monthlyPayment);
    const isOverdue = isPast(debt.dueDate) && debt.paidAmount < debt.totalAmount;
    
    const getStatusBadge = () => {
         if (debt.paidAmount >= debt.totalAmount) {
            return <Badge variant="default" className="bg-blue-500/20 text-blue-500 border-blue-500/20">Pagada</Badge>
        }
        if (isOverdue) {
            return <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/20">Atrasada</Badge>
        }
        return <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/20">Al día</Badge>;
    }
    
    return (
        <div className="space-y-6">
             <div className="flex flex-col space-y-2">
                 <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">{debt.name}</h1>
                    {getStatusBadge()}
                 </div>
                <p className="text-muted-foreground">Detalle y progreso de tu deuda.</p>
             </div>
             
             <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                <KpiCard title="Monto Total" value={formatCurrency(debt.totalAmount)} icon={Scale} description="Monto original de la deuda"/>
                <KpiCard title="Monto Pagado" value={formatCurrency(debt.paidAmount)} icon={HandCoins} description="Suma de todos los abonos"/>
                <KpiCard title="Monto Restante" value={formatCurrency(remainingAmount)} icon={Banknote} description="Lo que queda por pagar"/>
                <KpiCard title="Cuota Mensual" value={formatCurrency(debt.monthlyPayment)} icon={Landmark} description={`Próximo vencimiento: ${format(debt.dueDate, "dd/MM/yyyy")}`}/>
                <KpiCard title="Cuotas Pagadas" value={`${paidInstallments} de ${debt.installments}`} icon={Percent} description="Total de cuotas pagadas"/>
             </div>

            <div>
                <p className="text-sm text-muted-foreground mb-1">{progress.toFixed(1)}% pagado</p>
                <Progress value={progress > 100 ? 100 : progress} className="h-2" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Abonos</CardTitle>
                    <CardDescription>
                        Todos los pagos realizados para esta deuda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Monto Abonado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length > 0 ? (
                                payments.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{format(new Date(payment.date), "dd/MM/yyyy")}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center">
                                        No se han realizado abonos para esta deuda.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    )
}
