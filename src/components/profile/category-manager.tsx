
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MoreHorizontal, Trash2, Pencil, PlusCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/data-context";
import { AddCategoryDialog } from "./add-category-dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import type { Category } from "@/types";

export function CategoryManager() {
    const { categories, deleteCategory } = useData();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>(undefined);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    const handleAdd = () => {
        setCategoryToEdit(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (category: Category) => {
        setCategoryToEdit(category);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        setIsDeleteLoading(true);
        try {
            await deleteCategory(id);
            toast({
                title: "Categoría eliminada",
                description: "La categoría ha sido eliminada exitosamente.",
            });
        } catch (err) {
            const error = err as Error;
            toast({
                title: "Error",
                description: error.message || "No se pudo eliminar la categoría.",
                variant: "destructive"
            });
        } finally {
            setIsDeleteLoading(false);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Gestionar Categorías</CardTitle>
                        <CardDescription>Añade, edita o elimina categorías para tus transacciones.</CardDescription>
                    </div>
                     <Button size="icon" variant="outline" onClick={handleAdd}>
                        <PlusCircle className="h-6 w-6" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                                        <span>{category.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={category.type === "Gasto" ? "destructive" : "default"} className={category.type === 'Ingreso' ? 'bg-green-500/20 text-green-500 border-green-500/20' : category.type === 'Gasto' ? 'bg-red-500/20 text-red-500 border-red-500/20' : 'bg-blue-500/20 text-blue-500 border-blue-500/20'}>
                                        {category.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                     <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(category)}>
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
                                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la categoría.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(category.id)} disabled={isDeleteLoading}>
                                                     {isDeleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                     Continuar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <AddCategoryDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                categoryToEdit={categoryToEdit}
            />
        </Card>
    );
}
