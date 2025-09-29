
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
import { Input, CurrencyInput } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import type { Subscription } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formSchema = z.object({
  name: z.string().min(2, { message: "Nombre de la suscripción es muy corto." }),
  amount: z.coerce.number().positive({ message: "Monto debe ser positivo." }),
  dueDate: z.date({ required_error: "La fecha de pago es requerida." }),
  cardId: z.string().min(1, { message: "La tarjeta es requerida."}),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
});

type FormValues = z.infer<typeof formSchema>;


interface UpdateSubscriptionDialogProps {
    subscription: Subscription;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpdateSubscriptionDialog({ subscription, open, onOpenChange }: UpdateSubscriptionDialogProps) {
    const { toast } = useToast();
    const { updateSubscription, profiles, bankCards, formatCurrency } = useData();
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: subscription.name,
            amount: subscription.amount,
            dueDate: new Date(subscription.dueDate),
            cardId: subscription.cardId,
            profile: subscription.profile,
        },
    });
    
    useEffect(() => {
        if(open){
            form.reset({
                name: subscription.name,
                amount: subscription.amount,
                dueDate: new Date(subscription.dueDate),
                cardId: subscription.cardId,
                profile: subscription.profile,
            });
        }
    }, [open, subscription, form]);

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            await updateSubscription({ ...subscription, ...values });
            toast({
                title: "Suscripción Actualizada",
                description: `La suscripción "${values.name}" ha sido actualizada.`,
            });
            onOpenChange(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
             toast({
                title: "Error",
                description: err.message || "No se pudo actualizar la suscripción.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    };
    
    const selectedProfile = form.watch("profile");
    const filteredCards = bankCards.filter(card => card.profile === selectedProfile);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Suscripción: {subscription.name}</DialogTitle>
                    <DialogDescription>
                       Actualiza los detalles de esta suscripción.
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
                                            <Input placeholder="Ej: Netflix, Spotify" {...field} />
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
                                name="cardId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Método de Pago</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProfile}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={selectedProfile ? "Selecciona una tarjeta" : "Primero elige un perfil"} />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {filteredCards.map(card => {
                                                    const availableCredit = card.creditLimit ? card.creditLimit - (card.usedAmount || 0) : 0;
                                                    return (
                                                        <SelectItem key={card.id} value={card.id}>
                                                        {card.bank} - {card.name} (**** {card.last4Digits})
                                                        {card.cardType === 'credit' && ` - Disp: ${formatCurrency(availableCredit)}`}
                                                        </SelectItem>
                                                    )
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Próximo Vencimiento</FormLabel>
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
                                Guardar Cambios
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
