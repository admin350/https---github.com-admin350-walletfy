
'use client';
import { ReactNode, useState, useContext } from 'react';
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
import { DataContext } from '@/context/data-context';

const formSchema = z.object({
  name: z.string().min(2, { message: "Nombre de la deuda es muy corto." }),
  totalAmount: z.coerce.number().positive({ message: "Monto total debe ser positivo." }),
  interestRate: z.coerce.number().min(0, { message: "Tasa de interés no puede ser negativa." }),
  monthlyPayment: z.coerce.number().positive({ message: "Pago mensual debe ser positivo." }),
  nextDueDate: z.date({ required_error: "Fecha de próximo pago es requerida." }),
  financialInstitution: z.string().min(2, { message: "Entidad financiera es requerida." }),
});

export function AddDebtDialog({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addDebt } = useContext(DataContext);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            totalAmount: '' as any,
            interestRate: '' as any,
            monthlyPayment: '' as any,
            nextDueDate: new Date(),
            financialInstitution: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            await addDebt({
                id: crypto.randomUUID(),
                name: values.name,
                amount: values.monthlyPayment,
                dueDate: values.nextDueDate,
                financialInstitution: values.financialInstitution
            });
            
            toast({
                title: "Deuda añadida",
                description: "Tu deuda ha sido registrada exitosamente.",
            });
            form.reset();
            setOpen(false);
        } catch (error) {
             toast({
                title: "Error",
                description: "No se pudo añadir la deuda.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Añadir Nueva Deuda</DialogTitle>
                    <DialogDescription>
                        Registra una nueva deuda para darle seguimiento.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Deuda</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Préstamo de auto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="financialInstitution"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Entidad Financiera / Banco</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Banco Santander" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="totalAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto Total</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="$10.000.000" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="interestRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tasa de Interés (%)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="1.5" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="monthlyPayment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pago Mensual</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="$350.000" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nextDueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Fecha Próximo Pago</FormLabel>
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
                            Guardar Deuda
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
