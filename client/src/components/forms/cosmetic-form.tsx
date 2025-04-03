import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cosmeticProductSchema, CosmeticProduct } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CosmeticFormProps {
  onSubmit: (data: CosmeticProduct) => void;
  defaultValues?: Partial<CosmeticProduct>;
  isReadOnly?: boolean;
}

export default function CosmeticForm({ 
  onSubmit, 
  defaultValues = {}, 
  isReadOnly = false 
}: CosmeticFormProps) {
  const form = useForm<CosmeticProduct>({
    resolver: zodResolver(cosmeticProductSchema),
    defaultValues: {
      name: "",
      subtitle: "",
      code: "",
      date: new Date().toISOString().split("T")[0],
      content: "",
      category: "",
      packaging: "",
      accessory: "",
      batch: "",
      cpnp: "",
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
      cosmeticDetails: {
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
      },
      ...defaultValues,
    },
  });

  // Update form with defaultValues when they change
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      // Reset with the new values
      form.reset({
        ...form.getValues(),
        ...defaultValues,
      });
    }
  }, [defaultValues, form]);

  // Submit handler
  const handleSubmit = (data: CosmeticProduct) => {
    onSubmit(data);
  };

  // Common props for all form fields
  const getFieldProps = (disabled: boolean = false) => ({
    disabled: isReadOnly || disabled,
    className: isReadOnly ? "bg-gray-50" : undefined,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informazioni di Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Prodotto</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci nome prodotto" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sottotitolo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci sottotitolo" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codice Notifica Farmadati</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="000000000" 
                        {...field} 
                        {...getFieldProps()} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        {...getFieldProps()} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenuto (ml)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="100" 
                        {...field} 
                        {...getFieldProps()} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Macrocategoria</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Inserisci macrocategoria" 
                        {...field} 
                        {...getFieldProps()} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="packaging"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Packaging Primario</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Inserisci packaging" 
                        {...field} 
                        {...getFieldProps()} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessorio</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Inserisci accessorio" 
                        {...field} 
                        {...getFieldProps()} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lotto</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Inserisci lotto" 
                        {...field} 
                        {...getFieldProps()} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpnp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPNP</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Inserisci CPNP" 
                        {...field} 
                        {...getFieldProps()} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Analisi Organolettica */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Analisi Organolettica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="cosmeticDetails.color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stato/colore</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci stato/colore" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cosmeticDetails.fragrance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profumazione</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci profumazione" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cosmeticDetails.sensorial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percezione sensoriale</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci percezione sensoriale" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cosmeticDetails.absorbability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assorbibilità</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci assorbibilità" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Analisi Chimico-Fisica e Microbiologica */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Analisi Chimico-Fisica e Microbiologica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cosmeticDetails.ph"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>pH</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Inserisci pH" 
                        {...field} 
                        {...getFieldProps()} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cosmeticDetails.viscosity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Viscosità (cps)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Inserisci viscosità" 
                        {...field} 
                        {...getFieldProps()} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cosmeticDetails.cbt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CBT</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci CBT" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cosmeticDetails.yeastAndMold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieviti e muffe</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci lieviti e muffe" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cosmeticDetails.escherichiaColi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escherichia coli</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci escherichia coli" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cosmeticDetails.pseudomonas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pseudomonas auriginosa</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci pseudomonas auriginosa" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Composizione - Ingredienti */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Composizione - Ingredienti (INCI)</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci la composizione..." 
                      className="h-40" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Test - Certificazioni - Studi Scientifici */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test - Certificazioni - Studi Scientifici</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="tests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TEST</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci test" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CERTIFICAZIONI</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci certificazioni" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clinicalTrials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TRIAL CLINICI</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci trial clinici" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="claims"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CLAIM/INDICAZIONI SALUTISTICHE</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci claim/indicazioni" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Principi Attivi di Origine Vegetale */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Principi Attivi di Origine Vegetale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="naturalActives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attivi Naturali Selezionati</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci attivi naturali" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="functionalActives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attivi Funzionali in formula</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Inserisci attivi funzionali" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Caratteristiche Principali */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Caratteristiche Principali</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="characteristics"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci le caratteristiche principali..." 
                      className="h-32" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Modo d'Uso */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Modo d'Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="usage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci il modo d'uso..." 
                      className="h-32" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Avvertenze */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Avvertenze</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="warnings"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci le avvertenze..." 
                      className="h-32" 
                      {...field} 
                      {...getFieldProps()} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Hidden submit button (triggered by header button) */}
        <Button id="submit-product-form" type="submit" className="hidden">
          Salva
        </Button>
      </form>
    </Form>
  );
}
