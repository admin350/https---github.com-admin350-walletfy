

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
import { CurrencyInput } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import type { Investment } from '@/types';

interface ContributeToInvestmentDialogProps {
    investment: Investment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    purpose: 'investment' | 'saving';
}

export function ContributeToInvestmentDialog({ investment, open, onOpenChange, purpose }: ContributeToInvestmentDialogProps) {
    const { toast } = useToast();
    const { addInvestmentContribution, bankAccounts, formatCurrency } = useData();
    const [isLoading, setIsLoading] = useState(false);
    
    const relevantPortfolioAccount = useMemo(() => 
        bankAccounts.find(acc => acc.purpose === purpose && acc.profile === investment.profile), 
    [bankAccounts, investment.profile, purpose]);
    
    const availableToContribute = relevantPortfolioAccount?.balance ?? 0;

    const formSchema = z.object({
      amount: z.coerce.number()
        .positive({ message: "El monto debe ser positivo." })
        .max(availableToContribute, { message: `No puedes aportar más de lo que tienes disponible en tu cartera (${formatCurrency(availableToContribute)}).` }),
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!relevantPortfolioAccount) {
            toast({ title: "Error", description: `No se ha configurado una cuenta de 'Cartera de ${purpose === 'investment' ? 'Inversión' : 'Ahorro'}' para el perfil '${investment.profile}'.`, variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            await addInvestmentContribution({
                investmentId: investment.id,
                investmentName: investment.name,
                amount: values.amount,
                date: new Date(),
                purpose: purpose,
            });
            toast({
                title: "¡Aporte Exitoso!",
                description: `Has aportado ${formatCurrency(values.amount)} a tu activo "${investment.name}".`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
             const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || "No se pudo registrar el aporte al activo.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if(open){
            form.reset({ amount: 0 });
        }
    }, [open, form]);


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Aportar a: {investment.name}</DialogTitle>
                    <DialogDescription>
                       Saldo disponible para aportar ({relevantPortfolioAccount?.name}): <span className="font-bold text-primary">{formatCurrency(availableToContribute)}</span>
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
                                        <CurrencyInput value={field.value} onValueChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading || !relevantPortfolioAccount}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!relevantPortfolioAccount ? `Cartera no encontrada` : "Confirmar Aporte"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
