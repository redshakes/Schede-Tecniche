import { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATE_COLORS } from "@/lib/constants";

type PdfPreviewImprovedProps = {
  product: any;
  details: any;
};

export default function PdfPreviewImproved({ product, details }: PdfPreviewImprovedProps) {
  const [zoom, setZoom] = useState<number>(100);

  const zoomIn = () => {
    setZoom(Math.min(zoom + 10, 150));
  };

  const zoomOut = () => {
    setZoom(Math.max(zoom - 10, 70));
  };

  // Determina i colori del template basati sul tipo di prodotto
  const templateColor = product?.type === 'cosmetic' 
    ? TEMPLATE_COLORS.COSMETIC 
    : TEMPLATE_COLORS.SUPPLEMENT;

  // Formatta il testo multilinea per la visualizzazione HTML
  const formatMultilineText = (text: string | null | undefined) => {
    if (!text) return '—';
    return text.split('\n').map((line, i) => (
      <div key={i} className="mb-1">{line || '—'}</div>
    ));
  };

  // Verifica se una sezione di dati ha almeno un valore non vuoto
  const hasSectionData = (dataObject: Record<string, any> | null | undefined, keys: string[]): boolean => {
    if (!dataObject) return false;
    return keys.some(key => !!dataObject[key]);
  };

  // Formatta un valore per la visualizzazione, mostrando un default se vuoto
  const formatValue = (value: any, defaultValue: string = '—') => {
    return value || defaultValue;
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
        className="border border-neutral-200 rounded mx-auto" 
        style={{ 
          width: `${zoom}%`, 
          maxWidth: '800px',
          backgroundColor: 'white',
          transition: 'width 0.2s ease',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {/* Header */}
        <div 
          style={{ 
            backgroundColor: templateColor.header,
            color: 'white',
            padding: '15px',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px'
          }}
        >
          <h1 className="text-xl font-bold text-center">SCHEDA TECNICA PRODOTTO</h1>
        </div>
        
        {/* Titolo prodotto */}
        <div className="text-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">{formatValue(product?.name, 'NOME PRODOTTO')}</h2>
          {product?.subtitle && <p className="text-sm mt-1">{product.subtitle}</p>}
          <p className="text-sm mt-2">
            {product?.type === 'cosmetic' ? 'CPNP: ' : 'Aut. Min.: '}
            {product?.type === 'cosmetic' ? formatValue(product?.cpnp) : formatValue(product?.authMinistry)}
          </p>
        </div>
        
        {/* Informazioni generali */}
        <div className="p-4">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 w-1/3 font-medium bg-gray-50">Sede di Campionamento</td>
                <td className="border border-gray-300 p-2">
                  Laboratorio LFA – {product?.type === 'cosmetic' ? 'Arpino (FR)' : 'via Rondinella Arpino (FR)'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">Data</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.date)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">Riferimento</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.ref)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">Contenuto</td>
                <td className="border border-gray-300 p-2">{product?.content ? `${product.content} ℮` : '—'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">Macrocategoria</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.category)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">Packaging Primario</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.packaging)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">Accessorio</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.accessory)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">Lotto</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.batch)}</td>
              </tr>
              {product?.type === 'cosmetic' ? (
                <tr>
                  <td className="border border-gray-300 p-2 font-medium bg-gray-50">CPNP</td>
                  <td className="border border-gray-300 p-2">{formatValue(product?.cpnp)}</td>
                </tr>
              ) : (
                <tr>
                  <td className="border border-gray-300 p-2 font-medium bg-gray-50">Autorizzazione Ministeriale</td>
                  <td className="border border-gray-300 p-2">{formatValue(product?.authMinistry)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Sezioni specifiche per tipo di prodotto */}
        {product?.type === 'cosmetic' && (
          <>
            {/* Analisi Organolettica per Cosmetici */}
            <div className="p-4 border-t border-gray-200">
              <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
                ANALISI ORGANOLETTICA
              </h3>
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 w-1/3 font-medium bg-gray-50">Stato/colore</td>
                    <td className="border border-gray-300 p-2">{formatValue(details?.color)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium bg-gray-50">Profumazione</td>
                    <td className="border border-gray-300 p-2">{formatValue(details?.fragrance)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium bg-gray-50">Percezione sensoriale</td>
                    <td className="border border-gray-300 p-2">{formatValue(details?.sensorial)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium bg-gray-50">Assorbibilità</td>
                    <td className="border border-gray-300 p-2">{formatValue(details?.absorbability)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Analisi Chimico-Fisica per Cosmetici */}
            <div className="p-4 border-t border-gray-200">
              <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
                ANALISI CHIMICO-FISICA E MICROBIOLOGICA
              </h3>
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 w-1/3 font-medium bg-gray-50">pH</td>
                    <td className="border border-gray-300 p-2">{formatValue(details?.ph)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium bg-gray-50">Viscosità</td>
                    <td className="border border-gray-300 p-2">{details?.viscosity ? `${details.viscosity} cps` : '—'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium bg-gray-50">CBT</td>
                    <td className="border border-gray-300 p-2">{formatValue(details?.cbt)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium bg-gray-50">Lieviti e muffe</td>
                    <td className="border border-gray-300 p-2">{formatValue(details?.yeastAndMold)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium bg-gray-50">Escherichia coli</td>
                    <td className="border border-gray-300 p-2">{formatValue(details?.escherichiaColi)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium bg-gray-50">Pseudomonas auriginosa</td>
                    <td className="border border-gray-300 p-2">{formatValue(details?.pseudomonas)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
        
        {/* Ingredienti */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
            COMPOSIZIONE – INGREDIENTI [i.n.c.i.]
          </h3>
          <div className="border border-gray-300 p-3 bg-white">
            {formatMultilineText(product?.ingredients)}
          </div>
        </div>
        
        {/* Sezioni per Integratori */}
        {product?.type === 'supplement' && (
          <>
            <div className="p-4 border-t border-gray-200">
              <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
                TABELLA NUTRIZIONALE
              </h3>
              <div className="border border-gray-300 p-3 bg-white">
                {formatMultilineText(details?.nutritionalInfo)}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
                INDICAZIONI
              </h3>
              <div className="border border-gray-300 p-3 bg-white">
                {formatMultilineText(details?.indications)}
              </div>
            </div>
          </>
        )}
        
        {/* Test e certificazioni */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
            TEST - CERTIFICAZIONI - STUDI - TRIAL CLINICI
          </h3>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 w-1/3 font-medium bg-gray-50">Test</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.tests)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">Certificazioni</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.certifications)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">Trial Clinici</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.clinicalTrials)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">Claim/Indicazioni</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.claims)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Principi attivi */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
            PRINCIPI ATTIVI
          </h3>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 w-1/3 font-medium bg-gray-50">Attivi Naturali</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.naturalActives)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">Attivi Funzionali</td>
                <td className="border border-gray-300 p-2">{formatValue(product?.functionalActives)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Caratteristiche e modo d'uso */}
        <div className="p-4 border-t border-gray-200">
          {product?.type === 'cosmetic' && (
            <>
              <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
                CARATTERISTICHE PRINCIPALI
              </h3>
              <div className="border border-gray-300 p-3 bg-white mb-4">
                {formatMultilineText(product?.characteristics)}
              </div>
            </>
          )}
          
          <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
            {product?.type === 'cosmetic' ? 'MODO D\'USO' : 'MODO D\'USO / POSOLOGIA'}
          </h3>
          <div className="border border-gray-300 p-3 bg-white">
            {formatMultilineText(product?.type === 'cosmetic' ? product?.usage : details?.dosage)}
          </div>
        </div>
        
        {/* Avvertenze */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
            AVVERTENZE
          </h3>
          <div className="border border-gray-300 p-3 bg-white">
            {formatMultilineText(product?.warnings)}
          </div>
        </div>
        
        {/* Sezioni specifiche per integratori */}
        {product?.type === 'supplement' && (
          <>
            <div className="p-4 border-t border-gray-200">
              <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
                MODALITÀ DI CONSERVAZIONE
              </h3>
              <div className="border border-gray-300 p-3 bg-white">
                {formatMultilineText(product?.conservationMethod)}
              </div>
            </div>
            
            {product?.specialWarnings && (
              <div className="p-4 border-t border-gray-200">
                <h3 className="font-bold text-lg mb-3" style={{ color: templateColor.header }}>
                  AVVERTENZE SPECIALI
                </h3>
                <div className="border border-gray-300 p-3 bg-white">
                  {formatMultilineText(product?.specialWarnings)}
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Modulo di approvazione */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="font-bold mb-2">MODULO DI APPROVAZIONE</h3>
          <p className="text-sm mb-3">APPROVAZIONE CLIENTE</p>
          
          <div className="flex space-x-8 mb-4">
            <div className="border border-gray-400 w-10 h-10 flex items-center justify-center bg-white">SI</div>
            <div className="border border-gray-400 w-10 h-10 flex items-center justify-center bg-white">NO</div>
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
          
          <div className="text-center mt-10 mb-4">
            <p className="text-sm">TIMBRO E FIRMA</p>
            <div className="border-b border-gray-400 my-2"></div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4 text-xs text-center text-muted-foreground">
          <p>Laboratorio LFA srl - P.IVA 12345678910 - www.laboratoriolfa.it</p>
          <p>Via Rondinella 12, 03033 Arpino (FR) - Italia</p>
        </div>
      </div>
    </div>
  );
}