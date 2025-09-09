
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const backgroundOptions = [
    { id: 'theme-gradient', name: 'Gradiente', style: { backgroundImage: 'linear-gradient(to top, #030712, #111827)'} },
    { id: 'theme-aqua', name: 'Aqua', style: { backgroundImage: 'url(/textures/aqua.png)', backgroundRepeat: 'repeat' } },
    { id: 'theme-blackmetal', name: 'Metal Oscuro', style: { backgroundImage: 'url(/textures/blackmetal.png)', backgroundRepeat: 'repeat' } },
    { id: 'theme-marmol', name: 'Mármol', style: { backgroundImage: 'url(/textures/marmol.png)', backgroundRepeat: 'repeat' } },
    { id: 'theme-marmol-gold', name: 'Mármol Dorado', style: { backgroundImage: 'url(/textures/marmol%20gold.png)', backgroundRepeat: 'repeat' } },
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
