
'use client';
import { ReactNode, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '@/context/data-context';
import type { Budget } from '@/types';

const budgetItemSchema = z.object({
    category: z.string().min(1, "Categoría es requerida."),
    percentage: z.coerce.number().min(0, "Porcentaje no puede ser negativo.").max(100, "Porcentaje no puede exceder 100."),
});

const formSchema = z.object({
  name: z.string().min(2, "Nombre del presupuesto es muy corto."),
  profile: z.string().min(1, "El perfil es requerido."),
  items: z.array(budgetItemSchema),
}).refine(data => {
    const totalPercentage = data.items.reduce((sum, item) => sum + item.percentage, 0);
    return totalPercentage === 100;
}, {
    message: "La suma de los porcentajes debe ser exactamente 100.",
    path: ["items"],
});

type FormValues = z.infer<typeof formSchema>;

interface AddBudgetDialogProps {
    children: ReactNode;
    budgetToEdit?: Budget;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddBudgetDialog({ children, budgetToEdit, open, onOpenChange }: AddBudgetDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { addBudget, updateBudget, profiles, categories } = useData();
    const [isLoading, setIsLoading] = useState(false);
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            profile: "",
            items: [],
        },
    });
    
    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            if (budgetToEdit) {
                await updateBudget({ ...values, id: budgetToEdit.id });
                toast({
                    title: "Presupuesto actualizado",
                    description: `El plan ha sido actualizado exitosamente.`,
                });
            } else {
                await addBudget(values);
                 toast({
                    title: "Presupuesto añadido",
                    description: `El plan ha sido creado exitosamente.`,
                });
            }
            setDialogOpen(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || `No se pudo ${budgetToEdit ? 'actualizar' : 'añadir'} el presupuesto.`,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (dialogOpen) {
            if (budgetToEdit) {
                form.reset({
                    name: budgetToEdit.name,
                    profile: budgetToEdit.profile,
                    items: budgetToEdit.items,
                });
            } else {
                form.reset({
                    name: "",
                    profile: "",
                    items: [],
                });
            }
        }
    }, [budgetToEdit, form, dialogOpen]);
    
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const watchItems = form.watch("items");
    const totalPercentage = watchItems.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);
    const expenseCategories = categories.filter(c => c.type === 'Gasto');

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{budgetToEdit ? 'Editar' : 'Añadir'} Presupuesto</DialogTitle>
                    <DialogDescription>
                        {budgetToEdit ? 'Actualiza los detalles de tu plan.' : 'Define un nuevo plan presupuestario.'}
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
                                        <FormLabel>Nombre del Plan</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Presupuesto Ideal" {...field} />
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

                            <div>
                                <FormLabel>Categorías del Presupuesto</FormLabel>
                                <div className="space-y-2 mt-2">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2 items-end">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.category`}
                                                render={({ field }) => (
                                                    <FormItem className='flex-1'>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Categoría" />
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
                                                name={`items.${index}.percentage`}
                                                render={({ field }) => (
                                                    <FormItem className="w-28">
                                                        <FormControl>
                                                            <Input type="number" placeholder="%" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => append({ category: "", percentage: 0 })}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Añadir Categoría
                                </Button>
                            </div>
                            
                            <div className="text-right font-medium text-lg">
                                Total: <span className={totalPercentage !== 100 ? 'text-red-500' : 'text-green-500'}>{totalPercentage}%</span>
                            </div>
                            {form.formState.errors.items && (
                                <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>
                            )}


                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {budgetToEdit ? 'Guardar Cambios' : 'Guardar Presupuesto'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
