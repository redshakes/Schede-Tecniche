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
      className: `${props.className || ''} ${isReadOnly ? 'bg-gray-100' : ''}`,
      // Disabilita l'autofocus per risolvere il problema di salto automatico
      autoFocus: false
    };
  };
  
  // Applicare readOnly a tutti gli input del componente e disabilitare autofocus
  useEffect(() => {
    // Disabilita l'autofocus su tutti gli input e textarea
    const disableAutoFocus = () => {
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        // Rimuovi l'attributo autofocus se presente
        input.removeAttribute('autofocus');
        
        // Aggiungi l'attributo readOnly se necessario
        if (isReadOnly) {
          input.setAttribute('readOnly', 'true');
          input.classList.add('bg-gray-100');
        }
      });
    };

    // Applica immediatamente e di nuovo dopo un breve ritardo per catturare anche elementi aggiunti dinamicamente
    disableAutoFocus();
    setTimeout(disableAutoFocus, 100);
    
    // Aggiungi un listener per prevenire che il focus venga impostato automaticamente sui campi
    const preventAutoFocus = (e: MouseEvent) => {
      // Impedisci al browser di impostare automaticamente il focus
      e.preventDefault();
      // Rimuovi l'attributo autofocus da tutti gli elementi
      document.querySelectorAll('[autofocus]').forEach(el => {
        el.removeAttribute('autofocus');
      });
    };
    
    // Aggiungi il listener al documento
    document.addEventListener('click', preventAutoFocus, true);
    
    // Rimuovi il listener quando il componente viene smontato
    return () => {
      document.removeEventListener('click', preventAutoFocus, true);
    };
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