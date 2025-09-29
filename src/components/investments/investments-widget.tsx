

'use client';
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useData } from "@/context/data-context";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MoreVertical, Pencil, Trash2, TrendingUp, HandCoins } from "lucide-react";
import { ContributeToInvestmentDialog } from "./contribute-to-investment-dialog";
import type { Investment } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { AddInvestmentDialog } from "./add-investment-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { CloseInvestmentDialog } from "./close-investment-dialog";


interface InvestmentsWidgetProps {
  investments?: Investment[];
  isLoading?: boolean;
  purpose: 'investment' | 'saving';
}

export function InvestmentsWidget({ investments: investmentsFromProps, isLoading: isLoadingFromProps, purpose }: InvestmentsWidgetProps) {
  const { deleteInvestment, formatCurrency, investments: contextInvestments, isLoading: contextIsLoading } = useData();

  const investments = (investmentsFromProps !== undefined ? investmentsFromProps : contextInvestments).filter(inv => inv.purpose === purpose);
  const isLoading = isLoadingFromProps !== undefined ? isLoadingFromProps : contextIsLoading;

  const [isClient, setIsClient] = useState(false);
  const [selectedForContribution, setSelectedForContribution] = useState<Investment | null>(null);
  const [selectedForEdit, setSelectedForEdit] = useState<Investment | null>(null);
  const [selectedToClose, setSelectedToClose] = useState<Investment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleContributeClick = (investment: Investment) => {
    setSelectedForContribution(investment);
  }

  const handleEditClick = (investment: Investment) => {
    setSelectedForEdit(investment);
  };

  const handleCloseClick = (investment: Investment) => {
      setSelectedToClose(investment);
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteInvestment(id);
      toast({
        title: "Activo eliminado",
        description: "Tu activo ha sido eliminado exitosamente."
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "No se pudo eliminar el activo.",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="space-y-6">
      {isLoading || !isClient ? (
        Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
              <div className="flex justify-between mb-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-1/4" />
          </div>
        ))
      ) : !investments || investments.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No hay {purpose === 'investment' ? 'inversiones' : 'instrumentos de ahorro'} registrados.</p>
      ) : (
        investments.map((investment) => {
          const profit = investment.currentValue - investment.initialAmount;
          const profitPercentage = investment.initialAmount > 0 ? (profit / investment.initialAmount) * 100 : 0;
          return (
            <div key={investment.id}>
              <div className="flex justify-between mb-1 items-start">
                <div>
                    <p className="text-base font-medium">{investment.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {`Valor Actual: ${formatCurrency(investment.currentValue)}`}
                    </p>
                </div>
                 <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => handleCloseClick(investment)}>
                                <HandCoins className="mr-2 h-4 w-4" />
                                Liquidar {purpose === 'investment' ? 'Inversión' : 'Ahorro'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditClick(investment)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el activo y sus contribuciones asociadas.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(investment.id)}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-full">
                             <div className={`flex justify-between text-sm ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                <span className="font-medium">Ganancia / Pérdida</span>
                                <span>{formatCurrency(profit)} ({profitPercentage.toFixed(2)}%)</span>
                             </div>
                             <Progress value={profitPercentage > 0 ? (profitPercentage > 100 ? 100 : profitPercentage) : 0} className={`h-2 [&>div]:${profit >= 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Aporte Inicial: {formatCurrency(investment.initialAmount)}</p>
                    </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant='secondary'>{investment.investmentType}</Badge>
                    <Badge variant='outline'>{investment.platform}</Badge>
                </div>
                 <Button size="sm" variant="outline" onClick={() => handleContributeClick(investment)}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Aportar
                </Button>
              </div>
            </div>
          );
        })
      )}
      {selectedForContribution && (
          <ContributeToInvestmentDialog
            investment={selectedForContribution}
            open={!!selectedForContribution}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setSelectedForContribution(null);
              }
            }}
            purpose={purpose}
          />
        )}
      {selectedForEdit && (
        <AddInvestmentDialog 
            open={!!selectedForEdit}
            onOpenChange={(isOpen) => {
                if(!isOpen) {
                    setSelectedForEdit(null)
                }
            }}
            investmentToEdit={selectedForEdit}
            purpose={purpose}
        />
      )}
      {selectedToClose && (
            <CloseInvestmentDialog
                investment={selectedToClose}
                open={!!selectedToClose}
                onOpenChange={(isOpen) => {
                    if(!isOpen) {
                        setSelectedToClose(null);
                    }
                }}
            />
        )}
    </div>
  );
}
