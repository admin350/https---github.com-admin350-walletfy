
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
import type { FixedExpense } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre del gasto es muy corto." }),
  amount: z.coerce.number().positive({ message: "El monto debe ser positivo." }),
  type: z.enum(["income", "expense"], { required_error: "El tipo es requerido." }),
  category: z.string().min(1, { message: "La categoría es requerida." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
  paymentDay: z.coerce.number().min(1, "El día debe ser al menos 1.").max(31, "El día no puede ser mayor a 31.").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddFixedExpenseDialogProps {
    children: ReactNode;
    expenseToEdit?: FixedExpense;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onFinish?: () => void;
}

export function AddFixedExpenseDialog({ children, expenseToEdit, open, onOpenChange, onFinish }: AddFixedExpenseDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { addFixedExpense, updateFixedExpense, categories, profiles } = useData();
    const [isLoading, setIsLoading] = useState(false);
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            amount: 0,
            type: "expense",
            category: "",
            profile: "",
            paymentDay: undefined,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            const dataToSubmit = { ...values, paymentDay: values.paymentDay || 0 };
            if (expenseToEdit) {
                await updateFixedExpense({ id: expenseToEdit.id, ...dataToSubmit });
            } else {
                await addFixedExpense(dataToSubmit);
            }
            toast({
                title: expenseToEdit ? "Plantilla actualizada" : "Gasto Fijo Añadido",
                description: `La plantilla ha sido ${expenseToEdit ? 'actualizada' : 'creada'} exitosamente.`,
            });
            if (onFinish) onFinish();
            setDialogOpen(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || `No se pudo ${expenseToEdit ? 'actualizar' : 'añadir'} la plantilla.`,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (dialogOpen) {
            if (expenseToEdit) {
                form.reset({
                    ...expenseToEdit,
                    amount: expenseToEdit.amount || 0,
                    paymentDay: expenseToEdit.paymentDay || undefined,
                });
            } else {
                form.reset({
                    name: "",
                    amount: 0,
                    type: "expense",
                    category: "",
                    profile: "",
                    paymentDay: undefined,
                });
            }
        }
    }, [expenseToEdit, form, dialogOpen]);
    
    const expenseType = form.watch("type");
    const availableCategories = categories.filter(c => {
        if (expenseType === 'income') return c.type === 'Ingreso';
        if (expenseType === 'expense') return c.type === 'Gasto';
        return true;
    });


    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{expenseToEdit ? 'Editar' : 'Añadir'} Plantilla de Gasto Fijo</DialogTitle>
                    <DialogDescription>
                        {expenseToEdit ? 'Edita los detalles de tu plantilla.' : 'Registra una nueva plantilla de gasto mensual recurrente.'}
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
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Gimnasio, Plan Celular" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un tipo" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="expense">Egreso</SelectItem>
                                            <SelectItem value="income">Ingreso</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto Mensual</FormLabel>
                                        <FormControl>
                                            <CurrencyInput value={field.value} onValueChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="paymentDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Día de Pago (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ej: 5 (para el día 5 del mes)" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoría</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una categoría" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableCategories.map(c => (
                                                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                                                ))}
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
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {expenseToEdit ? 'Guardar Cambios' : 'Guardar Plantilla'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
