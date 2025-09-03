
'use client';
import { ReactNode, useState, useContext } from 'react';
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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DataContext } from '@/context/data-context';

const formSchema = z.object({
  name: z.string().min(2, { message: "Nombre de la suscripción es muy corto." }),
  amount: z.coerce.number().positive({ message: "Monto debe ser positivo." }),
  nextDueDate: z.date({ required_error: "Fecha de próximo pago es requerida." }),
  cardId: z.string().min(1, { message: "La tarjeta es requerida."}),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
});

export function AddSubscriptionDialog({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addSubscription, profiles, bankCards } = useContext(DataContext);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            amount: '' as any,
            nextDueDate: new Date(),
            cardId: "",
            profile: "",
        },
    });
    
    const selectedProfile = form.watch("profile");
    const filteredCards = bankCards.filter(card => card.profile === selectedProfile);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            await addSubscription({
                name: values.name,
                amount: values.amount,
                dueDate: values.nextDueDate,
                cardId: values.cardId,
                profile: values.profile,
            });
            toast({
                title: "Suscripción añadida",
                description: "Tu suscripción ha sido registrada exitosamente.",
            });
            setOpen(false);
            form.reset();
        } catch (error) {
             toast({
                title: "Error",
                description: "No se pudo añadir la suscripción.",
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
                    <DialogTitle>Añadir Nueva Suscripción</DialogTitle>
                    <DialogDescription>
                        Registra un nuevo pago recurrente.
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
                                    <FormLabel>Monto</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="$15.990" {...field} value={field.value ?? ''} />
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
                                            {filteredCards.map(card => (
                                                <SelectItem key={card.id} value={card.id}>
                                                   {card.name} (**** {card.last4Digits})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nextDueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Fecha Próximo Pago</FormLabel>
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
                            Guardar Suscripción
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
