
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
import type { Investment } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

const formSchema = z.object({
  finalValue: z.coerce.number().positive({ message: "El valor final debe ser positivo." }),
});

type FormValues = z.infer<typeof formSchema>;

interface CloseInvestmentDialogProps {
    investment: Investment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CloseInvestmentDialog({ investment, open, onOpenChange }: CloseInvestmentDialogProps) {
    const { toast } = useToast();
    const { closeInvestment, formatCurrency } = useData();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            finalValue: investment.currentValue,
        },
    });

    const finalValue = form.watch("finalValue");
    const profitOrLoss = finalValue - investment.initialAmount;

    useEffect(() => {
        if (open) {
            form.reset({ finalValue: investment.currentValue });
        }
    }, [open, investment, form]);

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            await closeInvestment(investment.id, values.finalValue);
            toast({
                title: "Inversión Liquidada",
                description: `Se ha registrado el cierre de "${investment.name}".`,
            });
            onOpenChange(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || "No se pudo liquidar la inversión.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Liquidar Inversión: {investment.name}</DialogTitle>
                    <DialogDescription>
                        Ingresa el valor final al momento de liquidar la inversión para registrar la ganancia o pérdida.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Resumen de la Operación</AlertTitle>
                        <AlertDescription>
                            <div className="flex justify-between">
                                <span>Monto Invertido Inicialmente:</span>
                                <span>{formatCurrency(investment.initialAmount)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Ganancia / Pérdida:</span>
                                <span className={profitOrLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                                    {formatCurrency(profitOrLoss)}
                                </span>
                            </div>
                        </AlertDescription>
                    </Alert>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="finalValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Final de Liquidación</FormLabel>
                                        <FormControl>
                                            <CurrencyInput
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmar y Liquidar
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
