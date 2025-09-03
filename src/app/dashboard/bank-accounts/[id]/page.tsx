
'use client';
import { useContext, useState } from 'react';
import { useParams } from 'next/navigation';
import { DataContext } from '@/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Banknote, Building, Landmark, User, Copy, Check } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';


function AccountTransactionsTable({ accountId }: { accountId: string }) {
    const { transactions } = useContext(DataContext);
    const accountTransactions = transactions.filter(t => t.accountId === accountId);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {accountTransactions.length > 0 ? (
                    accountTransactions.map((t: Transaction) => (
                        <TableRow key={t.id}>
                            <TableCell>{format(new Date(t.date), 'dd/MM/yy')}</TableCell>
                            <TableCell>{t.description}</TableCell>
                            <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                            <TableCell>
                                {t.type === 'income' ? <ArrowUpRight className="h-5 w-5 text-green-500" /> : <ArrowDownLeft className="h-5 w-5 text-red-500" />}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-CL')}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            No hay transacciones para esta cuenta en el período seleccionado.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

const CopyableKpiCard = ({ title, value, copyValue, icon: Icon, iconClassName }: { title: string, value: string, copyValue: string, icon: any, iconClassName?: string }) => {
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(copyValue);
        setIsCopied(true);
        toast({ title: '¡Copiado!', description: 'Número de cuenta copiado al portapapeles.' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle as="h3" className="text-sm font-medium">{title}</CardTitle>
                <Icon className={iconClassName} />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{value}</div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
                                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copiar número de cuenta</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
};


export default function BankAccountDetailPage() {
    const { id } = useParams();
    const { bankAccounts, isLoading } = useContext(DataContext);

    const account = bankAccounts.find(c => c.id === id);

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />
    }

    if (!account) {
        return <div>Cuenta no encontrada</div>
    }

    return (
        <div className="space-y-6">
             <div className="flex items-center gap-4 mb-4">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button asChild variant="outline" size="icon">
                                <Link href="/dashboard/bank-accounts">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Volver a Cuentas</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                 <div className="flex flex-col">
                    <h1 className="text-2xl font-bold">{account.name}</h1>
                    <p className="text-muted-foreground">Detalle y movimientos de tu cuenta {account.bank}.</p>
                 </div>
             </div>
             
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Saldo Actual" value={<span className="text-primary">${account.balance.toLocaleString('es-CL')}</span>} icon={Landmark} iconClassName="text-primary" description="Dinero disponible en la cuenta"/>
                <CopyableKpiCard title="Banco" value={account.bank} copyValue={account.accountNumber} icon={Building} iconClassName="text-blue-400" />
                <KpiCard title="Tipo de Cuenta" value={account.accountType} icon={Banknote} iconClassName="text-green-400" />
                <KpiCard title="Perfil Asociado" value={account.profile} icon={User} iconClassName="text-purple-400" />
             </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Transacciones</CardTitle>
                    <CardDescription>
                        Todos los movimientos asociados a esta cuenta en el período seleccionado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AccountTransactionsTable accountId={account.id as string} />
                </CardContent>
            </Card>

        </div>
    )
}
