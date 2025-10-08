
'use client';
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useData } from "@/context/data-context";
import { Skeleton } from "../ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { PiggyBank, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ContributeToGoalDialog } from "../goals/contribute-to-goal-dialog";
import type { SavingsGoal } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AddGoalDialog } from "../goals/add-goal-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";

interface SavingsGoalsWidgetProps {
  goals?: SavingsGoal[];
  isLoading?: boolean;
  isDashboardWidget?: boolean;
}


export function SavingsGoalsWidget({ goals: goalsFromProps, isLoading: isLoadingFromProps, isDashboardWidget = false }: SavingsGoalsWidgetProps) {
  const { deleteGoal, goals: goalsFromContext, isLoading: isLoadingFromContext, formatCurrency } = useData();

  const goals = goalsFromProps !== undefined ? goalsFromProps : goalsFromContext;
  const isLoading = isLoadingFromProps !== undefined ? isLoadingFromProps : isLoadingFromContext;


  const [isClient, setIsClient] = useState(false);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<SavingsGoal | null>(null);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState<SavingsGoal | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleContributeClick = (goal: SavingsGoal) => {
    setSelectedGoalForContribution(goal);
  }

  const handleEditClick = (goal: SavingsGoal) => {
    setSelectedGoalForEdit(goal);
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      toast({
        title: "Meta eliminada",
        description: "Tu meta ha sido eliminada exitosamente."
      });
    } catch (err) {
       const error = err as Error;
       toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la meta.",
        variant: "destructive"
      });
    }
  }
  
  const goalsToDisplay = isDashboardWidget ? (goals || []).filter(g => g.currentAmount < g.targetAmount).slice(0, 3) : goals;

  return (
    <div className="space-y-6">
      {isLoading || !isClient ? (
        Array.from({ length: isDashboardWidget ? 3 : 1 }).map((_, i) => (
          <div key={i} className="space-y-2">
              <div className="flex justify-between mb-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-1/4" />
          </div>
        ))
      ) : !goalsToDisplay || goalsToDisplay.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No hay metas en esta categoría.</p>
      ) : (
        goalsToDisplay.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const isCompleted = progress >= 100;
          return (
            <div key={goal.id}>
                <div className="flex justify-between mb-1 items-start">
                <div>
                    <p className="text-base font-medium">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                    {`${formatCurrency(goal.currentAmount)} / ${formatCurrency(goal.targetAmount)}`}
                    </p>
                </div>
                  {!isDashboardWidget && (
                     <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(goal)}>
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
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la meta y sus contribuciones asociadas.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(goal.id)}>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  )}
              </div>
               <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Progress value={progress} className="h-2" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{progress.toFixed(1)}% completado</p>
                    </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant='secondary'>
                        {goal.category}
                    </Badge>
                     {!isDashboardWidget && <span>Fecha Límite: {format(new Date(goal.estimatedDate), "dd 'de' MMMM, yyyy", { locale: es })}</span>}
                </div>
                {!isCompleted && !isDashboardWidget && (
                  <Button size="sm" variant="outline" onClick={() => handleContributeClick(goal)}>
                      <PiggyBank className="mr-2 h-4 w-4" />
                      Aportar
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}
      {selectedGoalForContribution && (
      <ContributeToGoalDialog
        goal={selectedGoalForContribution}
        open={!!selectedGoalForContribution}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedGoalForContribution(null);
          }
        }}
      />
    )}
      {selectedGoalForEdit && (
        <AddGoalDialog 
            open={!!selectedGoalForEdit}
            onOpenChange={(isOpen) => {
                if(!isOpen) {
                    setSelectedGoalForEdit(null)
                }
            }}
            goalToEdit={selectedGoalForEdit}
        />
      )}
    </div>
  );
}
