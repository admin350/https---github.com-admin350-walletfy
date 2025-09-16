'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Asegúrate de que la ruta sea correcta

// Define el tipo para el valor del contexto
interface DataContextType {
user: User | null;
uid: string | null;
isLoading: boolean;
// Añade aquí cualquier otro estado o función que quieras compartir
}

// Crea el contexto con un valor por defecto
const DataContext = createContext<DataContextType | undefined>(undefined);

// Define el componente DataProvider
export const DataProvider = ({ children }: { children: ReactNode }) => {
const [user, setUser] = useState<User | null>(null);
const [uid, setUid] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
setUser(currentUser);

  setUid(currentUser ? currentUser.uid : null);
  setIsLoading(false);
});
// Limpia el listener cuando el componente se desmonta
return () => unsubscribe();


}, []);
const value = {
user,
uid,
isLoading,
// Añade aquí otros valores que quieras proveer
};

// ¡ESTA ES LA LÍNEA QUE FALTA!
return (
<DataContext.Provider value={value}>
{!isLoading && children}
</DataContext.Provider>
);
};

// Hook personalizado para usar el contexto fácilmente
export const useData = () => {
const context = useContext(DataContext);
if (context === undefined) {
throw new Error('useData must be used within a DataProvider');
}
return context;
};