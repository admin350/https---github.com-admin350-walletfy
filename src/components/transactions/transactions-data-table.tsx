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
import { format, getMonth, getYear } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Badge } from "../ui/badge";

export function TransactionsDataTable() {
    const { transactions, deleteTransaction } = useContext(DataContext);
    const { toast } = useToast();
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | undefined>(undefined);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [date, setDate] = useState({
        month: getMonth(new Date()),
        year: getYear(new Date()),
    });

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return getMonth(transactionDate) === date.month && getYear(transactionDate) === date.year;
        });
    }, [transactions, date]);

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
                let variant: "default" | "destructive" | "outline" = "outline";
                let text = "";
                if (type === 'income') {
                    variant = 'default';
                    text = 'Ingreso'
                } else if (type === 'expense') {
                    variant = 'destructive';
                    text = 'Egreso'
                } else {
                    text = 'Transferencia'
                }
                const className = type === 'income' ? 'bg-green-500/20 text-green-500 border-green-500/20' : type === 'expense' ? 'bg-red-500/20 text-red-500 border-red-500/20' : '';
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
                 const className = type === 'income' ? 'text-green-500' : 'text-red-500';
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
        data: filteredTransactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: format(new Date(0, i), 'LLLL', { locale: es }),
    }));
    
    const currentYear = getYear(new Date());
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    return (
        <div className="w-full">
             <AddTransactionDialog transactionToEdit={transactionToEdit} onFinish={() => setTransactionToEdit(undefined)}>
                 {isEditModalOpen && <button className="hidden" onClick={() => setIsEditModalOpen(false)}></button>}
            </AddTransactionDialog>
            <div className="flex items-center py-4 gap-4">
                <Select
                    value={date.month.toString()}
                    onValueChange={(value) => setDate(prev => ({...prev, month: parseInt(value)}))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select
                     value={date.year.toString()}
                     onValueChange={(value) => setDate(prev => ({...prev, year: parseInt(value)}))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                       {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
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
                                    No hay resultados.
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
             {isEditModalOpen && <AddTransactionDialog transactionToEdit={transactionToEdit} onFinish={() => {
                setTransactionToEdit(undefined)
                setIsEditModalOpen(false);
             }}>
                 <button id="edit-dialog-trigger" className="hidden"></button>
            </AddTransactionDialog>}
             <script>
                {isEditModalOpen && `document.getElementById('edit-dialog-trigger')?.click()`}
             </script>
        </div>
    )
}
