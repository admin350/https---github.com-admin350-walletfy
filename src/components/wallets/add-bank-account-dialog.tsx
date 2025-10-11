

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
import { Input, CurrencyInput } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '@/context/data-context';
import type { BankAccount } from '@/types';
import { Switch } from '../ui/switch';
import { useSubmitAction } from '@/hooks/use-submit-action';

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre es muy corto." }),
  bank: z.string().min(2, { message: "El banco es requerido." }),
  accountType: z.string().min(1, { message: "El tipo de cuenta es requerido." }),
  accountNumber: z.string().min(1, { message: "El número de cuenta es requerido." }),
  balance: z.coerce.number().min(0, { message: "El saldo inicial no puede ser negativo." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
  purpose: z.enum(["main", "savings", "investment", "tax"]),
  rut: z.string().min(1, "El RUT es requerido."),
  email: z.string().email("Debe ser un correo electrónico válido."),
  color: z.string().optional(),
  monthlyLimit: z.coerce.number().optional(),
  hasCreditLine: z.boolean().default(false),
  creditLineLimit: z.coerce.number().optional(),
  creditLineUsed: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddBankAccountDialogProps {
    children?: ReactNode;
    accountToEdit?: BankAccount;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddBankAccountDialog({ children, accountToEdit, open, onOpenChange }: AddBankAccountDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { addBankAccount, updateBankAccount, profiles } = useData();
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            bank: "",
            accountType: "Cuenta Corriente",
            accountNumber: "",
            balance: 0,
            profile: "",
            purpose: "main",
            rut: "",
            email: "",
            color: "#0ea5e9",
            monthlyLimit: undefined,
            hasCreditLine: false,
            creditLineLimit: undefined,
            creditLineUsed: 0,
        },
    });

     const { performAction, isLoading, isSuccess } = useSubmitAction<FormValues>({
        action: async (values: FormValues) => {
            if (accountToEdit) {
                await updateBankAccount({ ...accountToEdit, ...values });
            } else {
                await addBankAccount(values);
            }
        },
        onSuccess: () => {
            toast({
                title: accountToEdit ? "Cuenta actualizada" : "Cuenta añadida",
                description: `La cuenta ha sido ${accountToEdit ? 'actualizada' : 'creada'} exitosamente.`,
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || `No se pudo ${accountToEdit ? 'actualizar' : 'añadir'} la cuenta.`,
                variant: "destructive"
            });
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setDialogOpen(false);
        }
    }, [isSuccess, setDialogOpen]);


    useEffect(() => {
        if (dialogOpen) {
            if (accountToEdit) {
                form.reset({
                    ...accountToEdit,
                    rut: accountToEdit.rut || "",
                    email: accountToEdit.email || "",
                    color: accountToEdit.color || "#0ea5e9",
                    monthlyLimit: accountToEdit.monthlyLimit || undefined,
                    hasCreditLine: accountToEdit.hasCreditLine || false,
                    creditLineLimit: accountToEdit.creditLineLimit || undefined,
                    creditLineUsed: accountToEdit.creditLineUsed || 0,
                });
            } else {
                form.reset({
                    name: "",
                    bank: "",
                    accountType: "Cuenta Corriente",
                    accountNumber: "",
                    balance: 0,
                    profile: "",
                    purpose: "main",
                    rut: "",
                    email: "",
                    color: "#0ea5e9",
                    monthlyLimit: undefined,
                    hasCreditLine: false,
                    creditLineLimit: undefined,
                    creditLineUsed: 0,
                });
            }
        }
    }, [accountToEdit, form, dialogOpen]);
    
    const accountType = form.watch("accountType");
    const hasCreditLine = form.watch("hasCreditLine");

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
                        <form onSubmit={form.handleSubmit(performAction)} className="space-y-4">
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
                                name="rut"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>RUT del Titular</FormLabel>
                                        <FormControl>
                                            <Input placeholder="12.345.678-9" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="tu@correo.com" {...field} />
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
                                                <CurrencyInput value={field.value || 0} onValueChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                             {accountType === "Cuenta Corriente" && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="hasCreditLine"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel>¿Tiene Línea de Crédito?</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    {hasCreditLine && (
                                        <FormField
                                            control={form.control}
                                            name="creditLineLimit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cupo de la Línea de Crédito</FormLabel>
                                                    <FormControl>
                                                        <CurrencyInput value={field.value || 0} onValueChange={field.onChange} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </>
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
                                            <SelectItem value="tax">Cartera Tributaria</SelectItem>
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
                                            <CurrencyInput value={field.value} onValueChange={field.onChange} disabled={!!accountToEdit}/>
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
