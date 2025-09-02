'use client';
import { useState, useContext } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { DataContext } from "@/context/data-context";
import { generateFinancialSummary } from "@/ai/flows/generate-financial-summary";
import { useToast } from "@/hooks/use-toast";

export function FinancialAnalysisIA() {
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const { transactions, goals, debts, subscriptions, fixedExpenses } = useContext(DataContext);
    const { toast } = useToast();

    const handleAsk = async () => {
        if (!question.trim()) return;
        setIsLoading(true);
        setAnalysis("");
        try {
            const financialData = `
                Transacciones: ${JSON.stringify(transactions, null, 2)}
                Metas de Ahorro: ${JSON.stringify(goals, null, 2)}
                Deudas: ${JSON.stringify(debts, null, 2)}
                Suscripciones: ${JSON.stringify(subscriptions, null, 2)}
                Gastos Fijos: ${JSON.stringify(fixedExpenses, null, 2)}
            `;
            const result = await generateFinancialSummary({
                financialData,
                question
            });
            setAnalysis(result);
        } catch (error) {
            console.error("Error generating financial summary:", error);
            toast({
                title: "Error",
                description: "No se pudo generar el análisis. Inténtalo de nuevo.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-card/50 border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary" />
                    Análisis IA
                </CardTitle>
                <CardDescription>
                    Haz una pregunta en lenguaje natural sobre tus finanzas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Ej: ¿Cuánto gasté en 'Negocio' este mes?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                        />
                        <Button onClick={handleAsk} disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Preguntar"
                            )}
                        </Button>
                    </div>
                    {isLoading && (
                         <div className="text-sm text-muted-foreground p-4 border rounded-md">
                            Analizando tus datos...
                         </div>
                    )}
                    {analysis && (
                        <div className="prose prose-invert max-w-none text-sm p-4 border rounded-md whitespace-pre-wrap">
                            {analysis}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
