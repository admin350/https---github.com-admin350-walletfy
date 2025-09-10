
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

interface UpdateSubscriptionDialogProps {
    subscription: Subscription;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpdateSubscriptionDialog({ subscription, open, onOpenChange }: UpdateSubscriptionDialogProps) {
    const { toast } = useToast();
    const { updateSubscriptionAmount, formatCurrency } = useData();
    const [isLoading, setIsLoading] = useState(false);

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

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (values.amount === subscription.amount) {
            onOpenChange(false);
            return;
        }
        setIsLoading(true);
        try {
            await updateSubscriptionAmount(subscription.id, values.amount);
            toast({
                title: "¡Monto Actualizado!",
                description: `El nuevo monto para "${subscription.name}" es ${formatCurrency(values.amount)}.`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
             toast({
                title: "Error",
                description: err.message || "No se pudo actualizar el monto.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if(open){
            form.reset({ amount: subscription.amount });
        }
    }, [open, subscription, form]);

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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
