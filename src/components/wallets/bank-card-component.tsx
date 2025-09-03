
'use client'

import { BankCard, BankAccount, Transaction } from "@/types";
import { cn } from "@/lib/utils";
import { Cpu, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useContext, useState } from "react";
import { DataContext } from "@/context/data-context";
import { AddBankCardDialog } from "./add-bank-card-dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Progress } from "../ui/progress";
import Link from "next/link";


interface BankCardComponentProps {
    card: BankCard;
}

const VisaLogo = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 384 512" fill="white" className="h-8 w-auto">
        <path d="M384 32H0V64H384V32zM0 128V448H384V128H0zM64 192c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-17.7 0-32-14.3-32-32zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-17.7 0-32-14.3-32-32z"/>
    </svg>
)

const MastercardLogo = () => (
    <div className="relative h-8 w-12 flex items-center">
        <div className="w-8 h-8 rounded-full bg-red-500 absolute left-0 z-10 opacity-90"></div>
        <div className="w-8 h-8 rounded-full bg-yellow-500 absolute right-0"></div>
    </div>
)


export function BankCardComponent({ card }: BankCardComponentProps) {
    const { deleteBankCard } = useContext(DataContext);
    const { toast } = useToast();
    const [cardToEdit, setCardToEdit] = useState<BankCard | null>(null);

    const isCredit = card.cardType === 'credit';
   
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setCardToEdit(card);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            await deleteBankCard(card.id);
            toast({
                title: "Tarjeta Eliminada",
                description: "La tarjeta ha sido eliminada exitosamente."
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar la tarjeta.",
                variant: "destructive"
            })
        }
    };
    
    const cardTypeText = {
        credit: "Crédito",
        debit: "Débito",
        prepaid: "Prepago"
    }
    
    const cardStyle = {
      '--tw-gradient-from': card.cardColor || '#374151',
      '--tw-gradient-to': 'rgb(0 0 0 / 1)',
      '--tw-shadow-color': card.cardColor || '#ffffff',
    } as React.CSSProperties;


    return (
        <>
        <Link href={`/dashboard/bank-cards/${card.id}`} className="block group">
            <div 
                 style={cardStyle}
                 className={cn(
                    "relative aspect-[1.586] rounded-xl text-white flex flex-col justify-between p-4 md:p-6 overflow-hidden transition-all duration-300 group-hover:scale-105 shadow-lg shadow-[var(--tw-shadow-color)]/20 hover:shadow-[var(--tw-shadow-color)]/30 bg-gradient-to-br from-[var(--tw-gradient-from)] via-gray-900 to-[var(--tw-gradient-to)]"
                )}
            >
                <div className="absolute top-0 left-0 w-full h-full bg-black/10 z-0"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                             <p className="font-semibold text-lg">{card.bank}</p>
                             {card.cardLevel && <span className="text-xs uppercase font-bold opacity-80">{card.cardLevel}</span>}
                        </div>
                        <p className="text-sm font-light opacity-80">{card.name}</p>
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
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la tarjeta.
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
                    <Cpu className="h-8 w-8 md:h-10 md:w-10 text-yellow-300/80" />
                    <div className="font-mono tracking-widest text-lg md:text-xl">
                        •••• •••• •••• {card.last4Digits}
                    </div>
                
                    <div className="flex justify-between items-end pt-2">
                         <span className="text-xs font-light opacity-80">{cardTypeText[card.cardType]}</span>
                        {card.cardType === 'credit' ? <MastercardLogo /> : <VisaLogo />}
                    </div>
                </div>
            </div>
        </Link>
        
        {cardToEdit && (
            <AddBankCardDialog 
                open={!!cardToEdit}
                onOpenChange={(isOpen) => !isOpen && setCardToEdit(null)}
                cardToEdit={cardToEdit}
            />
        )}
        </>
    )
}
