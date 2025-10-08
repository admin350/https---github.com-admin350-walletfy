
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Pencil, Trash2, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useState } from "react";
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import type { Profile } from "@/types";
import { AddProfileDialog } from "./add-profile-dialog";

export function ProfileManager() {
    const { profiles, deleteProfile } = useData();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [profileToEdit, setProfileToEdit] = useState<Profile | undefined>(undefined);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    const handleAdd = () => {
        setProfileToEdit(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (profile: Profile) => {
        setProfileToEdit(profile);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        setIsDeleteLoading(true);
        try {
            await deleteProfile(id);
            toast({
                title: "Perfil eliminado",
                description: "El perfil ha sido eliminado exitosamente.",
            });
        } catch (err) {
            const error = err as Error;
            toast({
                title: "Error",
                description: error.message || "No se pudo eliminar el perfil. Asegúrate que no esté en uso.",
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
                        <CardTitle>Gestionar Perfiles</CardTitle>
                        <CardDescription>Añade, edita o elimina perfiles para organizar tus finanzas.</CardDescription>
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
                            <TableHead>Color</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profiles.map((profile) => (
                            <TableRow key={profile.id}>
                                <TableCell className="font-medium">{profile.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: profile.color }} />
                                        <span>{profile.color}</span>
                                    </div>
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
                                                <DropdownMenuItem onClick={() => handleEdit(profile)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem disabled={profiles.length <= 1}>
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
                                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el perfil.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(profile.id)} disabled={isDeleteLoading}>
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
             <AddProfileDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                profileToEdit={profileToEdit}
            />
        </Card>
    );
}
