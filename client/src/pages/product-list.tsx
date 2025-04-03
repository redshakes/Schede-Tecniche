import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Download, Edit, Eye, MoreVertical, Search, Trash2 } from "lucide-react";
import { TEMPLATE_COLORS } from "../../server/pdf";

export default function ProductList() {
  const [activeType, setActiveType] = useState<string>("cosmetic");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Get products with optional type filter
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/products", typeFilter],
    queryFn: async ({ queryKey }) => {
      const url = typeFilter 
        ? `/api/products?type=${typeFilter}` 
        : "/api/products";
      const res = await fetch(url, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Errore nel caricamento dei prodotti");
      return res.json();
    }
  });

  // Filter products by search query
  const filteredProducts = products.filter((product: any) => {
    if (!searchQuery) return true;
    return (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await apiRequest("DELETE", `/api/products/${productToDelete}`);
        toast({
          title: "Prodotto eliminato",
          description: "Il prodotto è stato eliminato con successo",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione",
          variant: "destructive",
        });
      } finally {
        setProductToDelete(null);
      }
    }
  };

  const downloadPdf = async (id: number) => {
    try {
      const res = await apiRequest("POST", "/api/generate-pdf", { id });
      
      // Create a blob from the response
      const blob = await res.blob();
      
      // Create a temporary link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scheda-tecnica-${id}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF generato",
        description: "Il PDF è stato generato e scaricato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la generazione del PDF",
        variant: "destructive",
      });
    }
  };

  const downloadMarkdown = async (id: number) => {
    try {
      const res = await apiRequest("POST", "/api/export-md", { id });
      
      // Create a blob from the response
      const blob = await res.blob();
      
      // Create a temporary link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scheda-tecnica-${id}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Markdown generato",
        description: "Il file Markdown è stato generato e scaricato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la generazione del Markdown",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar activeType={activeType} setActiveType={setActiveType} />
      
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow">
          <div className="mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-neutral-800">Elenco Schede Tecniche</h1>
            
            <Button onClick={() => navigate("/products/new")}>
              <i className="pi pi-plus mr-2"></i>
              Nuova Scheda
            </Button>
          </div>
        </header>
        
        <div className="container mx-auto py-6 px-4 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca prodotto..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Tutti i tipi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti i tipi</SelectItem>
                    <SelectItem value="cosmetic">Cosmetici</SelectItem>
                    <SelectItem value="supplement">Integratori</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Caricamento...</span>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  {searchQuery 
                    ? "Nessun prodotto corrisponde alla ricerca" 
                    : "Nessun prodotto disponibile"}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Nome Prodotto
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Codice
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Data Creazione
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Azioni
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {filteredProducts.map((product: any) => (
                          <tr key={product.id} className="hover:bg-neutral-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                product.type === 'cosmetic' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                              }`}>
                                {product.type === 'cosmetic' ? 'Cosmetico' : 'Integratore'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                              {product.code || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                              {new Date(product.createdAt).toLocaleDateString('it-IT')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => navigate(`/products/${product.id}`)}
                                  title="Modifica"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => downloadPdf(product.id)}
                                  title="Scarica PDF"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => navigate(`/products/${product.id}`)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      <span>Visualizza</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => downloadMarkdown(product.id)}>
                                      <Download className="mr-2 h-4 w-4" />
                                      <span>Esporta MD</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600" 
                                      onClick={() => setProductToDelete(product.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Elimina</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-neutral-700">
                      Mostrando <span>1</span> a <span>{filteredProducts.length}</span> di <span>{filteredProducts.length}</span> risultati
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={productToDelete !== null} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo prodotto? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
