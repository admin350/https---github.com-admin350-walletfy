
'use client';
import { Card, CardContent } from "@/components/ui/card";

interface InvestmentContributionsTableProps {
    purpose?: 'investment' | 'saving';
}

export function InvestmentContributionsTable({ purpose }: InvestmentContributionsTableProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">La tabla de datos está temporalmente deshabilitada.</p>
            </CardContent>
        </Card>
    );
}
