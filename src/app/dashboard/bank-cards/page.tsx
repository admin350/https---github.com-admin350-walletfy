'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CreditCard, Banknote, Landmark } from "lucide-react";
import { AddBankCardDialog } from "@/components/wallets/add-bank-card-dialog";
import { useData } from "@/context/data-context";
import { BankCardComponent } from "@/components/wallets/bank-card-component";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/dashboard/kpi-card";
import type { BankCard } from "@/types";

export default function BankCardsPage() {
    const { bankCards, isLoading, formatCurrency } = useData();

    const creditCards = bankCards.filter((c: BankCard) => c.cardType === 'credit');
    const totalCreditLimit = creditCards.reduce((acc: number, card: BankCard) => acc + (card.creditLimit || 0), 0);
    const totalUsedAmount = creditCards.reduce((acc: number, card: BankCard) => acc + (card.usedAmount || 0), 0);
    const totalAvailableCredit = totalCreditLimit - totalUsedAmount;
    
    const KpiSkeleton = () => (
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )

    return (
        <div className="space-y-6">
             <div className="grid gap-4 md:grid-cols-3">
                {isLoading ? (
                    <>
                        <KpiCard title="Cupo Total en Tarjetas" value={<KpiSkeleton />} icon={Landmark} description="Cargando..." />
                        <KpiCard title="Deuda Total en Tarjetas" value={<KpiSkeleton />} icon={Banknote} description="Cargando..." />
                        <KpiCard title="Crédito Disponible Total" value={<KpiSkeleton />} icon={CreditCard} description="Cargando..." />
                    </>
                ) : (
                    <>
                        <KpiCard 
                            title="Cupo Total en Tarjetas" 
                            value={formatCurrency(totalCreditLimit)}
                            icon={Landmark} 
                            description="Suma de los límites de todas tus tarjetas."
                        />
                        <KpiCard 
                            title="Deuda Total en Tarjetas" 
                            value={<span className="text-red-400">{formatCurrency(totalUsedAmount)}</span>} 
                            icon={Banknote}
                            description="Suma de los cupos utilizados en tus tarjetas."
                        />
                        <KpiCard
                            title="Crédito Disponible Total"
                            value={<span className="text-green-400">{formatCurrency(totalAvailableCredit)}</span>}
                            icon={CreditCard}
                            description="Cupo disponible consolidado para compras."
                        />
                    </>
                )}
            </div>
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
                            {bankCards.map((card: BankCard) => (
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
