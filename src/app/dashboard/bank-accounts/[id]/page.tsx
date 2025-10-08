
'use client';
import { useParams } from 'next/navigation';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Banknote, Building, Landmark, User, Library, HandCoins, TrendingDown } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function AccountTransactionsTable({ accountId }: { accountId: string }) {
    const { transactions, formatCurrency } = useData();
    const accountTransactions = transactions.filter((t: Transaction) => 
        (t.accountId === accountId && !t.isCreditLinePayment) || 
        (t.type === 'transfer' && t.destinationAccountId === accountId)
    );

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
                                {t.type === 'income' || (t.type === 'transfer' && t.destinationAccountId === accountId) ? <ArrowUpRight className="h-5 w-5 text-green-500" /> : <ArrowDownLeft className="h-5 w-5 text-red-500" />}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${t.type === 'income' || (t.type === 'transfer' && t.destinationAccountId === accountId) ? 'text-green-400' : 'text-red-400'}`}>
                                {t.type === 'income' || (t.type === 'transfer' && t.destinationAccountId === accountId) ? '+' : '-'}{formatCurrency(t.amount)}
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

function CreditLineTransactionsTable({ accountId }: { accountId: string }) {
    const { transactions, formatCurrency } = useData();
    const creditLineTransactions = transactions.filter((t: Transaction) => t.isCreditLinePayment && t.accountId === accountId);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Monto Utilizado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {creditLineTransactions.length > 0 ? (
                    creditLineTransactions.map((t: Transaction) => (
                        <TableRow key={t.id}>
                            <TableCell>{format(new Date(t.date), 'dd/MM/yy')}</TableCell>
                            <TableCell>{t.description}</TableCell>
                            <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                            <TableCell className="text-right font-medium text-red-400">
                                -{formatCurrency(t.amount)}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                            No se han realizado gastos con la línea de crédito para esta cuenta.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}


export default function BankAccountDetailPage() {
    const { id } = useParams();
    const { bankAccounts, isLoading, formatCurrency } = useData();

    const account = bankAccounts.find(c => c.id === id);

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />
    }

    if (!account) {
        return <div>Cuenta no encontrada</div>
    }

    const creditLineAvailable = (account.creditLineLimit || 0) - (account.creditLineUsed || 0);
    const creditLineProgress = account.creditLineLimit ? ((account.creditLineUsed || 0) / account.creditLineLimit) * 100 : 0;

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
                    <h1 className="text-xl font-bold">{account.name}</h1>
                    <p className="text-muted-foreground">Detalle y movimientos de tu cuenta {account.bank}.</p>
                 </div>
             </div>
             
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Saldo Actual" value={<span className="text-primary">{formatCurrency(account.balance)}</span>} icon={Landmark} description="Dinero disponible en la cuenta"/>
                <KpiCard title="Número de Cuenta" value={account.accountNumber} icon={Building} description={account.bank} />
                <KpiCard title="Tipo de Cuenta" value={account.accountType} icon={Banknote} description="Tipo de producto bancario" />
                <KpiCard title="Perfil Asociado" value={account.profile} icon={User} description="Perfil financiero al que pertenece"/>
             </div>
             
             {account.hasCreditLine && account.creditLineLimit && (
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2"><Library className="h-5 w-5 text-amber-400"/>Línea de Crédito</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <KpiCard title="Cupo Total" value={formatCurrency(account.creditLineLimit)} icon={Library} description="Límite total aprobado"/>
                            <KpiCard title="Cupo Utilizado" value={<span className="text-red-400">{formatCurrency(account.creditLineUsed || 0)}</span>} icon={TrendingDown} description="Monto que has utilizado"/>
                            <KpiCard title="Cupo Disponible" value={<span className="text-green-400">{formatCurrency(creditLineAvailable)}</span>} icon={HandCoins} description="Lo que te queda por usar"/>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">{creditLineProgress.toFixed(1)}% del cupo utilizado</p>
                            <Progress value={creditLineProgress > 100 ? 100 : creditLineProgress} className="h-2 [&>div]:bg-amber-400" />
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Movimientos</CardTitle>
                    <CardDescription>
                        Todos los movimientos asociados a esta cuenta y su línea de crédito.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Tabs defaultValue="account">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="account">Movimientos de la Cuenta</TabsTrigger>
                            <TabsTrigger value="creditLine" disabled={!account.hasCreditLine}>Línea de Crédito</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account" className="mt-4">
                            <AccountTransactionsTable accountId={account.id as string} />
                        </TabsContent>
                        <TabsContent value="creditLine" className="mt-4">
                             {account.hasCreditLine ? (
                                <CreditLineTransactionsTable accountId={account.id as string} />
                            ) : (
                                <p className="text-center text-muted-foreground py-10">
                                    Esta cuenta no tiene una línea de crédito activa.
                                </p>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

        </div>
    )
}
