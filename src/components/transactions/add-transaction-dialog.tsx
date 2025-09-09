
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
import { useSubmitAction } from '@/hooks/use-submit-action';


const formSchema = z.object({
  type: z.enum(["income", "expense", "transfer"], { required_error: "Tipo es requerido." }),
  amount: z.coerce.number().positive({ message: "Monto debe ser positivo." }),
  description: z.string().min(2, { message: "Descripción es muy corta." }),
  category: z.string().min(1, { message: "Categoría es requerida." }),
  profile: z.string().min(1, { message: "El perfil es requerido."}),
  accountId: z.string().min(1, { message: "La cuenta de origen es requerida." }),
  destinationAccountId: z.string().optional(),
  paymentMethod: z.string().optional(), // 'account-balance', 'credit-line', or cardId
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

type FormValues = z.infer<typeof formSchema>;

interface AddTransactionDialogProps {
    children?: ReactNode;
    transactionToEdit?: Partial<Transaction>;
    defaultType?: 'income' | 'expense' | 'transfer';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onFinish?: () => void;
}

export function AddTransactionDialog({ children, transactionToEdit, defaultType = 'expense', open, onOpenChange, onFinish }: AddTransactionDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { addTransaction, updateTransaction, categories, profiles, bankAccounts, bankCards, formatCurrency } = useData();
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: defaultType,
            amount: '' as any,
            description: "",
            category: "",
            profile: "",
            accountId: "",
            destinationAccountId: undefined,
            paymentMethod: 'account-balance',
            date: new Date(),
            isInstallment: false,
            installments: undefined,
        },
    });

     const { performAction, isLoading, isSuccess } = useSubmitAction({
        action: async (values: FormValues) => {
             const transactionData = {
                ...values,
                date: values.date.toISOString(),
            };
            if (transactionToEdit && transactionToEdit.id) {
                 await addTransaction(transactionData);
            } else {
                await addTransaction(transactionData);
            }
        },
        onSuccess: () => {
            toast({
                title: transactionToEdit?.id ? "Transacción actualizada" : "Transacción añadida",
                description: `La transacción ha sido ${transactionToEdit?.id ? 'actualizada' : 'registrada'} exitosamente.`,
            });
            if (onFinish) onFinish();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || `No se pudo ${transactionToEdit?.id ? 'actualizar' : 'añadir'} la transacción.`,
                variant: 'destructive'
            });
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setDialogOpen(false);
        }
    }, [isSuccess, setDialogOpen]);

    useEffect(() => {
        if(dialogOpen) {
            const transferCategory = categories.find(c => c.type === 'Transferencia');
            const initialValues: Partial<FormValues> = {
                type: defaultType,
                amount: '' as any,
                description: "",
                category: "",
                profile: "",
                accountId: "",
                destinationAccountId: undefined,
                paymentMethod: 'account-balance',
                date: new Date(),
                isInstallment: false,
                installments: undefined,
            };

            if (transactionToEdit) {
                Object.assign(initialValues, {
                    ...transactionToEdit,
                    amount: transactionToEdit.amount || ('' as any),
                    date: transactionToEdit.date ? new Date(transactionToEdit.date) : new Date(),
                    paymentMethod: transactionToEdit.cardId || 'account-balance'
                });
            }
            
            if (initialValues.type === 'transfer' && transferCategory) {
                initialValues.category = transferCategory.name;
            }
            
            form.reset(initialValues as FormValues);
        }
    }, [transactionToEdit, defaultType, form, dialogOpen, categories]);


    const transactionType = form.watch("type");
    const selectedProfile = form.watch("profile");
    const sourceAccountId = form.watch("accountId");
    const paymentMethod = form.watch("paymentMethod");
    const isInstallment = form.watch("isInstallment");
    
    const sourceAccount = bankAccounts.find(acc => acc.id === sourceAccountId);
    const selectedCard = bankCards.find(c => c.id === paymentMethod);

    const availableCategories = categories.filter(c => {
        if (transactionType === 'income') return c.type === 'Ingreso';
        if (transactionType === 'expense') return c.type === 'Gasto';
        return false; // Hide for transfer
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
        // Reset payment method if source account changes
        form.setValue('paymentMethod', 'account-balance');
    }, [sourceAccountId, form]);

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
                <form onSubmit={form.handleSubmit(performAction)} className="space-y-4">
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
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Pagar con</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} >
                                    <FormControl>
                                    <SelectTrigger disabled={!sourceAccountId}>
                                        <SelectValue placeholder={!sourceAccountId ? "Elige una cuenta primero" : "Selecciona método de pago"} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="account-balance">Saldo de la Cuenta ({formatCurrency(sourceAccount?.balance || 0)})</SelectItem>
                                        {sourceAccount?.hasCreditLine && (
                                            <SelectItem value="credit-line">
                                                Línea de Crédito (Disponible: {formatCurrency((sourceAccount.creditLineLimit || 0) - (sourceAccount.creditLineUsed || 0))})
                                            </SelectItem>
                                        )}
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
                    {transactionType !== 'transfer' && (
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
                                        {availableCategories.map(c => (
                                            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
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

    