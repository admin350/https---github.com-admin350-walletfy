
'use client'

import type { BankAccount } from "@/types";
import { cn } from "@/lib/utils";
import { Landmark, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useContext, useState } from "react";
import { DataContext } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import Link from "next/link";
import { AddBankAccountDialog } from "./add-bank-account-dialog";


interface BankAccountComponentProps {
    account: BankAccount;
}

export function BankAccountComponent({ account }: BankAccountComponentProps) {
    const { deleteBankAccount, profiles } = useContext(DataContext);
    const { toast } = useToast();
    const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);
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
                description: "La cuenta ha sido eliminada exitosamente."
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar la cuenta.",
                variant: "destructive"
            })
        }
    };
    
    const accountStyle = {
      '--tw-shadow-color': profile ? profile.color : '#06b6d4',
    } as React.CSSProperties;


    return (
        <>
        <Link href={`/dashboard/bank-accounts/${account.id}`} className="block group">
            <div 
                 style={accountStyle}
                 className={cn(
                    "relative aspect-video rounded-xl text-white flex flex-col justify-between p-4 md:p-6 overflow-hidden transition-all duration-300 group-hover:scale-105 shadow-lg shadow-[--tw-shadow-color]/20 hover:shadow-[--tw-shadow-color]/30 bg-gradient-to-br from-card to-background border border-border"
                )}
            >
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                             <p className="font-semibold text-lg">{account.bank}</p>
                        </div>
                        <p className="text-sm font-light opacity-80">{account.name}</p>
                    </div>
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
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={e => {e.stopPropagation();}}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <div className="relative z-10 space-y-2">
                     <div className="flex justify-between items-end">
                        <span className="text-2xl font-bold">${account.balance.toLocaleString('es-CL')}</span>
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
