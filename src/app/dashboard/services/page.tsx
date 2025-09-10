
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ServicesDataTable } from "@/components/services/services-data-table";
import { useState } from "react";
import { AddServiceDialog } from "@/components/services/add-service-dialog";
import { useData } from "@/context/data-context";

export default function ServicesPage() {
    const { services, isLoading } = useData();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mis Servicios</CardTitle>
                        <CardDescription>
                            Registra tus servicios recurrentes y accede a sus portales de pago.
                        </CardDescription>
                    </div>
                    <Button size="icon" variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                       <PlusCircle className="h-6 w-6" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <ServicesDataTable services={services} isLoading={isLoading} />
                </CardContent>
            </Card>
             <AddServiceDialog 
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
             />
        </div>
    )
}
