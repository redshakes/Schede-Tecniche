import React, { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

type MainLayoutProps = {
  children: ReactNode;
  title: string;
};

export default function MainLayout({ children, title }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  // Se non c'è un utente autenticato, non mostra la sidebar
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="w-full p-4 sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b">
          <div className="container flex justify-between items-center">
            <h1 className="text-xl font-bold">{title}</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="container mx-auto px-4">
          {children}
        </main>
      </div>
    );
  }

  // Se è mobile, mostra l'hamburger menu in un drawer
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="w-full p-4 sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b">
          <div className="container flex justify-between items-center">
            <div className="flex items-center">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72" hideCloseButton={true}>
                  <Sidebar 
                    activeType="" 
                    setActiveType={() => {}} 
                  />
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-bold">{title}</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="container mx-auto px-4">
          {children}
        </main>
      </div>
    );
  }

  // Altrimenti, mostra la sidebar standard
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        activeType="" 
        setActiveType={() => {}} 
      />
      <div className="flex-1 overflow-y-auto">
        <header className="w-full p-4 sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b">
          <div className="container flex justify-between items-center">
            <h1 className="text-xl font-bold">{title}</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="container mx-auto px-4">
          {children}
        </main>
      </div>
    </div>
  );
}