

'use client';
import { useState, useContext, useMemo } from 'react';
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
import { DataContext } from '@/context/data-context';
import type { Investment } from '@/types';

interface ContributeToInvestmentDialogProps {
    investment: Investment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ContributeToInvestmentDialog({ investment, open, onOpenChange }: ContributeToInvestmentDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addInvestmentContribution, transactions, investmentContributions } = useContext(DataContext);
    
    const totalInvestmentTransfers = useMemo(() => {
        return transactions.filter(t => t.type === 'transfer-investment').reduce((acc, t) => acc + t.amount, 0);
    }, [transactions]);
    
    const totalContributedToInvestments = useMemo(() => {
        return investmentContributions.reduce((acc, c) => acc + c.amount, 0);
    }, [investmentContributions]);


    const availableToInvest = totalInvestmentTransfers - totalContributedToInvestments;

    const formSchema = z.object({
      amount: z.coerce.number()
        .positive({ message: "El monto debe ser positivo." })
        .max(availableToInvest, { message: `No puedes aportar más de lo que tienes disponible en tu cartera de inversión ($${availableToInvest.toLocaleString('es-CL')}).` }),
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: '' as any,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            await addInvestmentContribution({
                investmentId: investment.id,
                investmentName: investment.name,
                amount: values.amount,
                date: new Date(),
            });
            toast({
                title: "¡Aporte Exitoso!",
                description: `Has aportado $${values.amount.toLocaleString('es-CL')} a tu inversión "${investment.name}".`,
            });
            form.reset();
            onOpenChange(false);
        } catch (error) {
             toast({
                title: "Error",
                description: "No se pudo registrar el aporte a la inversión.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Aportar a: {investment.name}</DialogTitle>
                    <DialogDescription>
                       Saldo disponible para invertir: <span className="font-bold text-primary">${availableToInvest.toLocaleString('es-CL')}</span>
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto a Aportar</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="$50.000" {...field} value={field.value ?? ''} />
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
