
'use client';
import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, HandCoins, Ban, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import type { Subscription } from "@/types";
import { format, getMonth, getYear } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "../ui/badge";
import { UpdateSubscriptionDialog } from "./update-subscription-dialog";
import { PaySubscriptionDialog } from "./pay-subscription-dialog";

interface SubscriptionsDataTableProps {
    subscriptions: Subscription[];
    tab: 'overdue' | 'this-month' | 'upcoming' | 'cancelled';
}

export function SubscriptionsDataTable({ subscriptions, tab }: SubscriptionsDataTableProps) {
    const { deleteSubscription, cancelSubscription, formatCurrency } = useData();
    const { toast } = useToast();
    const [subscriptionToEdit, setSubscriptionToEdit] = useState<Subscription | null>(null);
    const [subscriptionToPay, setSubscriptionToPay] = useState<Subscription | null>(null);

    const handleCancel = async (id: string) => {
        try {
            await cancelSubscription(id);
            toast({ title: "Suscripción cancelada", description: "La suscripción ha sido marcada como cancelada." });
        } catch (err) {
            const error = err as Error;
            toast({ title: "Error", description: error.message || "No se pudo cancelar la suscripción.", variant: "destructive" });
        }
    };
    
    const handleDelete = async (id: string) => {
        try {
            await deleteSubscription(id);
            toast({ title: "Suscripción eliminada", description: "La suscripción ha sido eliminada permanentemente." });
        } catch (err) {
            const error = err as Error;
            toast({ title: "Error", description: error.message || "No se pudo eliminar la suscripción.", variant: "destructive" });
        }
    };

    const columns: ColumnDef<Subscription>[] = [
        {
            accessorKey: "name",
            header: "Nombre",
        },
        {
            accessorKey: "amount",
            header: () => <div className="text-right">Monto</div>,
            cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue("amount"))}</div>,
        },
        {
            accessorKey: "dueDate",
            header: "Próximo Vencimiento",
            cell: ({ row }) => {
                const sub = row.original;
                if (sub.status === 'cancelled') return 'N/A';
                return format(new Date(row.getValue("dueDate")), "dd 'de' MMMM, yyyy", { locale: es })
            },
        },
        {
            accessorKey: "profile",
            header: "Perfil",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const subscription = row.original;
                const isCancelled = subscription.status === 'cancelled';
                const currentMonth = getMonth(new Date());
                const currentYear = getYear(new Date());
                
                const isPaidThisPeriod = subscription.paidThisPeriod && 
                                         subscription.lastPaymentMonth === currentMonth && 
                                         subscription.lastPaymentYear === currentYear;

                // Logic for showing payment status
                let showPayButton = false;
                let showPaidBadge = false;

                if (!isCancelled) {
                    if (tab === 'this-month') {
                        if (isPaidThisPeriod) {
                            showPaidBadge = true;
                        } else {
                            showPayButton = true;
                        }
                    } else if (tab === 'upcoming' || tab === 'overdue') {
                        showPayButton = true;
                    }
                }
                
                return (
                    <div className="text-right space-x-2">
                        {showPayButton && (
                            <Button variant="outline" size="sm" onClick={() => setSubscriptionToPay(subscription)}>
                                <HandCoins className="mr-2 h-4 w-4" /> Pagar ahora
                            </Button>
                        )}
                        {showPaidBadge && (
                            <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/20">
                                <CheckCircle className="mr-2 h-4 w-4" /> Pagado este mes
                            </Badge>
                        )}
                         <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {!isCancelled && (
                                        <DropdownMenuItem onClick={() => setSubscriptionToEdit(subscription)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                    )}
                                     {!isCancelled && (
                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleCancel(subscription.id); }}>
                                            <Ban className="mr-2 h-4 w-4" /> Cancelar suscripción
                                        </DropdownMenuItem>
                                    )}
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem>
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente la suscripción.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(subscription.id)}>Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: subscriptions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
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
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Siguiente
                </Button>
            </div>

            {subscriptionToEdit && (
                <UpdateSubscriptionDialog
                    open={!!subscriptionToEdit}
                    onOpenChange={isOpen => !isOpen && setSubscriptionToEdit(null)}
                    subscription={subscriptionToEdit}
                />
            )}
            {subscriptionToPay && (
                <PaySubscriptionDialog
                    open={!!subscriptionToPay}
                    onOpenChange={isOpen => !isOpen && setSubscriptionToPay(null)}
                    subscription={subscriptionToPay}
                />
            )}
        </>
    );
}
