
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '@/context/data-context';
import type { TangibleAsset } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "Nombre del activo es muy corto." }),
  category: z.string().min(1, { message: "La categoría es requerida." }),
  estimatedValue: z.coerce.number().positive({ message: "El valor estimado debe ser positivo." }),
  purchaseDate: z.date({ required_error: "La fecha de compra es requerida." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddAssetDialogProps {
    children?: ReactNode;
    assetToEdit?: TangibleAsset;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddAssetDialog({ children, assetToEdit, open, onOpenChange }: AddAssetDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { addTangibleAsset, updateTangibleAsset, profiles } = useData();
    const [isLoading, setIsLoading] = useState(false);
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: "Vehículo",
            estimatedValue: 0,
            profile: "",
            description: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            if (assetToEdit) {
                await updateTangibleAsset({ ...assetToEdit, ...values });
                toast({
                    title: "Activo actualizado",
                    description: "El activo ha sido actualizado exitosamente.",
                });
            } else {
                await addTangibleAsset(values);
                toast({
                    title: "Activo añadido",
                    description: "El activo ha sido registrado exitosamente.",
                });
            }
            setDialogOpen(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || `No se pudo ${assetToEdit ? 'actualizar' : 'añadir'} el activo.`,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (dialogOpen) {
            if (assetToEdit) {
                form.reset({
                    ...assetToEdit,
                    purchaseDate: new Date(assetToEdit.purchaseDate)
                });
            } else {
                form.reset({
                    name: "",
                    category: "Vehículo",
                    estimatedValue: 0,
                    purchaseDate: new Date(),
                    profile: "",
                    description: "",
                });
            }
        }
    }, [assetToEdit, form, dialogOpen]);

    const assetCategories = ["Vehículo", "Propiedad", "Electrónica", "Mobiliario", "Joyas", "Arte", "Otro"];

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{assetToEdit ? 'Editar' : 'Añadir Nuevo'} Activo Tangible</DialogTitle>
                    <DialogDescription>
                        {assetToEdit ? 'Actualiza los detalles de tu activo.' : 'Registra un nuevo bien como un vehículo o una propiedad.'}
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
                                        <FormLabel>Nombre del Activo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Toyota Hilux 2022" {...field} />
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
                                            {assetCategories.map(c => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="estimatedValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Estimado</FormLabel>
                                        <FormControl>
                                            <CurrencyInput
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="purchaseDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha de Compra</FormLabel>
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
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Patente GH-KL-12, 4x4, color rojo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {assetToEdit ? 'Guardar Cambios' : 'Guardar Activo'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
