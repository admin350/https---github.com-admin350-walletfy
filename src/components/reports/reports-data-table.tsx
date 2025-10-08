
'use client';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

// NOTE: MonthlyReport is deprecated for now. This component is kept as a placeholder.
type MonthlyReport = {
    id: string;
    year: number;
    month: number;
    generatedAt: Date;
}

export function ReportsDataTable() {
    const { toast } = useToast();
    const reports: MonthlyReport[] = []; // Placeholder

    const handleDelete = async () => {
        toast({ title: "Función no disponible", description: "La eliminación de informes no está habilitada actualmente." });
    };

    const columns: ColumnDef<MonthlyReport>[] = [
        {
            accessorKey: "month",
            header: "Período",
            cell: ({ row }) => {
                const report = row.original;
                const date = new Date(report.year, report.month);
                return <span className="capitalize">{format(date, "MMMM yyyy", { locale: es })}</span>;
            },
        },
        {
            accessorKey: "generatedAt",
            header: "Fecha de Generación",
            cell: ({ row }) => format(new Date(row.getValue("generatedAt")), "dd/MM/yyyy HH:mm"),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const report = row.original;
                return (
                    <div className="text-right">
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/reports/${report.id}`}><Eye className="mr-2 h-4 w-4" /> Ver Informe</Link>
                                    </DropdownMenuItem>
                                    <AlertDialogTrigger asChild><DropdownMenuItem><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>Esta acción eliminará permanentemente el informe generado.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
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
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>{table.getHeaderGroups().map(headerGroup => (<TableRow key={headerGroup.id}>{headerGroup.headers.map(header => (<TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (<TableRow key={row.id}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))
                        ) : (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No has generado informes.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
            </div>
        </div>
    );
}
