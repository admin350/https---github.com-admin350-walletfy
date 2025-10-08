
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
import { CurrencyInput } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import type { SavingsGoal } from '@/types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

interface ContributeToGoalDialogProps {
    goal: SavingsGoal;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ContributeToGoalDialog({ goal, open, onOpenChange }: ContributeToGoalDialogProps) {
    const { toast } = useToast();
    const { addGoalContribution, bankAccounts, formatCurrency } = useData();
    const [isLoading, setIsLoading] = useState(false);
    
    const savingsAccountsForProfile = bankAccounts.filter(acc => acc.purpose === 'savings' && acc.profile === goal.profile);

    const formSchema = z.object({
      sourceAccountId: z.string().min(1, { message: "Debes seleccionar una cuenta de origen." }),
      amount: z.coerce.number()
        .positive({ message: "El monto debe ser positivo." })
    }).refine(data => {
        const selectedAccount = bankAccounts.find(acc => acc.id === data.sourceAccountId);
        if (selectedAccount) {
            return data.amount <= selectedAccount.balance;
        }
        return true;
    }, { 
        message: "No puedes aportar más de lo que tienes disponible en la cuenta de ahorros seleccionada.",
        path: ["amount"],
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sourceAccountId: savingsAccountsForProfile.length === 1 ? savingsAccountsForProfile[0].id : "",
            amount: 0,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            await addGoalContribution({
                goalId: goal.id,
                goalName: goal.name,
                amount: values.amount,
                date: new Date(),
                sourceAccountId: values.sourceAccountId,
            });
            toast({
                title: "¡Aporte Exitoso!",
                description: `Has aportado ${formatCurrency(values.amount)} a tu meta "${goal.name}".`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || "No se pudo registrar el aporte.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({ 
                sourceAccountId: savingsAccountsForProfile.length === 1 ? savingsAccountsForProfile[0].id : "",
                amount: 0 
            });
        }
    }, [open, form, savingsAccountsForProfile]);


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Aportar a: {goal.name}</DialogTitle>
                    <DialogDescription>
                       Selecciona la cartera de origen y el monto a aportar a tu meta.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="sourceAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pagar desde Cartera</FormLabel>
                                     <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una cartera de ahorro" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {savingsAccountsForProfile.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.name} ({formatCurrency(acc.balance)})
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
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto a Aportar</FormLabel>
                                    <FormControl>
                                        <CurrencyInput value={field.value} onValueChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading || savingsAccountsForProfile.length === 0}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {savingsAccountsForProfile.length === 0 ? "Cartera de Ahorro no encontrada" : "Confirmar Aporte"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
