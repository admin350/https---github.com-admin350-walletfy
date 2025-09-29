
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
import type { Subscription } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface PaySubscriptionDialogProps {
    subscription: Subscription;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PaySubscriptionDialog({ subscription, open, onOpenChange }: PaySubscriptionDialogProps) {
    const { toast } = useToast();
    const { paySubscription, bankAccounts, bankCards, formatCurrency } = useData();
    const [isLoading, setIsLoading] = useState(false);

    const formSchema = z.object({
        amount: z.coerce.number().positive({ message: "El monto debe ser positivo." }),
        paymentMethod: z.string().min(1, "Debes seleccionar un método de pago."),
        includesTax: z.boolean().default(false),
        taxRate: z.coerce.number().optional(),
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: subscription.amount,
            paymentMethod: subscription.cardId,
            includesTax: false,
            taxRate: 19,
        },
    });
    
    const includesTax = form.watch("includesTax");

    const paymentOptions = useMemo(() => {
        const accountsForProfile = bankAccounts.filter(acc => acc.profile === subscription.profile);
        const cardsForProfile = bankCards.filter(card => card.profile === subscription.profile);

        const options = [];

        // Add bank accounts (for debit payments)
        options.push(...accountsForProfile.map(acc => ({
            value: acc.id,
            label: `${acc.bank} - ${acc.accountType} - Saldo: ${formatCurrency(acc.balance)}`,
            type: 'account'
        })));
        
        // Add credit cards
        options.push(...cardsForProfile.filter(c => c.cardType === 'credit').map(card => ({
             value: card.id,
             label: `${card.bank} - ${card.name} (**** ${card.last4Digits}) - Disp: ${formatCurrency((card.creditLimit || 0) - (card.usedAmount || 0))}`,
             type: 'card'
        })));

        return options;

    }, [bankAccounts, bankCards, subscription.profile, formatCurrency]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const selectedOption = paymentOptions.find(opt => opt.value === values.paymentMethod);
            if (!selectedOption) throw new Error("Método de pago no válido.");

            const paymentDetails = {
                accountId: selectedOption.type === 'account' ? selectedOption.value : bankCards.find(c => c.id === selectedOption.value)?.accountId,
                cardId: selectedOption.type === 'card' ? selectedOption.value : undefined,
                taxDetails: values.includesTax ? {
                    rate: values.taxRate || 19,
                    amount: values.amount - (values.amount / (1 + (values.taxRate || 19) / 100))
                } : undefined,
            };
            
            if (!paymentDetails.accountId) throw new Error("La cuenta asociada al método de pago no se encontró.");

            await paySubscription({
                ...subscription,
                amount: values.amount
            }, paymentDetails);

            toast({
                title: "¡Suscripción Pagada!",
                description: `Has pagado ${formatCurrency(values.amount)} por tu suscripción a "${subscription.name}".`,
            });
            onOpenChange(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
             toast({
                title: "Error",
                description: err.message || "No se pudo registrar el pago.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if(open){
            form.reset({ 
                amount: subscription.amount,
                paymentMethod: subscription.cardId,
                includesTax: false,
                taxRate: 19,
            });
        }
    }, [open, subscription, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Pagar Suscripción: {subscription.name}</DialogTitle>
                    <DialogDescription>
                       Confirma el monto y selecciona el método de pago para esta suscripción.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto a Pagar</FormLabel>
                                        <FormControl>
                                            <CurrencyInput value={field.value} onValueChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pagar Con</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un método de pago" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {paymentOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                Confirmar Pago
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
