'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/data-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wallet, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  rememberMe: z.boolean().default(false),
});

const resetSchema = z.object({
    email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
});

export default function LoginPage() {
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
      rememberMe: false,
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
    } catch (error: any) {
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
      } catch (error: any) {
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
                <div className="text-center space-y-4">
                    <CardTitle>Correo Enviado</CardTitle>
                    <CardDescription>
                        Revisa tu bandeja de entrada (y la carpeta de spam) para encontrar el enlace y restablecer tu contraseña.
                    </CardDescription>
                    <Button onClick={() => { setIsResetting(false); setResetSent(false); setError(null); }} className="w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Iniciar Sesión
                    </Button>
                </div>
            )
        }
        return (
            <>
                <Button variant="ghost" size="icon" onClick={() => setIsResetting(false)} className="absolute top-4 left-4 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardHeader className="text-center pt-12">
                    <CardTitle>Restablecer Contraseña</CardTitle>
                    <CardDescription>
                       Ingresa tu correo electrónico y te enviaremos un enlace para recuperarla.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...resetForm}>
                        <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                            <FormField
                                control={resetForm.control}
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
                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enviar Correo de Recuperación
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </>
        )
    }

    return (
        <>
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 mb-2 animate-pulse animation-delay-4000">
                    <Wallet className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold font-headline">FA WALLET</h1>
                </div>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>Bienvenido de vuelta. Accede a tu panel financiero.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                        control={loginForm.control}
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
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="flex items-center justify-between">
                        <FormField
                            control={loginForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-normal">Recordarme</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Button variant="link" onClick={() => setIsResetting(true)} className="text-sm text-primary hover:underline px-0">
                            ¿Olvidaste tu contraseña?
                        </Button>
                    </div>

                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Iniciar Sesión
                    </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    ¿No tienes una cuenta?{" "}
                    <Link href="/signup" className="underline text-primary">
                    Regístrate aquí
                    </Link>
                </div>
            </CardContent>
        </>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-t from-gray-950 to-gray-900 p-4">
      <Card className="w-full max-w-md bg-card/20 backdrop-blur-lg border-white/10 rounded-2xl shadow-2xl transition-shadow duration-300 hover:shadow-primary/20 hover:shadow-2xl">
        {cardContent()}
      </Card>
    </div>
  );
}
