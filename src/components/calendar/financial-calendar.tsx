
'use client';
import { useState, useMemo, useContext } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { DataContext } from '@/context/data-context';
import { addMonths, startOfMonth, endOfMonth, getDay, isSameDay, setDate, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { CreditCard, Repeat, ListChecks, Calendar as CalendarIconLucide } from 'lucide-react';
import type { Debt, Subscription, FixedExpense } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type CalendarEvent = {
    date: Date;
    type: 'debt' | 'subscription' | 'fixedExpense';
    data: Debt | Subscription | FixedExpense;
    title: string;
    amount: number;
};

export function FinancialCalendar() {
    const { debts, subscriptions, fixedExpenses, formatCurrency } = useContext(DataContext);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const events = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);

        const activeDebts = debts.filter(d => d.paidAmount < d.totalAmount && d.dueDate >= monthStart && d.dueDate <= monthEnd);
        const debtEvents: CalendarEvent[] = activeDebts.map(debt => ({
            date: debt.dueDate,
            type: 'debt',
            data: debt,
            title: debt.name,
            amount: debt.monthlyPayment
        }));

        const activeSubscriptions = subscriptions.filter(s => s.status === 'active' && s.dueDate >= monthStart && s.dueDate <= monthEnd);
        const subscriptionEvents: CalendarEvent[] = activeSubscriptions.map(sub => ({
            date: sub.dueDate,
            type: 'subscription',
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
                    type: 'fixedExpense',
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
            debt: { icon: CreditCard, color: 'bg-red-500/20 text-red-500 border-red-500/20' },
            subscription: { icon: ListChecks, color: 'bg-purple-500/20 text-purple-500 border-purple-500/20' },
            fixedExpense: { icon: Repeat, color: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/20' },
        };
        const Icon = config[type].icon;
        return <Icon className={`h-4 w-4 ${config[type].color}`} />;
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                 <Calendar
                    mode="single"
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    selected={selectedDay as Date}
                    onSelect={(day) => setSelectedDay(day || null)}
                    className="p-0"
                    components={{
                        DayContent: ({ date, displayMonth }) => {
                            const dayKey = format(date, 'yyyy-MM-dd');
                            const dayEvents = eventsByDay[dayKey];
                            const isCurrentMonth = date.getMonth() === displayMonth.getMonth();
                            
                            return (
                                <div className="relative w-full h-full">
                                    <span className="relative z-10">{format(date, 'd')}</span>
                                    {dayEvents && isCurrentMonth && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                                            {dayEvents.slice(0, 3).map((event, index) => {
                                                const colors = {
                                                    debt: 'bg-red-500',
                                                    subscription: 'bg-purple-500',
                                                    fixedExpense: 'bg-indigo-500'
                                                };
                                                return <div key={index} className={`w-1.5 h-1.5 rounded-full ${colors[event.type]}`}></div>
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        }
                    }}
                />
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                             <CalendarIconLucide className="h-5 w-5" />
                            {selectedDay ? format(selectedDay, "eeee, dd 'de' MMMM", { locale: es }) : 'Eventos del Mes'}
                        </CardTitle>
                        <CardDescription>
                            {selectedDay ? 'Eventos para este día.' : 'Selecciona un día para ver los detalles.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                        {selectedDay && selectedDayEvents.length > 0 ? (
                            selectedDayEvents.map((event, index) => (
                                <div key={index} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 truncate">
                                        <EventBadge type={event.type} />
                                        <span className="text-sm font-medium truncate" title={event.title}>{event.title}</span>
                                    </div>
                                    <span className="text-sm font-semibold flex-shrink-0">{formatCurrency(event.amount)}</span>
                                </div>
                            ))
                        ) : (
                             <p className="text-sm text-muted-foreground text-center pt-4">
                                {selectedDay ? 'No hay eventos para este día.' : 'No hay eventos programados para este mes.'}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
