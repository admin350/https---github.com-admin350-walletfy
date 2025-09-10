
'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import type { Debt } from '@/types';

interface PayDebtDialogProps {
    debt: Debt;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PayDebtDialog({ debt, open, onOpenChange }: PayDebtDialogProps) {
    const { toast } = useToast();
    const { addDebtPayment, bankAccounts, formatCurrency } = useData();
    const [isLoading, setIsLoading] = useState(false);
    
    const relevantAccount = bankAccounts.find(acc => acc.id === debt.accountId);
    
    const formSchema = z.object({
        amount: z.coerce.number()
          .positive({ message: "El monto debe ser positivo." })
          .max(relevantAccount?.balance ?? 0, { message: `No puedes pagar más de tu balance disponible en la cuenta (${formatCurrency(relevantAccount?.balance ?? 0)}).` }),
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: debt.monthlyPayment,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
             await addDebtPayment({
                debtId: debt.id,
                debtName: debt.name,
                amount: values.amount,
                date: new Date(),
                accountId: debt.accountId,
            });
            toast({
                title: "¡Abono Exitoso!",
                description: `Has abonado ${formatCurrency(values.amount)} a tu deuda "${debt.name}".`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || "No se pudo registrar el abono.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({ amount: debt.monthlyPayment });
        }
    }, [open, debt, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Abonar a: {debt.name}</DialogTitle>
                    <DialogDescription>
                       Pagando desde: <span className="font-bold text-primary">{relevantAccount?.name} ({formatCurrency(relevantAccount?.balance ?? 0)})</span>
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto a Abonar (Cuota: {formatCurrency(debt.monthlyPayment)})</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Abono
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
