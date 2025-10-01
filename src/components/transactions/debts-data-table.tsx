
'use client';
import { Card, CardContent } from "@/components/ui/card";
import type { Debt } from "@/types";

interface DebtsDataTableProps {
    debts: Debt[];
}

export function DebtsDataTable({ debts }: DebtsDataTableProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">La tabla de datos está temporalmente deshabilitada.</p>
            </CardContent>
        </Card>
    );
}
