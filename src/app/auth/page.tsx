'use client';
import { UserAuthForm } from "@/components/auth/user-auth-form";
import { motion } from "framer-motion";
import { PieChart, Wallet, BarChart, TrendingUp } from "lucide-react";
import React from "react";

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
        scale: 1,
        opacity: 0.7,
        transition: {
            delay: i * 0.2 + 0.8,
            type: "spring",
            stiffness: 260,
            damping: 20,
        },
    }),
};

export default function AuthenticationPage() {
    return (
        <div 
            className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-white"
        >
            <div className="absolute inset-0 -z-10 h-full w-full">
                <div className="relative h-full w-full bg-zinc-900">
                   <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                   <div className="absolute -z-10 h-full w-full bg-gradient-to-t from-zinc-950 to-zinc-900"></div>
                </div>
            </div>

            <motion.div
                className="relative z-10 w-full max-w-md"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div 
                    className="flex flex-col items-center justify-center p-4 sm:p-0"
                >
                    <motion.div
                        className="flex flex-col items-center justify-center space-y-4 text-center mb-10"
                        variants={itemVariants}
                    >
                        <div className="relative flex items-center justify-center w-24 h-24">
                            <motion.div custom={1} variants={iconVariants} className="absolute top-0 left-12"><BarChart className="h-6 w-6 text-blue-400"/></motion.div>
                            <motion.div custom={2} variants={iconVariants} className="absolute bottom-4 left-2"><TrendingUp className="h-6 w-6 text-green-400"/></motion.div>
                            <motion.div custom={3} variants={iconVariants} className="absolute top-4 right-2"><PieChart className="h-6 w-6 text-rose-400"/></motion.div>
                            
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.5, type: 'spring' }}}>
                                <Wallet className="h-12 w-12 text-primary" />
                            </motion.div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            FA WALLET
                        </h1>
                        <p className="max-w-xs text-sm text-muted-foreground">
                            Toma el control de tus finanzas con una claridad y poder sin
                            precedentes.
                        </p>
                    </motion.div>

                    <motion.div 
                        className="w-full" 
                        variants={itemVariants}
                    >
                        <div className="w-full p-6 space-y-6 rounded-2xl border border-border/20 bg-card/60 backdrop-blur-lg">
                            <UserAuthForm />
                        </div>
                    </motion.div>

                    <motion.p
                        className="mt-8 px-8 text-center text-xs text-muted-foreground"
                        variants={itemVariants}
                    >
                        Al continuar, aceptas nuestros{" "}
                        <a
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Términos de Servicio
                        </a>{" "}
                        y{" "}
                        <a
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Política de Privacidad
                        </a>
                        .
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
}
