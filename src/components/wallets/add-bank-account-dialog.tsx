
'use client';
import { ReactNode, useState, useContext, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DataContext } from '@/context/data-context';
import type { BankAccount } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre es muy corto." }),
  bank: z.string().min(2, { message: "El banco es requerido." }),
  accountType: z.string().min(1, { message: "El tipo de cuenta es requerido." }),
  accountNumber: z.string().min(1, { message: "El número de cuenta es requerido." }),
  balance: z.coerce.number().min(0, { message: "El saldo inicial no puede ser negativo." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
});

interface AddBankAccountDialogProps {
    children?: ReactNode;
    accountToEdit?: BankAccount;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddBankAccountDialog({ children, accountToEdit, open, onOpenChange }: AddBankAccountDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addBankAccount, updateBankAccount, profiles } = useContext(DataContext);
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            bank: "",
            accountType: "Cuenta Corriente",
            accountNumber: "",
            balance: 0,
            profile: "",
        },
    });

    useEffect(() => {
        if (dialogOpen && accountToEdit) {
            form.reset(accountToEdit);
        } else if (dialogOpen && !accountToEdit) {
            form.reset({
                name: "",
                bank: "",
                accountType: "Cuenta Corriente",
                accountNumber: "",
                balance: 0,
                profile: "",
            });
        }
    }, [accountToEdit, form, dialogOpen]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            if(accountToEdit) {
                await updateBankAccount({
                    ...values,
                    id: accountToEdit.id,
                });
                 toast({
                    title: "Cuenta actualizada",
                    description: "Tu cuenta ha sido actualizada exitosamente.",
                });
            } else {
                await addBankAccount(values);
                toast({
                    title: "Cuenta añadida",
                    description: "Tu nueva cuenta ha sido creada exitosamente.",
                });
            }
            form.reset();
            setDialogOpen(false);
        } catch (error) {
             toast({
                title: "Error",
                description: `No se pudo ${accountToEdit ? 'actualizar' : 'añadir'} la cuenta.`,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{accountToEdit ? 'Editar' : 'Añadir Nueva'} Cuenta Bancaria</DialogTitle>
                    <DialogDescription>
                        {accountToEdit ? 'Actualiza los detalles de tu cuenta.' : 'Define una nueva cuenta para gestionar fondos.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Alias de la Cuenta</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Mi Cuenta Principal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="bank"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Banco</FormLabel>
                                     <FormControl>
                                        <Input placeholder="Ej: Banco de Chile" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="accountType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Tipo de Cuenta</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Cuenta Corriente">Cuenta Corriente</SelectItem>
                                        <SelectItem value="Cuenta Vista">Cuenta Vista</SelectItem>
                                        <SelectItem value="Cuenta de Ahorro">Cuenta de Ahorro</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de Cuenta</FormLabel>
                                     <FormControl>
                                        <Input placeholder="00-123-45678-9" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="balance"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Saldo Inicial</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="$1.000.000" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="profile"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Perfil Asociado</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un perfil" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {profiles.map(p => (
                                            <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {accountToEdit ? 'Guardar Cambios' : 'Guardar Cuenta'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
