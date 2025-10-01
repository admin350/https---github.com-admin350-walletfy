'use client';
import { useData } from "@/context/data-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function TaxPaymentsTable() {
    const { taxPayments, formatCurrency } = useData();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha de Pago</TableHead>
                        <TableHead>Período Declarado</TableHead>
                        <TableHead className="text-right">Monto Pagado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {taxPayments.length > 0 ? (
                        taxPayments.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{format(new Date(p.date), "dd/MM/yyyy", { locale: es })}</TableCell>
                                <TableCell className="capitalize">{format(new Date(p.year, p.month), "MMMM yyyy", { locale: es })}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(p.amount)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">No se han realizado pagos de impuestos.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
