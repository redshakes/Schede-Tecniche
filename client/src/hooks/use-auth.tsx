import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<{ message?: string } | User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  email: string;
  name: string;
  role?: string; // Aggiungiamo il campo opzionale role
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login effettuato",
        description: `Benvenuto, ${user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore di login",
        description: error.message || "Credenziali non valide",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<{ message?: string } | User, Error, RegisterData>({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: (response) => {
      // La risposta potrebbe essere un messaggio di successo invece di un utente
      if ('message' in response) {
        toast({
          title: "Registrazione completata",
          description: response.message,
        });
      } else {
        // Se non è un messaggio, deve essere un utente
        const user = response as User;
        queryClient.setQueryData(["/api/user"], user);
        toast({
          title: "Registrazione completata",
          description: `Benvenuto, ${user.name}!`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Errore di registrazione",
        description: error.message || "Si è verificato un errore durante la registrazione",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout effettuato",
        description: "Sessione terminata con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore di logout",
        description: error.message || "Si è verificato un errore durante il logout",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Funzioni di controllo permessi
export function hasRole(user: User | null, role: string | string[]): boolean {
  if (!user) return false;
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

export function canEdit(user: User | null): boolean {
  return hasRole(user, ["amministratore", "compilatore"]);
}

export function canView(user: User | null): boolean {
  return hasRole(user, ["amministratore", "compilatore", "visualizzatore"]);
}

export function canAdministrate(user: User | null): boolean {
  return hasRole(user, "amministratore");
}

export function isGuest(user: User | null): boolean {
  return hasRole(user, "guest");
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return {
    ...context,
    // Aggiungiamo le funzioni di verifica permessi
    hasRole: (role: string | string[]) => hasRole(context.user, role),
    canEdit: () => canEdit(context.user),
    canView: () => canView(context.user),
    canAdministrate: () => canAdministrate(context.user),
    isGuest: () => isGuest(context.user),
  };
}
