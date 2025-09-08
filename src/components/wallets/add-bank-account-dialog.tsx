

'use client';
import { ReactNode, useState, useEffect } from 'react';
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
import { useData } from '@/context/data-context';
import type { BankAccount } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre es muy corto." }),
  bank: z.string().min(2, { message: "El banco es requerido." }),
  accountType: z.string().min(1, { message: "El tipo de cuenta es requerido." }),
  accountNumber: z.string().min(1, { message: "El número de cuenta es requerido." }),
  balance: z.coerce.number().min(0, { message: "El saldo inicial no puede ser negativo." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
  purpose: z.enum(["main", "savings", "investment"]),
  color: z.string().optional(),
  monthlyLimit: z.coerce.number().optional(),
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
    const { addBankAccount, updateBankAccount, profiles } = useData();
    
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
            purpose: "main",
            color: "#0ea5e9",
            monthlyLimit: undefined,
        },
    });

    const accountType = form.watch("accountType");

    useEffect(() => {
        if (dialogOpen && accountToEdit) {
            form.reset({
                ...accountToEdit,
                color: accountToEdit.color || "#0ea5e9",
                monthlyLimit: accountToEdit.monthlyLimit || undefined,
            });
        } else if (dialogOpen && !accountToEdit) {
            form.reset({
                name: "",
                bank: "",
                accountType: "Cuenta Corriente",
                accountNumber: "",
                balance: 0,
                profile: "",
                purpose: "main",
                color: "#0ea5e9",
                monthlyLimit: undefined,
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
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-4">
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
                            {accountType === "Cuenta Vista" && (
                                <FormField
                                    control={form.control}
                                    name="monthlyLimit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Límite de Ingresos Mensuales</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="5000000" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="purpose"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Propósito Principal de la Cuenta</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un propósito" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="main">Uso Principal</SelectItem>
                                            <SelectItem value="savings">Cartera de Ahorros</SelectItem>
                                            <SelectItem value="investment">Cartera de Inversión</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color Representativo</FormLabel>
                                        <FormControl>
                                            <div className='flex items-center gap-2'>
                                                <Input type="color" className='w-12 h-10 p-1' {...field} />
                                                <Input type="text" className='flex-1' {...field} />
                                            </div>
                                        </FormControl>
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
