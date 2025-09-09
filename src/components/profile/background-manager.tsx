
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const backgroundOptions = [
    { id: 'theme-gradient', name: 'Original', style: { backgroundImage: 'linear-gradient(to top, #111827, #030712)'} },
    { id: 'theme-gradient-midnight', name: 'Medianoche', style: { backgroundImage: 'linear-gradient(to bottom right, #111827, #1e1b4b)' } },
    { id: 'theme-gradient-dusk', name: 'Ocaso', style: { backgroundImage: 'linear-gradient(to bottom right, #0f172a, #2e1065, #0f172a)' } },
    { id: 'theme-gradient-forest', name: 'Bosque', style: { backgroundImage: 'linear-gradient(to bottom right, #111827, #064e3b)' } },
    { id: 'theme-gradient-metal', name: 'Acero', style: { backgroundImage: 'linear-gradient(to bottom right, #1e293b, #0f172a)' } },
]

export function BackgroundManager() {
    const { settings, updateSettings } = useData();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(settings.background || 'theme-gradient');

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateSettings({ background: selectedTheme });
            toast({
                title: "Fondo actualizado",
                description: "Tu nuevo fondo se ha guardado.",
            });
        } catch (error) {
             toast({
                title: "Error",
                description: "No se pudo guardar el fondo.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    const isChanged = settings.background !== selectedTheme;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestionar Fondo de la Aplicación</CardTitle>
                <CardDescription>Elige tu fondo preferido para personalizar la apariencia de la aplicación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {backgroundOptions.map((option) => (
                        <div key={option.id} className="space-y-2">
                             <button 
                                onClick={() => setSelectedTheme(option.id)} 
                                style={option.style}
                                className={cn(
                                    "w-full h-24 rounded-lg border-2 transition-all flex items-center justify-center",
                                    selectedTheme === option.id ? "border-primary" : "border-muted hover:border-muted-foreground"
                                )}
                            >
                                {selectedTheme === option.id && <Check className="h-8 w-8 text-white bg-black/50 rounded-full p-1" />}
                             </button>
                             <p className="text-sm text-center text-muted-foreground">{option.name}</p>
                        </div>
                    ))}
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
