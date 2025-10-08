
'use client';

import { Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export function AnimatedWalletIcon() {
  return (
    <div className="relative w-20 h-20 mx-auto mb-4">
      <motion.div
        className="absolute inset-0 bg-accent rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0, 0.3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10 w-full h-full flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-full border-2 border-accent/50">
        <Wallet className="w-10 h-10 text-accent" />
      </div>
    </div>
  );
}
