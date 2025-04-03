import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductHeader from "@/components/product-header";
import CosmeticForm from "@/components/cosmetic-form";
import SupplementForm from "@/components/supplement-form";
import PdfPreview from "@/components/pdf-preview";
import MainLayout from "@/components/main-layout";
import { Loader2 } from "lucide-react";

// Form validation schema
const productSchema = z.object({
  product: z.object({
    name: z.string().min(1, "Il nome del prodotto è obbligatorio"),
    subtitle: z.string().optional(),
    type: z.string().min(1, "Il tipo di prodotto è obbligatorio"),
    code: z.string().optional(),
    ref: z.string().optional(),
    date: z.string().optional(),
    content: z.string().optional(),
    category: z.string().optional(),
    packaging: z.string().optional(),
    accessory: z.string().optional(),
    batch: z.string().optional(),
    cpnp: z.string().optional(),
    authMinistry: z.string().optional(),
    ingredients: z.string().optional(),
    tests: z.string().optional(),
    certifications: z.string().optional(),
    clinicalTrials: z.string().optional(),
    claims: z.string().optional(),
    naturalActives: z.string().optional(),
    functionalActives: z.string().optional(),
    characteristics: z.string().optional(),
    usage: z.string().optional(),
    warnings: z.string().optional(),
    conservationMethod: z.string().optional(),
    specialWarnings: z.string().optional(),
    groupId: z.number().nullable().optional(),
  }),
  details: z.object({
    // Common properties
    productId: z.number().optional(),
    
    // Cosmetic properties
    color: z.string().optional(),
    fragrance: z.string().optional(),
    sensorial: z.string().optional(),
    absorbability: z.string().optional(),
    ph: z.string().optional(),
    viscosity: z.string().optional(),
    cbt: z.string().optional(),
    yeastAndMold: z.string().optional(),
    escherichiaColi: z.string().optional(),
    pseudomonas: z.string().optional(),
    
    // Supplement properties
    nutritionalInfo: z.string().optional(),
    indications: z.string().optional(),
    dosage: z.string().optional(),
  }).passthrough(),
});

type FormValues = z.infer<typeof productSchema>;

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { canEdit } = useAuth();
  const [activeType, setActiveType] = useState<string>("cosmetic");
  const isReadOnly = !canEdit();
  
  // Funzione di utilità per applicare la proprietà readOnly agli input
  const withReadOnly = (props: any) => {
    return {
      ...props,
      readOnly: isReadOnly,
      className: `${props.className || ''} ${isReadOnly ? 'bg-gray-100' : ''}`
    };
  };
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product: {
        name: "",
        subtitle: "",
        type: activeType,
        code: "",
        ref: "",
        date: new Date().toISOString().split("T")[0],
        content: "",
        category: "",
        packaging: "",
        accessory: "",
        batch: "",
        cpnp: "",
        authMinistry: "",
        ingredients: "",
        tests: "",
        certifications: "",
        clinicalTrials: "",
        claims: "",
        naturalActives: "",
        functionalActives: "",
        characteristics: "",
        usage: "",
        warnings: "",
        conservationMethod: "",
        specialWarnings: "",
      },
      details: {
        // Cosmetic details
        color: "",
        fragrance: "",
        sensorial: "",
        absorbability: "",
        ph: "",
        viscosity: "",
        cbt: "",
        yeastAndMold: "",
        escherichiaColi: "",
        pseudomonas: "",
        
        // Supplement details
        nutritionalInfo: "",
        indications: "",
        dosage: "",
      },
    },
  });
  
  // Set active type from form
  useEffect(() => {
    const type = form.watch("product.type");
    if (type) {
      setActiveType(type);
    }
  }, [form.watch("product.type")]);
  
  // Load existing product if ID is provided
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/products/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Errore nel caricamento del prodotto");
      return res.json();
    },
    enabled: !!id,
  });
  
  // Ottieni tutti i gruppi
  const { data: groups = [] } = useQuery({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      const res = await fetch("/api/groups", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Errore nel caricamento dei gruppi");
      return res.json();
    }
  });
  
  // Prepara le opzioni dei gruppi per il select
  const groupsOptions = groups.map((group: any) => (
    <SelectItem key={group.id} value={group.id.toString()}>
      {group.name}
    </SelectItem>
  ));
  
  // Update form when product data is loaded
  useEffect(() => {
    if (productData) {
      const { product, details } = productData;
      form.reset({
        product,
        details: details || {},
      });
      setActiveType(product.type);
    }
  }, [productData, form]);
  
  // Applicare lo stile di sola lettura a tutti gli input
  useEffect(() => {
    if (isReadOnly) {
      // Applicare a tutti gli input e textarea
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.setAttribute('readOnly', 'true');
        input.classList.add('bg-gray-100');
      });
    }
  }, [isReadOnly]);
  
  // Save product mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Prodotto salvato",
        description: "La scheda tecnica è stata creata con successo",
      });
      navigate(`/products/${data.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante il salvataggio",
        variant: "destructive",
      });
    },
  });
  
  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("PUT", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Prodotto aggiornato",
        description: "La scheda tecnica è stata aggiornata con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: FormValues) => {
    // Make sure product type matches activeType
    data.product.type = activeType;
    
    if (id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Handle changing product type
  const handleTypeChange = (type: string) => {
    setActiveType(type);
    form.setValue("product.type", type);
  };
  
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const title = id ? "Modifica Scheda Tecnica" : "Nuova Scheda Tecnica";
  const formTitle = id 
    ? `Modifica ${activeType === "cosmetic" ? "Cosmetico" : "Integratore"}`
    : `Nuovo ${activeType === "cosmetic" ? "Cosmetico" : "Integratore"}`;
  
  // Show loading state
  if (id && isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-neutral-500">Caricamento scheda tecnica...</p>
        </div>
      </div>
    );
  }
  
  return (
    <MainLayout title={title} activeType={activeType} setActiveType={handleTypeChange} isReadOnly={isReadOnly}>
      <div className="flex flex-col">
        <ProductHeader 
          title={formTitle} 
          productId={id ? parseInt(id) : undefined} 
          onSave={form.handleSubmit(onSubmit)} 
          isSaving={isSaving}
          isReadOnly={isReadOnly}
        />
        
        <div className="container mx-auto py-6 px-4 lg:px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
                {/* Form Panel */}
                <div className="lg:w-1/2 space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-lg font-medium text-neutral-800 mb-4">{formTitle}</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Nome Prodotto</label>
                          <Input
                            {...form.register("product.name")}
                            placeholder="Inserisci nome prodotto"
                            readOnly={isReadOnly}
                          />
                          {form.formState.errors.product?.name && (
                            <p className="text-sm text-red-500 mt-1">{form.formState.errors.product.name.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Sottotitolo</label>
                          <Input
                            {...withReadOnly(form.register("product.subtitle"))}
                            placeholder="Inserisci sottotitolo"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Gruppo</label>
                          <Controller
                            name="product.groupId"
                            control={form.control}
                            render={({ field }) => (
                              <div>
                                {isReadOnly ? (
                                  <Input 
                                    value={groups.find((g: any) => g.id === field.value)?.name || "Nessun gruppo"} 
                                    readOnly 
                                    className="bg-gray-100"
                                  />
                                ) : (
                                  <Select 
                                    onValueChange={(value) => field.onChange(value !== "null" ? parseInt(value) : null)}
                                    value={field.value ? field.value.toString() : "null"}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleziona gruppo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="null">Nessun gruppo</SelectItem>
                                      {groupsOptions}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Codice Notifica Farmadati</label>
                            <Input
                              {...withReadOnly(form.register("product.code"))}
                              placeholder="000000000"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Data</label>
                            <Input
                              type="date"
                              {...withReadOnly(form.register("product.date"))}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Contenuto (ml)</label>
                            <Input
                              {...form.register("product.content")}
                              placeholder="100"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Macrocategoria</label>
                            <Input
                              {...form.register("product.category")}
                              placeholder="Inserisci macrocategoria"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Packaging Primario</label>
                            <Input
                              {...form.register("product.packaging")}
                              placeholder="Inserisci packaging"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Accessorio</label>
                            <Input
                              {...form.register("product.accessory")}
                              placeholder="Inserisci accessorio"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Lotto</label>
                            <Input
                              {...form.register("product.batch")}
                              placeholder="Inserisci lotto"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              {activeType === "cosmetic" ? "CPNP" : "Aut. Min."}
                            </label>
                            <Input
                              {...form.register(activeType === "cosmetic" ? "product.cpnp" : "product.authMinistry")}
                              placeholder={`Inserisci ${activeType === "cosmetic" ? "CPNP" : "Aut. Min."}`}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Dynamic form based on type */}
                  {activeType === "cosmetic" ? (
                    <CosmeticForm control={form.control} isReadOnly={isReadOnly} />
                  ) : (
                    <SupplementForm control={form.control} isReadOnly={isReadOnly} />
                  )}
                  
                  {/* Common fields for both types */}
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <h2 className="text-lg font-medium text-neutral-800 mb-4">Composizione - Ingredienti (INCI)</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <Textarea
                            {...form.register("product.ingredients")}
                            className="w-full px-3 py-2 h-40"
                            placeholder="Inserisci la composizione..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <h2 className="text-lg font-medium text-neutral-800 mb-4">Test - Certificazioni - Studi Scientifici</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">TEST</label>
                          <Input
                            {...form.register("product.tests")}
                            placeholder="Inserisci test"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">CERTIFICAZIONI</label>
                          <Input
                            {...form.register("product.certifications")}
                            placeholder="Inserisci certificazioni"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">TRIAL CLINICI</label>
                          <Input
                            {...form.register("product.clinicalTrials")}
                            placeholder="Inserisci trial clinici"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">CLAIM/INDICAZIONI SALUTISTICHE</label>
                          <Input
                            {...form.register("product.claims")}
                            placeholder="Inserisci claim/indicazioni"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <h2 className="text-lg font-medium text-neutral-800 mb-4">Principi Attivi di Origine Vegetale</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Attivi Naturali Selezionati</label>
                          <Input
                            {...form.register("product.naturalActives")}
                            placeholder="Inserisci attivi naturali"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Attivi Funzionali in formula</label>
                          <Input
                            {...form.register("product.functionalActives")}
                            placeholder="Inserisci attivi funzionali"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <h2 className="text-lg font-medium text-neutral-800 mb-4">Avvertenze</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <Textarea
                            {...form.register("product.warnings")}
                            className="w-full px-3 py-2 h-32"
                            placeholder="Inserisci le avvertenze..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Additional fields for supplements */}
                  {activeType === "supplement" && (
                    <>
                      <Card className="mb-6">
                        <CardContent className="pt-6">
                          <h2 className="text-lg font-medium text-neutral-800 mb-4">Modalità di Conservazione del Prodotto</h2>
                          
                          <div className="space-y-4">
                            <div>
                              <Textarea
                                {...form.register("product.conservationMethod")}
                                className="w-full px-3 py-2 h-32"
                                placeholder="Inserisci le modalità di conservazione..."
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="mb-6">
                        <CardContent className="pt-6">
                          <h2 className="text-lg font-medium text-neutral-800 mb-4">Avvertenze Speciali</h2>
                          
                          <div className="space-y-4">
                            <div>
                              <Textarea
                                {...form.register("product.specialWarnings")}
                                className="w-full px-3 py-2 h-32"
                                placeholder="Inserisci le avvertenze speciali..."
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
                
                {/* Preview Panel */}
                <div className="lg:w-1/2 sticky top-0">
                  <PdfPreview 
                    product={form.watch("product")}
                    details={form.watch("details")}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </MainLayout>
  );
}