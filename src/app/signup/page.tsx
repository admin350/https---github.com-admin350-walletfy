'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DataProvider, useData } from "@/context/data-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

function SignupPageContent() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useData();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      await signup(values.email, values.password);
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError("Este correo electrónico ya está en uso. Intenta iniciar sesión.");
      } else {
        setError("Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.");
      }
      console.error("Signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-t from-gray-950 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md bg-card/20 backdrop-blur-lg border-white/10 rounded-2xl shadow-2xl transition-shadow duration-300 hover:shadow-primary/20 hover:shadow-2xl">
          <CardHeader className="text-center">
              <motion.div 
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: 0.5 }}
                    className="flex justify-center items-center gap-2 mb-2"
                >
                   <Wallet className="h-8 w-8 text-primary" />
                   <h1 className="text-3xl font-bold font-headline">WALLETFY</h1>
              </motion.div>
            <CardTitle>Crear una Cuenta</CardTitle>
            <CardDescription>Empieza a tomar el control de tus finanzas hoy mismo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Cuenta
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="underline text-primary">
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


export default function SignupPage() {
    return (
        <DataProvider>
            <SignupPageContent />
        </DataProvider>
    )
}
