
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '@/context/data-context';
import type { BankCard } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "El alias es muy corto." }),
  bank: z.string().min(2, { message: "El banco es requerido." }),
  cardType: z.enum(["credit", "debit", "prepaid"], { required_error: "El tipo es requerido."}),
  last4Digits: z.string().length(4, { message: "Debe contener 4 dígitos." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
  accountId: z.string().min(1, { message: "La cuenta asociada es requerida." }),
  creditLimit: z.coerce.number().optional(),
  cardLevel: z.string().optional(),
  cardColor: z.string().optional(),
});

interface AddBankCardDialogProps {
    children?: ReactNode;
    cardToEdit?: BankCard;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddBankCardDialog({ children, cardToEdit, open, onOpenChange }: AddBankCardDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addBankCard, updateBankCard, profiles, bankAccounts, formatCurrency } = useData();
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            bank: "",
            cardType: "credit",
            last4Digits: "",
            profile: "",
            accountId: "",
            creditLimit: undefined,
            cardLevel: "",
            cardColor: "#374151"
        },
    });
    
    const cardType = form.watch("cardType");

    useEffect(() => {
        if (dialogOpen && cardToEdit) {
            form.reset({
                ...cardToEdit,
                creditLimit: cardToEdit.creditLimit ?? undefined,
                cardLevel: cardToEdit.cardLevel ?? "",
                cardColor: cardToEdit.cardColor ?? "#374151"
            });
        } else if (dialogOpen && !cardToEdit) {
            form.reset({
                name: "",
                bank: "",
                cardType: "credit",
                last4Digits: "",
                profile: "",
                accountId: "",
                creditLimit: undefined,
                cardLevel: "",
                cardColor: "#374151"
            });
        }
    }, [cardToEdit, form, dialogOpen]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            if(cardToEdit) {
                await updateBankCard({ ...cardToEdit, ...values });
                 toast({
                    title: "Tarjeta actualizada",
                    description: "Tu tarjeta ha sido actualizada exitosamente.",
                });
            } else {
                await addBankCard(values);
                toast({
                    title: "Tarjeta añadida",
                    description: "Tu nueva tarjeta ha sido creada exitosamente.",
                });
            }
            form.reset();
            setDialogOpen(false);
        } catch (error) {
             toast({
                title: "Error",
                description: `No se pudo ${cardToEdit ? 'actualizar' : 'añadir'} la tarjeta.`,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }
    
    const selectedProfile = form.watch("profile");
    const filteredAccounts = bankAccounts.filter(acc => acc.profile === selectedProfile);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{cardToEdit ? 'Editar' : 'Añadir Nueva'} Tarjeta Bancaria</DialogTitle>
                    <DialogDescription>
                        {cardToEdit ? 'Actualiza los detalles de tu tarjeta.' : 'Define una nueva tarjeta para gestionar gastos.'}
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
                                        <FormLabel>Alias de la Tarjeta</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Visa Gold Personal" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bank"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Banco Emisor</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Banco de Chile" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cardLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nivel de la Tarjeta (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Black, Signature, Premium" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last4Digits"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Últimos 4 Dígitos</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1234" {...field} maxLength={4} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cardColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color de la Tarjeta</FormLabel>
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
                            <FormField
                                control={form.control}
                                name="cardType"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Tipo de Tarjeta</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un tipo" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="credit">Crédito</SelectItem>
                                            <SelectItem value="debit">Débito</SelectItem>
                                            <SelectItem value="prepaid">Crédito Prepago</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {cardType === 'credit' && (
                                <FormField
                                    control={form.control}
                                    name="creditLimit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Límite de Crédito</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder={formatCurrency(2000000)} {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="profile"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Perfil Asociado</FormLabel>
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
                                name="accountId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Cuenta Bancaria Vinculada</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProfile}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={selectedProfile ? "Selecciona una cuenta" : "Primero elige un perfil"} />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {filteredAccounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.bank})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {cardToEdit ? 'Guardar Cambios' : 'Guardar Tarjeta'}
                            </Button>
                        </form>
                    </Form>
                 </div>
            </DialogContent>
        </Dialog>
    );
}
