import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Group } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "../lib/queryClient";
import { CheckCircle, XCircle, UserCog, User as UserIcon, UsersRound } from "lucide-react";
import { useLocation } from "wouter";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export default function AdminUsersPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, canAdministrate } = useAuth();
  
  // Stati per il dialog dei gruppi
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  
  // Redirect if not an admin
  if (user && !canAdministrate()) {
    setLocation("/");
    return null;
  }
  
  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
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
  
  // Fetch groups
  const { data: groups, isLoading: groupsLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      const res = await fetch("/api/groups");
      if (!res.ok) {
        throw new Error("Errore durante il recupero dei gruppi");
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
  
  // Mutation to approve user with groups
  const approveWithGroupsMutation = useMutation({
    mutationFn: async ({userId, allowedGroups}: {userId: number, allowedGroups: string[]}) => {
      await apiRequest("POST", `/api/admin/users/${userId}/approve`, { allowedGroups });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsGroupDialogOpen(false);
      setSelectedUserId(null);
      setSelectedGroups([]);
      toast({
        title: "Utente approvato",
        description: "L'utente è stato approvato con successo e i gruppi sono stati assegnati",
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
  
  // Mutation to update user's allowed groups
  const updateUserGroupsMutation = useMutation({
    mutationFn: async ({userId, allowedGroups}: {userId: number, allowedGroups: string[]}) => {
      await apiRequest("POST", `/api/admin/users/${userId}/update-groups`, { allowedGroups });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsGroupDialogOpen(false);
      setSelectedUserId(null);
      setSelectedGroups([]);
      toast({
        title: "Gruppi aggiornati",
        description: "I gruppi dell'utente sono stati aggiornati con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento dei gruppi",
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
  
  // Open group dialog for a user
  const openGroupDialog = (userId: number, userRole: string, existingGroups?: string[]) => {
    setSelectedUserId(userId);
    setSelectedGroups(existingGroups || []);
    setIsGroupDialogOpen(true);
  };
  
  // Handle group selection
  const handleGroupChange = (groupId: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };
  
  // Handle approve with groups
  const handleApproveWithGroups = () => {
    if (selectedUserId) {
      approveWithGroupsMutation.mutate({
        userId: selectedUserId,
        allowedGroups: selectedGroups
      });
    }
  };
  
  // Handle update groups
  const handleUpdateGroups = () => {
    if (selectedUserId) {
      updateUserGroupsMutation.mutate({
        userId: selectedUserId,
        allowedGroups: selectedGroups
      });
    }
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
                {user.role === "visualizzatore" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openGroupDialog(user.id, user.role)}
                  >
                    <UsersRound className="h-4 w-4 mr-1" />
                    Approva con Gruppi
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "allowedGroups",
      header: "Gruppi Assegnati",
      cell: ({ row }: RowType) => {
        const user = row.original;
        const userGroups = user.allowedGroups || [];
        
        // Mostra solo per i visualizzatori
        if (user.role !== "visualizzatore") {
          return <span className="text-gray-400 text-sm">Non applicabile</span>;
        }
        
        return (
          <div className="flex items-center gap-2">
            {userGroups.length > 0 ? (
              <div className="flex flex-wrap gap-1 max-w-xs">
                {userGroups.map(groupId => {
                  const group = groups?.find(g => g.id.toString() === groupId);
                  return group ? (
                    <Badge key={groupId} variant="outline" className="text-xs">
                      {group.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Nessun gruppo</span>
            )}
            
            {user.approved && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openGroupDialog(user.id, user.role, userGroups)}
                title="Modifica gruppi"
              >
                <UsersRound className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      }
    },
  ];

  const isLoading = usersLoading || groupsLoading;
  
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
      
      {/* Dialog per la selezione dei gruppi */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {users?.find(u => u.id === selectedUserId)?.approved 
                ? "Aggiorna gruppi del visualizzatore" 
                : "Assegna gruppi al visualizzatore"}
            </DialogTitle>
            <DialogDescription>
              Seleziona i gruppi di schede a cui l'utente avrà accesso.
              Solo i visualizzatori necessitano dell'assegnazione di gruppi specifici.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-medium mb-2">Gruppi disponibili:</h3>
            {groups && groups.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded">
                    <Checkbox 
                      id={`group-${group.id}`} 
                      checked={selectedGroups.includes(group.id.toString())}
                      onCheckedChange={() => handleGroupChange(group.id.toString())}
                    />
                    <label 
                      htmlFor={`group-${group.id}`}
                      className="cursor-pointer flex-1 font-medium text-sm"
                    >
                      {group.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Nessun gruppo disponibile. Crea prima dei gruppi.</p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>Annulla</Button>
            
            {users?.find(u => u.id === selectedUserId)?.approved ? (
              // Pulsante per aggiornare i gruppi di un utente approvato
              <Button 
                disabled={updateUserGroupsMutation.isPending} 
                onClick={handleUpdateGroups}
              >
                {updateUserGroupsMutation.isPending ? "Aggiornamento..." : "Aggiorna gruppi"}
              </Button>
            ) : (
              // Pulsante per approvare un nuovo utente con gruppi
              <Button 
                disabled={selectedGroups.length === 0 || approveWithGroupsMutation.isPending} 
                onClick={handleApproveWithGroups}
              >
                {approveWithGroupsMutation.isPending ? "Approvazione..." : "Approva con gruppi selezionati"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}