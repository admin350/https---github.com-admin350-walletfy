
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Monto debe ser positivo." }),
  description: z.string().min(2, { message: "Descripción es muy corta." }),
  sourceAccountId: z.string().min(1, { message: "La cuenta de origen es requerida." }),
  destinationAccountId: z.string().min(1, { message: "La cuenta de destino es requerida." }),
  date: z.date({ required_error: "Fecha es requerida." }),
}).refine(data => data.sourceAccountId !== data.destinationAccountId, {
    message: "La cuenta de origen y destino no pueden ser la misma.",
    path: ["destinationAccountId"],
});

type FormValues = z.infer<typeof formSchema>;

export function AddTransferDialog({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addTransaction, categories, bankAccounts, formatCurrency } = useData();
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
            description: "",
            sourceAccountId: "",
            destinationAccountId: "",
            date: new Date(),
        },
    });

    const sourceAccountId = form.watch("sourceAccountId");
    const sourceAccount = bankAccounts.find(acc => acc.id === sourceAccountId);

    // This dynamic schema check is great, but we still need to handle the initial submission logic carefully.
    const dynamicSchema = formSchema.refine(data => {
        if (sourceAccount && data.amount > sourceAccount.balance) {
            return false;
        }
        return true;
    }, {
        message: `El monto no puede ser mayor al saldo de la cuenta de origen (${formatCurrency(sourceAccount?.balance || 0)}).`,
        path: ["amount"],
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            // Re-validate with the most current data right before submitting
            const validationResult = dynamicSchema.safeParse(values);
            if (!validationResult.success) {
                // Find the specific error and set it on the form
                const amountError = validationResult.error.errors.find(e => e.path.includes('amount'));
                if (amountError) {
                    form.setError("amount", { type: "manual", message: amountError.message });
                }
                const destError = validationResult.error.errors.find(e => e.path.includes('destinationAccountId'));
                 if (destError) {
                    form.setError("destinationAccountId", { type: "manual", message: destError.message });
                }
                throw new Error(amountError?.message || destError?.message || "Validation failed");
            }
            
            const sourceProfile = bankAccounts.find(a => a.id === values.sourceAccountId)?.profile;
            if (!sourceProfile) throw new Error("Perfil de la cuenta de origen no encontrado");
            
            const transferCategory = categories.find(c => c.type === 'Transferencia');
            if (!transferCategory) throw new Error("Categoría de transferencia no encontrada.");

            await addTransaction({
                type: 'transfer',
                amount: values.amount,
                description: values.description,
                category: transferCategory.name,
                profile: sourceProfile,
                date: values.date,
                accountId: values.sourceAccountId,
                destinationAccountId: values.destinationAccountId,
            });
            toast({
                title: "Transferencia Exitosa",
                description: `Has transferido ${formatCurrency(values.amount)}.`,
            });
            setOpen(false);
        } catch (error) {
            // Only show a generic toast if the form itself doesn't have a more specific error
            if (!form.formState.errors.amount && !form.formState.errors.destinationAccountId) {
                 const err = error instanceof Error ? error : new Error('An unknown error occurred');
                 toast({
                    title: "Error en la Transferencia",
                    description: err.message || `No se pudo registrar la transferencia.`,
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
                description: "",
                sourceAccountId: "",
                destinationAccountId: "",
                date: new Date(),
            });
        }
    }, [open, form]);

    const availableDestinationAccounts = bankAccounts.filter(acc => acc.id !== sourceAccountId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Realizar Transferencia</DialogTitle>
          <DialogDescription>
            Mueve fondos entre tus cuentas bancarias.
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
                                            <SelectValue placeholder="Selecciona una cuenta de origen" />
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
                                            <SelectValue placeholder="Selecciona una cuenta de destino" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availableDestinationAccounts.map(a => (
                                            <SelectItem key={a.id} value={a.id}>{a.name} ({a.bank})</SelectItem>
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
                                    <CurrencyInput value={field.value} onValueChange={field.onChange}/>
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
                                    <Input placeholder="Ej: Traspaso a ahorros" {...field} />
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
                                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
