
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
import type { BankAccount } from '@/types';
import { useSubmitAction } from '@/hooks/use-submit-action';

const formSchema = z.object({
  creditLineLimit: z.coerce.number().positive({ message: "El cupo debe ser un número positivo." }),
});

interface ManageCreditLineDialogProps {
    account: BankAccount;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ManageCreditLineDialog({ account, open, onOpenChange }: ManageCreditLineDialogProps) {
    const { toast } = useToast();
    const { updateBankAccount, formatCurrency } = useData();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            creditLineLimit: 0,
        },
    });

    const { performAction, isLoading, isSuccess } = useSubmitAction({
        action: async (values: z.infer<typeof formSchema>) => {
            await updateBankAccount({
                ...account,
                hasCreditLine: true,
                creditLineLimit: values.creditLineLimit,
            });
        },
        onSuccess: (result, values) => {
             toast({
                title: "Línea de Crédito Actualizada",
                description: `Se ha establecido un cupo de ${formatCurrency(values.creditLineLimit)} para tu cuenta.`,
            });
        },
        onError: (error) => {
             toast({
                title: "Error",
                description: `No se pudo actualizar la línea de crédito.`,
                variant: "destructive"
            })
        }
    });

    useEffect(() => {
        if(isSuccess){
            onOpenChange(false);
        }
    }, [isSuccess, onOpenChange]);

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
                        Define o actualiza el cupo de tu línea de crédito para la cuenta "{account.name}".
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(performAction)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="creditLineLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cupo Total de la Línea de Crédito</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder={formatCurrency(1000000)} {...field} value={field.value ?? ''}/>
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
