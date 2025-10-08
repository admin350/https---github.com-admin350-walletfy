
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


const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Monto debe ser positivo." }),
  description: z.string().min(2, { message: "Descripción es muy corta." }),
  category: z.string().min(1, { message: "Categoría es requerida." }),
  accountId: z.string().min(1, { message: "La cuenta de origen es requerida." }),
  date: z.date({ required_error: "Fecha es requerida." }),
});

interface AddWithdrawalDialogProps {
    children: ReactNode;
}

export function AddWithdrawalDialog({ children }: AddWithdrawalDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addTransaction, categories, bankAccounts, formatCurrency } = useData();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
            description: "Retiro en Efectivo",
            category: "",
            accountId: "",
            date: new Date(),
        },
    });

    const selectedAccountId = form.watch("accountId");
    const selectedAccount = bankAccounts.find(acc => acc.id === selectedAccountId);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            if (selectedAccount && values.amount > selectedAccount.balance) {
                form.setError("amount", { type: "manual", message: "El retiro no puede exceder el saldo de la cuenta." });
                throw new Error("Saldo insuficiente");
            }
            
             if (!selectedAccount) {
                throw new Error("Cuenta no encontrada.");
            }
            
             await addTransaction({
                ...values,
                type: 'expense',
                profile: selectedAccount.profile,
            });

            toast({
                title: "Retiro Registrado",
                description: `Se ha registrado un egreso de ${formatCurrency(values.amount)} de la cuenta ${selectedAccount?.name}.`,
            });
            setOpen(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            if (!form.formState.errors.amount) {
                toast({
                    title: "Error",
                    description: err.message || `No se pudo añadir el retiro.`,
                    variant: 'destructive'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(!open) {
            form.reset({
                amount: 0,
                description: "Retiro en Efectivo",
                category: "",
                accountId: "",
                date: new Date(),
            });
        }
    }, [open, form]);

    const expenseCategories = categories.filter(c => c.type === 'Gasto');
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Retiro en Efectivo</DialogTitle>
                    <DialogDescription>
                        Registra una salida de dinero desde una de tus cuentas.
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
                                        <FormLabel>Cuenta de Origen</FormLabel>
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
                                        <FormLabel>Monto a Retirar</FormLabel>
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
                                            <Input placeholder="Ej: Retiro para gastos" {...field} />
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
                                                {expenseCategories.map(c => (
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
                                        <FormLabel>Fecha del Retiro</FormLabel>
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
                                Guardar Retiro
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
