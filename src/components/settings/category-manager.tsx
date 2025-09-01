'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const mockCategories = [
    { name: "Alimentación", type: "Gasto" },
    { name: "Transporte", type: "Gasto" },
    { name: "Vivienda", type: "Gasto" },
    { name: "Entretenimiento", type: "Gasto" },
    { name: "Suscripciones", type: "Gasto" },
    { name: "Servicios", type: "Gasto" },
    { name: "Compras", type: "Gasto" },
    { name: "Inversiones", type: "Gasto" },
    { name: "Fondo de Emergencia", type: "Gasto" },
    { name: "Otros", type: "Gasto" },
    { name: "Pago de Deuda", type: "Gasto" },
    { name: "Ahorro para Meta", type: "Gasto" },
    { name: "Sueldo", type: "Ingreso" },
    { name: "Negocio", type: "Ingreso" },
    { name: "Otros Ingresos", type: "Ingreso" },
];

export function CategoryManager() {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Gestionar Categorías</CardTitle>
                        <CardDescription>Añade, edita o elimina categorías para tus transacciones.</CardDescription>
                    </div>
                    <Button>Añadir Nueva</Button>
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
                        {mockCategories.map((category) => (
                            <TableRow key={category.name}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>
                                    <Badge variant={category.type === "Gasto" ? "destructive" : "default"} className={category.type === 'Ingreso' ? 'bg-green-500/20 text-green-500 border-green-500/20' : 'bg-red-500/20 text-red-500 border-red-500/20'}>
                                        {category.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Editar</DropdownMenuItem>
                                            <DropdownMenuItem>Eliminar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
