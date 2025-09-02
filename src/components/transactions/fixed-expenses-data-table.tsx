
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
import type { FixedExpense, Transaction } from "@/types";
import { DataContext } from "@/context/data-context";
import { MoreHorizontal, Pencil, Trash2, FilePlus2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { AddFixedExpenseDialog } from "./add-fixed-expense-dialog";

export function FixedExpensesDataTable() {
    const { fixedExpenses, deleteFixedExpense } = useContext(DataContext);
    const { toast } = useToast();
    const [expenseToRegister, setExpenseToRegister] = useState<Partial<Transaction> | undefined>(undefined);
    const [expenseToEdit, setExpenseToEdit] = useState<FixedExpense | undefined>(undefined);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    

    const handleRegister = (expense: FixedExpense) => {
        setExpenseToRegister({
            type: 'expense',
            description: expense.name,
            amount: expense.amount, // Set the base amount, user can change it
            category: expense.category,
            profile: expense.profile,
            date: new Date(),
        });
        setIsRegisterOpen(true);
    };

    const handleEdit = (expense: FixedExpense) => {
        setExpenseToEdit(expense);
        setIsEditOpen(true);
    };
    
    const handleDelete = async (id: string) => {
        try {
            await deleteFixedExpense(id);
            toast({
                title: "Plantilla eliminada",
                description: "La plantilla de gasto fijo ha sido eliminada.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar la plantilla.",
                variant: "destructive"
            });
        }
    };
    
    const columns: ColumnDef<FixedExpense>[] = [
        {
            accessorKey: "name",
            header: "Nombre de Plantilla",
        },
        {
            accessorKey: "category",
            header: "Categoría",
        },
         {
            accessorKey: "profile",
            header: "Perfil",
        },
        {
            accessorKey: "amount",
            header: "Monto Base",
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
            id: "actions",
            cell: ({ row }) => {
                const item = row.original;
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
                                <DropdownMenuItem onClick={() => handleRegister(item)}>
                                    <FilePlus2 className="mr-2 h-4 w-4" />
                                    Registrar como Gasto
                                </DropdownMenuItem>
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
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la plantilla.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)}>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )
            },
        },
    ];


    const table = useReactTable({
        data: fixedExpenses,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="w-full">
             {isRegisterOpen && (
                <AddTransactionDialog
                    transactionToEdit={expenseToRegister as Transaction}
                    open={isRegisterOpen}
                    onOpenChange={setIsRegisterOpen}
                    onFinish={() => {
                        setExpenseToRegister(undefined);
                        setIsRegisterOpen(false);
                    }}
                >
                    {/* El diálogo se controla por estado, no necesita un trigger visible aquí */}
                </AddTransactionDialog>
            )}

            {isEditOpen && (
                <AddFixedExpenseDialog
                    expenseToEdit={expenseToEdit}
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    onFinish={() => {
                        setExpenseToEdit(undefined);
                        setIsEditOpen(false);
                    }}
                >
                    {/* El diálogo se controla por estado, no necesita un trigger visible aquí */}
                </AddFixedExpenseDialog>
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
                                    No hay plantillas de gastos fijos. Añade una para empezar.
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
