
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
import type { BankCard } from "@/types";
import { DataContext } from "@/context/data-context";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { AddBankCardDialog } from "./add-bank-card-dialog";
import { Badge } from "../ui/badge";

export function BankCardsDataTable() {
    const { bankCards, deleteBankCard, profiles, bankAccounts } = useContext(DataContext);
    const { toast } = useToast();
    const [cardToEdit, setCardToEdit] = useState<BankCard | undefined>(undefined);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEdit = (item: BankCard) => {
        setCardToEdit(item);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBankCard(id);
            toast({
                title: "Tarjeta eliminada",
                description: "La tarjeta bancaria ha sido eliminada exitosamente.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar la tarjeta. Puede estar en uso por una suscripción.",
                variant: "destructive"
            });
        }
    };
    
    const columns: ColumnDef<BankCard>[] = [
        {
            accessorKey: "name",
            header: "Alias",
            cell: ({ row }) => {
                 const card = row.original;
                 const profile = profiles.find(p => p.name === card.profile);
                 return (
                    <div className="flex items-center gap-2">
                        {profile && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: profile.color }} />}
                        <span className="font-medium">{card.name}</span>
                    </div>
                 )
            }
        },
        {
            accessorKey: "bank",
            header: "Banco",
        },
        {
            accessorKey: "cardType",
            header: "Tipo",
             cell: ({ row }) => {
                const type = row.getValue("cardType") as string;
                return <Badge variant="outline">{type === 'credit' ? 'Crédito' : 'Débito'}</Badge>
            }
        },
        {
            accessorKey: "last4Digits",
            header: "Terminación",
            cell: ({ row }) => `**** ${row.getValue("last4Digits")}`
        },
        {
            accessorKey: "accountId",
            header: "Cuenta Vinculada",
            cell: ({ row }) => {
                const account = bankAccounts.find(acc => acc.id === row.original.accountId);
                return account ? `${account.name} (${account.bank})` : 'N/A';
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
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente la tarjeta.
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
        data: bankCards,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="w-full">
             <AddBankCardDialog
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                cardToEdit={cardToEdit}
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
                                    No hay tarjetas bancarias registradas.
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
