import { Control } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

type SupplementFormProps = {
  control: Control<any>;
};

export default function SupplementForm({ control }: SupplementFormProps) {
  return (
    <>
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
                      {...field}
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
                      {...field}
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
