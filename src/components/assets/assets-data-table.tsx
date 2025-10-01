
'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import type { TangibleAsset } from "@/types";

interface AssetsDataTableProps {
    assets: TangibleAsset[];
    isLoading: boolean;
}

export function AssetsDataTable({ assets, isLoading }: AssetsDataTableProps) {

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">La tabla de datos está temporalmente deshabilitada.</p>
            </CardContent>
        </Card>
    )
}
