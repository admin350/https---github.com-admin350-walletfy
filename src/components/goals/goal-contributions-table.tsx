'use client';
import { useData } from "@/context/data-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function GoalContributionsTable() {
    const { goalContributions, formatCurrency } = useData();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Meta</TableHead>
                        <TableHead className="text-right">Monto Aportado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {goalContributions.length > 0 ? (
                        goalContributions.map(c => (
                            <TableRow key={c.id}>
                                <TableCell>{format(new Date(c.date), "dd/MM/yyyy", { locale: es })}</TableCell>
                                <TableCell>{c.goalName}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(c.amount)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">No se han realizado aportes a metas.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
