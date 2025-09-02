

'use client';
import { ReactNode, useState, useContext, useEffect } from 'react';
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
import { DataContext } from '@/context/data-context';
import type { Transaction } from '@/types';


const formSchema = z.object({
  type: z.enum(["income", "expense", "transfer", "transfer-investment"], { required_error: "Tipo es requerido." }),
  amount: z.coerce.number().positive({ message: "Monto debe ser positivo." }),
  description: z.string().min(2, { message: "Descripción es muy corta." }),
  category: z.string().min(1, { message: "Categoría es requerida." }),
  profile: z.string().min(1, { message: "El perfil es requerido."}),
  date: z.date({ required_error: "Fecha es requerida." }),
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
    const { addTransaction, updateTransaction, categories, profiles } = useContext(DataContext);
    
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
            date: new Date(),
        },
    });

    useEffect(() => {
        if(dialogOpen && transactionToEdit) {
            form.reset({
                ...transactionToEdit,
                amount: transactionToEdit.amount || ('' as any),
                date: transactionToEdit.date ? new Date(transactionToEdit.date) : new Date()
            });
        } else if (dialogOpen && !transactionToEdit) {
             form.reset({
                type: "expense",
                amount: '' as any,
                description: "",
                category: "",
                profile: "",
                date: new Date(),
            });
        }
    }, [transactionToEdit, form, dialogOpen]);


    const transactionType = form.watch("type");

    const availableCategories = categories.filter(c => {
        if (transactionType === 'income') return c.type === 'Ingreso';
        if (transactionType === 'expense' || transactionType === 'transfer' || transactionType === 'transfer-investment') return c.type === 'Gasto';
        return true;
    });

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
                date: new Date(),
            });
            setDialogOpen(false);
            if(onFinish) onFinish();
        } catch (error) {
            toast({
                title: "Error",
                description: `No se pudo ${transactionToEdit?.id ? 'actualizar' : 'añadir'} la transacción.`,
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
                                <SelectItem value="transfer">Transferencia a Ahorros</SelectItem>
                                <SelectItem value="transfer-investment">Transferencia a Inversión</SelectItem>
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
                            <Input type="number" placeholder="$0" {...field} value={field.value ?? ''}/>
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
      </DialogContent>
    </Dialog>
  );
}
