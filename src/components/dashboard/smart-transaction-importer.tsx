
'use client';
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Upload, FileText, Check, AlertTriangle } from "lucide-react";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { processTransactions, ProcessTransactionsInputSchema } from "@/app/ai/flows/process-transactions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { Transaction } from "@/types";
import { v4 as uuidv4 } from 'uuid';

type ParsedTransaction = Omit<Transaction, 'id' | 'date'> & {
    id: string; // Use string for preview ID
    date: Date;
    status: 'ok' | 'error' | 'pending';
    error?: string;
};

export function SmartTransactionImporter() {
    const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
    const [textInput, setTextInput] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
    
    const { toast } = useToast();
    const { categories, profiles, bankAccounts, addTransaction } = useData();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        setIsLoading(true);
        setParsedTransactions([]);
        try {
            let inputData: z.infer<typeof ProcessTransactionsInputSchema> = {
                categories: categories.map(c => c.name),
                profiles: profiles.map(p => p.name),
                accounts: bankAccounts.map(a => ({ id: a.id, name: a.name })),
            };

            if (inputMode === 'text' && textInput.trim()) {
                inputData.text = textInput;
            } else if (inputMode === 'image' && imageFile) {
                inputData.photoDataUri = imagePreview!;
            } else {
                toast({ title: "Error", description: "Por favor, proporciona texto o una imagen.", variant: 'destructive' });
                setIsLoading(false);
                return;
            }

            const response = await processTransactions(inputData);

            if (response && response.transactions) {
                 const transactionsWithStatus: ParsedTransaction[] = response.transactions.map((t: any) => {
                    const hasError = !t.amount || !t.description || !t.category || !t.profile || !t.accountId;
                    return {
                        ...t,
                        id: uuidv4(), // Temporary ID for the list
                        date: new Date(),
                        status: hasError ? 'error' : 'ok',
                        error: hasError ? 'Faltan campos requeridos' : undefined,
                    }
                });
                setParsedTransactions(transactionsWithStatus);
                toast({ title: "Análisis Completo", description: `${transactionsWithStatus.length} transacciones encontradas. Por favor, revísalas.` });
            } else {
                 toast({ title: "Sin Resultados", description: "No se pudieron encontrar transacciones en la entrada proporcionada.", variant: 'destructive' });
            }

        } catch (error) {
            console.error("Error processing transactions:", error);
            toast({ title: "Error de Análisis", description: "Hubo un problema al procesar los datos con la IA.", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
     const handleUpdateTransaction = (id: string, field: keyof ParsedTransaction, value: any) => {
        setParsedTransactions(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };


    const handleImport = async () => {
        setIsImporting(true);
        const validTransactions = parsedTransactions.filter(t => t.status === 'ok' && !t.error);
        if(validTransactions.length === 0) {
            toast({ title: "Nada para Importar", description: "No hay transacciones válidas para importar.", variant: 'destructive' });
            setIsImporting(false);
            return;
        }

        let successCount = 0;
        for (const trans of validTransactions) {
            try {
                // Remove the temporary id before sending to DB
                const { id, status, error, ...dbTransaction } = trans;
                await addTransaction(dbTransaction as Omit<Transaction, 'id'>);
                successCount++;
            } catch (error) {
                console.error("Error importing transaction:", trans, error);
                 toast({ title: "Error de Importación", description: `No se pudo importar: ${trans.description}`, variant: 'destructive' });
            }
        }
        
        toast({ title: "Importación Completa", description: `${successCount} de ${validTransactions.length} transacciones fueron importadas.` });
        
        setParsedTransactions([]);
        setTextInput("");
        setImageFile(null);
        setImagePreview(null);
        setIsImporting(false);
    };


    return (
        <Card className="bg-card/50 border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary" />
                    Importador Inteligente de Transacciones
                </CardTitle>
                <CardDescription>
                    Pega texto o sube una imagen de tus transacciones y deja que la IA las registre por ti.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2 rounded-md bg-muted p-1">
                    <Button variant={inputMode === 'text' ? 'secondary' : 'ghost'} className="w-full" onClick={() => setInputMode('text')}><FileText className="mr-2"/>Desde Texto</Button>
                    <Button variant={inputMode === 'image' ? 'secondary' : 'ghost'} className="w-full" onClick={() => setInputMode('image')}><Upload className="mr-2"/>Desde Imagen</Button>
                </div>

                {inputMode === 'text' ? (
                     <Textarea 
                        placeholder="Ej: - 5500, Supermercado, comida, personal, debito
- 25000, bencina, negocio, credito visa"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        rows={5}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="h-24 object-contain"/>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
                                    </>
                                )}
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg"/>
                        </label>
                    </div> 
                )}
                 <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Analizar y Extraer Transacciones
                </Button>
                
                {parsedTransactions.length > 0 && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium">Transacciones Detectadas</h3>
                         <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[150px]">Monto</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Perfil</TableHead>
                                        <TableHead>Cuenta/Tarjeta</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedTransactions.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    value={t.amount} 
                                                    onChange={e => handleUpdateTransaction(t.id, 'amount', e.target.value)}
                                                    className={!t.amount ? 'border-red-500' : ''}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    value={t.description} 
                                                    onChange={e => handleUpdateTransaction(t.id, 'description', e.target.value)}
                                                     className={!t.description ? 'border-red-500' : ''}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select value={t.category} onValueChange={val => handleUpdateTransaction(t.id, 'category', val)}>
                                                    <SelectTrigger className={!t.category ? 'border-red-500' : ''}><SelectValue placeholder="Categoría"/></SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                 <Select value={t.profile} onValueChange={val => handleUpdateTransaction(t.id, 'profile', val)}>
                                                    <SelectTrigger className={!t.profile ? 'border-red-500' : ''}><SelectValue placeholder="Perfil"/></SelectTrigger>
                                                    <SelectContent>
                                                        {profiles.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Select value={t.accountId} onValueChange={val => handleUpdateTransaction(t.id, 'accountId', val)}>
                                                    <SelectTrigger className={!t.accountId ? 'border-red-500' : ''}><SelectValue placeholder="Cuenta"/></SelectTrigger>
                                                    <SelectContent>
                                                        {bankAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Button onClick={handleImport} disabled={isImporting} className="w-full">
                            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Confirmar e Importar Transacciones
                        </Button>
                     </div>
                )}
            </CardContent>
        </Card>
    );
}
