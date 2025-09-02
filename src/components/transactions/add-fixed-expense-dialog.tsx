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
import type { FixedExpense } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre del gasto es muy corto." }),
  amount: z.coerce.number().positive({ message: "El monto debe ser positivo." }),
  category: z.string().min(1, { message: "La categoría es requerida." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
});

interface AddFixedExpenseDialogProps {
    children: ReactNode;
    expenseToEdit?: FixedExpense;
    onFinish?: () => void;
}

export function AddFixedExpenseDialog({ children, expenseToEdit, onFinish }: AddFixedExpenseDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addFixedExpense, updateFixedExpense, categories, profiles } = useContext(DataContext);
    
    const expenseCategories = categories.filter(c => c.type === 'Gasto');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            amount: undefined,
            category: "",
            profile: "",
        },
    });

     useEffect(() => {
        if (expenseToEdit) {
            form.reset(expenseToEdit);
        } else {
            form.reset({
                name: "",
                amount: undefined,
                category: "",
                profile: "",
            });
        }
    }, [expenseToEdit, form, open]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            if (expenseToEdit) {
                await updateFixedExpense({ id: expenseToEdit.id, ...values });
                toast({
                    title: "Plantilla Actualizada",
                    description: "La plantilla de gasto fijo ha sido actualizada.",
                });
            } else {
                await addFixedExpense(values);
                toast({
                    title: "Gasto Fijo Añadido",
                    description: "Tu plantilla de gasto ha sido creada exitosamente.",
                });
            }
            form.reset();
            setOpen(false);
            if(onFinish) onFinish();
        } catch (error) {
             toast({
                title: "Error",
                description: `No se pudo ${expenseToEdit ? 'actualizar' : 'añadir'} la plantilla.`,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{expenseToEdit ? 'Editar' : 'Añadir'} Plantilla de Gasto Fijo</DialogTitle>
                    <DialogDescription>
                        {expenseToEdit ? 'Edita los detalles de tu plantilla.' : 'Registra una nueva plantilla de gasto mensual recurrente.'}
                    </DialogDescription>
                </DialogHeader>
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
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto Mensual</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="$50.000" {...field} />
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {expenseCategories.map(c => (
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
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
            </DialogContent>
        </Dialog>
    );
}
