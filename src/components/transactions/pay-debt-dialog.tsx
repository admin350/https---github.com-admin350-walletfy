
'use client';
import { useState, useEffect } from 'react';
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input, CurrencyInput } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import type { Debt } from '@/types';
import { Checkbox } from '../ui/checkbox';

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
        includesTax: z.boolean().default(false),
        taxRate: z.coerce.number().optional(),
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: debt.monthlyPayment,
            includesTax: false,
            taxRate: 19,
        },
    });
    
    const includesTax = form.watch("includesTax");

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
             await addDebtPayment({
                debtId: debt.id,
                debtName: debt.name,
                amount: values.amount,
                date: new Date(),
                accountId: debt.accountId,
                taxDetails: values.includesTax ? {
                    rate: values.taxRate || 19,
                    amount: values.amount - (values.amount / (1 + (values.taxRate || 19) / 100))
                } : undefined,
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
            form.reset({ 
                amount: debt.monthlyPayment,
                includesTax: false,
                taxRate: 19
            });
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
                                        <CurrencyInput value={field.value} onValueChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="includesTax"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                     <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>¿Este pago incluye impuestos? (Ej: IVA)</FormLabel>
                                        <FormDescription>
                                            Marca esto si el monto total incluye impuestos que necesitas rastrear.
                                        </FormDescription>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                         {includesTax && (
                            <FormField
                                control={form.control}
                                name="taxRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tasa de Impuesto (%)</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input type="number" placeholder="19" {...field} value={field.value ?? ''} className="pl-8"/>
                                            </FormControl>
                                            <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
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
