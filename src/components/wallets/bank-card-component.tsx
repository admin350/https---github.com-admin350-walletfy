
'use client'

import { BankCard } from "@/types";
import { cn } from "@/lib/utils";
import { Cpu, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";

interface BankCardComponentProps {
    card: BankCard;
}

const VisaLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-auto text-white">
        <path d="M2.212 9.222c-.39.43-.61.96-.61 1.51v2.54c0 .55.22 1.08.61 1.51l2.42 2.62c.39.43.92.68 1.49.68h12.96c.57 0 1.1-.25 1.49-.68l2.42-2.62c.39-.43.61-.96.61-1.51v-2.54c0-.55-.22-1.08-.61-1.51l-2.42-2.62a2.003 2.003 0 0 0-1.49-.68H6.122c-.57 0-1.1.25-1.49.68L2.212 9.222Z" />
        <path d="M12 12h.01" />
        <path d="M15.5 12h.01" />
        <path d="M8.5 12h.01" />
    </svg>
)

const MastercardLogo = () => (
    <div className="relative h-8 w-12 flex items-center">
        <div className="w-8 h-8 rounded-full bg-red-500 absolute left-0 z-10 opacity-90"></div>
        <div className="w-8 h-8 rounded-full bg-yellow-500 absolute right-0"></div>
    </div>
)


export function BankCardComponent({ card }: BankCardComponentProps) {

    const isCredit = card.cardType === 'credit';

    return (
        <div className={cn(
            "relative aspect-[1.586] rounded-xl shadow-lg text-white flex flex-col justify-between p-6 overflow-hidden",
            isCredit ? "bg-gradient-to-br from-gray-700 via-gray-900 to-black" : "bg-gradient-to-br from-blue-700 via-blue-900 to-black"
        )}>
             <div className="absolute top-0 left-0 w-full h-full bg-black/10 z-0"></div>

             <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-sm font-light opacity-80">{card.bank}</p>
                    <p className="font-semibold text-lg">{card.name}</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
             </div>

            <div className="relative z-10 space-y-4">
                <Cpu className="h-10 w-10 text-yellow-300/80" />
                <div className="flex justify-between items-end">
                    <div>
                        <p className="font-mono tracking-widest text-xl">
                            •••• •••• •••• {card.last4Digits}
                        </p>
                    </div>
                     <div className="flex flex-col items-end">
                        <span className="text-xs font-light opacity-80">{isCredit ? 'Crédito' : 'Débito'}</span>
                         {isCredit ? <MastercardLogo /> : <VisaLogo />}
                    </div>
                </div>
            </div>
        </div>
    )
}
