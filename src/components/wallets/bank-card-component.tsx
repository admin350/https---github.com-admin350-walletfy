
'use client'

import { BankCard, BankAccount, Transaction } from "@/types";
import { cn } from "@/lib/utils";
import { Cpu, MoreVertical, Pencil, Trash2, History } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useContext, useState } from "react";
import { DataContext } from "@/context/data-context";
import { AddBankCardDialog } from "./add-bank-card-dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Progress } from "../ui/progress";
import { CardTransactionHistoryDialog } from "./card-transaction-history-dialog";

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
    const { bankAccounts, deleteBankCard } = useContext(DataContext);
    const { toast } = useToast();
    const [cardToEdit, setCardToEdit] = useState<BankCard | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const isCredit = card.cardType === 'credit';
    const associatedAccount = bankAccounts.find(acc => acc.id === card.accountId);

    const handleEdit = () => {
        setCardToEdit(card);
    };

    const handleDelete = async () => {
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
    
    const available = card.creditLimit ? card.creditLimit - (card.usedAmount || 0) : 0;
    const progress = card.creditLimit ? ((card.usedAmount || 0) / card.creditLimit) * 100 : 0;

    return (
        <>
        <div className={cn(
            "relative aspect-[1.586] rounded-xl shadow-lg text-white flex flex-col justify-between p-4 md:p-6 overflow-hidden",
            isCredit ? "bg-gradient-to-br from-gray-700 via-gray-900 to-black" : "bg-gradient-to-br from-blue-700 via-blue-900 to-black"
        )}>
             <div className="absolute top-0 left-0 w-full h-full bg-black/10 z-0"></div>

             <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-sm font-light opacity-80">{card.bank}</p>
                    <p className="font-semibold text-lg">{card.name}</p>
                </div>
                 <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEdit}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem>
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
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
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

                {isCredit && card.creditLimit ? (
                    <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                            <span>Utilizado: ${card.usedAmount?.toLocaleString('es-CL') || 0}</span>
                            <span>Disponible: ${available.toLocaleString('es-CL')}</span>
                        </div>
                        <Progress value={progress} className="h-1 bg-white/20 [&>div]:bg-white" />
                         <div className="text-right text-white/70">
                            Cupo Total: ${card.creditLimit.toLocaleString('es-CL')}
                        </div>
                    </div>
                ) : (
                     <div className="text-sm">
                        <span className="text-white/70">Saldo Cuenta: </span>
                        <span>${associatedAccount?.balance.toLocaleString('es-CL') || 0}</span>
                    </div>
                )}
               
                <div className="flex justify-between items-end pt-2">
                    <div className='flex flex-col gap-1'>
                        <span className="text-xs font-light opacity-80">{cardTypeText[card.cardType]}</span>
                         <Button
                            variant="link"
                            className="text-xs text-white p-0 h-auto justify-start"
                            onClick={() => setIsHistoryOpen(true)}
                        >
                            <History className="mr-1 h-3 w-3" />
                            Ver historial
                        </Button>
                    </div>
                    {card.cardType === 'credit' ? <MastercardLogo /> : <VisaLogo />}
                </div>
            </div>
        </div>
        
        {cardToEdit && (
            <AddBankCardDialog 
                open={!!cardToEdit}
                onOpenChange={(isOpen) => !isOpen && setCardToEdit(null)}
                cardToEdit={cardToEdit}
            />
        )}
        <CardTransactionHistoryDialog
            open={isHistoryOpen}
            onOpenChange={setIsHistoryOpen}
            card={card}
        />
        </>
    )
}
