
'use client';
import { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { useData } from '@/context/data-context';
import { startOfMonth, endOfMonth, setDate, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '../ui/card';
import { CreditCard, Repeat, ListChecks, Calendar as CalendarIconLucide, HandCoins } from 'lucide-react';
import type { Debt, Subscription, FixedExpense } from '@/types';
import { Button } from '../ui/button';
import { PayDebtDialog } from '../transactions/pay-debt-dialog';
import { PaySubscriptionDialog } from '../transactions/pay-subscription-dialog';

type CalendarEvent = {
    date: Date;
    type: 'debt' | 'subscription' | 'fixedExpense';
    data: Debt | Subscription | FixedExpense;
    title: string;
    amount: number;
};

export function FinancialCalendar() {
    const { debts, subscriptions, fixedExpenses, formatCurrency } = useData();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
    const [itemToPay, setItemToPay] = useState<CalendarEvent | null>(null);


    const events = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);

        const activeDebts = debts.filter(d => d.paidAmount < d.totalAmount && new Date(d.dueDate) >= monthStart && new Date(d.dueDate) <= monthEnd);
        const debtEvents: CalendarEvent[] = activeDebts.map(debt => ({
            date: new Date(debt.dueDate),
            type: 'debt' as const,
            data: debt,
            title: debt.name,
            amount: debt.monthlyPayment
        }));

        const activeSubscriptions = subscriptions.filter(s => s.status === 'active' && new Date(s.dueDate) >= monthStart && new Date(s.dueDate) <= monthEnd);
        const subscriptionEvents: CalendarEvent[] = activeSubscriptions.map(sub => ({
            date: new Date(sub.dueDate),
            type: 'subscription' as const,
            data: sub,
            title: sub.name,
            amount: sub.amount
        }));

        const fixedExpenseEvents: CalendarEvent[] = fixedExpenses
            .filter(fe => fe.paymentDay > 0 && fe.paymentDay <= 31)
            .map(fe => {
                 const eventDate = setDate(currentMonth, fe.paymentDay);
                 return {
                    date: eventDate,
                    type: 'fixedExpense' as const,
                    data: fe,
                    title: fe.name,
                    amount: fe.amount
                 }
            })
            .filter(event => event.date >= monthStart && event.date <= monthEnd);

        return [...debtEvents, ...subscriptionEvents, ...fixedExpenseEvents];
    }, [currentMonth, debts, subscriptions, fixedExpenses]);

    const eventsByDay = useMemo(() => {
        return events.reduce((acc, event) => {
            const dayKey = format(event.date, 'yyyy-MM-dd');
            if (!acc[dayKey]) {
                acc[dayKey] = [];
            }
            acc[dayKey].push(event);
            return acc;
        }, {} as Record<string, CalendarEvent[]>);
    }, [events]);
    
    const selectedDayEvents = selectedDay ? eventsByDay[format(selectedDay, 'yyyy-MM-dd')] || [] : [];
    
    const EventBadge = ({ type }: { type: CalendarEvent['type'] }) => {
        const config = {
            debt: { icon: CreditCard, color: 'text-red-400 border-red-400/30 bg-red-400/10' },
            subscription: { icon: ListChecks, color: 'text-purple-400 border-purple-400/30 bg-purple-400/10' },
            fixedExpense: { icon: Repeat, color: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10' },
        };
        const Icon = config[type].icon;
        return (
             <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${config[type].color}`}>
                <Icon className="h-4 w-4" />
             </div>
        )
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-lg bg-card/80">
                <CardContent className="flex justify-center p-0">
                    <Calendar
                        mode="single"
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        selected={selectedDay as Date}
                        onSelect={(day) => setSelectedDay(day || null)}
                        className="w-full"
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4 w-full",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex justify-around",
                            head_cell: "text-muted-foreground rounded-md w-full font-normal text-sm",
                            row: "flex w-full mt-2 justify-around",
                            cell: "h-16 w-full text-center text-sm p-1 relative [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-full w-full p-1.5 flex flex-col items-start justify-start font-normal aria-selected:opacity-100 rounded-lg transition-colors hover:bg-accent/50",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                        }}
                        components={{
                            Day: ({ date, displayMonth }) => {
                                const dayKey = format(date, 'yyyy-MM-dd');
                                const dayEvents = eventsByDay[dayKey];
                                const isCurrentMonth = date.getMonth() === displayMonth.getMonth();
                                
                                return (
                                    <div className="relative w-full h-full flex flex-col items-start">
                                        <time dateTime={date.toISOString()} className="relative z-10">{format(date, 'd')}</time>
                                        {dayEvents && isCurrentMonth && (
                                            <div className="flex-1 w-full overflow-hidden mt-1">
                                                <div className="flex flex-col gap-1">
                                                    {dayEvents.slice(0, 3).map((event, index) => {
                                                        const colors = {
                                                            debt: 'bg-red-500',
                                                            subscription: 'bg-purple-500',
                                                            fixedExpense: 'bg-indigo-500'
                                                        };
                                                        return <div key={index} className={`w-full h-1.5 rounded-full ${colors[event.type]}`}></div>
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                        }}
                    />
                </CardContent>
            </Card>
            
            <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                     <CalendarIconLucide className="h-5 w-5" />
                    {selectedDay ? format(selectedDay, "eeee, dd 'de' MMMM", { locale: es }) : 'Eventos del Mes'}
                </h2>
                <div className="space-y-4">
                    {selectedDay && selectedDayEvents.length > 0 ? (
                        <ul className="divide-y divide-border rounded-md border">
                            {selectedDayEvents.map((event, index) => (
                                <li key={index} className="flex items-center justify-between gap-2 p-3">
                                    <div className="flex items-center gap-3 truncate">
                                        <EventBadge type={event.type} />
                                        <div className="flex flex-col truncate">
                                            <span className="text-sm font-medium truncate" title={event.title}>{event.title}</span>
                                            <span className="text-xs text-muted-foreground">{formatCurrency(event.amount)}</span>
                                        </div>
                                    </div>
                                    { (event.type === 'debt' || event.type === 'subscription') && (
                                         <Button variant="outline" size="sm" onClick={() => setItemToPay(event)}>
                                            <HandCoins className="mr-2 h-4 w-4" />
                                            Pagar
                                        </Button>
                                    )}
                                </li>
                            ))}
                         </ul>
                    ) : (
                         <p className="text-sm text-muted-foreground text-center pt-4">
                            {selectedDay ? 'No hay eventos para este día.' : 'No hay eventos programados para este mes.'}
                        </p>
                    )}
                </div>
            </div>

             {itemToPay?.type === 'debt' && (
                <PayDebtDialog 
                    debt={itemToPay.data as Debt}
                    open={!!itemToPay}
                    onOpenChange={(isOpen) => !isOpen && setItemToPay(null)}
                />
             )}
             {itemToPay?.type === 'subscription' && (
                <PaySubscriptionDialog 
                    subscription={itemToPay.data as Subscription}
                    open={!!itemToPay}
                    onOpenChange={(isOpen) => !isOpen && setItemToPay(null)}
                />
             )}
        </div>
    );
}
