import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Configuración</CardTitle>
                    <CardDescription>
                        Gestiona tus espacios de trabajo, categorías de transacciones y configuración de la cuenta aquí.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Gestionar Categorías</h3>
                        <p className="text-muted-foreground mb-3">Crea, edita y elimina tus categorías personalizadas para ingresos y gastos.</p>
                        <Button>Gestionar Categorías</Button>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Gestionar Espacios de Trabajo</h3>
                        <p className="text-muted-foreground mb-3">Cambia entre espacios de trabajo o crea nuevos.</p>
                        <Button>Gestionar Espacios de Trabajo</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
