import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// Componente per gli utenti guest
function GuestDashboard() {
  return (
    <div className="container mx-auto py-10">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-primary">Benvenuto nel Sistema</h1>
        <div className="border-l-4 border-amber-500 bg-amber-50 p-4 mb-6">
          <h2 className="font-semibold text-amber-800 mb-2">Account in attesa di approvazione</h2>
          <p className="text-amber-700">
            Il tuo account è stato registrato con successo ma è in attesa di approvazione da parte di un amministratore.
            Riceverai una notifica via email quando il tuo account sarà stato approvato.
          </p>
        </div>
        <div className="space-y-4 text-gray-700">
          <p>
            Una volta approvato, potrai accedere a tutte le funzionalità del sistema in base al ruolo che ti verrà assegnato.
          </p>
          <p>
            Per qualsiasi informazione o assistenza, contatta l'amministratore del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  path,
  component: Component,
  requiresFullAccess = true,
}: {
  path: string;
  component: () => React.ReactNode;
  requiresFullAccess?: boolean;
}) {
  const { user, isLoading, isGuest, canView } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Guest users can only see the guest dashboard
  if (isGuest() && requiresFullAccess) {
    return (
      <Route path={path}>
        <GuestDashboard />
      </Route>
    );
  }

  // If the route requires view or edit permissions and the user doesn't have them
  if (requiresFullAccess && !canView()) {
    return (
      <Route path={path}>
        <div className="container mx-auto py-10 text-center">
          <h1 className="text-2xl font-bold text-red-600">Accesso non autorizzato</h1>
          <p className="mt-4 text-gray-700">
            Non hai i permessi necessari per accedere a questa risorsa.
          </p>
        </div>
      </Route>
    );
  }

  // User has the necessary permissions
  return <Route path={path} component={Component} />;
}
