
'use client';
import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, FilePlus2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import type { FixedExpense, Transaction } from "@/types";
import { AddFixedExpenseDialog } from "./add-fixed-expense-dialog";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { Badge } from "../ui/badge";

export function FixedExpensesDataTable() {
    const { fixedExpenses, isLoading, deleteFixedExpense, formatCurrency } = useData();
    const { toast } = useToast();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [expenseToEdit, setExpenseToEdit] = useState<FixedExpense | null>(null);
    const [transactionDefault, setTransactionDefault] = useState<Partial<Transaction> | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteFixedExpense(id);
            toast({ title: "Plantilla eliminada", description: "La plantilla ha sido eliminada." });
        } catch (err) {
            const error = err as Error;
            toast({ title: "Error", description: error.message || "No se pudo eliminar la plantilla.", variant: "destructive" });
        }
    };
    
    const handleCreateTransaction = (expense: FixedExpense) => {
        setTransactionDefault(expense);
    };

    const columns: ColumnDef<FixedExpense>[] = [
        { accessorKey: "name", header: "Nombre" },
        { accessorKey: "category", header: "Categoría", cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge> },
        { accessorKey: "profile", header: "Perfil" },
        {
            accessorKey: "amount",
            header: () => <div className="text-right">Monto</div>,
            cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue("amount"))}</div>,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const expense = row.original;
                return (
                     <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleCreateTransaction(expense)}>
                                    <FilePlus2 className="mr-2 h-4 w-4" /> Crear Transacción
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setExpenseToEdit(expense)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
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
                                <AlertDialogDescription>Esto eliminará permanentemente la plantilla de gasto fijo.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(expense.id)}>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                );
            },
        },
    ];

    const table = useReactTable({
        data: fixedExpenses,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
    });

    if (isLoading) {
        return <div>...Cargando</div>;
    }

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No hay plantillas de gastos fijos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {expenseToEdit && (
                 <AddFixedExpenseDialog
                    open={!!expenseToEdit}
                    onOpenChange={(isOpen) => !isOpen && setExpenseToEdit(null)}
                    expenseToEdit={expenseToEdit}
                ><></></AddFixedExpenseDialog>
            )}
             {transactionDefault && (
                <AddTransactionDialog
                    open={!!transactionDefault}
                    onOpenChange={(isOpen) => !isOpen && setTransactionDefault(null)}
                    transactionToEdit={{...transactionDefault}}
                    onFinish={() => setTransactionDefault(null)}
                />
            )}
        </div>
    );
}
