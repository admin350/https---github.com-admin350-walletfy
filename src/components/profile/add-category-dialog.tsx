
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '@/context/data-context';
import type { Category } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto."),
  type: z.enum(["Ingreso", "Gasto", "Transferencia"], { required_error: "El tipo es requerido." }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Debe ser un color hexadecimal válido."),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCategoryDialogProps {
    categoryToEdit?: Category;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddCategoryDialog({ categoryToEdit, open, onOpenChange }: AddCategoryDialogProps) {
    const { toast } = useToast();
    const { addCategory, updateCategory } = useData();
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "Gasto",
            color: "#6b7280",
        },
    });
    
    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            if (categoryToEdit) {
                await updateCategory({ ...values, id: categoryToEdit.id });
                toast({
                    title: "Categoría actualizada",
                    description: "La categoría ha sido actualizada exitosamente.",
                });
            } else {
                await addCategory(values);
                toast({
                    title: "Categoría añadida",
                    description: "La categoría ha sido creada exitosamente.",
                });
            }
            onOpenChange(false);
        } catch (err) {
             const error = err as Error;
             toast({
                title: "Error",
                description: error.message || `No se pudo ${categoryToEdit ? 'actualizar' : 'añadir'} la categoría.`,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (open) {
            if (categoryToEdit) {
                form.reset(categoryToEdit);
            } else {
                form.reset({
                    name: "",
                    type: "Gasto",
                    color: "#6b7280",
                });
            }
        }
    }, [categoryToEdit, form, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{categoryToEdit ? 'Editar' : 'Añadir'} Categoría</DialogTitle>
                    <DialogDescription>
                        {categoryToEdit ? 'Actualiza los detalles de la categoría.' : 'Define una nueva categoría para tus transacciones.'}
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
                                        <Input placeholder="Ej: Supermercado" {...field} />
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
                                            <SelectItem value="Gasto">Gasto</SelectItem>
                                            <SelectItem value="Ingreso">Ingreso</SelectItem>
                                             <SelectItem value="Transferencia" disabled>Transferencia</SelectItem>
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
                                    <FormLabel>Color</FormLabel>
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {categoryToEdit ? 'Guardar Cambios' : 'Guardar Categoría'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
