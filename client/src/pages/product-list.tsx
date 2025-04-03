import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import QuickPreviewModal from "@/components/quick-preview-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Download, Edit, Eye, FileSearch, MoreVertical, Search, Trash2 } from "lucide-react";
import { TEMPLATE_COLORS } from "@/lib/constants";
import MainLayout from "@/components/main-layout";

export default function ProductList() {
  const [activeType, setActiveType] = useState<string>("cosmetic");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [previewProductId, setPreviewProductId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<{ product: any; details: any } | null>(null);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { canEdit, canAdministrate } = useAuth();

  // Get products with optional type filter
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/products", typeFilter],
    queryFn: async ({ queryKey }) => {
      const url = typeFilter && typeFilter !== "all" 
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
  
  // Funzione per visualizzare l'anteprima rapida
  const showQuickPreview = async (id: number) => {
    try {
      setPreviewProductId(id);
      
      // Fetch dati del prodotto e dettagli
      const product: any = await apiRequest("GET", `/api/products/${id}`);
      
      // Basati sul tipo di prodotto, recupera i dettagli specifici
      let details = null;
      if (product && product.type === 'cosmetic') {
        details = await apiRequest("GET", `/api/cosmetic-details/${id}`);
      } else if (product && product.type === 'supplement') {
        details = await apiRequest("GET", `/api/supplement-details/${id}`);
      }
      
      setPreviewData({ product, details });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il caricamento dell'anteprima",
        variant: "destructive",
      });
      setPreviewProductId(null);
    }
  };
  
  // Funzione per chiudere l'anteprima
  const closePreview = () => {
    setPreviewProductId(null);
    setPreviewData(null);
  };

  return (
    <MainLayout title="Elenco Schede Tecniche">
      <div className="container mx-auto py-6 px-4 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          {canEdit() && (
            <Button onClick={() => navigate("/products/new")}>
              <i className="pi pi-plus mr-2"></i>
              Nuova Scheda
            </Button>
          )}
        </div>
        
        <div className="bg-card shadow rounded-lg">
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
                  <SelectItem value="all">Tutti i tipi</SelectItem>
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
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery 
                  ? "Nessun prodotto corrisponde alla ricerca" 
                  : "Nessun prodotto disponibile"}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Nome Prodotto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Tipo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Codice
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Data Creazione
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Azioni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {filteredProducts.map((product: any) => (
                        <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.type === 'cosmetic' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                            }`}>
                              {product.type === 'cosmetic' ? 'Cosmetico' : 'Integratore'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {product.code || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {new Date(product.createdAt).toLocaleDateString('it-IT')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {canEdit() ? (
                                <>
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
                                    onClick={() => showQuickPreview(product.id)}
                                    title="Anteprima Rapida"
                                  >
                                    <FileSearch className="h-4 w-4" />
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
                                      <DropdownMenuItem onClick={() => downloadPdf(product.id)}>
                                        <Download className="mr-2 h-4 w-4" />
                                        <span>Esporta PDF</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => downloadMarkdown(product.id)}>
                                        <Download className="mr-2 h-4 w-4" />
                                        <span>Esporta Markdown</span>
                                      </DropdownMenuItem>
                                      {canAdministrate() && (
                                        <DropdownMenuItem 
                                          className="text-red-600" 
                                          onClick={() => setProductToDelete(product.id)}
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>Elimina</span>
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </>
                              ) : (
                                // Opzioni solo per visualizzatori
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => navigate(`/products/${product.id}`)}
                                    title="Visualizza"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => showQuickPreview(product.id)}
                                    title="Anteprima Rapida"
                                  >
                                    <FileSearch className="h-4 w-4" />
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
                                      <DropdownMenuItem onClick={() => downloadPdf(product.id)}>
                                        <Download className="mr-2 h-4 w-4" />
                                        <span>Esporta PDF</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => downloadMarkdown(product.id)}>
                                        <Download className="mr-2 h-4 w-4" />
                                        <span>Esporta Markdown</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-muted-foreground text-right">
                  Totale: {filteredProducts.length} schede tecniche
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Dialog di conferma eliminazione */}
      <AlertDialog open={productToDelete !== null} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questa scheda?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile. La scheda tecnica verrà eliminata permanentemente dal sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Modal di anteprima rapida */}
      {previewData && (
        <QuickPreviewModal
          product={previewData.product}
          details={previewData.details}
          isOpen={previewProductId !== null}
          onClose={closePreview}
        />
      )}
    </MainLayout>
  );
}