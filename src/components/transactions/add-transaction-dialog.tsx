

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useData } from '@/context/data-context';
import type { Transaction } from '@/types';
import { Checkbox } from '../ui/checkbox';


const formSchema = z.object({
  type: z.enum(["income", "expense", "transfer"], { required_error: "Tipo es requerido." }),
  amount: z.coerce.number().positive({ message: "Monto debe ser positivo." }),
  description: z.string().min(2, { message: "Descripción es muy corta." }),
  category: z.string().min(1, { message: "Categoría es requerida." }),
  profile: z.string().min(1, { message: "El perfil es requerido."}),
  accountId: z.string().min(1, { message: "La cuenta de origen es requerida." }),
  destinationAccountId: z.string().optional(),
  cardId: z.string().optional(),
  date: z.date({ required_error: "Fecha es requerida." }),
  isInstallment: z.boolean().default(false),
  installments: z.coerce.number().optional(),
}).refine(data => {
    if (data.type === 'transfer' && !data.destinationAccountId) {
        return false;
    }
    return true;
}, {
    message: "La cuenta de destino es requerida para las transferencias.",
    path: ["destinationAccountId"],
}).refine(data => {
    if (data.type === 'transfer' && data.accountId === data.destinationAccountId) {
        return false;
    }
    return true;
}, {
    message: "La cuenta de origen y destino no pueden ser la misma.",
    path: ["destinationAccountId"],
}).refine(data => {
    if (data.isInstallment && (!data.installments || data.installments < 2)) {
        return false;
    }
    return true;
}, {
    message: "El número de cuotas debe ser 2 o más.",
    path: ["installments"],
});

interface AddTransactionDialogProps {
    children?: ReactNode;
    transactionToEdit?: Partial<Transaction>;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onFinish?: () => void;
}

export function AddTransactionDialog({ children, transactionToEdit, open, onOpenChange, onFinish }: AddTransactionDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addTransaction, updateTransaction, categories, profiles, bankAccounts, bankCards, formatCurrency } = useData();
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "expense",
            amount: '' as any,
            description: "",
            category: "",
            profile: "",
            accountId: "",
            destinationAccountId: undefined,
            cardId: undefined,
            date: new Date(),
            isInstallment: false,
            installments: undefined,
        },
    });

    useEffect(() => {
        if(dialogOpen && transactionToEdit) {
            form.reset({
                ...transactionToEdit,
                amount: transactionToEdit.amount || ('' as any),
                date: transactionToEdit.date ? new Date(transactionToEdit.date) : new Date(),
                isInstallment: false, // Don't support editing installments for now
                installments: undefined,
            });
        } else if (dialogOpen && !transactionToEdit) {
             form.reset({
                type: "expense",
                amount: '' as any,
                description: "",
                category: "",
                profile: "",
                accountId: "",
                destinationAccountId: undefined,
                cardId: undefined,
                date: new Date(),
                isInstallment: false,
                installments: undefined,
            });
        }
    }, [transactionToEdit, form, dialogOpen]);


    const transactionType = form.watch("type");
    const selectedProfile = form.watch("profile");
    const sourceAccountId = form.watch("accountId");
    const selectedCardId = form.watch("cardId");
    const isInstallment = form.watch("isInstallment");
    
    const selectedCard = bankCards.find(c => c.id === selectedCardId);

    const availableCategories = categories.filter(c => {
        if (transactionType === 'income') return c.type === 'Ingreso';
        if (transactionType === 'expense') return c.type === 'Gasto';
        if (transactionType === 'transfer') return c.type === 'Transferencia';
        return true;
    });

    const availableAccounts = bankAccounts.filter(acc => !selectedProfile || acc.profile === selectedProfile);
    const availableDestinationAccounts = bankAccounts.filter(acc => acc.id !== sourceAccountId);
    const availableCards = bankCards.filter(card => !sourceAccountId || card.accountId === sourceAccountId);

    useEffect(() => {
        if (transactionType === 'transfer') {
            const transferCategory = categories.find(c => c.type === 'Transferencia');
            if (transferCategory) {
                form.setValue('category', transferCategory.name);
            }
        }
    }, [transactionType, categories, form]);
    
    useEffect(() => {
        // Reset cardId if source account changes and the card is no longer valid
        if (sourceAccountId && selectedCardId) {
            const cardIsValid = availableCards.some(c => c.id === selectedCardId);
            if (!cardIsValid) {
                form.setValue('cardId', undefined);
            }
        }
    }, [sourceAccountId, selectedCardId, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            if (transactionToEdit && transactionToEdit.id) {
                await updateTransaction({
                    ...values,
                    id: transactionToEdit.id,
                    date: values.date.toISOString(),
                });
                 toast({
                    title: "Transacción actualizada",
                    description: "Tu transacción ha sido actualizada exitosamente.",
                });
            } else {
                 await addTransaction({
                    ...values,
                    date: values.date.toISOString(),
                });
                toast({
                    title: "Transacción añadida",
                    description: "Tu transacción ha sido registrada exitosamente.",
                });
            }
           
            form.reset({
                type: "expense",
                amount: '' as any,
                description: "",
                category: "",
                profile: "",
                accountId: "",
                date: new Date(),
            });
            setDialogOpen(false);
            if(onFinish) onFinish();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || `No se pudo ${transactionToEdit?.id ? 'actualizar' : 'añadir'} la transacción.`,
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transactionToEdit?.id ? 'Editar' : 'Añadir'} Transacción</DialogTitle>
          <DialogDescription>
            {transactionToEdit?.id ? 'Edita los detalles de tu transacción.' : 'Registra un nuevo ingreso, egreso o transferencia.'}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                    <SelectItem value="expense">Egreso</SelectItem>
                                    <SelectItem value="income">Ingreso</SelectItem>
                                    <SelectItem value="transfer">Transferencia</SelectItem>
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
                                <Input type="number" placeholder={formatCurrency(0)} {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Compra semanal" {...field} />
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
                        name="accountId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{transactionType === 'transfer' ? 'Cuenta de Origen' : 'Cuenta Afectada'}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una cuenta" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {availableAccounts.map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.bank}) - {formatCurrency(a.balance)}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    {transactionType === 'transfer' && (
                         <FormField
                            control={form.control}
                            name="destinationAccountId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Cuenta de Destino</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona cuenta de destino" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {availableDestinationAccounts.map(a => (
                                        <SelectItem key={a.id} value={a.id}>{a.name} ({a.bank}) - {formatCurrency(a.balance)}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {transactionType === 'expense' && (
                        <FormField
                            control={form.control}
                            name="cardId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Tarjeta Utilizada (Opcional)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} >
                                    <FormControl>
                                    <SelectTrigger disabled={!sourceAccountId}>
                                        <SelectValue placeholder={!sourceAccountId ? "Elige una cuenta primero" : "Efectivo / Transferencia"} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ninguna">Ninguna (Efectivo/Transferencia)</SelectItem>
                                        {availableCards.map(c => {
                                            const availableCredit = c.creditLimit ? c.creditLimit - (c.usedAmount || 0) : 0;
                                            return (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name} (**** {c.last4Digits})
                                                    {c.cardType === 'credit' && ` - Disp: ${formatCurrency(availableCredit)}`}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {selectedCard?.cardType === 'credit' && (
                        <>
                            <FormField
                                control={form.control}
                                name="isInstallment"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                         <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>¿Diferir como deuda en cuotas?</FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            {isInstallment && (
                                 <FormField
                                    control={form.control}
                                    name="installments"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Cuotas</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ej: 3, 6, 12" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </>
                    )}
                     <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={transactionType === 'transfer'}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {availableCategories.map(c => (
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
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Fecha</FormLabel>
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
                                    disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                    }
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
                        {transactionToEdit?.id ? 'Guardar Cambios' : 'Guardar Transacción'}
                    </Button>
                </form>
            </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
