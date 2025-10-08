
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
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '@/context/data-context';
import type { TangibleAsset } from '@/types';
import { CurrencyInput } from '../ui/input';

const formSchema = z.object({
  salePrice: z.coerce.number().positive({ message: "El precio de venta debe ser positivo." }),
  destinationAccountId: z.string().min(1, { message: "Debes seleccionar una cuenta de destino." }),
});

type FormValues = z.infer<typeof formSchema>;

interface SellAssetDialogProps {
    asset: TangibleAsset;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SellAssetDialog({ asset, open, onOpenChange }: SellAssetDialogProps) {
    const { toast } = useToast();
    const { sellTangibleAsset, bankAccounts, formatCurrency } = useData();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            salePrice: asset.estimatedValue,
            destinationAccountId: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            await sellTangibleAsset(asset.id, values.salePrice, values.destinationAccountId);
            toast({
                title: "¡Activo Vendido!",
                description: `Se registró un ingreso de ${formatCurrency(values.salePrice)} por la venta de ${asset.name}.`,
            });
            onOpenChange(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || "No se pudo registrar la venta del activo.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                salePrice: asset.estimatedValue,
                destinationAccountId: "",
            });
        }
    }, [open, asset, form]);

    const accountsForProfile = bankAccounts.filter(acc => acc.profile === asset.profile);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Vender Activo: {asset.name}</DialogTitle>
                    <DialogDescription>
                        Registra el precio de venta final y selecciona la cuenta donde se depositará el dinero. El valor estimado es {formatCurrency(asset.estimatedValue)}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="salePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Precio de Venta Final</FormLabel>
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
                        <FormField
                            control={form.control}
                            name="destinationAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Depositar en Cuenta</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una cuenta" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accountsForProfile.map(acc => (
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Venta
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
