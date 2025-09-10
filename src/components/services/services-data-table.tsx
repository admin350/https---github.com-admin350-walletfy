
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
import type { Service } from "@/types";
import { useData } from "@/context/data-context";
import { MoreHorizontal, Pencil, Trash2, Link as LinkIcon, FilePlus2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Skeleton } from "../ui/skeleton";
import { AddServiceDialog } from "./add-service-dialog";
import { AddTransactionDialog } from "../transactions/add-transaction-dialog";


interface ServicesDataTableProps {
    services: Service[];
    isLoading: boolean;
}


export function ServicesDataTable({ services, isLoading }: ServicesDataTableProps) {
    const { deleteService } = useData();
    const { toast } = useToast();
    const [serviceToEdit, setServiceToEdit] = useState<Service | undefined>(undefined);
    const [transactionToRegister, setTransactionToRegister] = useState<Partial<Service> | undefined>(undefined);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const handleEdit = (item: Service) => {
        setServiceToEdit(item);
        setIsEditModalOpen(true);
    };

    const handleRegister = (service: Service) => {
        setTransactionToRegister({
            name: service.name,
            category: service.category,
            profile: service.profile,
        });
        setIsRegisterModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteService(id);
            toast({
                title: "Servicio eliminado",
                description: "El servicio ha sido eliminado exitosamente.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el servicio.",
                variant: "destructive"
            });
        }
    };
    
    const columns: ColumnDef<Service>[] = [
        {
            accessorKey: "name",
            header: "Nombre del Servicio",
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
            id: "actions",
            cell: ({ row }) => {
                const item = row.original;
                return (
                     <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="secondary" size="sm">
                           <a href={item.paymentUrl} target="_blank" rel="noopener noreferrer">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Ir a Pagar
                           </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRegister(item)}>
                            <FilePlus2 className="mr-2 h-4 w-4" />
                            Registrar Gasto
                        </Button>
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
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente el registro del servicio.
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
        data: services,
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
             <AddServiceDialog
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                serviceToEdit={serviceToEdit}
            />
            <AddTransactionDialog
                open={isRegisterModalOpen}
                onOpenChange={setIsRegisterModalOpen}
                defaultType="expense"
                transactionToEdit={{
                    description: transactionToRegister?.name,
                    category: transactionToRegister?.category,
                    profile: transactionToRegister?.profile,
                }}
            />
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
                                    No has registrado ningún servicio.
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
