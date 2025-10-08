
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '@/context/data-context';
import type { Service } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre es muy corto." }),
  category: z.string().min(1, { message: "La categoría es requerida." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
  paymentUrl: z.string().url({ message: "Debe ser una URL válida." }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddServiceDialogProps {
    serviceToEdit?: Service;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddServiceDialog({ serviceToEdit, open, onOpenChange }: AddServiceDialogProps) {
    const { toast } = useToast();
    const { addService, updateService, profiles, categories } = useData();
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: "",
            profile: "",
            paymentUrl: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            if (serviceToEdit) {
                await updateService({ ...values, id: serviceToEdit.id });
                 toast({
                    title: "Servicio actualizado",
                    description: `El servicio ha sido actualizado exitosamente.`,
                });
            } else {
                await addService(values);
                toast({
                    title: "Servicio añadido",
                    description: `El servicio ha sido registrado exitosamente.`,
                });
            }
            onOpenChange(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || `No se pudo ${serviceToEdit ? 'actualizar' : 'añadir'} el servicio.`,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            if (serviceToEdit) {
                form.reset(serviceToEdit);
            } else {
                form.reset({
                    name: "",
                    category: "",
                    profile: "",
                    paymentUrl: "",
                });
            }
        }
    }, [serviceToEdit, form, open]);

    const expenseCategories = categories.filter(c => c.type === 'Gasto');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{serviceToEdit ? 'Editar' : 'Añadir Nuevo'} Servicio</DialogTitle>
                    <DialogDescription>
                        {serviceToEdit ? 'Actualiza los detalles de tu servicio.' : 'Registra un nuevo servicio recurrente y su enlace de pago.'}
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
                                        <FormLabel>Nombre del Servicio</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Cuenta de la Luz" {...field} />
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
                                                <SelectValue placeholder="Selecciona una categoría de gasto" />
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
                                name="paymentUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL del Portal de Pago</FormLabel>
                                        <FormControl>
                                            <Input type="url" placeholder="https://www.servipag.com/..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {serviceToEdit ? 'Guardar Cambios' : 'Guardar Servicio'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
