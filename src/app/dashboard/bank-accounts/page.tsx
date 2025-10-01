
'use client';
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Landmark, Wallet, Banknote, ArrowRightLeft } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useData } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { AddBankAccountDialog } from "@/components/wallets/add-bank-account-dialog";
import { BankAccountComponent } from "@/components/wallets/bank-account-component";
import { AddTransferDialog } from "@/components/wallets/add-transfer-dialog";
import type { BankAccount } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function BankAccountsPage() {
    const { bankAccounts, isLoading, formatCurrency, profiles } = useData();
    const [activeProfile, setActiveProfile] = useState<string>('all');
    
    const totalBalance = bankAccounts.reduce((acc: number, account: BankAccount) => acc + account.balance, 0);
    const personalBalance = bankAccounts.filter((a: BankAccount) => a.profile === 'Personal').reduce((acc: number, a: BankAccount) => acc + a.balance, 0);
    const businessBalance = bankAccounts.filter((a: BankAccount) => a.profile === 'Negocio').reduce((acc: number, a: BankAccount) => acc + a.balance, 0);
    
    const filteredAccounts = activeProfile === 'all'
        ? bankAccounts
        : bankAccounts.filter(account => account.profile === activeProfile);

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
                            value={<span className="text-primary">{formatCurrency(totalBalance)}</span>}
                            icon={Wallet} 
                            description="Balance consolidado actual de tus cuentas."
                        />
                        <KpiCard 
                            title="Balance Personal" 
                            value={formatCurrency(personalBalance)} 
                            icon={Banknote}
                            description="Balance actual de tus cuentas 'Personal'."
                        />
                        <KpiCard
                            title="Balance Negocio"
                            value={formatCurrency(businessBalance)}
                            icon={Landmark}
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
                     <div className="flex items-center gap-2">
                         <AddTransferDialog>
                            <Button variant="outline" className="hover:bg-blue-500/90 hover:text-white">
                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                Transferir
                            </Button>
                        </AddTransferDialog>
                         <AddBankAccountDialog>
                            <Button size="icon" variant="outline">
                               <PlusCircle className="h-6 w-6" />
                            </Button>
                        </AddBankAccountDialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeProfile} onValueChange={setActiveProfile} className="mb-6">
                        <TabsList className="grid w-full grid-cols-1 sm:w-auto sm:grid-cols-3">
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="Personal">Personal</TabsTrigger>
                            <TabsTrigger value="Negocio">Negocio</TabsTrigger>
                        </TabsList>
                    </Tabs>
                   {isLoading ? (
                         <div className="space-y-4 max-w-3xl mx-auto">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-40 rounded-xl" />
                            ))}
                         </div>
                    ) : filteredAccounts.length > 0 ? (
                        <div className="space-y-4 max-w-3xl mx-auto">
                            {filteredAccounts.map((account: BankAccount) => (
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
