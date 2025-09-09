
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
import type { SavingsGoal } from '@/types';
import { useSubmitAction } from '@/hooks/use-submit-action';

interface ContributeToGoalDialogProps {
    goal: SavingsGoal;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ContributeToGoalDialog({ goal, open, onOpenChange }: ContributeToGoalDialogProps) {
    const { toast } = useToast();
    const { addGoalContribution, bankAccounts, goalContributions, formatCurrency } = useData();
    
    const savingsAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'savings'), [bankAccounts]);
    const totalSavings = savingsAccount?.balance ?? 0;
    
    const totalContributed = useMemo(() => {
        return goalContributions.reduce((acc, c) => acc + c.amount, 0);
    }, [goalContributions]);

    const availableSavings = totalSavings - totalContributed;

    const formSchema = z.object({
      amount: z.coerce.number()
        .positive({ message: "El monto debe ser positivo." })
        .max(availableSavings, { message: `No puedes aportar más de lo que tienes disponible en tu cartera de ahorros (${formatCurrency(availableSavings)}).` }),
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: '' as any,
        },
    });

    const { performAction, isLoading, isSuccess } = useSubmitAction({
        action: async (values: z.infer<typeof formSchema>) => {
            if (!savingsAccount) {
                throw new Error("No se ha configurado una cuenta de ahorros.");
            }
            await addGoalContribution({
                goalId: goal.id,
                goalName: goal.name,
                amount: values.amount,
                date: new Date(),
                sourceAccountId: savingsAccount.id,
            });
        },
        onSuccess: (result, values) => {
            toast({
                title: "¡Aporte Exitoso!",
                description: `Has aportado ${formatCurrency(values.amount)} a tu meta "${goal.name}".`,
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "No se pudo registrar el aporte.",
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
                    <DialogTitle>Aportar a: {goal.name}</DialogTitle>
                    <DialogDescription>
                       Ahorro disponible en cartera: <span className="font-bold text-primary">{formatCurrency(availableSavings)}</span>
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(performAction)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto a Aportar</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder={formatCurrency(50000)} {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Aporte
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
