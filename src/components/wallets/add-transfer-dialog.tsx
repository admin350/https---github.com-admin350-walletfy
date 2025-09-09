
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
  sourceAccountId: z.string().min(1, { message: "La cuenta de origen es requerida." }),
  destinationAccountId: z.string().min(1, { message: "La cuenta de destino es requerida." }),
  date: z.date({ required_error: "Fecha es requerida." }),
});

interface AddTransferDialogProps {
    children: ReactNode;
}

export function AddTransferDialog({ children }: AddTransferDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addTransaction, categories, bankAccounts, formatCurrency } = useData();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: '' as any,
            description: "Transferencia entre cuentas",
            sourceAccountId: "",
            destinationAccountId: "",
            date: new Date(),
        },
    });

    const transferCategory = categories.find(c => c.type === 'Transferencia');
    const sourceAccountId = form.watch("sourceAccountId");
    const sourceAccount = bankAccounts.find(acc => acc.id === sourceAccountId);

    const availableDestinationAccounts = bankAccounts.filter(acc => acc.id !== sourceAccountId);
    
    // Dynamic validation schema
    const dynamicFormSchema = formSchema.refine(data => {
        if (sourceAccount && data.amount > sourceAccount.balance) {
            return false;
        }
        return true;
    }, {
        message: "No puedes transferir más del saldo disponible en la cuenta de origen.",
        path: ["amount"],
    }).refine(data => data.sourceAccountId !== data.destinationAccountId, {
        message: "La cuenta de origen y destino no pueden ser la misma.",
        path: ["destinationAccountId"],
    });

    useEffect(() => {
        if (transferCategory) {
            form.setValue('category', transferCategory.name);
        }
    }, [transferCategory, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const validationResult = await dynamicFormSchema.safeParseAsync(values);
        if (!validationResult.success) {
            validationResult.error.errors.forEach((error) => {
                form.setError(error.path[0] as keyof typeof values, {
                    type: "manual",
                    message: error.message,
                });
            });
            return;
        }

        setIsLoading(true);
        try {
            if (!sourceAccount) throw new Error("Cuenta de origen no encontrada");

            await addTransaction({
                ...values,
                type: 'transfer',
                date: values.date.toISOString(),
                profile: sourceAccount.profile,
                category: transferCategory?.name || 'Transferencia',
            });
            
            toast({
                title: "Transferencia Exitosa",
                description: `Has transferido ${formatCurrency(values.amount)} de ${sourceAccount.name}.`,
            });
            
            setOpen(false);
            form.reset({
                amount: '' as any,
                description: "Transferencia entre cuentas",
                sourceAccountId: "",
                destinationAccountId: "",
                date: new Date(),
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || `No se pudo realizar la transferencia.`,
                variant: 'destructive'
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
                    <DialogTitle>Realizar Transferencia</DialogTitle>
                    <DialogDescription>
                        Mueve fondos entre tus cuentas bancarias registradas.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                             <FormField
                                control={form.control}
                                name="sourceAccountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Desde la Cuenta</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona cuenta de origen" />
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
                                name="destinationAccountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hacia la Cuenta</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!sourceAccountId}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={!sourceAccountId ? "Elige origen primero" : "Selecciona cuenta de destino"} />
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
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto a Transferir</FormLabel>
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
                                            <Input placeholder="Ej: Traspaso de fondos" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha de la Transferencia</FormLabel>
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
                                Confirmar Transferencia
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
