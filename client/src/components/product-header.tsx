import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { SaveIcon, FileDown } from "lucide-react";
import { useLocation } from "wouter";

type ProductHeaderProps = {
  title: string;
  productId?: number;
  onSave: () => void;
  isSaving: boolean;
  isReadOnly?: boolean;
};

export default function ProductHeader({ title, productId, onSave, isSaving, isReadOnly = false }: ProductHeaderProps) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const generatePdf = useCallback(async () => {
    if (!productId) {
      toast({
        title: "Errore",
        description: "Salva il prodotto prima di generare il PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await apiRequest("POST", "/api/generate-pdf", { id: productId });
      
      // Create a blob from the response
      const blob = await res.blob();
      
      // Create a temporary link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scheda-tecnica.docx`;
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
  }, [productId, toast]);

  // Gestione salvataggio con messaggio di conferma e redirect
  const handleSave = () => {
    onSave();
    // Il redirect verrà gestito nella mutation di salvataggio
  };

  return (
    <header className="bg-white shadow">
      <div className="mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">{title}</h1>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {!isReadOnly && (
              <Button className="w-full sm:w-auto" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></span>
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Salva
                  </>
                )}
              </Button>
            )}
            
            <Button className="flex-1 sm:flex-initial" variant="outline" onClick={generatePdf} disabled={!productId}>
              <FileDown className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Esporta PDF</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
