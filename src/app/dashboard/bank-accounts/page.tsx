
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Landmark, Wallet, Banknote } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { AddBankAccountDialog } from "@/components/wallets/add-bank-account-dialog";
import { BankAccountComponent } from "@/components/wallets/bank-account-component";

export default function BankAccountsPage() {
    const { bankAccounts, isLoading } = useContext(DataContext);
    
    const totalBalance = bankAccounts.reduce((acc, account) => acc + account.balance, 0);
    const personalBalance = bankAccounts.filter(a => a.profile === 'Personal').reduce((acc, a) => acc + a.balance, 0);
    const businessBalance = bankAccounts.filter(a => a.profile === 'Negocio').reduce((acc, a) => acc + a.balance, 0);
    
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
                        <KpiCard title="Balance Total" value={<KpiSkeleton />} icon={Wallet} description="Cargando..." />
                        <KpiCard title="Balance Personal" value={<KpiSkeleton />} icon={Banknote} description="Cargando..." />
                        <KpiCard title="Balance Negocio" value={<KpiSkeleton />} icon={Landmark} description="Cargando..." />
                    </>
                ) : (
                    <>
                        <KpiCard 
                            title="Balance Total" 
                            value={<span className="text-primary">${totalBalance.toLocaleString('es-CL')}</span>}
                            icon={Wallet} 
                            iconClassName="text-primary"
                            description="Balance consolidado actual de tus cuentas."
                        />
                        <KpiCard 
                            title="Balance Personal" 
                            value={<span className="text-blue-400">${personalBalance.toLocaleString('es-CL')}</span>} 
                            icon={Banknote}
                            iconClassName="text-blue-400"
                            description="Balance actual de tus cuentas 'Personal'."
                        />
                        <KpiCard
                            title="Balance Negocio"
                            value={<span className="text-teal-400">${businessBalance.toLocaleString('es-CL')}</span>}
                            icon={Landmark}
                            iconClassName="text-teal-400"
                            description="Balance actual de tus cuentas 'Negocio'."
                        />
                    </>
                )}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mis Cuentas Bancarias</CardTitle>
                        <CardDescription>
                            Define y gestiona tus cuentas de origen para los fondos.
                        </CardDescription>
                    </div>
                     <AddBankAccountDialog>
                        <Button size="icon" variant="outline">
                           <PlusCircle className="h-6 w-6" />
                        </Button>
                    </AddBankAccountDialog>
                </CardHeader>
                <CardContent>
                   {isLoading ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-48 rounded-xl" />
                            ))}
                         </div>
                    ) : bankAccounts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bankAccounts.map(account => (
                                <BankAccountComponent key={account.id} account={account} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No tienes cuentas registradas para el perfil seleccionado.</p>
                            <AddBankAccountDialog>
                                <Button variant="link" className="mt-2">Añade tu primera cuenta</Button>
                            </AddBankAccountDialog>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
