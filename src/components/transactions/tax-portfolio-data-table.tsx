'use client';
import { useMemo } from 'react';
import { useData } from '@/context/data-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import type { Transaction } from '@/types';

export function TaxPortfolioDataTable() {
    const { transactions, formatCurrency, bankAccounts } = useData();
    
    const taxAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'tax'), [bankAccounts]);
    
    const taxTransactions = useMemo(() => {
        if (!taxAccount) return [];
        return transactions.filter((t: Transaction) => 
            t.type === 'transfer' && t.destinationAccountId === taxAccount.id
        );
    }, [transactions, taxAccount]);

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
                    {taxTransactions.length > 0 ? (
                        taxTransactions.map(t => {
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
                                No hay transferencias a tu cartera tributaria.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
