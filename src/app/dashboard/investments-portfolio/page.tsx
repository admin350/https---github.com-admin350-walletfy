
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddInvestmentDialog } from "@/components/investments/add-investment-dialog";
import { InvestmentsWidget } from "@/components/investments/investments-widget";
import { InvestmentContributionsTable } from "@/components/investments/investment-contributions-table";

export default function InvestmentsPortfolioPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mis Inversiones</CardTitle>
                        <CardDescription>
                            Define, sigue y gestiona tus activos de inversión.
                        </CardDescription>
                    </div>
                     <AddInvestmentDialog>
                        <Button>
                           <PlusCircle className="mr-2 h-4 w-4 text-green-400" />
                            Añadir Inversión
                        </Button>
                    </AddInvestmentDialog>
                </CardHeader>
                <CardContent>
                    <InvestmentsWidget />
                </CardContent>
            </Card>

             <Card>
                 <CardHeader>
                    <CardTitle>Registro de Aportes a Inversiones</CardTitle>
                    <CardDescription>
                        Historial de todos los aportes desde tu cartera de ahorros hacia tus inversiones.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvestmentContributionsTable />
                </CardContent>
            </Card>
        </div>
    )
}
