
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, HandCoins } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useData } from '@/context/data-context';
import type { Debt } from '@/types';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { PayDebtDialog } from './pay-debt-dialog';

interface DebtsDataTableProps {
  debts: Debt[];
}

export function DebtsDataTable({ debts }: DebtsDataTableProps) {
  const { formatCurrency } = useData();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [debtToPay, setDebtToPay] = React.useState<Debt | null>(null);

  const columns: ColumnDef<Debt>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
            const debt = row.original;
            const isOverdue = isPast(new Date(debt.dueDate)) && debt.paidAmount < debt.totalAmount;
            if (debt.paidAmount >= debt.totalAmount) {
                return <Badge variant="default" className="bg-blue-500/20 text-blue-500 border-blue-500/20">Pagada</Badge>
            }
            if (isOverdue) {
                return <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/20">Atrasada</Badge>
            }
            return <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/20">Al día</Badge>;
        }
    },
    {
      accessorKey: 'totalAmount',
      header: () => <div className="text-right">Monto Total</div>,
      cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue('totalAmount'))}</div>,
    },
    {
        accessorKey: 'paidAmount',
        header: () => <div className="text-right">Monto Pagado</div>,
        cell: ({ row }) => <div className="text-right font-medium text-green-400">{formatCurrency(row.getValue('paidAmount'))}</div>,
    },
    {
        accessorKey: 'remainingAmount',
        header: () => <div className="text-right">Monto Restante</div>,
        cell: ({ row }) => {
            const debt = row.original;
            const remaining = debt.totalAmount - debt.paidAmount;
            return <div className="text-right font-medium text-red-400">{formatCurrency(remaining)}</div>
        },
    },
    {
      accessorKey: 'dueDate',
      header: 'Próximo Vencimiento',
      cell: ({ row }) => format(new Date(row.getValue('dueDate')), 'dd/MM/yyyy', { locale: es }),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const debt = row.original;
        return (
          <div className="text-right space-x-2">
            {debt.paidAmount < debt.totalAmount && (
                <Button variant="outline" size="sm" onClick={() => setDebtToPay(debt)}>
                    <HandCoins className="mr-2 h-4 w-4" /> Realizar Abono
                </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/debts/${debt.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> Ver Detalle
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: debts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  No hay deudas en esta categoría.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Siguiente
        </Button>
      </div>
       {debtToPay && (
            <PayDebtDialog
                debt={debtToPay}
                open={!!debtToPay}
                onOpenChange={(isOpen) => !isOpen && setDebtToPay(null)}
            />
        )}
    </>
  );
}
