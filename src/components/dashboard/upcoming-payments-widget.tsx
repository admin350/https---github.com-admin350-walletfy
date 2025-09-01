import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const upcomingPayments = [
  { name: "Suscripción Netflix", amount: 15.99, dueDate: addDays(new Date(), 3) },
  { name: "Cuota Préstamo Auto", amount: 350, dueDate: addDays(new Date(), 7) },
  { name: "Alquiler", amount: 800, dueDate: addDays(new Date(), 10) },
  { name: "Spotify", amount: 9.99, dueDate: addDays(new Date(), 12) },
];

export function UpcomingPaymentsWidget() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Próximos Pagos</CardTitle>
        <CardDescription>Suscripciones y cuotas que vencen pronto.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {upcomingPayments.map((payment) => (
            <li key={payment.name} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{payment.name}</p>
                <p className="text-sm text-muted-foreground">
                  Vence: {format(payment.dueDate, "dd 'de' MMMM", { locale: es })}
                </p>
              </div>
              <p className="font-semibold text-base">${payment.amount.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
