import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

type CosmeticFormProps = {
  control: Control<any>;
  isReadOnly?: boolean;
};

export default function CosmeticForm({ control, isReadOnly = false }: CosmeticFormProps) {
  // Funzione di utilità per applicare la proprietà readOnly agli input
  const withReadOnly = (props: any) => {
    return {
      ...props,
      readOnly: isReadOnly,
      className: `${props.className || ''} ${isReadOnly ? 'bg-gray-100' : ''}`
    };
  };
  
  // Applicare readOnly a tutti gli input del componente
  useEffect(() => {
    if (isReadOnly) {
      // Seleziona tutti gli input e textarea nel componente
      setTimeout(() => {
        const inputs = document.querySelectorAll('.cosmetic-form input, .cosmetic-form textarea');
        inputs.forEach(input => {
          input.setAttribute('readOnly', 'true');
          input.classList.add('bg-gray-100');
        });
      }, 100);
    }
  }, [isReadOnly]);
  
  return (
    <div className="cosmetic-form">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Analisi Organolettica</h2>
          
          <div className="space-y-4">
            <FormField
              control={control}
              name="details.color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stato/colore</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inserisci stato/colore"
                      {...withReadOnly(field)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="details.fragrance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profumazione</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inserisci profumazione"
                      {...withReadOnly(field)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="details.sensorial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percezione sensoriale</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inserisci percezione sensoriale"
                      {...withReadOnly(field)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="details.absorbability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assorbibilità</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inserisci assorbibilità"
                      {...withReadOnly(field)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Analisi Chimico-Fisica e Microbiologica</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="details.ph"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>pH</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Inserisci pH"
                        {...withReadOnly(field)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="details.viscosity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Viscosità (cps)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Inserisci viscosità"
                        {...withReadOnly(field)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={control}
              name="details.cbt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CBT</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inserisci CBT"
                      {...withReadOnly(field)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="details.yeastAndMold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieviti e muffe</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inserisci lieviti e muffe"
                      {...withReadOnly(field)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="details.escherichiaColi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escherichia coli</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inserisci escherichia coli"
                      {...withReadOnly(field)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="details.pseudomonas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pseudomonas auriginosa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inserisci pseudomonas auriginosa"
                      {...withReadOnly(field)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Caratteristiche Principali</h2>
          
          <div className="space-y-4">
            <FormField
              control={control}
              name="product.characteristics"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Inserisci le caratteristiche principali..."
                      className="min-h-[120px]"
                      {...withReadOnly(field)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Modo d'Uso</h2>
          
          <div className="space-y-4">
            <FormField
              control={control}
              name="product.usage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Inserisci il modo d'uso..."
                      className="min-h-[120px]"
                      {...withReadOnly(field)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}