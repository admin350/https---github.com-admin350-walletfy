
'use client';
import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Handshake } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import type { TangibleAsset } from "@/types";
import { AddAssetDialog } from "./add-asset-dialog";
import { SellAssetDialog } from "./sell-asset-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AssetsDataTableProps {
    assets: TangibleAsset[];
    isLoading: boolean;
}

export function AssetsDataTable({ assets, isLoading }: AssetsDataTableProps) {
    const { deleteTangibleAsset, formatCurrency } = useData();
    const { toast } = useToast();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [assetToEdit, setAssetToEdit] = useState<TangibleAsset | null>(null);
    const [assetToSell, setAssetToSell] = useState<TangibleAsset | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteTangibleAsset(id);
            toast({ title: "Activo eliminado", description: "El activo ha sido eliminado exitosamente." });
        } catch (err) {
            const error = err as Error;
            toast({ title: "Error", description: error.message || "No se pudo eliminar el activo.", variant: "destructive" });
        }
    };

    const columns: ColumnDef<TangibleAsset>[] = [
        { accessorKey: "name", header: "Nombre" },
        { accessorKey: "category", header: "Categoría" },
        { accessorKey: "profile", header: "Perfil" },
        {
            accessorKey: "purchaseDate",
            header: "Fecha de Compra",
            cell: ({ row }) => format(new Date(row.getValue("purchaseDate")), "dd/MM/yyyy", { locale: es }),
        },
        {
            accessorKey: "estimatedValue",
            header: () => <div className="text-right">Valor Estimado</div>,
            cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue("estimatedValue"))}</div>,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const asset = row.original;
                return (
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setAssetToSell(asset)}><Handshake className="mr-2 h-4 w-4" /> Vender</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setAssetToEdit(asset)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                <AlertDialogTrigger asChild><DropdownMenuItem><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente el activo.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(asset.id)}>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                );
            },
        },
    ];

    const table = useReactTable({
        data: assets,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
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
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No hay resultados.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
            </div>
            {assetToEdit && <AddAssetDialog open={!!assetToEdit} onOpenChange={isOpen => !isOpen && setAssetToEdit(null)} assetToEdit={assetToEdit} />}
            {assetToSell && <SellAssetDialog open={!!assetToSell} onOpenChange={isOpen => !isOpen && setAssetToSell(null)} asset={assetToSell} />}
        </div>
    );
}
