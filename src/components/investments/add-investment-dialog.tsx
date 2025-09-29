
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
import type { Investment } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "Nombre de la inversión es muy corto." }),
  initialAmount: z.coerce.number().positive({ message: "Monto inicial debe ser positivo." }),
  investmentType: z.string().min(2, { message: "Tipo de inversión es requerido." }),
  platform: z.string().min(2, { message: "La plataforma es requerida." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddInvestmentDialogProps {
    children?: ReactNode;
    investmentToEdit?: Investment;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddInvestmentDialog({ children, investmentToEdit, open, onOpenChange }: AddInvestmentDialogProps) {
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
            investmentType: "",
            platform: "",
            profile: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            if (investmentToEdit) {
                await updateInvestment({ ...values, id: investmentToEdit.id, currentValue: investmentToEdit.currentValue });
                toast({
                    title: "Inversión actualizada",
                    description: `La inversión ha sido actualizada exitosamente.`,
                });
            } else {
                await addInvestment(values);
                 toast({
                    title: "Inversión añadida",
                    description: `La inversión ha sido registrada exitosamente.`,
                });
            }
            setDialogOpen(false);
        } catch (error) {
             const err = error instanceof Error ? error : new Error('An unknown error occurred');
            toast({
                title: "Error",
                description: err.message || `No se pudo ${investmentToEdit ? 'actualizar' : 'añadir'} la inversión.`,
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
                    investmentType: investmentToEdit.investmentType,
                    platform: investmentToEdit.platform,
                    profile: investmentToEdit.profile,
                });
            } else {
                form.reset({
                    name: "",
                    initialAmount: 0,
                    investmentType: "",
                    platform: "",
                    profile: "",
                });
            }
        }
    }, [investmentToEdit, form, dialogOpen]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{investmentToEdit ? 'Editar' : 'Añadir Nueva'} Inversión</DialogTitle>
                    <DialogDescription>
                        {investmentToEdit ? 'Actualiza los detalles de tu activo.' : 'Registra un nuevo activo en tu portafolio.'}
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
                                            <Input placeholder="Ej: Acciones Apple" {...field} />
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
                                name="investmentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Inversión</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Acciones, Cripto, Forex" {...field} />
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
                                        <FormLabel>Plataforma / Broker</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Interactive Brokers, Binance" {...field} />
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
                                {investmentToEdit ? 'Guardar Cambios' : 'Guardar Inversión'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
