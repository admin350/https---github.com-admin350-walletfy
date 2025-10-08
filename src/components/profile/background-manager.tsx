
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const darkBackgroundOptions = [
    { id: 'theme-gradient', name: 'Original', style: { backgroundImage: 'linear-gradient(to top, #030712, #111827)'} },
    { id: 'theme-gradient-midnight', name: 'Medianoche', style: { backgroundImage: 'linear-gradient(to bottom right, #111827, #1e1b4b)' } },
    { id: 'theme-gradient-dusk', name: 'Ocaso', style: { backgroundImage: 'linear-gradient(to bottom right, #0f172a, #2e1065, #0f172a)' } },
    { id: 'theme-gradient-forest', name: 'Bosque', style  : { backgroundImage: 'linear-gradient(to bottom right, #111827, #064e3b)' } },
    { id: 'theme-gradient-metal', name: 'Acero', style: { backgroundImage: 'linear-gradient(to bottom right, #1e293b, #0f172a)' } },
    { id: 'theme-gradient-ember', name: 'Ascua', style: { backgroundImage: 'linear-gradient(to bottom right, #1f2937, #450a0a, #000000)' } },
    { id: 'theme-gradient-abyss', name: 'Abismo', style: { backgroundImage: 'linear-gradient(to bottom right, #0f172a, #164e63, #0f172a)' } },
    { id: 'theme-gradient-majesty', name: 'Majestad', style: { backgroundImage: 'linear-gradient(to bottom right, #1e1b4b, #3b0764, #000000)' } },
    { id: 'theme-gradient-bronze', name: 'Bronce', style: { backgroundImage: 'linear-gradient(to bottom right, #1f2937, #78350f, #000000)' } },
    { id: 'theme-gradient-graphite', name: 'Grafito', style: { backgroundImage: 'linear-gradient(to bottom right, #1f2937, #111827, #000000)' } },
];


export function BackgroundManager() {
    const { settings, updateSettings, previewBackground, setPreviewBackground } = useData();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSave = async () => {
        if (previewBackground && previewBackground !== (settings.background || 'theme-gradient')) {
            setIsLoading(true);
            try {
                await updateSettings({ background: previewBackground });
                toast({
                    title: "Fondo actualizado",
                    description: "Tu nuevo fondo se ha guardado.",
                });
                 setPreviewBackground(null);
            } catch (err) {
                const error = err as Error;
                toast({
                    title: "Error",
                    description: error.message || "No se pudo guardar el fondo.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
    }

    useEffect(() => {
        // Cleanup function to reset preview when component unmounts
        return () => {
            setPreviewBackground(null);
        };
    }, [setPreviewBackground]);

    const selectedTheme = previewBackground || settings.background || 'theme-gradient';
    const isChanged = selectedTheme !== (settings.background || 'theme-gradient');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestionar Fondo de la Aplicación</CardTitle>
                <CardDescription>Elige tu fondo preferido para personalizar la apariencia de la aplicación. El cambio se previsualizará en tiempo real.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <h3 className="text-lg font-medium mb-4">Temas Oscuros</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {darkBackgroundOptions.map((option) => (
                            <div key={option.id} className="space-y-2">
                                <button 
                                    onClick={() => setPreviewBackground(option.id)} 
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
