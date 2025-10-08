
'use client';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DataProvider, useData } from "@/context/data-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AnimatedWalletIcon } from "@/components/icons/animated-wallet-icon";

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
    } catch (err) {
      const error = err as { code?: string };
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
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="relative w-full max-w-sm">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/30 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/30 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-6000"></div>

        <div className="relative bg-[#1C1C1E]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
              <div className="text-center">
                <AnimatedWalletIcon />
                <h2 className="text-2xl font-bold text-white">Crear cuenta</h2>
                <p className="text-gray-400 text-sm">Empieza a gestionar tus finanzas hoy.</p>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="relative">
                    <FormField
                      control={form.control}
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
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel className="absolute left-3 -top-2.5 text-xs text-gray-400 bg-[#1C1C1E] px-1">Contraseña</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Mínimo 6 caracteres" 
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
                  
                  {error && <p className="text-sm font-medium text-destructive text-center pt-2">{error}</p>}
                  
                </form>
              </Form>
              <div className="mt-6 text-center text-sm text-gray-400">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="font-semibold text-accent hover:underline">
                  Inicia sesión aquí
                </Link>
              </div>
          </div>
        </div>
      </div>
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
