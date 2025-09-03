
'use client';
import { useContext, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { DataContext } from "@/context/data-context";
import { getMonth, getYear } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { generateMonthlyReport } from "@/ai/flows/generate-monthly-report";
import { Loader2, Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export function CloseMonthButton() {
    const { reports, addReport, transactions, getAllDataForMonth } = useContext(DataContext);
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const { canClose, month, year, monthName } = useMemo(() => {
        const now = new Date();
        const currentMonth = getMonth(now);
        const currentYear = getYear(now);
        
        const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(now);

        const hasTransactionsThisMonth = transactions.some(t => {
            const date = new Date(t.date);
            return getMonth(date) === currentMonth && getYear(date) === currentYear;
        });

        const reportExists = reports.some(r => r.month === currentMonth && r.year === currentYear);

        return {
            canClose: hasTransactionsThisMonth && !reportExists,
            month: currentMonth,
            year: currentYear,
            monthName,
        };
    }, [transactions, reports]);

    const handleCloseMonth = async () => {
        setIsLoading(true);
        try {
            const { transactions, goals, debts, investments, budgets } = getAllDataForMonth(month, year);
            
            const reportContent = await generateMonthlyReport({
                month,
                year,
                transactions: JSON.stringify(transactions),
                goals: JSON.stringify(goals),
                debts: JSON.stringify(debts),
                investments: JSON.stringify(investments),
                budgets: JSON.stringify(budgets),
            });
            
            await addReport({
                id: `${year}-${month}`,
                month,
                year,
                generatedAt: new Date(),
                content: reportContent
            });

            toast({
                title: "Mes Cerrado Exitosamente",
                description: `Se ha generado el informe para ${monthName} ${year}.`
            });

        } catch (error) {
            console.error("Error closing month:", error);
            toast({
                title: "Error al Cerrar el Mes",
                description: "No se pudo generar el informe. Por favor, inténtalo de nuevo.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                 <Button disabled={!canClose || isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Lock className="mr-2 h-4 w-4" />
                    )}
                    Cerrar Mes
                </Button>
            </AlertDialogTrigger>
             <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar Cierre de Mes?</AlertDialogTitle>
                    <AlertDialogDescription>
                       Estás a punto de generar el informe financiero para <span className="font-bold text-primary">{monthName} {year}</span>.
                       Esta acción creará una instantánea de tus finanzas para este período. No podrás volver a generar un informe para este mes.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCloseMonth}>Confirmar y Generar Informe</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
