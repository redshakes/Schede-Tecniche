import { Control } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

type SupplementFormProps = {
  control: Control<any>;
  isReadOnly?: boolean;
};

export default function SupplementForm({ control, isReadOnly = false }: SupplementFormProps) {
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
        const inputs = document.querySelectorAll('.supplement-form textarea');
        inputs.forEach(input => {
          input.setAttribute('readOnly', 'true');
          input.classList.add('bg-gray-100');
        });
      }, 100);
    }
  }, [isReadOnly]);
  
  return (
    <div className="supplement-form">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Tabella Nutrizionale</h2>
          
          <div className="space-y-4">
            <FormField
              control={control}
              name="details.nutritionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informazioni Nutrizionali</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Inserisci le informazioni nutrizionali..."
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
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Indicazioni</h2>
          
          <div className="space-y-4">
            <FormField
              control={control}
              name="details.indications"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Inserisci le indicazioni..."
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
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Modo d'Uso / Posologia</h2>
          
          <div className="space-y-4">
            <FormField
              control={control}
              name="details.dosage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Inserisci la posologia..."
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