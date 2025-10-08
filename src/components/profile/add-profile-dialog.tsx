
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
import { useData } from '@/context/data-context';
import type { Profile } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto."),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Debe ser un color hexadecimal válido."),
});

type FormValues = z.infer<typeof formSchema>;

interface AddProfileDialogProps {
    profileToEdit?: Profile;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddProfileDialog({ profileToEdit, open, onOpenChange }: AddProfileDialogProps) {
    const { toast } = useToast();
    const { addProfile, updateProfile } = useData();
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            color: "#6b7280",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            if (profileToEdit) {
                await updateProfile({ ...values, id: profileToEdit.id });
                toast({
                    title: "Perfil actualizado",
                    description: `El perfil ha sido actualizado exitosamente.`,
                });
            } else {
                await addProfile(values);
                toast({
                    title: "Perfil añadido",
                    description: `El perfil ha sido creado exitosamente.`,
                });
            }
            onOpenChange(false);
        } catch (err) {
            const error = err as Error;
            toast({
                title: "Error",
                description: error.message || `No se pudo ${profileToEdit ? 'actualizar' : 'añadir'} el perfil.`,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (open) {
            if (profileToEdit) {
                form.reset({
                    name: profileToEdit.name,
                    color: profileToEdit.color,
                });
            } else {
                form.reset({
                    name: "",
                    color: "#6b7280",
                });
            }
        }
    }, [profileToEdit, open, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{profileToEdit ? 'Editar' : 'Añadir'} Perfil</DialogTitle>
                    <DialogDescription>
                        {profileToEdit ? 'Actualiza los detalles del perfil.' : 'Define un nuevo perfil para organizar tus finanzas.'}
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
                                        <Input placeholder="Ej: Familia" {...field} />
                                    </FormControl>
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
                            {profileToEdit ? 'Guardar Cambios' : 'Guardar Perfil'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
