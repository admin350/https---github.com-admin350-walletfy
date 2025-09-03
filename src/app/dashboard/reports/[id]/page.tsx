
'use client';
import { useContext } from 'react';
import { useParams } from 'next/navigation';
import { DataContext } from '@/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// This is a simple markdown parser, we can replace it with a more robust library if needed.
const MarkdownRenderer = ({ content }: { content: string }) => {
    const lines = content.split('\\n');
    return (
        <div className="prose prose-invert max-w-none">
            {lines.map((line, index) => {
                 if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-semibold mt-3 mb-1">{line.substring(3)}</h2>;
                }
                if (line.startsWith('* ')) {
                    return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>;
                }
                 if (line.startsWith('**')) {
                    const cleanLine = line.replace(/\*\*/g, '');
                    return <p key={index} className="font-bold my-1">{cleanLine}</p>;
                }
                return <p key={index}>{line}</p>;
            })}
        </div>
    )
}


export default function ReportDetailPage() {
    const { id } = useParams();
    const { reports, isLoading } = useContext(DataContext);

    const report = reports.find(r => r.id === id);

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!report) {
        return <div>Informe no encontrado.</div>;
    }

    const reportDate = new Date(report.year, report.month);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Informe Financiero - {format(reportDate, "MMMM yyyy", { locale: es })}</CardTitle>
                    <CardDescription>Generado el: {format(report.generatedAt, "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</CardDescription>
                </CardHeader>
                <CardContent>
                    <MarkdownRenderer content={report.content} />
                </CardContent>
            </Card>
        </div>
    );
}
