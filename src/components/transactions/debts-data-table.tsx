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
import type { UpcomingPayment } from "@/types";
import { DataContext } from "@/context/data-context";
import { format, getMonth, getYear } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { AddDebtDialog } from "./add-debt-dialog";

export function DebtsDataTable() {
    const { debts, deleteDebt } = useContext(DataContext);
    const { toast } = useToast();
    const [itemToEdit, setItemToEdit] = useState<UpcomingPayment | undefined>(undefined);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [date, setDate] = useState({
        month: getMonth(new Date()),
        year: getYear(new Date()),
    });

    const filteredData = useMemo(() => {
        return debts.filter(d => {
            const itemDate = new Date(d.dueDate);
            return getMonth(itemDate) === date.month && getYear(itemDate) === date.year;
        });
    }, [debts, date]);

    const handleEdit = (item: UpcomingPayment) => {
        // Since we don't have a full edit form for debts yet,
        // we'll just log this for now and prepare the state.
        // The AddDebtDialog would need to be enhanced to support editing.
        console.log("Editing debt:", item);
        toast({
            title: "Función no implementada",
            description: "La edición de deudas se añadirá en una futura actualización."
        })
    };

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
    
    const columns: ColumnDef<UpcomingPayment>[] = [
        {
            accessorKey: "name",
            header: "Nombre",
        },
        {
            accessorKey: "amount",
            header: "Monto",
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
            accessorKey: "dueDate",
            header: "Vencimiento",
            cell: ({ row }) => format(new Date(row.getValue("dueDate")), "dd/MM/yyyy")
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
                )
            },
        },
    ];


    const table = useReactTable({
        data: filteredData,
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
        </div>
    )
}
