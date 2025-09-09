
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
import { useSubmitAction } from '@/hooks/use-submit-action';

interface PaySubscriptionDialogProps {
    subscription: Subscription;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PaySubscriptionDialog({ subscription, open, onOpenChange }: PaySubscriptionDialogProps) {
    const { toast } = useToast();
    const { paySubscription, bankAccounts, bankCards, formatCurrency } = useData();

    const card = useMemo(() => bankCards.find(c => c.id === subscription.cardId), [bankCards, subscription]);
    const account = useMemo(() => bankAccounts.find(a => a.id === card?.accountId), [bankAccounts, card]);

    const formSchema = z.object({
        amount: z.coerce.number()
          .positive({ message: "El monto debe ser positivo." })
          .max(account?.balance ?? 0, { message: `No puedes pagar más de tu balance disponible (${formatCurrency(account?.balance ?? 0)}).` }),
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: subscription.amount,
        },
    });

     const { performAction, isLoading, isSuccess } = useSubmitAction({
        action: async (values: z.infer<typeof formSchema>) => {
            await paySubscription({
                ...subscription,
                amount: values.amount
            });
        },
        onSuccess: (result, values) => {
            toast({
                title: "¡Suscripción Pagada!",
                description: `Has pagado ${formatCurrency(values.amount)} por tu suscripción a "${subscription.name}".`,
            });
        },
        onError: (error) => {
             toast({
                title: "Error",
                description: "No se pudo registrar el pago.",
                variant: "destructive"
            })
        }
    });

    useEffect(() => {
        if(isSuccess) {
            onOpenChange(false);
            form.reset();
        }
    }, [isSuccess, onOpenChange, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Pagar Suscripción: {subscription.name}</DialogTitle>
                    <DialogDescription>
                       Pagando desde la cuenta: <span className="font-bold text-primary">{account?.name} ({formatCurrency(account?.balance ?? 0)})</span>
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(performAction)} className="space-y-4">
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
