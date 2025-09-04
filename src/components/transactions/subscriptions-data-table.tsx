
'use client'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Subscription } from "@/types";
import { useData } from "@/context/data-context";
import { format, isPast } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, HandCoins } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { PaySubscriptionDialog } from "./pay-subscription-dialog";
import { Badge } from "../ui/badge";

interface SubscriptionsDataTableProps {
    subscriptions: Subscription[];
    tab: 'overdue' | 'this-month' | 'upcoming' | 'cancelled';
}

export function SubscriptionsDataTable({ subscriptions, tab }: SubscriptionsDataTableProps) {
    const { cancelSubscription, bankCards } = useData();
    const { toast } = useToast();
    const [subscriptionToPay, setSubscriptionToPay] = useState<Subscription | undefined>(undefined);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    
    const handleEdit = (item: Subscription) => {
        console.log("Editing subscription:", item);
         toast({
            title: "Función no implementada",
            description: "La edición de suscripciones se añadirá en una futura actualización."
        })
    };

    const handlePay = (item: Subscription) => {
        setSubscriptionToPay(item);
        setIsPayModalOpen(true);
    }

    const handleCancelSubscription = async (id: string) => {
        try {
            await cancelSubscription(id);
            toast({
                title: "Suscripción Cancelada",
                description: "La suscripción ha sido marcada como cancelada.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cancelar la suscripción.",
                variant: "destructive"
            });
        }
    };
    
    const columns: ColumnDef<Subscription>[] = [
        {
            accessorKey: "name",
            header: "Nombre",
        },
        {
            accessorKey: "profile",
            header: "Perfil",
        },
        {
            accessorKey: "cardId",
            header: "Método de Pago",
            cell: ({row}) => {
                const card = bankCards.find(c => c.id === row.original.cardId);
                return card ? `${card.name} (**** ${card.last4Digits})` : 'N/A'
            }
        },
        {
            accessorKey: "amount",
            header: "Monto",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("amount"))
                const formatted = new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                }).format(amount)
                return <div className="font-medium">{formatted}</div>
            },
        },
        {
            accessorKey: "dateColumn",
            header: () => tab === 'cancelled' ? "Fecha de Cancelación" : "Vencimiento",
            cell: ({ row }) => {
                 const subscription = row.original;
                 const date = tab === 'cancelled' ? subscription.cancellationDate : subscription.dueDate;
                 if (!date) return null;

                 const isDue = isPast(subscription.dueDate);

                 return (
                    <div className="flex items-center gap-2">
                        <span>{format(date, "dd/MM/yyyy")}</span>
                        {isDue && tab !== 'cancelled' && <Badge variant="destructive">Vencida</Badge>}
                        {tab === 'cancelled' && <Badge variant="outline">Cancelada</Badge>}
                    </div>
                 )
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original;
                const showPayButton = tab === 'overdue' || tab === 'this-month';

                return (
                     <div className="flex items-center justify-end gap-2">
                        {showPayButton && (
                            <Button variant="outline" size="sm" onClick={() => handlePay(item)}>
                                <HandCoins className="mr-2 h-4 w-4" />
                                Pagar
                            </Button>
                        )}
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Abrir menú</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(item)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem disabled={item.status === 'cancelled'}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Cancelar Suscripción
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Dar de baja la suscripción?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no eliminará los pagos históricos, pero moverá la suscripción a la pestaña "Canceladas" y no se te recordará pagarla.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cerrar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCancelSubscription(item.id)}>Continuar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )
            },
        },
    ];


    const table = useReactTable({
        data: subscriptions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="w-full">
            {subscriptionToPay && (
                <PaySubscriptionDialog
                    open={isPayModalOpen}
                    onOpenChange={setIsPayModalOpen}
                    subscription={subscriptionToPay}
                />
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No hay suscripciones en esta categoría.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
             <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    )
}
