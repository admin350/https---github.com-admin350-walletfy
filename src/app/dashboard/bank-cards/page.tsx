
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddBankCardDialog } from "@/components/wallets/add-bank-card-dialog";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { BankCardComponent } from "@/components/wallets/bank-card-component";
import { Skeleton } from "@/components/ui/skeleton";

export default function BankCardsPage() {
    const { bankCards, isLoading } = useContext(DataContext);
    
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
                        <Button size="icon" variant="outline">
                           <PlusCircle className="h-6 w-6" />
                        </Button>
                    </AddBankCardDialog>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-48 rounded-xl" />
                            ))}
                         </div>
                    ) : bankCards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bankCards.map(card => (
                                <BankCardComponent key={card.id} card={card} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No tienes tarjetas registradas para el perfil seleccionado.</p>
                            <AddBankCardDialog>
                                <Button variant="link" className="mt-2">Añade tu primera tarjeta</Button>
                            </AddBankCardDialog>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
