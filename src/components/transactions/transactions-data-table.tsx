
'use client';
import { useState, useMemo } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    ColumnFiltersState,
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
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@/types";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function TransactionsDataTable() {
    const { transactions, deleteTransaction, formatCurrency } = useData();
    const { toast } = useToast();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const filteredTransactions = useMemo(() => {
        if (categoryFilter === 'all') {
            return transactions;
        }
        return transactions.filter(t => t.category === categoryFilter);
    }, [transactions, categoryFilter]);


    const handleDelete = async (id: string) => {
        try {
            await deleteTransaction(id);
            toast({
                title: "Transacción eliminada",
                description: "La transacción ha sido eliminada exitosamente.",
            });
        } catch (err) {
            const error = err as Error;
            toast({
                title: "Error",
                description: error.message || "No se pudo eliminar la transacción.",
                variant: "destructive"
            });
        }
    };
    
    const typeTranslations: { [key: string]: string } = {
        income: 'Ingreso',
        expense: 'Egreso',
        transfer: 'Transferencia'
    }

    const columns: ColumnDef<Transaction>[] = [
        {
            accessorKey: "date",
            header: "Fecha",
            cell: ({ row }) => format(new Date(row.getValue("date")), "dd/MM/yyyy HH:mm"),
        },
        {
            accessorKey: "description",
            header: "Descripción",
        },
        {
            accessorKey: "category",
            header: "Categoría",
            cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
        },
        {
            accessorKey: "profile",
            header: "Perfil",
        },
        {
            accessorKey: "type",
            header: "Tipo",
            cell: ({ row }) => {
                const type = row.getValue("type") as string;
                const variant = type === 'income' ? 'default' : type === 'expense' ? 'destructive' : 'secondary';
                const className = type === 'income' ? 'bg-green-500/20 text-green-500 border-green-500/20' : type === 'expense' ? 'bg-red-500/20 text-red-500 border-red-500/20' : 'bg-blue-500/20 text-blue-500 border-blue-500/20';
                return <Badge variant={variant} className={className}>{typeTranslations[type] || type}</Badge>
            }
        },
        {
            accessorKey: "amount",
            header: () => <div className="text-right">Monto</div>,
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("amount"));
                const type = row.getValue("type");
                const formatted = formatCurrency(amount);
                const sign = type === 'income' ? '+' : type === 'expense' ? '-' : '';
                const color = type === 'income' ? 'text-green-400' : type === 'expense' ? 'text-red-400' : '';
                return <div className={`text-right font-medium ${color}`}>{sign} {formatted}</div>;
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
                                <DropdownMenuItem onClick={() => setTransactionToEdit(transaction)}>
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
                );
            },
        },
    ];

    const table = useReactTable({
        data: filteredTransactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });
    
    const uniqueCategories = useMemo(() => {
        const categorySet = new Set(transactions.map(t => t.category));
        return Array.from(categorySet);
    }, [transactions]);

    return (
        <div>
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filtrar por descripción..."
                    value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("description")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                 <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las Categorías</SelectItem>
                        {uniqueCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
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
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
             <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </div>
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
            {transactionToEdit && (
                <AddTransactionDialog
                    open={!!transactionToEdit}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setTransactionToEdit(null);
                        }
                    }}
                    transactionToEdit={transactionToEdit}
                />
            )}
        </div>
    );
}
