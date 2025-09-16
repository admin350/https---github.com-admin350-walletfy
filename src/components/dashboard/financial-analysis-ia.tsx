
'use client';
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";

export function FinancialAnalysisIA() {
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const { toast } = useToast();

    const handleAsk = async () => {
        if (!question.trim()) return;
        setIsLoading(true);
        setAnalysis("");
        toast({
            title: "Función no disponible",
            description: "Las funciones de IA se han deshabilitado temporalmente para resolver problemas de dependencias.",
            variant: "destructive"
        });
        setIsLoading(false);
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
                            disabled
                        />
                        <Button onClick={handleAsk} disabled={isLoading || true}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Preguntar"
                            )}
                        </Button>
                    </div>
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
