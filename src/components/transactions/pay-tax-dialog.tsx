
'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import type { BankAccount } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

interface PayTaxDialogProps {
    taxAccount: BankAccount;
    amountToPay: number;
    profile: string;
    period: { month: number; year: number; };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PayTaxDialog({ taxAccount, amountToPay, profile, period, open, onOpenChange }: PayTaxDialogProps) {
    const { toast } = useToast();
    const { addTaxPayment, formatCurrency } = useData();
    const [isLoading, setIsLoading] = useState(false);
    
    const handlePayment = async () => {
        setIsLoading(true);
        try {
            await addTaxPayment({
                amount: amountToPay,
                date: new Date(),
                month: period.month,
                year: period.year,
                sourceAccountId: taxAccount.id,
                profile: profile
            });
            toast({
                title: "¡Impuesto Pagado!",
                description: `Has pagado ${formatCurrency(amountToPay)} correspondiente al período ${period.month + 1}/${period.year}.`,
            });
            onOpenChange(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || "No se pudo registrar el pago del impuesto.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirmar Pago de Impuesto (F29)</DialogTitle>
                    <DialogDescription>
                       Estás a punto de registrar el pago del impuesto para el período {period.month + 1}/{period.year}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                     <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Resumen del Pago</AlertTitle>
                        <AlertDescription>
                            <div className="flex justify-between">
                                <span>Monto a Pagar:</span>
                                <span className="font-bold">{formatCurrency(amountToPay)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pagar desde Cartera:</span>
                                <span>{taxAccount.name}</span>
                            </div>
                             <div className="flex justify-between mt-2 pt-2 border-t">
                                <span className="font-semibold">Nuevo Saldo en Cartera:</span>
                                <span className="font-bold text-primary">{formatCurrency(taxAccount.balance - amountToPay)}</span>
                            </div>
                        </AlertDescription>
                    </Alert>

                     <Button onClick={handlePayment} className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar y Pagar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
