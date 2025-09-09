
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const darkBackgroundOptions = [
    { id: 'theme-gradient', name: 'Original', style: { backgroundImage: 'linear-gradient(to top, #111827, #030712)'} },
    { id: 'theme-gradient-midnight', name: 'Medianoche', style: { backgroundImage: 'linear-gradient(to bottom right, #111827, #1e1b4b)' } },
    { id: 'theme-gradient-dusk', name: 'Ocaso', style: { backgroundImage: 'linear-gradient(to bottom right, #0f172a, #2e1065, #0f172a)' } },
    { id: 'theme-gradient-forest', name: 'Bosque', style  : { backgroundImage: 'linear-gradient(to bottom right, #111827, #064e3b)' } },
    { id: 'theme-gradient-metal', name: 'Acero', style: { backgroundImage: 'linear-gradient(to bottom right, #1e293b, #0f172a)' } },
];

const lightBackgroundOptions = [
    { id: 'theme-gradient-day', name: 'Día', style: { backgroundImage: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9, #e2e8f0)' } },
    { id: 'theme-gradient-sky', name: 'Cielo', style: { backgroundImage: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe, #e0e7ff)' } },
    { id: 'theme-gradient-sand', name: 'Arena', style: { backgroundImage: 'linear-gradient(to bottom right, #fffbeb, #fff7ed, #fefce8)' } },
    { id: 'theme-gradient-mint', name: 'Menta', style: { backgroundImage: 'linear-gradient(to bottom right, #ecfdf5, #f0fdfa, #ecfeff)' } },
    { id: 'theme-gradient-rose', name: 'Rosa', style: { backgroundImage: 'linear-gradient(to bottom right, #fff1f2, #fdf2f8, #fdf4ff)' } },
];


export function BackgroundManager() {
    const { settings, updateSettings, previewBackground, setPreviewBackground } = useData();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    // The selected theme for preview is now handled by the context's previewBackground state.
    const selectedTheme = previewBackground || settings.background || 'theme-gradient';

    const handleSelectTheme = (themeId: string) => {
        setPreviewBackground(themeId);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateSettings({ background: selectedTheme });
            setPreviewBackground(null); // Clear preview after saving
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
    
    const isChanged = selectedTheme !== settings.background;

    // Reset preview if component unmounts (e.g., user navigates away)
    useEffect(() => {
        return () => {
            setPreviewBackground(null);
        };
    }, [setPreviewBackground]);

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
                                    onClick={() => handleSelectTheme(option.id)} 
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
                    <h3 className="text-lg font-medium mb-4">Temas Claros</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {lightBackgroundOptions.map((option) => (
                            <div key={option.id} className="space-y-2">
                                <button 
                                    onClick={() => handleSelectTheme(option.id)} 
                                    style={option.style}
                                    className={cn(
                                        "w-full h-24 rounded-lg border-2 transition-all flex items-center justify-center",
                                        selectedTheme === option.id ? "border-primary" : "border-muted hover:border-muted-foreground"
                                    )}
                                >
                                    {selectedTheme === option.id && <Check className="h-8 w-8 text-black bg-white/50 rounded-full p-1" />}
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
