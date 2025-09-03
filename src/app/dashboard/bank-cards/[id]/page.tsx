
'use client';
import { useContext } from 'react';
import { useParams } from 'next/navigation';
import { DataContext } from '@/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ArrowLeft, Banknote, CreditCard, Landmark, WalletCards } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function CardTransactionsTable({ cardId }: { cardId: string }) {
    const { transactions } = useContext(DataContext);
    const cardTransactions = transactions.filter(t => t.cardId === cardId);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {cardTransactions.length > 0 ? (
                    cardTransactions.map(t => (
                        <TableRow key={t.id}>
                            <TableCell>{format(new Date(t.date), 'dd/MM/yy')}</TableCell>
                            <TableCell>{t.description}</TableCell>
                            <TableCell>{t.category}</TableCell>
                            <TableCell className="text-right font-medium text-red-400">
                                -${t.amount.toLocaleString('es-CL')}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                            No hay transacciones para esta tarjeta en el período seleccionado.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}


export default function BankCardDetailPage() {
    const { id } = useParams();
    const { bankCards, bankAccounts, isLoading } = useContext(DataContext);

    const card = bankCards.find(c => c.id === id);
    const account = bankAccounts.find(a => a.id === card?.accountId);

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />
    }

    if (!card) {
        return <div>Tarjeta no encontrada</div>
    }

    const isCredit = card.cardType === 'credit';
    const usedAmount = card.usedAmount || 0;
    const creditLimit = card.creditLimit || 0;
    const availableAmount = creditLimit - usedAmount;
    const progress = creditLimit > 0 ? (usedAmount / creditLimit) * 100 : 0;
    const cardTypeText = {
        credit: "Crédito",
        debit: "Débito",
        prepaid: "Prepago"
    }
    
    return (
        <div className="space-y-6">
             <div className="flex items-center gap-4 mb-4">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button asChild variant="outline" size="icon">
                                <Link href="/dashboard/bank-cards">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Volver a Tarjetas</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                 <div className="flex flex-col">
                    <h1 className="text-2xl font-bold">{card.name}</h1>
                    <p className="text-muted-foreground">Detalle y movimientos de tu tarjeta {card.bank} terminada en {card.last4Digits}.</p>
                 </div>
             </div>
             
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Tipo de Tarjeta" value={cardTypeText[card.cardType]} icon={CreditCard} description={card.bank}/>
                <KpiCard title="Perfil Asociado" value={card.profile} icon={WalletCards} description={`Cuenta: ${account?.name || 'N/A'}`}/>
                {isCredit ? (
                    <>
                        <KpiCard title="Cupo Utilizado" value={<span className="text-red-400">${usedAmount.toLocaleString('es-CL')}</span>} icon={Banknote} iconClassName="text-red-400" description={`de $${creditLimit.toLocaleString('es-CL')}`}/>
                        <KpiCard title="Cupo Disponible" value={<span className="text-green-400">${availableAmount.toLocaleString('es-CL')}</span>} icon={Landmark} iconClassName="text-green-400" description="Cupo restante para compras"/>
                    </>
                ) : (
                    <KpiCard title="Saldo de Cuenta" value={<span className="text-green-400">${account?.balance.toLocaleString('es-CL') || '0'}</span>} icon={Landmark} iconClassName="text-green-400" description="Saldo de la cuenta de débito asociada."/>
                )}
             </div>

            {isCredit && (
                <div>
                    <div className='flex justify-between items-center mb-1'>
                        <p className="text-sm text-muted-foreground">{progress.toFixed(1)}% del cupo utilizado</p>
                        <p className="text-sm text-muted-foreground">Cupo Total: ${creditLimit.toLocaleString('es-CL')}</p>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Transacciones</CardTitle>
                    <CardDescription>
                        Todos los gastos realizados con esta tarjeta en el período seleccionado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CardTransactionsTable cardId={card.id} />
                </CardContent>
            </Card>

        </div>
    )
}
