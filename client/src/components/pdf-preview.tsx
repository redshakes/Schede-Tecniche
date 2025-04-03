import { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type PdfPreviewProps = {
  product: any;
  details: any;
};

export default function PdfPreview({ product, details }: PdfPreviewProps) {
  const [zoom, setZoom] = useState<number>(100);

  const zoomIn = () => {
    setZoom(Math.min(zoom + 10, 150));
  };

  const zoomOut = () => {
    setZoom(Math.max(zoom - 10, 70));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 h-[calc(100vh-10rem)] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-neutral-800">Anteprima PDF</h2>
        
        <div className="flex space-x-2 items-center">
          <Button variant="ghost" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-neutral-600">{zoom}%</span>
          <Button variant="ghost" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        className="border border-neutral-200 rounded p-6 mx-auto" 
        style={{ 
          width: `${zoom}%`, 
          maxWidth: '800px', 
          minHeight: '842px', 
          backgroundColor: 'white',
          transition: 'width 0.2s ease'
        }}
      >
        {/* PDF Preview */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold">{product?.name || 'NOME PRODOTTO'}</h1>
          <p className="text-sm">{product?.subtitle || ''}</p>
          <p className="text-sm mt-2">Codice Notifica Prodotto in Farmadati: {product?.code || '000000000'}</p>
          <p className="text-lg font-semibold mt-3">Scheda Tecnica Prodotto</p>
        </div>
        
        <div className="text-sm space-y-3 mt-6">
          <p>Sede di Campionamento: Laboratorio LFA – {product?.type === 'cosmetic' ? 'Arpino (FR)' : 'via Rondinella Arpino (FR)'}</p>
          <p>Data: {product?.date || ''}</p>
          <p>Ref.: {product?.ref || product?.name || 'NOME PRODOTTO'}</p>
          <p>Contenuto: {product?.content || ''} ℮</p>
          <p>Macrocategoria: {product?.category || ''}</p>
          <p>Packaging Primario: {product?.packaging || ''}</p>
          <p>Accessorio: {product?.accessory || ''}</p>
          <p>Lotto: {product?.batch || ''}</p>
          {product?.type === 'cosmetic' ? (
            <p>CPNP: {product?.cpnp || ''}</p>
          ) : (
            <p>Aut. Min.: {product?.authMinistry || ''}</p>
          )}
        </div>
        
        {product?.type === 'cosmetic' && (
          <>
            <h2 className="text-base font-bold mt-8 mb-2">ANALISI ORGANOLETTICA</h2>
            <div className="text-sm space-y-2">
              <p>Analisi Organolettica Stato/colore: {details?.color || ''}</p>
              <p>Profumazione: {details?.fragrance || ''}</p>
              <p>Percezione sensoriale: {details?.sensorial || ''}</p>
              <p>Assorbibilità: {details?.absorbability || ''}</p>
            </div>
            
            <h2 className="text-base font-bold mt-6 mb-2">ANALISI CHIMICO-FISICA E MICROBIOLOGICA</h2>
            <div className="text-sm space-y-2">
              <p>pH: {details?.ph || ''}</p>
              <p>Viscosità: {details?.viscosity || ''} cps</p>
              <p>CBT: {details?.cbt || ''}</p>
              <p>Lieviti e muffe: {details?.yeastAndMold || ''}</p>
              <p>Escherichia coli: {details?.escherichiaColi || ''}</p>
              <p>Pseudomonas auriginosa: {details?.pseudomonas || ''}</p>
            </div>
          </>
        )}
        
        <h2 className="text-base font-bold mt-6 mb-2">COMPOSIZIONE – INGREDIENTI [i.n.c.i.]</h2>
        <div className="text-sm">
          <p>{product?.ingredients || ''}</p>
        </div>

        {product?.type === 'supplement' && (
          <>
            <h2 className="text-base font-bold mt-6 mb-2">TABELLA NUTRIZIONALE</h2>
            <div className="text-sm">
              <p>{details?.nutritionalInfo || ''}</p>
            </div>
            
            <h2 className="text-base font-bold mt-6 mb-2">INDICAZIONI</h2>
            <div className="text-sm">
              <p>{details?.indications || ''}</p>
            </div>
          </>
        )}

        <h2 className="text-base font-bold mt-6 mb-2">TEST - CERTIFICAZIONI - STUDI SCIENTIFICI - TRIAL CLINICI</h2>
        <div className="text-sm space-y-2">
          <p>TEST: {product?.tests || ''}</p>
          <p>CERTIFICAZIONI: {product?.certifications || ''}</p>
          <p>TRIAL CLINICI: {product?.clinicalTrials || ''}</p>
          <p>CLAIM/INDICAZIONI SALUTISTICHE: {product?.claims || ''}</p>
        </div>
        
        <h2 className="text-base font-bold mt-6 mb-2">PRINCIPI ATTIVI DI ORIGINE VEGETALE - NATURALI IN FORMULA</h2>
        <div className="text-sm space-y-2">
          <p>Attivi Naturali Selezionati: {product?.naturalActives || ''}</p>
          <p>Attivi Funzionali in formula: {product?.functionalActives || ''}</p>
        </div>
        
        {product?.type === 'cosmetic' && (
          <>
            <h2 className="text-base font-bold mt-6 mb-2">CARATTERISTICHE PRINCIPALI</h2>
            <div className="text-sm">
              <p>{product?.characteristics || ''}</p>
            </div>
          </>
        )}
        
        <h2 className="text-base font-bold mt-6 mb-2">{product?.type === 'cosmetic' ? 'MODO D\'USO' : 'MODO D\'USO / POSOLOGIA'}</h2>
        <div className="text-sm">
          <p>{product?.type === 'cosmetic' ? product?.usage : details?.dosage || ''}</p>
        </div>
        
        <h2 className="text-base font-bold mt-6 mb-2">AVVERTENZE</h2>
        <div className="text-sm">
          <p>{product?.warnings || ''}</p>
        </div>
        
        {product?.type === 'supplement' && (
          <>
            <h2 className="text-base font-bold mt-6 mb-2">MODALITÀ DI CONSERVAZIONE DEL PRODOTTO</h2>
            <div className="text-sm">
              <p>{product?.conservationMethod || ''}</p>
            </div>
            
            <h2 className="text-base font-bold mt-6 mb-2">AVVERTENZE SPECIALI</h2>
            <div className="text-sm">
              <p>{product?.specialWarnings || ''}</p>
            </div>
          </>
        )}

        {/* Footer with approval form */}
        <div className="mt-10 pt-6 border-t border-neutral-300">
          <h3 className="font-semibold mb-2">MODULO DI APPROVAZIONE</h3>
          <p className="text-sm mb-4">APPROVAZIONE CLIENTE</p>
          
          <div className="flex space-x-8 mb-4">
            <div className="border border-neutral-400 w-10 h-10 flex items-center justify-center">SI</div>
            <div className="border border-neutral-400 w-10 h-10 flex items-center justify-center">NO</div>
          </div>
          
          <p className="text-sm mb-4">NOTE___________________________________________________________________________________</p>
          
          <p className="text-sm mb-6">PER ACCETTAZIONE: apporre una firma/sigla su ogni pagina. Inserire di seguito luogo, data, timbro e firma negli appositi spazi</p>
          
          <div className="flex justify-between items-center mt-6">
            <div>
              <p className="text-sm">Luogo _______________________</p>
            </div>
            <div>
              <p className="text-sm">Data _______________________</p>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-sm">Timbro e Firma per Accettazione __________________________________________________</p>
          </div>
        </div>
      </div>
    </div>
  );
}
