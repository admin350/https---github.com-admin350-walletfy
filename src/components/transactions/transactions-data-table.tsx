

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
import { useContext, useState, useMemo } from "react";
import type { Transaction } from "@/types";
import { DataContext } from "@/context/data-context";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Badge } from "../ui/badge";

export function TransactionsDataTable() {
    const { transactions, deleteTransaction, profiles } = useContext(DataContext);
    const { toast } = useToast();
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | undefined>(undefined);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEdit = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTransaction(id);
            toast({
                title: "Transacción eliminada",
                description: "La transacción ha sido eliminada exitosamente.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar la transacción.",
                variant: "destructive"
            });
        }
    };
    
    const columns: ColumnDef<Transaction>[] = [
        {
            accessorKey: "date",
            header: "Fecha",
            cell: ({ row }) => format(new Date(row.getValue("date")), "dd/MM/yyyy")
        },
        {
            accessorKey: "description",
            header: "Descripción",
        },
        {
            accessorKey: "profile",
            header: "Perfil",
             cell: ({ row }) => {
                const profileName = row.getValue("profile") as string;
                const profile = profiles.find(p => p.name === profileName);
                return (
                    <div className="flex items-center gap-2">
                        {profile && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: profile.color }} />}
                        <span>{profileName}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "category",
            header: "Categoría",
        },
        {
            accessorKey: "type",
            header: "Tipo",
            cell: ({ row }) => {
                const type = row.getValue("type") as string;
                let variant: "default" | "destructive" | "outline" | "secondary" = "outline";
                let text = "";
                let className = "";

                switch (type) {
                    case 'income':
                        variant = 'default';
                        text = 'Ingreso';
                        className = 'bg-green-500/20 text-green-500 border-green-500/20';
                        break;
                    case 'expense':
                        variant = 'destructive';
                        text = 'Egreso';
                        className = 'bg-red-500/20 text-red-500 border-red-500/20';
                        break;
                    case 'transfer':
                        variant = 'secondary';
                        text = 'Ahorro';
                        className = 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20';
                        break;
                    case 'transfer-investment':
                        variant = 'secondary';
                        text = 'Inversión';
                        className = 'bg-blue-500/20 text-blue-500 border-blue-500/20';
                        break;
                    default:
                        text = 'Transacción';
                        break;
                }
                
                return <Badge variant={variant} className={className}>{text}</Badge>
            }
        },
        {
            accessorKey: "amount",
            header: "Monto",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("amount"))
                const type = row.getValue("type");
                const formatted = new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                }).format(amount)
                 const className = type === 'income' ? 'text-green-500' : type === 'expense' ? 'text-red-500' : '';
                return <div className={`font-medium ${className}`}>{formatted}</div>
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const transaction = row.original;
                return (
                     <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(transaction)}>
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
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la transacción.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(transaction.id)}>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )
            },
        },
    ];


    const table = useReactTable({
        data: transactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="w-full">
             <AddTransactionDialog 
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                transactionToEdit={transactionToEdit} 
                onFinish={() => setTransactionToEdit(undefined)}
            />
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
                                    No hay resultados para los filtros seleccionados.
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
