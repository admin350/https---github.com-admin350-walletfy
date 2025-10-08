
'use client';
import { useMemo } from 'react';
import { useData } from '@/context/data-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import type { Transaction } from '@/types';

export function SavingsPortfolioDataTable() {
    const { transactions, formatCurrency, bankAccounts } = useData();
    
    const savingsAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'savings'), [bankAccounts]);
    
    const savingsTransactions = useMemo(() => {
        if (!savingsAccount) return [];
        return transactions.filter((t: Transaction) => 
            t.type === 'transfer' && t.destinationAccountId === savingsAccount.id
        );
    }, [transactions, savingsAccount]);

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Desde Cuenta</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {savingsTransactions.length > 0 ? (
                        savingsTransactions.map(t => {
                            const sourceAccount = bankAccounts.find(acc => acc.id === t.accountId);
                            return (
                                <TableRow key={t.id}>
                                    <TableCell>{format(new Date(t.date), "dd/MM/yyyy")}</TableCell>
                                    <TableCell>{t.description}</TableCell>
                                    <TableCell>{sourceAccount?.name || 'N/A'}</TableCell>
                                    <TableCell className="text-right font-medium text-green-400">
                                        +{formatCurrency(t.amount)}
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No hay transferencias a tu cartera de ahorros.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
