
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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Debt } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "Nombre de la deuda es muy corto." }),
  totalAmount: z.coerce.number().positive({ message: "Monto total debe ser positivo." }),
  monthlyPayment: z.coerce.number().positive({ message: "Pago mensual debe ser positivo." }),
  installments: z.coerce.number().positive({ message: "El número de cuotas debe ser un número positivo." }),
  dueDate: z.date({ required_error: "Fecha de próximo pago es requerida." }),
  debtType: z.enum(['consumo', 'hipotecario', 'auto', 'line-of-credit', 'credit-card', 'otro'], { required_error: "El tipo de deuda es requerido." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
  accountId: z.string().min(1, { message: "La cuenta de origen es requerida." }),
  cardId: z.string().optional(),
  dueNotificationDays: z.coerce.number().optional(),
  sourceTransactionId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddDebtDialogProps {
    children: ReactNode;
    debtToEdit?: Debt;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddDebtDialog({ children, debtToEdit, open, onOpenChange }: AddDebtDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addDebt, updateDebt, profiles, bankAccounts } = useData();
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            totalAmount: 0,
            monthlyPayment: 0,
            installments: 0,
            dueDate: new Date(),
            debtType: 'consumo',
            profile: "",
            accountId: "",
            cardId: undefined,
            dueNotificationDays: 3,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            if (debtToEdit) {
                await updateDebt({ ...debtToEdit, ...values });
                toast({
                    title: "Deuda actualizada",
                    description: `La deuda ha sido actualizada exitosamente.`,
                });
            } else {
                 await addDebt({
                    ...values,
                 });
                toast({
                    title: "Deuda añadida",
                    description: `La deuda ha sido creada exitosamente.`,
                });
            }
            setDialogOpen(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || `No se pudo ${debtToEdit ? 'actualizar' : 'añadir'} la deuda.`,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (dialogOpen) {
            if (debtToEdit) {
                form.reset({
                    ...debtToEdit,
                    dueDate: new Date(debtToEdit.dueDate),
                    dueNotificationDays: debtToEdit.dueNotificationDays ?? 3,
                });
            } else {
                form.reset({
                    name: "",
                    totalAmount: 0,
                    monthlyPayment: 0,
                    installments: 0,
                    dueDate: new Date(),
                    debtType: 'consumo',
                    profile: "",
                    accountId: "",
                    cardId: undefined,
                    dueNotificationDays: 3,
                });
            }
        }
    }, [debtToEdit, form, dialogOpen]);
    
    const selectedProfile = form.watch("profile");
    const filteredAccounts = bankAccounts.filter(acc => acc.profile === selectedProfile);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{debtToEdit ? 'Editar' : 'Añadir Nueva'} Deuda</DialogTitle>
                    <DialogDescription>
                        {debtToEdit ? 'Actualiza los detalles de tu deuda.' : 'Registra una nueva deuda para darle seguimiento.'}
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
                                        <FormLabel>Nombre de la Deuda</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Préstamo de auto" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="debtType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Deuda</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un tipo" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="consumo">Crédito de Consumo</SelectItem>
                                                <SelectItem value="hipotecario">Crédito Hipotecario</SelectItem>
                                                <SelectItem value="auto">Crédito Automotriz</SelectItem>
                                                <SelectItem value="line-of-credit">Línea de Crédito</SelectItem>
                                                <SelectItem value="credit-card">Tarjeta de Crédito</SelectItem>
                                                <SelectItem value="otro">Otro Préstamo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="profile"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Perfil</FormLabel>
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
                            <FormField
                                control={form.control}
                                name="accountId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Cuenta de Origen de los Pagos</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProfile}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={!selectedProfile ? "Elige un perfil primero" : "Selecciona una cuenta"} />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {filteredAccounts.map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.bank} - {a.accountType} ({a.name})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="totalAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monto Total</FormLabel>
                                            <FormControl>
                                                <CurrencyInput value={field.value} onValueChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="monthlyPayment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pago Mensual</FormLabel>
                                            <FormControl>
                                                <CurrencyInput value={field.value} onValueChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="installments"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Cuotas</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="48" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha Próximo Pago</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: es })
                                                        ) : (
                                                            <span>Selecciona una fecha</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    locale={es}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueNotificationDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Avisar con (días de antelación)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="3" {...field} value={field.value ?? ''}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {debtToEdit ? 'Guardar Cambios' : 'Guardar Deuda'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
