
'use client';
import { useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@/types";
import { AddServiceDialog } from "./add-service-dialog";
import { Badge } from "../ui/badge";

interface ServicesDataTableProps {
    services: Service[];
    isLoading: boolean;
}

export function ServicesDataTable({ services, isLoading }: ServicesDataTableProps) {
    const { deleteService } = useData();
    const { toast } = useToast();
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteService(id);
            toast({ title: "Servicio eliminado", description: "El servicio ha sido eliminado exitosamente." });
        } catch (err) {
            const error = err as Error;
            toast({ title: "Error", description: error.message || "No se pudo eliminar el servicio.", variant: "destructive" });
        }
    };

    const columns: ColumnDef<Service>[] = [
        { accessorKey: "name", header: "Nombre del Servicio" },
        { accessorKey: "category", header: "Categoría", cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge> },
        { accessorKey: "profile", header: "Perfil" },
        {
            id: "actions",
            cell: ({ row }) => {
                const service = row.original;
                return (
                    <div className="text-right">
                        <Button variant="outline" size="sm" asChild className="mr-2">
                            <a href={service.paymentUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" /> Ir a Pagar
                            </a>
                        </Button>
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setServiceToEdit(service)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                    <AlertDialogTrigger asChild><DropdownMenuItem><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente el servicio.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(service.id)}>Continuar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: services,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (isLoading) {
        return <div className="space-y-4">...Cargando</div>;
    }

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>{table.getHeaderGroups().map(headerGroup => (<TableRow key={headerGroup.id}>{headerGroup.headers.map(header => (<TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (<TableRow key={row.id}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))
                        ) : (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No hay servicios registrados.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
            </div>
            {serviceToEdit && <AddServiceDialog open={!!serviceToEdit} onOpenChange={isOpen => !isOpen && setServiceToEdit(null)} serviceToEdit={serviceToEdit} />}
        </div>
    );
}
