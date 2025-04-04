import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/main-layout";

export default function HomePage() {
  const [activeType, setActiveType] = useState<string>("cosmetic");
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  // Get all products to display counts
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });

  const cosmeticCount = products.filter((p) => p.type === "cosmetic").length;
  const supplementCount = products.filter((p) => p.type === "supplement").length;
  
  return (
    <MainLayout title="Dashboard" activeType={activeType} setActiveType={setActiveType}>
      <div className="py-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-foreground mb-2">Benvenuto, {user?.name}</h2>
          <p className="text-muted-foreground">
            Gestisci le tue schede tecniche per prodotti cosmetici e integratori
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Schede Totali</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{products.length}</div>
              <p className="text-muted-foreground text-sm mt-1">Schede tecniche create</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Cosmetici</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{cosmeticCount}</div>
              <p className="text-muted-foreground text-sm mt-1">Schede tecniche cosmetici</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Integratori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{supplementCount}</div>
              <p className="text-muted-foreground text-sm mt-1">Schede tecniche integratori</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-card shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-card-foreground mb-4">Azioni Rapide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button onClick={() => navigate("/products/new")} className="h-auto py-4 justify-start">
              <div className="flex flex-col items-start text-left">
                <span className="flex items-center text-base mb-1">
                  <i className="pi pi-plus mr-2"></i>
                  Crea Nuova Scheda
                </span>
                <span className="text-xs opacity-80">Aggiungi una nuova scheda tecnica</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/products")} 
              className="h-auto py-4 justify-start"
            >
              <div className="flex flex-col items-start text-left">
                <span className="flex items-center text-base mb-1">
                  <i className="pi pi-list mr-2"></i>
                  Visualizza Elenco
                </span>
                <span className="text-xs opacity-80">Gestisci le schede esistenti</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setActiveType("cosmetic");
                navigate("/products/new");
              }}
              className="h-auto py-4 justify-start"
            >
              <div className="flex flex-col items-start text-left">
                <span className="flex items-center text-base mb-1">
                  <i className="pi pi-palette mr-2"></i>
                  Nuovo Cosmetico
                </span>
                <span className="text-xs opacity-80">Crea scheda per cosmetico</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setActiveType("supplement");
                navigate("/products/new");
              }}
              className="h-auto py-4 justify-start"
            >
              <div className="flex flex-col items-start text-left">
                <span className="flex items-center text-base mb-1">
                  <i className="pi pi-heart mr-2"></i>
                  Nuovo Integratore
                </span>
                <span className="text-xs opacity-80">Crea scheda per integratore</span>
              </div>
            </Button>
          </div>
        </div>
        
        {products.length > 0 && (
          <div className="bg-card shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-card-foreground">Schede Recenti</h2>
              <Button variant="link" onClick={() => navigate("/products")}>
                Visualizza Tutto
              </Button>
            </div>
            
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
                      Data Creazione
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {products.slice(0, 5).map((product: any) => (
                    <tr key={product.id} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/products/${product.id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.type === 'cosmetic' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                        }`}>
                          {product.type === 'cosmetic' ? 'Cosmetico' : 'Integratore'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(product.createdAt).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
