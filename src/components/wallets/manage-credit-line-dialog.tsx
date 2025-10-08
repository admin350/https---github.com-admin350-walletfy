
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
import type { BankAccount } from '@/types';

const formSchema = z.object({
  creditLineLimit: z.coerce.number().positive({ message: "El cupo debe ser un número positivo." }),
});

interface ManageCreditLineDialogProps {
    account: BankAccount;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ManageCreditLineDialog({ account, open, onOpenChange }: ManageCreditLineDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { updateBankAccount, formatCurrency } = useData();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            creditLineLimit: 0,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            await updateBankAccount({
                ...account,
                hasCreditLine: true,
                creditLineLimit: values.creditLineLimit,
            });
            toast({
                title: "Línea de Crédito Actualizada",
                description: `Se ha establecido un cupo de ${formatCurrency(values.creditLineLimit)} para tu cuenta.`,
            });
            onOpenChange(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || `No se pudo actualizar la línea de crédito.`,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                creditLineLimit: account.creditLineLimit || 0,
            });
        }
    }, [account, form, open]);


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Gestionar Línea de Crédito</DialogTitle>
                    <DialogDescription>
                        Define o actualiza el cupo de tu línea de crédito para la cuenta &quot;{account.name}&quot;.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="creditLineLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cupo Total de la Línea de Crédito</FormLabel>
                                    <FormControl>
                                        <CurrencyInput value={field.value} onValueChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
