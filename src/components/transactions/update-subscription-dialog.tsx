
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

interface UpdateSubscriptionDialogProps {
    subscription: Subscription;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpdateSubscriptionDialog({ subscription, open, onOpenChange }: UpdateSubscriptionDialogProps) {
    const { toast } = useToast();
    const { updateSubscriptionAmount, formatCurrency } = useData();

    const formSchema = z.object({
        amount: z.coerce.number()
          .positive({ message: "El monto debe ser positivo." })
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: subscription.amount,
        },
    });

    const { performAction, isLoading, isSuccess } = useSubmitAction({
        action: async (values: z.infer<typeof formSchema>) => {
            if (values.amount === subscription.amount) {
                 return;
            }
            await updateSubscriptionAmount(subscription.id, values.amount);
        },
        onSuccess: (result, values) => {
            if (values.amount !== subscription.amount) {
                toast({
                    title: "¡Monto Actualizado!",
                    description: `El nuevo monto para "${subscription.name}" es ${formatCurrency(values.amount)}.`,
                });
            }
        },
        onError: (error) => {
             toast({
                title: "Error",
                description: "No se pudo actualizar el monto.",
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
                    <DialogTitle>Actualizar Monto: {subscription.name}</DialogTitle>
                    <DialogDescription>
                       El monto actual es {formatCurrency(subscription.amount)}. Ingresa el nuevo valor para esta suscripción.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(performAction)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nuevo Monto Mensual</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Nuevo Monto
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
