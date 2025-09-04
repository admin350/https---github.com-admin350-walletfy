
'use client';
import { UserAuthForm } from "@/components/auth/user-auth-form";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  const mouseX = useMotionValue(250);
  const mouseY = useMotionValue(150);

  const cardRef = React.useRef<HTMLDivElement>(null);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
      if (!cardRef.current) return;
      const { left, top } = cardRef.current.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
  }
  
  const backgroundGradient = useTransform(
    mouseX,
    [0, 500],
    [
      "radial-gradient(400px circle at 50% 50%, hsl(var(--primary) / 0.1), transparent 80%)",
      "radial-gradient(400px circle at 100% 100%, hsl(var(--primary) / 0.1), transparent 80%)",
    ]
  );
  
  const dynamicMouseX = useSpring(mouseX, { stiffness: 400, damping: 90 });
  const dynamicMouseY = useSpring(mouseY, { stiffness: 400, damping: 90 });

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-t from-black via-zinc-900 to-zinc-800 text-white">
      {/* Background Glows */}
      <div className="absolute -top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute -bottom-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] animate-pulse animation-delay-4000"></div>

      <motion.div
        className="relative z-10 w-full max-w-md group"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
            mouseX.set(250);
            mouseY.set(150);
        }}
       
      >
        <motion.div 
            className="flex flex-col items-center justify-center p-4 sm:p-0 transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        >
            <motion.div
            className="flex flex-col items-center justify-center space-y-4 text-center mb-10"
            variants={itemVariants}
            >
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full border border-primary/20 bg-card/60 backdrop-blur-md">
                <motion.div custom={1} variants={iconVariants} className="absolute top-0 left-12"><BarChart className="h-5 w-5 text-blue-400"/></motion.div>
                <motion.div custom={2} variants={iconVariants} className="absolute bottom-4 left-2"><TrendingUp className="h-5 w-5 text-green-400"/></motion.div>
                <motion.div custom={3} variants={iconVariants} className="absolute top-4 right-2"><PieChart className="h-5 w-5 text-rose-400"/></motion.div>
                
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.5, type: 'spring' }}}>
                    <Wallet className="h-10 w-10 text-primary" />
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
                className="w-full relative" 
                variants={itemVariants}
            >
                 <motion.div
                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: useTransform(
                            [dynamicMouseX, dynamicMouseY],
                            ([latestX, latestY]) => `radial-gradient(350px circle at ${latestX}px ${latestY}px, hsla(var(--primary), 0.15), transparent 80%)`
                        ),
                    }}
                />
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
        </motion.div>
      </motion.div>
    </div>
  );
}
