
'use client';

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { MobileSidebar } from "./header";

interface HoverMenuProps {
    navItems: any[];
}

export function HoverMenu({ navItems }: HoverMenuProps) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    return (
        <div>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="icon"
                        onMouseEnter={() => setIsSheetOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Alternar menú de navegación</span>
                    </Button>
                </SheetTrigger>
                <SheetContent 
                    side="left" 
                    className="flex flex-col p-0 bg-card/80"
                    onMouseLeave={() => setIsSheetOpen(false)}
                >
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle>Navegación Principal</SheetTitle>
                    </SheetHeader>
                    <MobileSidebar navItems={navItems} />
                </SheetContent>
            </Sheet>
        </div>
    );
}
