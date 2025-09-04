'use client';

import { useData } from "@/context/data-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Profile, Category } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function SetupPage() {
    const { finishSetup } = useData();
    const router = useRouter();
    const { toast } = useToast();

    const [profiles, setProfiles] = useState<Omit<Profile, 'id'>[]>([
        { name: "Personal", color: "#3b82f6" },
        { name: "Negocio", color: "#14b8a6" },
    ]);

    const [categories, setCategories] = useState<Omit<Category, 'id'>[]>([
        { name: "Alimentación", type: "Gasto", color: "#f97316" },
        { name: "Transporte", type: "Gasto", color: "#3b82f6" },
        { name: "Vivienda", type: "Gasto", color: "#84cc16" },
        { name: "Sueldo", type: "Ingreso", color: "#22c55e" },
        { name: "Pago de Deuda", type: "Gasto", color: "#ef4444"},
        { name: "Suscripciones", type: "Gasto", color: "#a855f7"},
        { name: "Otros Gastos", type: "Gasto", color: "#6b7280"},
        { name: "Transferencia", type: "Transferencia", color: "#06b6d4"},
    ]);

    const [currency, setCurrency] = useState<'CLP' | 'USD' | 'EUR'>('CLP');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleProfileChange = (index: number, field: 'name' | 'color', value: string) => {
        const newProfiles = [...profiles];
        newProfiles[index] = { ...newProfiles[index], [field]: value };
        setProfiles(newProfiles);
    };

    const handleCategoryChange = (index: number, field: 'name' | 'color', value: string) => {
        const newCategories = [...categories];
        newCategories[index] = { ...newCategories[index], [field]: value };
        setCategories(newCategories);
    }
    
    const addProfile = () => {
        setProfiles([...profiles, { name: 'Nuevo Perfil', color: '#ffffff' }]);
    };
    
    const removeProfile = (index: number) => {
        const newProfiles = profiles.filter((_, i) => i !== index);
        setProfiles(newProfiles);
    };

    const handleFinishSetup = async () => {
        setIsLoading(true);
        try {
            await finishSetup({
                profiles,
                categories,
                settings: { currency }
            });
            toast({
                title: "¡Configuración completada!",
                description: "Bienvenido a tu centro de finanzas.",
            });
            router.push('/dashboard');
        } catch (error) {
            console.error("Error finishing setup:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la configuración. Inténtalo de nuevo.",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
            <div className="w-full max-w-2xl space-y-8">
                 <div className="text-center">
                    <Sparkles className="mx-auto h-12 w-12 text-primary" />
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Configuración Inicial</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        ¡Bienvenido! Personalicemos la aplicación para ti. Puedes cambiar esto más tarde.
                    </p>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>1. Define tus Perfiles Financieros</CardTitle>
                        <CardDescription>
                            Organiza tus finanzas. Ejemplos: Personal, Negocio, Familia.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {profiles.map((profile, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <Input 
                                    type="color" 
                                    value={profile.color}
                                    onChange={(e) => handleProfileChange(index, 'color', e.target.value)}
                                    className="w-12 h-10 p-1"
                                />
                                <Input
                                    value={profile.name}
                                    onChange={(e) => handleProfileChange(index, 'name', e.target.value)}
                                    className="flex-1"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeProfile(index)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                         <Button variant="outline" onClick={addProfile}>Añadir Perfil</Button>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>2. Revisa tus Categorías</CardTitle>
                        <CardDescription>
                            Estas son categorías comunes para empezar. Puedes ajustarlas a tu gusto.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-64 overflow-y-auto">
                        <h3 className="font-semibold text-white">Gastos</h3>
                         {categories.filter(c => c.type === "Gasto").map((category, index) => (
                           <div key={index} className="flex items-center gap-4">
                                <Input 
                                    type="color" 
                                    value={category.color}
                                    onChange={(e) => handleCategoryChange(categories.findIndex(c => c.name === category.name), 'color', e.target.value)}
                                    className="w-12 h-10 p-1"
                                />
                                <Input
                                    value={category.name}
                                    onChange={(e) => handleCategoryChange(categories.findIndex(c => c.name === category.name), 'name', e.target.value)}
                                    className="flex-1"
                                />
                            </div>
                        ))}
                         <h3 className="font-semibold text-white mt-4">Ingresos</h3>
                         {categories.filter(c => c.type === "Ingreso").map((category, index) => (
                           <div key={index} className="flex items-center gap-4">
                                <Input 
                                    type="color" 
                                    value={category.color}
                                    onChange={(e) => handleCategoryChange(categories.findIndex(c => c.name === category.name), 'color', e.target.value)}
                                    className="w-12 h-10 p-1"
                                />
                                <Input
                                    value={category.name}
                                     onChange={(e) => handleCategoryChange(categories.findIndex(c => c.name === category.name), 'name', e.target.value)}
                                    className="flex-1"
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                     <CardHeader>
                        <CardTitle>3. Elige tu Moneda Principal</CardTitle>
                        <CardDescription>
                           Selecciona la divisa en la que gestionarás tus finanzas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Select value={currency} onValueChange={(value) => setCurrency(value as 'CLP' | 'USD' | 'EUR')}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar divisa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CLP">Peso Chileno (CLP)</SelectItem>
                                <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button size="lg" onClick={handleFinishSetup} disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Finalizar y Empezar
                    </Button>
                </div>
            </div>
        </div>
    )
}
