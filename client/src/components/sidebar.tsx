import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserCog } from "lucide-react";

type SidebarProps = {
  activeType: string;
  setActiveType: (type: string) => void;
};

export default function Sidebar({ activeType, setActiveType }: SidebarProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation, canAdministrate } = useAuth();

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

  return (
    <aside className="w-64 bg-white shadow-md z-10 flex flex-col h-screen">
      <div className="p-4 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <span>LFA Schede Tecniche</span>
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <h2 className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Prodotti
        </h2>

        <div className="space-y-1">
          <Button
            variant={activeType === "cosmetic" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveType("cosmetic")}
          >
            <i className="pi pi-palette mr-3"></i>
            <span>Cosmetici</span>
          </Button>

          <Button
            variant={activeType === "supplement" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveType("supplement")}
          >
            <i className="pi pi-heart mr-3"></i>
            <span>Integratori</span>
          </Button>
        </div>

        <h2 className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-6 mb-2">
          Gestione
        </h2>

        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/")}
          >
            <i className="pi pi-home mr-3"></i>
            <span>Dashboard</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/products/new")}
          >
            <i className="pi pi-plus mr-3"></i>
            <span>Nuova Scheda</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/products")}
          >
            <i className="pi pi-list mr-3"></i>
            <span>Elenco Schede</span>
          </Button>

          {canAdministrate() && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/admin/users")}
            >
              <UserCog className="h-4 w-4 mr-3" />
              <span>Gestione Utenti</span>
            </Button>
          )}
        </div>
      </nav>

      <Separator />

      <div className="p-4">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 bg-primary text-white">
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-700">{user?.name}</p>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs font-medium text-neutral-500 hover:text-neutral-700"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
