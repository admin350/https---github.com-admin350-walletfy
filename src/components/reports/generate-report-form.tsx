
'use client'
import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '@/context/data-context';
import { format, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
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
        toast({
            title: "Función no disponible",
            description: "Las funciones de IA se han deshabilitado temporalmente para resolver problemas de dependencias.",
            variant: "destructive"
        });
        setIsLoading(false);
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

            <Button onClick={handleGenerateReport} disabled={isLoading || reportExists || true} className="w-full sm:w-auto">
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
