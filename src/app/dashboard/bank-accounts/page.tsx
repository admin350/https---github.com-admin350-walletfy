
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Landmark, Wallet, Banknote } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { BankAccountsDataTable } from "@/components/wallets/bank-accounts-data-table";
import { AddBankAccountDialog } from "@/components/wallets/add-bank-account-dialog";

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
                        <Button>
                           <PlusCircle className="mr-2 h-4 w-4 text-primary" />
                            Añadir Cuenta
                        </Button>
                    </AddBankAccountDialog>
                </CardHeader>
                <CardContent>
                    <BankAccountsDataTable />
                </CardContent>
            </Card>
        </div>
    )
}
