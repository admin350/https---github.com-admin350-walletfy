
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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Debt } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "Nombre de la deuda es muy corto." }),
  totalAmount: z.coerce.number().positive({ message: "Monto total debe ser positivo." }),
  monthlyPayment: z.coerce.number().positive({ message: "Pago mensual debe ser positivo." }),
  installments: z.coerce.number().positive({ message: "El número de cuotas debe ser positivo." }),
  dueDate: z.date({ required_error: "Fecha de próximo pago es requerida." }),
  financialInstitution: z.string().min(2, { message: "Entidad financiera es requerida." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
  accountId: z.string().min(1, { message: "La cuenta de origen es requerida." }),
});

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
    const { addDebt, updateDebt, profiles, bankAccounts } = useContext(DataContext);
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            totalAmount: '' as any,
            monthlyPayment: '' as any,
            installments: '' as any,
            dueDate: new Date(),
            financialInstitution: "",
            profile: "",
            accountId: "",
        },
    });

     useEffect(() => {
        if (dialogOpen && debtToEdit) {
            form.reset({
                ...debtToEdit,
                dueDate: new Date(debtToEdit.dueDate),
            });
        } else if (dialogOpen && !debtToEdit) {
            form.reset({
                name: "",
                totalAmount: '' as any,
                monthlyPayment: '' as any,
                installments: '' as any,
                dueDate: new Date(),
                financialInstitution: "",
                profile: "",
                accountId: "",
            });
        }
    }, [debtToEdit, form, dialogOpen]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            if(debtToEdit) {
                 await updateDebt({
                    ...debtToEdit,
                    ...values
                });
                 toast({
                    title: "Deuda actualizada",
                    description: "Tu deuda ha sido actualizada exitosamente.",
                });
            } else {
                 await addDebt(values);
                toast({
                    title: "Deuda añadida",
                    description: "Tu deuda ha sido registrada exitosamente.",
                });
            }
            form.reset();
            setDialogOpen(false);
        } catch (error) {
             toast({
                title: "Error",
                description: `No se pudo ${debtToEdit ? 'actualizar' : 'añadir'} la deuda.`,
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
                    <DialogTitle>{debtToEdit ? 'Editar' : 'Añadir Nueva'} Deuda</DialogTitle>
                    <DialogDescription>
                        {debtToEdit ? 'Actualiza los detalles de tu deuda.' : 'Registra una nueva deuda para darle seguimiento.'}
                    </DialogDescription>
                </DialogHeader>
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
                                <FormLabel>Cuenta de Origen</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una cuenta" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {bankAccounts.map(a => (
                                            <SelectItem key={a.id} value={a.id}>{a.name} ({a.bank})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="financialInstitution"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Entidad Financiera / Banco</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Banco Santander" {...field} />
                                    </FormControl>
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
                                            <Input type="number" placeholder="$10M" {...field} value={field.value ?? ''} />
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
                                            <Input type="number" placeholder="$350k" {...field} value={field.value ?? ''} />
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
                                        <Input type="number" placeholder="48" {...field} value={field.value ?? ''} />
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             {debtToEdit ? 'Guardar Cambios' : 'Guardar Deuda'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
