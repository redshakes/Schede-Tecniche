import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "../lib/queryClient";
import { CheckCircle, XCircle, UserCog, User as UserIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminUsersPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, canAdministrate } = useAuth();
  
  // Redirect if not an admin
  if (user && !canAdministrate()) {
    setLocation("/");
    return null;
  }
  
  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        throw new Error("Errore durante il recupero degli utenti");
      }
      return res.json();
    },
    enabled: !!user && canAdministrate()
  });
  
  // Mutation to approve user
  const approveUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("POST", `/api/admin/users/${userId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Utente approvato",
        description: "L'utente è stato approvato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'approvazione dell'utente",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to change user role
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Ruolo aggiornato",
        description: "Il ruolo dell'utente è stato aggiornato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del ruolo",
        variant: "destructive",
      });
    },
  });
  
  // Handle approve user
  const handleApprove = (userId: number) => {
    approveUserMutation.mutate(userId);
  };
  
  // Handle change role
  const handleChangeRole = (userId: number, newRole: string) => {
    changeRoleMutation.mutate({ userId, role: newRole });
  };
  
  // Define table columns
  type RowType = {
    row: {
      original: User;
    };
  };
  
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Ruolo",
      cell: ({ row }: RowType) => {
        const user = row.original;
        return (
          <div className="flex gap-2">
            <Badge variant={user.role === "amministratore" ? "destructive" : user.role === "compilatore" ? "default" : "secondary"}>
              {user.role === "amministratore" ? "Amministratore" : user.role === "compilatore" ? "Compilatore" : "Visualizzatore"}
            </Badge>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={user.role === "amministratore"}
                onClick={() => handleChangeRole(user.id, "amministratore")}
                title="Imposta come Amministratore"
              >
                <UserCog className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={user.role === "compilatore"}
                onClick={() => handleChangeRole(user.id, "compilatore")}
                title="Imposta come Compilatore"
              >
                <UserIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "approved",
      header: "Stato",
      cell: ({ row }: RowType) => {
        const user = row.original;
        return (
          <div className="flex items-center">
            {user.approved ? (
              <Badge variant="default" className="bg-green-500 text-white">
                <CheckCircle className="h-4 w-4 mr-1" /> Approvato
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="destructive">
                  <XCircle className="h-4 w-4 mr-1" /> In attesa
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleApprove(user.id)}
                >
                  Approva
                </Button>
              </div>
            )}
          </div>
        );
      }
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gestione Utenti</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {users && users.length > 0 ? (
          <DataTable columns={columns} data={users} searchColumn="name" />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nessun utente trovato</p>
          </div>
        )}
      </div>
    </div>
  );
}