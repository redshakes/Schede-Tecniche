import React, { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X, Home, FileText, UserCog, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type SidebarProps = {
  activeType: string;
  setActiveType: (type: string) => void;
  isReadOnly?: boolean;
};

export default function Sidebar({ activeType, setActiveType, isReadOnly = false }: SidebarProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation, canAdministrate } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";
    
  // Chiudi la sidebar quando si clicca su un elemento di navigazione (solo su mobile)
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  // Componente del contenuto della sidebar
  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <span>LFA Schede Tecniche</span>
        </h1>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 bg-primary text-white">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Navigazione
        </h2>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleNavigate("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleNavigate("/products")}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Schede Tecniche</span>
          </Button>
        </div>

        {canAdministrate() && (
          <>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">
              Amministrazione
            </h2>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigate("/admin/users")}
              >
                <UserCog className="mr-2 h-4 w-4" />
                <span>Gestione Utenti</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigate("/admin/groups")}
              >
                <UsersRound className="mr-2 h-4 w-4" />
                <span>Gestione Gruppi</span>
              </Button>
            </div>
          </>
        )}
      </nav>
    </>
  );

  // Se mobile, mostra la sidebar in un componente Sheet (drawer)
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 z-30 p-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72" hideCloseButton={true}>
              <div className="flex flex-col h-full">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  }

  // Altrimenti, mostra la sidebar standard
  return (
    <aside className="w-64 bg-background shadow-md z-10 flex flex-col h-screen border-r border-border">
      <SidebarContent />
    </aside>
  );
}