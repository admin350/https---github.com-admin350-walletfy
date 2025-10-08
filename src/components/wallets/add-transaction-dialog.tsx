

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
    FormDescription,
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
import { CalendarIcon, Loader2, Percent } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import type { Transaction, Debt } from '@/types';
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
  // Tax fields
  includesTax: z.boolean().default(false),
  taxRate: z.coerce.number().optional(),
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
    const { addTransaction, updateTransaction, categories, profiles, bankAccounts, bankCards, formatCurrency, addDebt } = useData();
    
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: defaultType,
            amount: '' as unknown as number,
            description: "",
            category: "",
            profile: "",
            accountId: "",
            destinationAccountId: undefined,
            paymentMethod: 'account-balance',
            date: new Date(),
            isInstallment: false,
            installments: undefined,
            includesTax: false,
            taxRate: 19,
        },
    });

    const { performAction, isLoading, isSuccess } = useSubmitAction<FormValues>({
        action: async (values: FormValues) => {
            if (values.isInstallment) {
                const card = bankCards.find(c => c.id === values.paymentMethod);
                if (!card) throw new Error("Tarjeta de crédito no encontrada para la compra en cuotas.");

                const newDebt: Omit<Debt, 'id' | 'paidAmount'> = {
                    name: `Compra en cuotas: ${values.description}`,
                    totalAmount: values.amount,
                    monthlyPayment: values.amount / (values.installments || 1),
                    installments: values.installments || 1,
                    debtType: 'credit-card' as const,
                    profile: values.profile,
                    accountId: values.accountId,
                    cardId: card.id,
                    dueDate: addMonths(values.date, 1),
                };

                await addDebt(newDebt);
                
                toast({
                    title: "Deuda por Cuotas Creada",
                    description: `Se ha creado una nueva deuda para tu compra en ${values.installments} cuotas.`,
                });

            } else {
                 const transactionData = { ...values };

                if (transactionToEdit && transactionToEdit.id) {
                    await updateTransaction({ ...transactionToEdit, ...transactionData, id: transactionToEdit.id });
                } else {
                    await addTransaction(transactionData);
                }
            }
        },
        onSuccess: () => {
            if (!form.getValues('isInstallment')) {
                toast({
                    title: transactionToEdit?.id ? "Transacción actualizada" : "Transacción añadida",
                    description: `La transacción ha sido ${transactionToEdit?.id ? 'actualizada' : 'registrada'} exitosamente.`,
                });
            }
            if (onFinish) onFinish();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || `No se pudo procesar la operación.`,
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
            const hasTax = !!transactionToEdit?.taxDetails;
            const initialValues: Partial<FormValues> = {
                type: transactionToEdit?.type || defaultType,
                amount: transactionToEdit?.amount || ('' as unknown as number),
                description: transactionToEdit?.description || "",
                category: transactionToEdit?.category || "",
                profile: transactionToEdit?.profile || "",
                accountId: transactionToEdit?.accountId || "",
                destinationAccountId: transactionToEdit?.destinationAccountId || undefined,
                paymentMethod: transactionToEdit?.cardId || 'account-balance',
                date: transactionToEdit?.date ? new Date(transactionToEdit.date) : new Date(),
                isInstallment: false,
                installments: undefined,
                includesTax: hasTax,
                taxRate: transactionToEdit?.taxDetails?.rate || 19,
            };
    
            form.reset(initialValues as FormValues);
        } else {
            form.reset({
                type: defaultType,
                amount: '' as unknown as number,
                description: "",
                category: "",
                profile: "",
                accountId: "",
                destinationAccountId: undefined,
                paymentMethod: 'account-balance',
                date: new Date(),
                isInstallment: false,
                installments: undefined,
                includesTax: false,
                taxRate: 19,
            });
        }
    }, [transactionToEdit, defaultType, form, dialogOpen]);


    const transactionType = form.watch("type");
    const selectedProfile = form.watch("profile");
    const sourceAccountId = form.watch("accountId");
    const paymentMethod = form.watch("paymentMethod");
    const isInstallment = form.watch("isInstallment");
    const includesTax = form.watch("includesTax");
    
    const sourceAccount = bankAccounts.find(acc => acc.id === sourceAccountId);
    const selectedCard = bankCards.find(c => c.id === paymentMethod);

    const availableCategories = categories.filter(c => {
        if (transactionType === 'income') return c.type === 'Ingreso';
        if (transactionType === 'expense') return c.type === 'Gasto';
        // For 'transfer', the category is set programmatically and the field is hidden
        return false;
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
                            <Select onValueChange={field.onChange} value={field.value} disabled={!!transactionToEdit?.id}>
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

                    {transactionType !== 'transfer' && (
                        <FormField
                            control={form.control}
                            name="includesTax"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                     <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>¿Esta transacción incluye impuestos? (Ej: IVA)</FormLabel>
                                        <FormDescription>
                                            Marca esto si el monto total incluye impuestos que necesitas rastrear.
                                        </FormDescription>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    )}
                    {includesTax && transactionType !== 'transfer' && (
                        <FormField
                            control={form.control}
                            name="taxRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tasa de Impuesto (%)</FormLabel>
                                    <div className="relative">
                                         <FormControl>
                                            <Input type="number" placeholder="19" {...field} value={field.value ?? ''} className="pl-8"/>
                                        </FormControl>
                                        <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
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

    