
'use client'
import { useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useData } from '@/context/data-context';
import { format, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sparkles } from 'lucide-react';

export function GenerateReportForm() {
    const { availableYears } = useData();
    
    const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
    const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
    
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: format(new Date(2000, i), 'LLLL', { locale: es }),
    }));
    
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

            <Button disabled={true} className="w-full sm:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                Generar Informe (Deshabilitado)
            </Button>
        </div>
    )
}
