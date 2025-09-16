'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transaction } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TaxReportPDFProps {
    taxData: {
        incomeWithTax: Transaction[];
        expensesWithTax: Transaction[];
        totalDebit: number;
        totalCredit: number;
        remanente: number;
        netTax: number;
    };
    filters: {
        profile: string;
        month: number;
        year: number;
    };
    formatCurrency: (amount: number) => string;
}

export function TaxReportPDF({ taxData, filters, formatCurrency }: TaxReportPDFProps) {
    const periodDate = new Date(filters.year, filters.month);
    const periodString = format(periodDate, 'MMMM, yyyy', { locale: es });

    return (
        <div className="bg-gray-900 text-white p-8 w-[800px]">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-primary">Informe Tributario (IVA)</h1>
                <p className="text-lg text-muted-foreground">Período: {periodString}</p>
                <p className="text-md text-muted-foreground">Perfil: {filters.profile === 'all' ? 'Consolidado' : filters.profile}</p>
            </header>

            <section className="mb-8 grid grid-cols-3 gap-4">
                <Card className="bg-card/80 border-border/80 text-center">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Débito Fiscal (Ventas)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-400">{formatCurrency(taxData.totalDebit)}</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 border-border/80 text-center">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Crédito Fiscal (Compras)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(taxData.totalCredit)}</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 border-border/80 text-center">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Impuesto a Pagar / Favor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-2xl font-bold ${taxData.netTax >= 0 ? 'text-primary' : 'text-green-400'}`}>{formatCurrency(taxData.netTax)}</p>
                    </CardContent>
                </Card>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b border-primary pb-2">Detalle de Débito Fiscal (Ingresos)</h2>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-white">Fecha</TableHead>
                            <TableHead className="text-white">Descripción</TableHead>
                            <TableHead className="text-right text-white">Neto</TableHead>
                            <TableHead className="text-right text-white">Impuesto</TableHead>
                            <TableHead className="text-right text-white">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {taxData.incomeWithTax.length > 0 ? (
                            taxData.incomeWithTax.map((t: Transaction) => {
                                const netAmount = t.amount - (t.taxDetails?.amount || 0);
                                return (
                                    <TableRow key={t.id}>
                                        <TableCell>{format(new Date(t.date), 'dd/MM/yy')}</TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(netAmount)}</TableCell>
                                        <TableCell className="text-right text-red-400">{formatCurrency(t.taxDetails?.amount || 0)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(t.amount)}</TableCell>
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-16">No hay ingresos con impuestos registrados.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </section>

             <section>
                <h2 className="text-xl font-semibold mb-4 border-b border-primary pb-2">Detalle de Crédito Fiscal (Egresos)</h2>
                 <Table>
                     <TableHeader>
                        <TableRow>
                            <TableHead className="text-white">Fecha</TableHead>
                            <TableHead className="text-white">Descripción</TableHead>
                            <TableHead className="text-right text-white">Neto</TableHead>
                            <TableHead className="text-right text-white">Impuesto</TableHead>
                            <TableHead className="text-right text-white">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {taxData.expensesWithTax.length > 0 ? (
                            taxData.expensesWithTax.map((t: Transaction) => {
                                const netAmount = t.amount - (t.taxDetails?.amount || 0);
                                return (
                                    <TableRow key={t.id}>
                                        <TableCell>{format(new Date(t.date), 'dd/MM/yy')}</TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(netAmount)}</TableCell>
                                        <TableCell className="text-right text-green-400">{formatCurrency(t.taxDetails?.amount || 0)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(t.amount)}</TableCell>
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-16">No hay egresos con impuestos registrados.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </section>

        </div>
    )
}
