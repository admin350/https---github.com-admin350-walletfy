
'use client'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
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
import { useContext, useState } from "react";
import type { Debt } from "@/types";
import { DataContext } from "@/context/data-context";
import { MoreHorizontal, Pencil, Trash2, HandCoins } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { AddDebtDialog } from "./add-debt-dialog";
import { Progress } from "../ui/progress";
import Link from "next/link";
import { PayDebtDialog } from "./pay-debt-dialog";
import { Badge } from "../ui/badge";
import { format, isPast, differenceInMonths } from "date-fns";
import { es } from "date-fns/locale";

export function DebtsDataTable() {
    const { debts, deleteDebt } = useContext(DataContext);
    const { toast } = useToast();
    const [debtToEdit, setDebtToEdit] = useState<Debt | undefined>(undefined);
    const [debtToPay, setDebtToPay] = useState<Debt | undefined>(undefined);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);

    const handleEdit = (item: Debt) => {
        setDebtToEdit(item);
        setIsEditModalOpen(true);
    };

    const handlePay = (item: Debt) => {
        setDebtToPay(item);
        setIsPayModalOpen(true);
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteDebt(id);
            toast({
                title: "Deuda eliminada",
                description: "La deuda ha sido eliminada exitosamente.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar la deuda.",
                variant: "destructive"
            });
        }
    };
    
    const columns: ColumnDef<Debt>[] = [
        {
            accessorKey: "name",
            header: "Nombre",
            cell: ({ row }) => {
                 const debt = row.original;
                 return (
                    <Link href={`/dashboard/debts/${debt.id}`} className="font-medium text-primary hover:underline">
                        {debt.name}
                    </Link>
                 )
            }
        },
        {
            accessorKey: "progress",
            header: "Progreso",
            cell: ({ row }) => {
                const debt = row.original;
                const progress = (debt.paidAmount / debt.totalAmount) * 100;
                return (
                    <div className="flex flex-col gap-2">
                        <Progress value={progress} className="h-2" />
                        <span className="text-xs text-muted-foreground">
                            {`$${debt.paidAmount.toLocaleString('es-CL')} / $${debt.totalAmount.toLocaleString('es-CL')}`}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "installments",
            header: "Cuotas Pagadas",
            cell: ({row}) => {
                const debt = row.original;
                const paidInstallments = Math.floor(debt.paidAmount / debt.monthlyPayment);
                return `${paidInstallments} de ${debt.installments}`
            }
        },
        {
            accessorKey: "dueDate",
            header: "Próximo Pago",
            cell: ({row}) => format(row.original.dueDate, "dd 'de' MMMM, yyyy", { locale: es })
        },
         {
            accessorKey: 'status',
            header: 'Estado',
            cell: ({ row }) => {
                const debt = row.original;
                const isOverdue = isPast(debt.dueDate) && debt.paidAmount < debt.totalAmount;
                
                if (debt.paidAmount >= debt.totalAmount) {
                     return <Badge variant="default" className="bg-blue-500/20 text-blue-500 border-blue-500/20">Pagada</Badge>
                }

                if (isOverdue) {
                    const overdueMonths = differenceInMonths(new Date(), debt.dueDate);
                    const overdueInstallments = overdueMonths > 0 ? overdueMonths : 1;
                    return <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/20">Atrasada ({overdueInstallments} cuota{overdueInstallments > 1 ? 's' : ''})</Badge>
                }

                return <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/20">Al día</Badge>;
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original;
                return (
                     <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePay(item)} disabled={item.paidAmount >= item.totalAmount}>
                            <HandCoins className="mr-2 h-4 w-4" />
                            Abonar
                        </Button>
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
                                        <DropdownMenuItem>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente el registro.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item.id)}>Continuar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     </div>
                )
            },
        },
    ];


    const table = useReactTable({
        data: debts,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="w-full">
             <AddDebtDialog
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                debtToEdit={debtToEdit}
            >
              <></>
            </AddDebtDialog>
            {debtToPay && (
                <PayDebtDialog
                    open={isPayModalOpen}
                    onOpenChange={setIsPayModalOpen}
                    debt={debtToPay}
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
                                    No hay deudas registradas.
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
