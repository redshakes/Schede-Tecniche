import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplementProductSchema, SupplementProduct } from "@shared/schema";
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

interface SupplementFormProps {
  onSubmit: (data: SupplementProduct) => void;
  defaultValues?: Partial<SupplementProduct>;
  isReadOnly?: boolean;
}

export default function SupplementForm({
  onSubmit,
  defaultValues = {},
  isReadOnly = false
}: SupplementFormProps) {
  const form = useForm<SupplementProduct>({
    resolver: zodResolver(supplementProductSchema),
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
      authMin: "",
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
      supplementDetails: {
        nutritionalInfo: "",
        indications: "",
        posology: "",
        conservation: "",
        specialWarnings: "",
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
  const handleSubmit = (data: SupplementProduct) => {
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
                    <FormLabel>Contenuto</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Inserisci contenuto" 
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
                name="authMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aut. Min.</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Inserisci Autorizzazione Ministeriale" 
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

        {/* Test e Certificazioni */}
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

        {/* Principi Attivi */}
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

        {/* Composizione */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Composizione – Ingredienti</CardTitle>
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

        {/* Tabella Nutrizionale */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tabella Nutrizionale</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="supplementDetails.nutritionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci informazioni nutrizionali..." 
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

        {/* Indicazioni */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Indicazioni</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="supplementDetails.indications"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci indicazioni..." 
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

        {/* Modo d'Uso/Posologia */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Modo d'Uso / Posologia</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="supplementDetails.posology"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci modo d'uso / posologia..." 
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
                      placeholder="Inserisci avvertenze..." 
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

        {/* Modalità di Conservazione */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Modalità di Conservazione del Prodotto</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="supplementDetails.conservation"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci modalità di conservazione..." 
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

        {/* Avvertenze Speciali */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Avvertenze Speciali</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="supplementDetails.specialWarnings"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci avvertenze speciali..." 
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
