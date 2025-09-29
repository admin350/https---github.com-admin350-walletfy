

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
import type { Investment } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "Nombre del activo es muy corto." }),
  initialAmount: z.coerce.number().positive({ message: "Monto inicial debe ser positivo." }),
  startDate: z.date({ required_error: "La fecha de inicio es requerida." }),
  investmentType: z.string().min(2, { message: "Tipo de activo es requerido." }),
  platform: z.string().min(2, { message: "La plataforma es requerida." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
  purpose: z.enum(['investment', 'saving']),
});

type FormValues = z.infer<typeof formSchema>;

interface AddInvestmentDialogProps {
    children?: ReactNode;
    investmentToEdit?: Investment;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    purpose: 'investment' | 'saving';
}

export function AddInvestmentDialog({ children, investmentToEdit, open, onOpenChange, purpose }: AddInvestmentDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addInvestment, updateInvestment, profiles } = useData();
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            initialAmount: 0,
            startDate: new Date(),
            investmentType: "",
            platform: "",
            profile: "",
            purpose: purpose,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            if (investmentToEdit) {
                await updateInvestment({ ...values, id: investmentToEdit.id, currentValue: investmentToEdit.currentValue });
                toast({
                    title: "Activo actualizado",
                    description: `El activo ha sido actualizado exitosamente.`,
                });
            } else {
                await addInvestment(values);
                 toast({
                    title: "Activo añadido",
                    description: `El activo ha sido registrado exitosamente.`,
                });
            }
            setDialogOpen(false);
        } catch (error) {
             const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || `No se pudo ${investmentToEdit ? 'actualizar' : 'añadir'} el activo.`,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (dialogOpen) {
            if (investmentToEdit) {
                form.reset({
                    name: investmentToEdit.name,
                    initialAmount: investmentToEdit.initialAmount,
                    startDate: new Date(investmentToEdit.startDate),
                    investmentType: investmentToEdit.investmentType,
                    platform: investmentToEdit.platform,
                    profile: investmentToEdit.profile,
                    purpose: investmentToEdit.purpose,
                });
            } else {
                form.reset({
                    name: "",
                    initialAmount: 0,
                    startDate: new Date(),
                    investmentType: "",
                    platform: "",
                    profile: "",
                    purpose: purpose,
                });
            }
        }
    }, [investmentToEdit, form, dialogOpen, purpose]);
    
    const titleText = purpose === 'investment' ? 'Inversión' : 'Instrumento de Ahorro';
    const descriptionText = purpose === 'investment' 
        ? 'Registra un nuevo activo en tu portafolio de inversión.'
        : 'Registra un nuevo instrumento en tu portafolio de ahorro.';


    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{investmentToEdit ? 'Editar' : 'Añadir Nuevo'} {titleText}</DialogTitle>
                    <DialogDescription>
                        {investmentToEdit ? 'Actualiza los detalles de tu activo.' : descriptionText}
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
                                            <Input placeholder={purpose === 'investment' ? "Ej: Acciones Apple" : "Ej: Depósito a Plazo"} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="initialAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto Invertido Inicialmente</FormLabel>
                                        <FormControl>
                                            <CurrencyInput value={field.value} onValueChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha de Inicio</FormLabel>
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
                                name="investmentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Activo</FormLabel>
                                        <FormControl>
                                            <Input placeholder={purpose === 'investment' ? "Ej: Acciones, Cripto" : "Ej: Renta Fija, Fondo Mutuo"} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="platform"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Plataforma / Institución</FormLabel>
                                        <FormControl>
                                            <Input placeholder={purpose === 'investment' ? "Ej: Interactive Brokers" : "Ej: Banco Estado"} {...field} />
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
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {investmentToEdit ? 'Guardar Cambios' : `Guardar ${titleText}`}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
