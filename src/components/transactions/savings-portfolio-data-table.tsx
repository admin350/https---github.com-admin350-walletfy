
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
import { Badge } from "../ui/badge";

export function SavingsPortfolioDataTable() {
    const { transactions } = useContext(DataContext);
    
    const [date, setDate] = useState({
        month: getMonth(new Date()),
        year: getYear(new Date()),
    });

    const savingsTransactions = useMemo(() => {
        return transactions.filter(t => t.type === 'transfer');
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return savingsTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            return getMonth(transactionDate) === date.month && getYear(transactionDate) === date.year;
        });
    }, [savingsTransactions, date]);

    
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
            header: "Perfil de Origen",
        },
        {
            accessorKey: "category",
            header: "Categoría de Origen",
        },
        {
            accessorKey: "amount",
            header: "Monto Ahorrado",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("amount"))
                const formatted = new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                }).format(amount)
                return <div className={`font-medium text-green-400`}>{formatted}</div>
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
        label: format(new Date(2000, i), 'LLLL', { locale: es }),
    }));
    
    const currentYear = getYear(new Date());
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    return (
        <div className="w-full">
            <div className="flex items-center py-4 gap-4">
                <Select
                    value={date.month.toString()}
                    onValueChange={(value) => setDate(prev => ({...prev, month: parseInt(value)}))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label.charAt(0).toUpperCase() + m.label.slice(1)}</SelectItem>)}
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
                                    No hay ahorros registrados para este período.
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
