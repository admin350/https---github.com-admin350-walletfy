
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
import type { Subscription } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: subscription.amount,
            paymentMethod: subscription.cardId,
        },
    });

    const paymentOptions = useMemo(() => {
        const accountsForProfile = bankAccounts.filter(acc => acc.profile === subscription.profile);
        const cardsForProfile = bankCards.filter(card => card.profile === subscription.profile);

        const options = [];

        // Add bank accounts (for debit payments)
        options.push(...accountsForProfile.map(acc => ({
            value: acc.id,
            label: `Cuenta: ${acc.name} (${acc.bank}) - Saldo: ${formatCurrency(acc.balance)}`,
            type: 'account'
        })));
        
        // Add credit cards
        options.push(...cardsForProfile.filter(c => c.cardType === 'credit').map(card => ({
             value: card.id,
             label: `Tarjeta: ${card.name} (**** ${card.last4Digits}) - Disp: ${formatCurrency((card.creditLimit || 0) - (card.usedAmount || 0))}`,
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
                cardId: selectedOption.type === 'card' ? selectedOption.value : undefined
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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto a Pagar</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={field.value ?? ''} />
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Pago
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
