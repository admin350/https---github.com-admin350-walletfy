
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building, Car, Laptop } from "lucide-react";
import { useData } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { AddAssetDialog } from "@/components/assets/add-asset-dialog";
import { KpiCard } from "@/components/dashboard/kpi-card";
import type { TangibleAsset } from "@/types";
import { AssetsDataTable } from "@/components/assets/assets-data-table";

export default function AssetsPage() {
    const { tangibleAssets, isLoading, formatCurrency } = useData();
    
    const totalAssetValue = (tangibleAssets || []).reduce((acc: number, asset: TangibleAsset) => acc + asset.estimatedValue, 0);
    const personalAssetsValue = (tangibleAssets || []).filter((a: TangibleAsset) => a.profile === 'Personal').reduce((acc: number, a: TangibleAsset) => acc + a.estimatedValue, 0);
    const businessAssetsValue = (tangibleAssets || []).filter((a: TangibleAsset) => a.profile === 'Negocio').reduce((acc: number, a: TangibleAsset) => acc + a.estimatedValue, 0);

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
                        <KpiCard title="Valor Total de Activos" value={<KpiSkeleton />} icon={Car} description="Cargando..." />
                        <KpiCard title="Activos Personales" value={<KpiSkeleton />} icon={Laptop} description="Cargando..." />
                        <KpiCard title="Activos de Negocio" value={<KpiSkeleton />} icon={Building} description="Cargando..." />
                    </>
                ) : (
                    <>
                        <KpiCard 
                            title="Valor Total de Activos" 
                            value={formatCurrency(totalAssetValue)}
                            icon={Car} 
                            description="Valor estimado de todos tus bienes tangibles."
                        />
                        <KpiCard 
                            title="Activos Personales" 
                            value={formatCurrency(personalAssetsValue)} 
                            icon={Laptop}
                            description="Valor de tus bienes 'Personal'."
                        />
                        <KpiCard
                            title="Activos de Negocio"
                            value={formatCurrency(businessAssetsValue)}
                            icon={Building}
                            description="Valor de tus bienes 'Negocio'."
                        />
                    </>
                )}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mis Activos Tangibles</CardTitle>
                        <CardDescription>
                            Registra y gestiona tus bienes como vehículos, propiedades o equipos.
                        </CardDescription>
                    </div>
                     <AddAssetDialog>
                        <Button size="icon" variant="outline">
                           <PlusCircle className="h-6 w-6" />
                        </Button>
                    </AddAssetDialog>
                </CardHeader>
                <CardContent>
                   <AssetsDataTable assets={tangibleAssets || []} isLoading={isLoading} />
                </CardContent>
            </Card>
        </div>
    )
}
