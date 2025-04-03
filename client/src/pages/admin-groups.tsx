import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Edit, Trash2, UserPlus, FileText, Users } from "lucide-react";
import { hasRole, canAdministrate } from "@/hooks/use-auth";

// Schema di validazione per il gruppo
const groupSchema = z.object({
  name: z.string().min(1, "Il nome del gruppo è obbligatorio"),
  description: z.string().optional(),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export default function AdminGroupsPage() {
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("groups");
  
  // Form per nuovo gruppo
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  // Form per modifica gruppo
  const editForm = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  // Carica i gruppi
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      const res = await fetch("/api/groups", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Errore nel caricamento dei gruppi");
      return res.json();
    },
  });
  
  // Mutation per creare un nuovo gruppo
  const createGroupMutation = useMutation({
    mutationFn: async (data: GroupFormValues) => {
      const res = await apiRequest("POST", "/api/groups", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Gruppo creato",
        description: "Il gruppo è stato creato con successo",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la creazione del gruppo",
        variant: "destructive",
      });
    },
  });
  
  // Mutation per aggiornare un gruppo
  const updateGroupMutation = useMutation({
    mutationFn: async (data: { id: number; group: GroupFormValues }) => {
      const res = await apiRequest("PUT", `/api/groups/${data.id}`, data.group);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Gruppo aggiornato",
        description: "Il gruppo è stato aggiornato con successo",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del gruppo",
        variant: "destructive",
      });
    },
  });
  
  // Mutation per eliminare un gruppo
  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/groups/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      toast({
        title: "Gruppo eliminato",
        description: "Il gruppo è stato eliminato con successo",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'eliminazione del gruppo",
        variant: "destructive",
      });
    },
  });
  
  // Ottieni i prodotti di un gruppo
  const { data: groupProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/groups", selectedGroup?.id, "products"],
    queryFn: async () => {
      if (!selectedGroup) return [];
      const res = await fetch(`/api/groups/${selectedGroup.id}/products`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Errore nel caricamento dei prodotti del gruppo");
      return res.json();
    },
    enabled: !!selectedGroup,
  });
  
  // Ottieni gli utenti di un gruppo
  const { data: groupUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/groups", selectedGroup?.id, "users"],
    queryFn: async () => {
      if (!selectedGroup) return [];
      const res = await fetch(`/api/groups/${selectedGroup.id}/users`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Errore nel caricamento degli utenti del gruppo");
      return res.json();
    },
    enabled: !!selectedGroup && canAdministrate(null),
  });
  
  // Gestione degli eventi del form
  const onSubmit = (data: GroupFormValues) => {
    createGroupMutation.mutate(data);
  };
  
  const onEditSubmit = (data: GroupFormValues) => {
    if (selectedGroup) {
      updateGroupMutation.mutate({ id: selectedGroup.id, group: data });
    }
  };
  
  const handleEdit = (group: any) => {
    setSelectedGroup(group);
    editForm.reset({
      name: group.name,
      description: group.description || "",
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (group: any) => {
    setSelectedGroup(group);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedGroup) {
      deleteGroupMutation.mutate(selectedGroup.id);
    }
  };
  
  const handleViewDetails = (group: any) => {
    setSelectedGroup(group);
    setActiveTab("details");
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Gestione Gruppi</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="groups">Lista Gruppi</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedGroup}>Dettagli Gruppo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form di creazione gruppo */}
            <Card>
              <CardHeader>
                <CardTitle>Nuovo Gruppo</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome Gruppo</label>
                      <Input
                        {...form.register("name")}
                        placeholder="Inserisci nome del gruppo"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Descrizione</label>
                      <Input
                        {...form.register("description")}
                        placeholder="Inserisci descrizione (opzionale)"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={createGroupMutation.isPending}
                      className="w-full"
                    >
                      {createGroupMutation.isPending ? "Creazione in corso..." : "Crea Gruppo"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Tabella dei gruppi */}
            <div className="col-span-1 md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Gruppi</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingGroups ? (
                    <div className="text-center py-4">Caricamento gruppi...</div>
                  ) : groups.length === 0 ? (
                    <div className="text-center py-4">Nessun gruppo trovato</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Descrizione</TableHead>
                          <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groups.map((group: any) => (
                          <TableRow key={group.id}>
                            <TableCell className="font-medium">{group.name}</TableCell>
                            <TableCell>{group.description || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleViewDetails(group)}
                                >
                                  Dettagli
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleEdit(group)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700" 
                                  onClick={() => handleDelete(group)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          {selectedGroup && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Dettagli del Gruppo: {selectedGroup.name}
                </h2>
                <Button variant="outline" onClick={() => setActiveTab("groups")}>
                  Torna alla lista
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Schede Tecniche del Gruppo */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle>Schede Tecniche</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingProducts ? (
                      <div className="text-center py-4">Caricamento schede...</div>
                    ) : groupProducts.length === 0 ? (
                      <div className="text-center py-4">Nessuna scheda tecnica in questo gruppo</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupProducts.map((product: any) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>
                                {product.type === "cosmetic" ? "Cosmetico" : "Integratore"}
                              </TableCell>
                              <TableCell>{product.date || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
                
                {/* Utenti con accesso */}
                {canAdministrate(null) && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <CardTitle>Utenti con Accesso</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingUsers ? (
                        <div className="text-center py-4">Caricamento utenti...</div>
                      ) : groupUsers.length === 0 ? (
                        <div className="text-center py-4">Nessun utente con accesso a questo gruppo</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Ruolo</TableHead>
                              <TableHead>Tipo di Accesso</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {groupUsers.map((user: any) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>
                                  {user.role === "amministratore" 
                                    ? "Amministratore" 
                                    : user.role === "compilatore" 
                                      ? "Compilatore" 
                                      : "Visualizzatore"}
                                </TableCell>
                                <TableCell>
                                  {user.role === "amministratore" || user.role === "compilatore"
                                    ? "Completo"
                                    : "Sola lettura"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dialog di modifica */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Gruppo</DialogTitle>
            <DialogDescription>
              Modifica i dettagli del gruppo selezionato.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Gruppo</label>
                <Input
                  {...editForm.register("name")}
                  placeholder="Inserisci nome del gruppo"
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descrizione</label>
                <Input
                  {...editForm.register("description")}
                  placeholder="Inserisci descrizione (opzionale)"
                />
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Annulla
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateGroupMutation.isPending}
                >
                  {updateGroupMutation.isPending ? "Aggiornamento..." : "Aggiorna"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog di conferma eliminazione */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questo gruppo?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile. Tutte le schede tecniche associate verranno svincolate dal gruppo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteGroupMutation.isPending ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}