
'use client';
import { Card, CardContent } from "@/components/ui/card";
import type { Subscription } from "@/types";

interface SubscriptionsDataTableProps {
    subscriptions: Subscription[];
    tab: 'overdue' | 'this-month' | 'upcoming' | 'cancelled';
}

export function SubscriptionsDataTable({ subscriptions, tab }: SubscriptionsDataTableProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">La tabla de datos está temporalmente deshabilitada.</p>
            </CardContent>
        </Card>
    );
}
