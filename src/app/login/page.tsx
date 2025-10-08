
'use client';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DataProvider, useData } from "@/context/data-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AnimatedWalletIcon } from "@/components/icons/animated-wallet-icon";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

const resetSchema = z.object({
    email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
});


function LoginPageContent() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, sendPasswordReset } = useData();
  const router = useRouter();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
      resolver: zodResolver(resetSchema),
      defaultValues: {
          email: "",
      }
  });

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      await login(values.email, values.password);
      router.push('/dashboard');
    } catch (err) {
      const error = err as { code?: string };
      setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onResetSubmit(values: z.infer<typeof resetSchema>) {
      setIsLoading(true);
      setError(null);
      try {
          await sendPasswordReset(values.email);
          setResetSent(true);
      } catch (err) {
           const error = err as { code?: string };
           setError("No se pudo enviar el correo. Verifica que el email sea correcto y esté registrado.");
           console.error("Password reset failed:", error);
      } finally {
          setIsLoading(false);
      }
  }
  
  const cardContent = () => {
    if (isResetting) {
        if (resetSent) {
            return (
                <div className="text-center space-y-6">
                    <AnimatedWalletIcon />
                    <div>
                        <h2 className="text-2xl font-bold text-white">Correo Enviado</h2>
                        <p className="text-gray-400 text-sm">Revisa tu bandeja de entrada para restablecer tu contraseña.</p>
                    </div>
                    <Button onClick={() => { setIsResetting(false); setResetSent(false); setError(null); }} className="w-full bg-white/10 border border-white/20 hover:bg-white/20 text-white">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Iniciar Sesión
                    </Button>
                </div>
            )
        }
        return (
             <div className="space-y-6">
                <div className="text-center">
                    <AnimatedWalletIcon />
                    <h2 className="text-2xl font-bold text-white">Recuperar Contraseña</h2>
                    <p className="text-gray-400 text-sm">Ingresa tu correo para recibir un enlace de recuperación.</p>
                </div>
                <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                        <div className="relative">
                            <FormField
                                control={resetForm.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="absolute left-3 -top-2.5 text-xs text-gray-400 bg-[#1C1C1E] px-1">Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input 
                                          type="email" 
                                          placeholder="tu@correo.com" 
                                          {...field} 
                                          className="bg-transparent border-gray-700 h-12 focus:border-accent"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs pt-1" />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-accent hover:bg-accent/80" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 text-black" />}
                            </Button>
                        </div>
                    </form>
                </Form>
                 {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
                <div className="text-center">
                    <Button variant="link" onClick={() => setIsResetting(false)} className="text-sm text-accent hover:underline p-0 h-auto">
                        Volver a iniciar sesión
                    </Button>
                </div>
             </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <AnimatedWalletIcon />
                <h2 className="text-2xl font-bold text-white">Bienvenido de nuevo</h2>
                <p className="text-gray-400 text-sm">Inicia sesión en tu cuenta</p>
            </div>
             <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                     <div className="relative">
                        <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="absolute left-3 -top-2.5 text-xs text-gray-400 bg-[#1C1C1E] px-1">Correo Electrónico</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="email" 
                                        placeholder="tu@correo.com" 
                                        {...field}
                                        className="bg-transparent border-gray-700 h-12 focus:border-accent"
                                    />
                                </FormControl>
                                <FormMessage className="text-xs pt-1"/>
                            </FormItem>
                            )}
                        />
                    </div>
                     <div className="relative">
                        <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                 <FormLabel className="absolute left-3 -top-2.5 text-xs text-gray-400 bg-[#1C1C1E] px-1">Contraseña</FormLabel>
                                <FormControl>
                                <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...field} 
                                    className="bg-transparent border-gray-700 h-12 focus:border-accent"
                                />
                                </FormControl>
                                <FormMessage className="text-xs pt-1"/>
                            </FormItem>
                            )}
                        />
                         <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-accent hover:bg-accent/80" disabled={isLoading}>
                             {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 text-black" />}
                        </Button>
                    </div>

                    <div className="text-right">
                         <Button variant="link" onClick={() => setIsResetting(true)} className="text-sm text-accent hover:underline p-0 h-auto">
                            ¿Olvidaste tu contraseña?
                        </Button>
                    </div>

                    {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}

                </form>
            </Form>
            <div className="mt-6 text-center text-sm text-gray-400">
                ¿No tienes una cuenta?{" "}
                <Link href="/signup" className="font-semibold text-accent hover:underline">
                 Regístrate aquí
                </Link>
            </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="relative w-full max-w-sm">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-accent/30 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/30 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>
        
        <div className="relative bg-[#1C1C1E]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {cardContent()}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
    return (
        <DataProvider>
            <LoginPageContent />
        </DataProvider>
    )
}
