
'use client';
import { useRef } from 'react';
import { useParams } from 'next/navigation';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// This is a simple markdown parser, we can replace it with a more robust library if needed.
const MarkdownRenderer = ({ content }: { content: string }) => {
    const lines = content.split('\n');
    let inList = false;

    return (
        <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            {lines.map((line, index) => {
                const trimmedLine = line.trim();

                if (trimmedLine.startsWith('# ')) {
                    inList = false;
                    return <h1 key={index} className="text-2xl font-bold mt-6 mb-3 border-b pb-2">{trimmedLine.substring(2)}</h1>;
                }
                if (trimmedLine.startsWith('## ')) {
                    inList = false;
                    return <h2 key={index} className="text-xl font-semibold mt-4 mb-2">{trimmedLine.substring(3)}</h2>;
                }
                if (trimmedLine.startsWith('### ')) {
                    inList = false;
                    return <h3 key={index} className="text-lg font-semibold mt-3 mb-1">{trimmedLine.substring(4)}</h3>;
                }

                if (trimmedLine.startsWith('* ')) {
                    const listContent = <li key={index}>{trimmedLine.substring(2)}</li>;
                    if (!inList) {
                        inList = true;
                        return <ul key={`ul-${index}`} className="list-disc pl-5 mt-2 mb-2">{listContent}</ul>;
                    }
                    return listContent;
                }

                if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                     inList = false;
                    const cleanLine = trimmedLine.substring(2, trimmedLine.length - 2);
                    return <p key={index} className="font-bold my-2">{cleanLine}</p>;
                }
                
                if (trimmedLine === '') {
                    inList = false;
                    return <br key={index} />;
                }
                
                if (inList) {
                     return <li key={index}>{trimmedLine}</li>;
                }

                return <p key={index} className="my-1">{trimmedLine}</p>;
            })}
        </div>
    )
}


export default function ReportDetailPage() {
    const { id } = useParams();
    const { reports, isLoading } = useData();
    const [isDownloading, setIsDownloading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const report = reports.find(r => r.id === id);

    const handleDownload = async () => {
        if (!reportRef.current || !report) return;
        setIsDownloading(true);

        const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            backgroundColor: '#28282B' // Match your dark background
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`informe-${report.year}-${report.month + 1}.pdf`);

        setIsDownloading(false);
    };


    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!report) {
        return <div>Informe no encontrado.</div>;
    }

    const reportDate = new Date(report.year, report.month);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button asChild variant="outline" size="icon">
                                <Link href="/dashboard/reports">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Volver a Informes</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    Descargar PDF
                </Button>
            </div>
            <Card ref={reportRef}>
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
