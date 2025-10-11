

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
import type { BankCard } from '@/types';
import { useSubmitAction } from '@/hooks/use-submit-action';

const formSchema = z.object({
  name: z.string().min(2, { message: "El alias es muy corto." }),
  bank: z.string().min(2, { message: "El banco es requerido." }),
  brand: z.enum(["visa", "mastercard", "amex", "other"], { required_error: "La marca es requerida." }),
  cardType: z.enum(["credit", "debit", "prepaid"], { required_error: "El tipo es requerido."}),
  last4Digits: z.string().length(4, { message: "Debe contener 4 dígitos." }),
  profile: z.string().min(1, { message: "El perfil es requerido." }),
  accountId: z.string().min(1, { message: "La cuenta asociada es requerida." }),
  creditLimit: z.coerce.number().optional(),
  cardLevel: z.string().optional(),
  cardColor: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddBankCardDialogProps {
    children?: ReactNode;
    cardToEdit?: BankCard;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddBankCardDialog({ children, cardToEdit, open, onOpenChange }: AddBankCardDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { addBankCard, updateBankCard, profiles, bankAccounts } = useData();
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            bank: "",
            brand: "visa",
            cardType: "credit",
            last4Digits: "",
            profile: "",
            accountId: "",
            creditLimit: 0,
            cardLevel: "",
            cardColor: "#374151"
        },
    });

    const { performAction, isLoading, isSuccess } = useSubmitAction<FormValues>({
        action: async (values: FormValues) => {
            if (cardToEdit) {
                await updateBankCard({ ...cardToEdit, ...values });
            } else {
                await addBankCard(values);
            }
        },
        onSuccess: () => {
             toast({
                title: cardToEdit ? "Tarjeta actualizada" : "Tarjeta añadida",
                description: `La tarjeta ha sido ${cardToEdit ? 'actualizada' : 'creada'} exitosamente.`,
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || `No se pudo ${cardToEdit ? 'actualizar' : 'añadir'} la tarjeta.`,
                variant: "destructive"
            });
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setDialogOpen(false);
        }
    }, [isSuccess, setDialogOpen]);
    
    useEffect(() => {
        if (dialogOpen) {
            if (cardToEdit) {
                form.reset({
                    ...cardToEdit,
                    creditLimit: cardToEdit.creditLimit ?? 0,
                    cardLevel: cardToEdit.cardLevel ?? "",
                    cardColor: cardToEdit.cardColor ?? "#374151",
                    brand: cardToEdit.brand ?? "visa",
                });
            } else {
                form.reset({
                    name: "",
                    bank: "",
                    brand: "visa",
                    cardType: "credit",
                    last4Digits: "",
                    profile: "",
                    accountId: "",
                    creditLimit: 0,
                    cardLevel: "",
                    cardColor: "#374151"
                });
            }
        }
    }, [cardToEdit, form, dialogOpen]);

    const cardType = form.watch("cardType");
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
                        <form onSubmit={form.handleSubmit(performAction)} className="space-y-4">
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
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Marca</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una marca" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="visa">Visa</SelectItem>
                                            <SelectItem value="mastercard">Mastercard</SelectItem>
                                            <SelectItem value="amex">American Express</SelectItem>
                                            <SelectItem value="other">Otra</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                                <CurrencyInput value={field.value || 0} onValueChange={field.onChange} />
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
                                                <SelectItem key={acc.id} value={acc.id}>{acc.bank} - {acc.accountType} ({acc.name})</SelectItem>
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
