
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { BankCardsDataTable } from "@/components/wallets/bank-cards-data-table";
import { AddBankCardDialog } from "@/components/wallets/add-bank-card-dialog";

export default function BankCardsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mis Tarjetas Bancarias</CardTitle>
                        <CardDescription>
                            Define y gestiona tus tarjetas de crédito y débito.
                        </CardDescription>
                    </div>
                     <AddBankCardDialog>
                        <Button>
                           <PlusCircle className="mr-2 h-4 w-4 text-orange-400" />
                            Añadir Tarjeta
                        </Button>
                    </AddBankCardDialog>
                </CardHeader>
                <CardContent>
                    <BankCardsDataTable />
                </CardContent>
            </Card>
        </div>
    )
}
