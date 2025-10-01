'use client';
import { useData } from "@/context/data-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface InvestmentContributionsTableProps {
    purpose: 'investment' | 'saving';
}

export function InvestmentContributionsTable({ purpose }: InvestmentContributionsTableProps) {
    const { investmentContributions, formatCurrency } = useData();
    const contributions = investmentContributions.filter(c => c.purpose === purpose);

    const titleText = purpose === 'investment' ? 'Inversión' : 'Ahorro';

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Activo de {titleText}</TableHead>
                        <TableHead className="text-right">Monto Aportado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contributions.length > 0 ? (
                        contributions.map(c => (
                            <TableRow key={c.id}>
                                <TableCell>{format(new Date(c.date), "dd/MM/yyyy", { locale: es })}</TableCell>
                                <TableCell>{c.investmentName}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(c.amount)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">No se han realizado aportes.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
