
'use client'

import type { BankAccount, Transaction } from "@/types";
import { Landmark, MoreVertical, Pencil, Trash2, Copy, Check, AlertTriangle, Library } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useState, useMemo } from "react";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import Link from "next/link";
import { AddBankAccountDialog } from "./add-bank-account-dialog";
import { Progress } from "../ui/progress";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { ManageCreditLineDialog } from "./manage-credit-line-dialog";
import { getMonth, getYear } from 'date-fns';


interface BankAccountComponentProps {
    account: BankAccount;
}

export function BankAccountComponent({ account }: BankAccountComponentProps) {
    const { deleteBankAccount, profiles, formatCurrency, transactions } = useData();
    const { toast } = useToast();
    const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);
    const [manageCreditLineAccount, setManageCreditLineAccount] = useState<BankAccount | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const monthlyIncome = useMemo(() => {
        if (account.accountType !== 'Cuenta Vista' || !account.monthlyLimit) return 0;
        
        const currentMonth = getMonth(new Date());
        const currentYear = getYear(new Date());

        return transactions
            .filter((t: Transaction) => 
                ((t.type === 'income' && t.accountId === account.id) ||
                 (t.type === 'transfer' && t.destinationAccountId === account.id)) &&
                 getMonth(new Date(t.date)) === currentMonth &&
                 getYear(new Date(t.date)) === currentYear
            )
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    }, [transactions, account]);

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setAccountToEdit(account);
    };
    
    const handleManageCreditLine = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setManageCreditLineAccount(account);
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            await deleteBankAccount(account.id);
            toast({
                title: "Cuenta Eliminada",
                description: "La cuenta y todos sus datos asociados han sido eliminados."
            })
        } catch (error) {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "No se pudo eliminar la cuenta.",
                variant: "destructive"
            })
        }
    };
    
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const accountInfo = `Banco: ${account.bank}\nAlias: ${account.name}\nTipo de Cuenta: ${account.accountType}\nNúmero de Cuenta: ${account.accountNumber}\nRUT: ${account.rut || 'No especificado'}\nCorreo: ${account.email || 'No especificado'}`;
        navigator.clipboard.writeText(accountInfo);
        setIsCopied(true);
        toast({ title: '¡Información Copiada!', description: 'Los detalles de la cuenta se han copiado.' });
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const hasLimit = account.accountType === 'Cuenta Vista' && account.monthlyLimit && account.monthlyLimit > 0;
    const limitUsage = hasLimit ? (monthlyIncome / (account.monthlyLimit ?? 1)) * 100 : 0;
    
    const creditLineAvailable = (account.creditLineLimit || 0) - (account.creditLineUsed || 0);
    const creditLineProgress = account.creditLineLimit ? ((account.creditLineUsed || 0) / account.creditLineLimit) * 100 : 0;
    
    const profileColor = profiles.find(p => p.name === account.profile)?.color || '#374151';

    return (
        <>
        <Link href={`/dashboard/bank-accounts/${account.id}`} className="block group relative">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative p-4 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg flex flex-col justify-between min-h-[160px]">
                <div>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5" style={{ borderColor: profileColor }}>
                                <Landmark className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-white text-sm">{account.name}</p>
                                <p className="text-xs text-gray-400">{account.bank} - {account.accountType}</p>
                            </div>
                        </div>
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-white/10 hover:text-white" onClick={e => {e.stopPropagation(); e.preventDefault();}}>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={e => {e.stopPropagation(); e.preventDefault();}}>
                                    <DropdownMenuItem onClick={handleEdit}>
                                        <Pencil className="mr-2 h-4 w-4" /> Editar Cuenta
                                    </DropdownMenuItem>
                                    {account.accountType === "Cuenta Corriente" && (
                                        <DropdownMenuItem onClick={handleManageCreditLine}>
                                            <Library className="mr-2 h-4 w-4" /> Gestionar Línea de Crédito
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleCopy}>
                                        {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                                        Copiar Datos
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-red-400 focus:text-red-500">
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
                                    <AlertDialogDescription asChild>
                                        <div>
                                            <p>Esta acción no se puede deshacer. Al eliminar esta cuenta bancaria, se borrarán permanentemente todos los datos asociados, incluyendo:</p>
                                            <ul className="list-disc list-inside mt-2 text-yellow-400/80">
                                                <li>Tarjetas de crédito y débito vinculadas</li>
                                                <li>Deudas y préstamos asociados</li>
                                            </ul>
                                            <p className="mt-2">¿Deseas continuar?</p>
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={e => {e.stopPropagation();}}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Continuar con la Eliminación</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    <div className="mt-2 flex justify-between items-end">
                        <div>
                            <p className="text-xs text-gray-400">Saldo Actual</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(account.balance)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Nº Cuenta</p>
                            <p className="font-mono text-xs text-gray-300">{account.accountNumber}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-2 space-y-2">
                     {hasLimit && (
                        <div className="space-y-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger className="w-full">
                                        <Progress value={limitUsage} className="h-1.5 [&>div]:bg-white/80" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{`Utilizado: ${formatCurrency(monthlyIncome, true, true)} de ${formatCurrency(account.monthlyLimit!, true, true)} (${limitUsage.toFixed(1)}%)`}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className="text-xs text-white/70 flex justify-between">
                            <span>Uso Cupo Mensual</span>
                             {limitUsage >= 80 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>¡Cupo mensual casi al límite!</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        </div>
                    )}
                    {account.hasCreditLine && account.creditLineLimit && (
                        <div className="space-y-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger className="w-full">
                                        <Progress value={creditLineProgress} className="h-1.5 [&>div]:bg-amber-400/80" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{`Utilizado: ${formatCurrency(account.creditLineUsed || 0)} de ${formatCurrency(account.creditLineLimit)} (${creditLineProgress.toFixed(1)}%)`}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className="text-xs text-white/70">
                            Cupo de Línea de Crédito: {formatCurrency(creditLineAvailable)}
                        </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
        
        {accountToEdit && (
            <AddBankAccountDialog 
                open={!!accountToEdit}
                onOpenChange={(isOpen) => !isOpen && setAccountToEdit(null)}
                accountToEdit={accountToEdit}
            />
        )}
        {manageCreditLineAccount && (
            <ManageCreditLineDialog
                open={!!manageCreditLineAccount}
                onOpenChange={(isOpen) => !isOpen && setManageCreditLineAccount(null)}
                account={manageCreditLineAccount}
            />
        )}
        </>
    )
}

    