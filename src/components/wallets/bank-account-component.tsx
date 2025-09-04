
'use client'

import type { BankAccount } from "@/types";
import { cn } from "@/lib/utils";
import { Landmark, MoreVertical, Pencil, Trash2, Copy, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useState } from "react";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import Link from "next/link";
import { AddBankAccountDialog } from "./add-bank-account-dialog";


interface BankAccountComponentProps {
    account: BankAccount;
}

export function BankAccountComponent({ account }: BankAccountComponentProps) {
    const { deleteBankAccount, profiles, formatCurrency } = useData();
    const { toast } = useToast();
    const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const profile = profiles.find(p => p.name === account.profile);

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setAccountToEdit(account);
    };

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
            toast({
                title: "Error",
                description: "No se pudo eliminar la cuenta.",
                variant: "destructive"
            })
        }
    };
    
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const accountInfo = `Banco: ${account.bank}\nAlias: ${account.name}\nTipo de Cuenta: ${account.accountType}\nNúmero de Cuenta: ${account.accountNumber}`;
        navigator.clipboard.writeText(accountInfo);
        setIsCopied(true);
        toast({ title: '¡Información Copiada!', description: 'Los detalles de la cuenta se han copiado.' });
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const accountStyle = {
      '--tw-gradient-from': account.color || '#374151',
      '--tw-gradient-to': 'rgb(0 0 0 / 1)',
      '--tw-shadow-color': profile ? profile.color : '#ffffff',
    } as React.CSSProperties;


    return (
        <>
        <Link href={`/dashboard/bank-accounts/${account.id}`} className="block group">
            <div 
                 style={accountStyle}
                 className={cn(
                    "relative aspect-video rounded-xl text-white flex flex-col justify-between p-4 md:p-6 overflow-hidden transition-all duration-300 group-hover:scale-105 shadow-lg hover:shadow-[var(--tw-shadow-color)]/30 bg-gradient-to-br from-[var(--tw-gradient-from)] via-gray-900 to-[var(--tw-gradient-to)] border border-border"
                )}
            >
                 <div className="absolute top-0 left-0 w-full h-full bg-black/10 z-0"></div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                             <p className="font-semibold text-lg">{account.bank}</p>
                        </div>
                        <p className="text-sm font-light opacity-80">{account.name}</p>
                    </div>
                     <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 hover:text-white" onClick={handleCopy}>
                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 hover:text-white" onClick={e => {e.stopPropagation(); e.preventDefault();}}>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleEdit}>
                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                    </DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onClick={e => {e.stopPropagation(); e.preventDefault();}}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Al eliminar esta cuenta bancaria, se borrarán permanentemente todos los datos asociados, incluyendo:
                                        <ul className="list-disc list-inside mt-2 text-yellow-400/80">
                                            <li>Tarjetas de crédito y débito vinculadas</li>
                                            <li>Deudas y préstamos asociados</li>
                                        </ul>
                                        ¿Deseas continuar?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={e => {e.stopPropagation();}}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Continuar con la Eliminación</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="relative z-10 space-y-2">
                     <div className="flex justify-between items-end">
                        <span className="text-2xl font-bold">{formatCurrency(account.balance)}</span>
                        <Landmark className="h-8 w-8 text-white/50" />
                     </div>
                    <div className="font-mono tracking-wider text-sm opacity-80">
                       •••• {account.accountNumber.slice(-4)}
                    </div>
                     <p className="text-xs font-light opacity-60">{account.accountType}</p>
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
        </>
    )
}
