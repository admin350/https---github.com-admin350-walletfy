
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
import { format, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import { Transaction } from '@/types';


const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Monto debe ser positivo." }),
  description: z.string().min(2, { message: "Descripción es muy corta." }),
  category: z.string().min(1, { message: "Categoría es requerida." }),
  accountId: z.string().min(1, { message: "La cuenta de destino es requerida." }),
  date: z.date({ required_error: "Fecha es requerida." }),
});

interface AddDepositDialogProps {
    children: ReactNode;
}

export function AddDepositDialog({ children }: AddDepositDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addTransaction, categories, bankAccounts, transactions, formatCurrency } = useData();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
            description: "",
            category: "",
            accountId: "",
            date: new Date(),
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const selectedAccount = bankAccounts.find(acc => acc.id === values.accountId);

            if (selectedAccount && selectedAccount.accountType === 'Cuenta Vista') {
                const currentMonth = getMonth(new Date());
                const currentYear = getYear(new Date());
                
                const currentMonthIncome = transactions
                    .filter((t: Transaction) => 
                        ((t.type === 'income' && t.accountId === selectedAccount.id) || 
                         (t.type === 'transfer' && t.destinationAccountId === selectedAccount.id)) &&
                         getMonth(new Date(t.date)) === currentMonth &&
                         getYear(new Date(t.date)) === currentYear
                    )
                    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

                if ((currentMonthIncome + values.amount) > (selectedAccount.monthlyLimit ?? Infinity)) {
                    form.setError("amount", { type: "manual", message: "Este depósito supera el límite de ingresos mensuales para esta cuenta." });
                    throw new Error("Límite de depósito mensual excedido.");
                }
            }

            if (!selectedAccount) {
                throw new Error("Cuenta no encontrada.");
            }
            
            await addTransaction({
                ...values,
                type: 'income',
                profile: selectedAccount.profile,
            });

            toast({
                title: "Depósito Registrado",
                description: `Se ha añadido un ingreso de ${formatCurrency(values.amount)} a la cuenta ${selectedAccount?.name}.`,
            });
            setOpen(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
             if (!form.formState.errors.amount) {
                toast({
                    title: "Error",
                    description: err.message || `No se pudo añadir el depósito.`,
                    variant: 'destructive'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(!open) {
            form.reset();
        }
    }, [open, form]);

    const incomeCategories = categories.filter(c => c.type === 'Ingreso');

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Depósito</DialogTitle>
                    <DialogDescription>
                        Añade un nuevo ingreso a una de tus cuentas bancarias.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                             <FormField
                                control={form.control}
                                name="accountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cuenta de Destino</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona una cuenta" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {bankAccounts.map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name} ({a.bank}) - {formatCurrency(a.balance)}</SelectItem>
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
                                            <CurrencyInput value={field.value} onValueChange={field.onChange} />
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
                                            <Input placeholder="Ej: Pago de cliente" {...field} />
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
                                                {incomeCategories.map(c => (
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
                                        <FormLabel>Fecha del Depósito</FormLabel>
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
                                Guardar Depósito
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
