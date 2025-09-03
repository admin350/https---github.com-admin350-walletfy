
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useContext, useState } from "react";
import { DataContext } from "@/context/data-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { AppSettings } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function CurrencyManager() {
    const { settings, updateSettings } = useContext(DataContext);
    const { toast } = useToast();
    const [selectedCurrency, setSelectedCurrency] = useState(settings.currency);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateSettings({ currency: selectedCurrency });
            toast({
                title: "Configuración guardada",
                description: "La divisa ha sido actualizada en toda la aplicación.",
            });
        } catch (error) {
             toast({
                title: "Error",
                description: "No se pudo guardar la configuración.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestionar Divisa</CardTitle>
                <CardDescription>Selecciona la moneda principal para la aplicación. Este cambio se reflejará en todos los montos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                     <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as AppSettings['currency'])}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Seleccionar divisa" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CLP">Peso Chileno (CLP)</SelectItem>
                            <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleSave} disabled={isLoading || selectedCurrency === settings.currency}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Guardar Cambios
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
