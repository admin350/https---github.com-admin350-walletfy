
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
import { useState } from "react";
import type { TangibleAsset } from "@/types";
import { useData } from "@/context/data-context";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, DollarSign } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Skeleton } from "../ui/skeleton";
import { AddAssetDialog } from "./add-asset-dialog";
import { SellAssetDialog } from "./sell-asset-dialog";

interface AssetsDataTableProps {
    assets: TangibleAsset[];
    isLoading: boolean;
}

export function AssetsDataTable({ assets, isLoading }: AssetsDataTableProps) {
    const { deleteTangibleAsset, profiles, formatCurrency } = useData();
    const { toast } = useToast();
    const [assetToEdit, setAssetToEdit] = useState<TangibleAsset | undefined>(undefined);
    const [assetToSell, setAssetToSell] = useState<TangibleAsset | undefined>(undefined);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);

    const handleEdit = (item: TangibleAsset) => {
        setAssetToEdit(item);
        setIsEditModalOpen(true);
    };

     const handleSell = (item: TangibleAsset) => {
        setAssetToSell(item);
        setIsSellModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTangibleAsset(id);
            toast({
                title: "Activo eliminado",
                description: "El activo ha sido eliminado exitosamente.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el activo.",
                variant: "destructive"
            });
        }
    };
    
    const columns: ColumnDef<TangibleAsset>[] = [
        {
            accessorKey: "name",
            header: "Nombre del Activo",
            cell: ({ row }) => {
                 const asset = row.original;
                 const profile = profiles.find(p => p.name === asset.profile);
                 return (
                    <div className="flex items-center gap-2">
                        {profile && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: profile.color }} />}
                        <span className="font-medium">{asset.name}</span>
                    </div>
                 )
            }
        },
        {
            accessorKey: "category",
            header: "Categoría",
        },
        {
            accessorKey: "estimatedValue",
            header: "Valor Estimado",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("estimatedValue"))
                return <div className="font-medium text-blue-400">{formatCurrency(amount)}</div>
            },
        },
        {
            accessorKey: "purchaseDate",
            header: "Fecha de Compra",
            cell: ({ row }) => {
                const dateValue = row.getValue("purchaseDate");
                if (!dateValue || isNaN(new Date(dateValue as string).getTime())) {
                    return "Fecha inválida";
                }
                return format(new Date(dateValue as string), "dd/MM/yyyy");
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original;
                return (
                     <div className="flex items-center justify-end gap-2">
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Abrir menú</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleSell(item)}>
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Vender Activo
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
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
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente el activo.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item.id)}>Continuar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     </div>
                )
            },
        },
    ];


    const table = useReactTable({
        data: assets,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    return (
        <div className="w-full">
             <AddAssetDialog
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                assetToEdit={assetToEdit}
            >
                <></>
            </AddAssetDialog>

            {assetToSell && (
                <SellAssetDialog
                    open={isSellModalOpen}
                    onOpenChange={setIsSellModalOpen}
                    asset={assetToSell}
                />
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
                                    No has registrado ningún activo.
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
