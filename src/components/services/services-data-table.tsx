
'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import type { Service } from "@/types";

interface ServicesDataTableProps {
    services: Service[];
    isLoading: boolean;
}

export function ServicesDataTable({ services, isLoading }: ServicesDataTableProps) {
    if (isLoading) {
        return <Skeleton className="h-24 w-full" />;
    }
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">La tabla de datos está temporalmente deshabilitada.</p>
            </CardContent>
        </Card>
    );
}
