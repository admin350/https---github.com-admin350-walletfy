
'use client'

import { useContext } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import type { BankCard } from "@/types";
import { DataContext } from "@/context/data-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { format } from "date-fns";

interface CardTransactionHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    card: BankCard;
}

export function CardTransactionHistoryDialog({ open, onOpenChange, card }: CardTransactionHistoryDialogProps) {
    const { transactions } = useContext(DataContext);
    const cardTransactions = transactions.filter(t => t.cardId === card.id);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Historial de Transacciones</DialogTitle>
                    <DialogDescription>
                        Mostrando movimientos para la tarjeta {card.name} (**** {card.last4Digits})
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cardTransactions.length > 0 ? (
                                cardTransactions.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{format(new Date(t.date), 'dd/MM/yy')}</TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell className="text-right font-medium text-red-400">
                                            -${t.amount.toLocaleString('es-CL')}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        No hay transacciones para esta tarjeta en el período seleccionado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}
