
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useData } from "@/context/data-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { AppSettings } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function CurrencyManager() {
    const { settings, updateSettings } = useData();
    const { toast } = useToast();
    const [localSettings, setLocalSettings] = useState(settings);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateSettings(localSettings);
            toast({
                title: "Configuración guardada",
                description: "La configuración ha sido actualizada en toda la aplicación.",
            });
        } catch (error) {
             const err = error instanceof Error ? error : new Error('An unknown error occurred');
             toast({
                title: "Error",
                description: err.message || "No se pudo guardar la configuración.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const isChanged = JSON.stringify(settings) !== JSON.stringify(localSettings);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestionar Divisa y Alertas</CardTitle>
                <CardDescription>Configura la moneda principal y los umbrales para notificaciones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Divisa Principal</Label>
                    <Select 
                        value={localSettings.currency} 
                        onValueChange={(value) => setLocalSettings(s => ({...s, currency: value as AppSettings['currency']}))}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Seleccionar divisa" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CLP">Peso Chileno (CLP)</SelectItem>
                            <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Umbral de Transacción Grande</Label>
                    <Input 
                        type="number"
                        className="w-48"
                        placeholder="Ej: 500000"
                        value={localSettings.largeTransactionThreshold || ''}
                        onChange={(e) => setLocalSettings(s => ({...s, largeTransactionThreshold: Number(e.target.value) || undefined}))}
                    />
                     <p className="text-xs text-muted-foreground">Recibe una alerta para transacciones individuales sobre este monto.</p>
                </div>
                <div>
                    <Button onClick={handleSave} disabled={isLoading || !isChanged}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Guardar Cambios
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
