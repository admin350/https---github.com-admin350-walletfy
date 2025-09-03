
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
import { useContext } from "react";
import type { MonthlyReport } from "@/types";
import { DataContext } from "@/context/data-context";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import Link from "next/link";
import { FileText } from "lucide-react";

export function ReportsDataTable() {
    const { reports } = useContext(DataContext);
    
    const columns: ColumnDef<MonthlyReport>[] = [
        {
            accessorKey: "month",
            header: "Mes del Informe",
            cell: ({ row }) => {
                const report = row.original;
                const date = new Date(report.year, report.month);
                return <span className="font-medium">{format(date, "MMMM yyyy", { locale: es })}</span>
            }
        },
        {
            accessorKey: "generatedAt",
            header: "Fecha de Generación",
            cell: ({ row }) => format(new Date(row.getValue("generatedAt")), "dd/MM/yyyy HH:mm")
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const report = row.original;
                return (
                    <div className="text-right">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/reports/${report.id}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                Ver Informe
                            </Link>
                        </Button>
                    </div>
                )
            },
        },
    ];


    const table = useReactTable({
        data: reports,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="w-full">
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
                                    No se han generado informes.
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
