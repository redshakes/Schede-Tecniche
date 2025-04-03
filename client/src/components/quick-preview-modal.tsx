import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import PdfPreview from "./pdf-preview";

type QuickPreviewModalProps = {
  product: any;
  details: any;
  isOpen: boolean;
  onClose: () => void;
};

export default function QuickPreviewModal({ product, details, isOpen, onClose }: QuickPreviewModalProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>
            Anteprima: {product.name}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 bg-muted/30 dark:bg-muted/10 rounded-md">
          {product && details ? (
            <div className="bg-card p-6 border shadow rounded-lg">
              <PdfPreview product={product} details={details} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Caricamento...</span>
                </div>
                <p className="mt-4 text-muted-foreground">Caricamento anteprima...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}