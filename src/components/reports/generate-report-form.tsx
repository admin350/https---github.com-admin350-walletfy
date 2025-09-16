
'use client'
import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '@/context/data-context';
import { format, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { generateMonthlyReport } from '@/ai/flows/generate-monthly-report';
import { Loader2, Sparkles } from 'lucide-react';
import type { MonthlyReport, Transaction } from '@/types';

export function GenerateReportForm() {
    const { availableYears, reports, getAllDataForMonth, addReport } = useData();
    const { toast } = useToast();
    
    const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
    const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
    const [isLoading, setIsLoading] = useState(false);
    
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: format(new Date(2000, i), 'LLLL', { locale: es }),
    }));
    
    const reportExists = useMemo(() => {
        return reports.some(r => r.month === selectedMonth && r.year === selectedYear);
    }, [reports, selectedMonth, selectedYear]);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const dataForMonth = getAllDataForMonth(selectedMonth, selectedYear);

            if (dataForMonth.transactions.length === 0) {
                 toast({
                    title: "No hay datos",
                    description: "No hay transacciones registradas para el período seleccionado. No se puede generar un informe.",
                    variant: "destructive"
                });
                return;
            }

            const totalIncome = dataForMonth.transactions.filter((t: Transaction) => t.type === 'income').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
            const totalExpenses = dataForMonth.transactions.filter((t: Transaction) => t.type === 'expense').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
            const expensesByCategory = dataForMonth.transactions
                .filter((t: Transaction) => t.type === 'expense')
                .reduce((acc: Record<string, number>, t: Transaction) => {
                    if (!acc[t.category]) acc[t.category] = 0;
                    acc[t.category] += t.amount;
                    return acc;
                }, {} as Record<string, number>);

            const reportContent = await generateMonthlyReport({
                month: selectedMonth,
                year: selectedYear,
                totalIncome,
                totalExpenses,
                netBalance: totalIncome - totalExpenses,
                expensesByCategory: JSON.stringify(expensesByCategory),
                activeDebts: dataForMonth.debts.filter((d: any) => d.paidAmount < d.totalAmount).length,
                activeGoals: dataForMonth.goals.filter((g: any) => g.currentAmount < g.targetAmount).length,
                activeInvestments: dataForMonth.investments.length,
            });
            
            const newReport: MonthlyReport = {
                id: `${selectedYear}-${selectedMonth}`,
                month: selectedMonth,
                year: selectedYear,
                generatedAt: new Date(),
                content: reportContent
            }
            
            await addReport(newReport);
            
            toast({
                title: "¡Informe Generado!",
                description: `El informe para ${format(new Date(selectedYear, selectedMonth), 'MMMM yyyy', {locale: es})} ha sido creado.`,
            });
        } catch (error) {
            console.error("Error generating report:", error);
            toast({
                title: "Error",
                description: "No se pudo generar el informe. Inténtalo de nuevo.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                     {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label.charAt(0).toUpperCase() + m.label.slice(1)}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                     {availableYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
            </Select>

            <Button onClick={handleGenerateReport} disabled={isLoading || reportExists} className="w-full sm:w-auto">
                 {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                {reportExists ? "Informe ya generado" : "Generar Informe"}
            </Button>
        </div>
    )
}
