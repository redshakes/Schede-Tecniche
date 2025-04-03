import { Product, CosmeticDetails, SupplementDetails } from "@shared/schema";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// Function to generate PDF content for cosmetic products
export function generateCosmeticPDF(
  product: Product,
  details: CosmeticDetails
): string {
  // Format the date properly
  const formattedDate = product.date ? 
    format(new Date(product.date), "dd/MM/yyyy", { locale: it }) : 
    format(new Date(), "dd/MM/yyyy", { locale: it });
  
  // Create HTML template for the PDF
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Scheda Tecnica - ${product.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.4; }
        h1, h2 { text-align: center; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-top: 20px; }
        .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
        .product-info { display: grid; grid-template-columns: 1fr 1fr; grid-gap: 10px; }
        .label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .approval-section { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
        .signature-line { border-top: 1px solid #333; margin-top: 50px; width: 40%; display: inline-block; }
        .approval-boxes { display: flex; gap: 20px; margin: 20px 0; }
        .approval-box { border: 1px solid #333; width: 30px; height: 30px; display: inline-block; text-align: center; line-height: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${product.name || 'NOME PRODOTTO'}</h1>
        <p>${product.subtitle || ''}</p>
        <p>Codice Notifica Prodotto in Farmadati: ${product.code || '000000000'}</p>
        <h2>Scheda Tecnica Prodotto</h2>
      </div>
      
      <div class="product-info">
        <p><span class="label">Sede di Campionamento:</span> Laboratorio LFA – Arpino (FR)</p>
        <p><span class="label">Data:</span> ${formattedDate}</p>
        <p><span class="label">Ref.:</span> ${product.ref || product.name || 'NOME PRODOTTO'}</p>
        <p><span class="label">Contenuto:</span> ${product.content || ''} ℮</p>
        <p><span class="label">Macrocategoria:</span> ${product.category || ''}</p>
        <p><span class="label">Packaging Primario:</span> ${product.packaging || ''}</p>
        <p><span class="label">Accessorio:</span> ${product.accessory || ''}</p>
        <p><span class="label">Lotto:</span> ${product.batch || ''}</p>
        <p><span class="label">CPNP:</span> ${product.cpnp || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">ANALISI ORGANOLETTICA</h3>
        <p><span class="label">Analisi Organolettica Stato/colore:</span> ${details.color || ''}</p>
        <p><span class="label">Profumazione:</span> ${details.fragrance || ''}</p>
        <p><span class="label">Percezione sensoriale:</span> ${details.sensorial || ''}</p>
        <p><span class="label">Assorbibilità:</span> ${details.absorbability || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">ANALISI CHIMICO-FISICA E MICROBIOLOGICA</h3>
        <p><span class="label">pH:</span> ${details.ph || ''}</p>
        <p><span class="label">Viscosità:</span> ${details.viscosity || ''} cps</p>
        <p><span class="label">CBT:</span> ${details.cbt || ''}</p>
        <p><span class="label">Lieviti e muffe:</span> ${details.yeastAndMold || ''}</p>
        <p><span class="label">Escherichia coli:</span> ${details.escherichiaColi || ''}</p>
        <p><span class="label">Pseudomonas auriginosa:</span> ${details.pseudomonas || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">COMPOSIZIONE – INGREDIENTI [i.n.c.i.]</h3>
        <p>${product.ingredients || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">TEST - CERTIFICAZIONI - STUDI SCIENTIFICI - TRIAL CLINICI</h3>
        <p><span class="label">TEST:</span> ${product.tests || ''}</p>
        <p><span class="label">CERTIFICAZIONI:</span> ${product.certifications || ''}</p>
        <p><span class="label">TRIAL CLINICI:</span> ${product.clinicalTrials || ''}</p>
        <p><span class="label">CLAIM/INDICAZIONI SALUTISTICHE:</span> ${product.claims || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">PRINCIPI ATTIVI DI ORIGINE VEGETALE - NATURALI IN FORMULA</h3>
        <p><span class="label">Attivi Naturali Selezionati:</span> ${product.naturalActives || ''}</p>
        <p><span class="label">Attivi Funzionali in formula:</span> ${product.functionalActives || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">CARATTERISTICHE PRINCIPALI</h3>
        <p>${product.characteristics || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">MODO D'USO</h3>
        <p>${product.usage || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">AVVERTENZE</h3>
        <p>${product.warnings || ''}</p>
      </div>
      
      <div class="approval-section">
        <h3>MODULO DI APPROVAZIONE</h3>
        <p>APPROVAZIONE CLIENTE</p>
        
        <div class="approval-boxes">
          <div class="approval-box">SI</div>
          <div class="approval-box">NO</div>
        </div>
        
        <p>NOTE___________________________________________________________________________________</p>
        
        <p>PER ACCETTAZIONE: apporre una firma/sigla su ogni pagina. Inserire di seguito luogo, data, timbro e firma negli appositi spazi</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div>
            <p>Luogo _______________________</p>
          </div>
          <div>
            <p>Data _______________________</p>
          </div>
        </div>
        
        <div style="margin-top: 60px;">
          <p>Timbro e Firma per Accettazione _______________________________________________________________</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Function to generate PDF content for supplement products
export function generateSupplementPDF(
  product: Product,
  details: SupplementDetails
): string {
  // Format the date properly  
  const formattedDate = product.date ? 
    format(new Date(product.date), "dd/MM/yyyy", { locale: it }) : 
    format(new Date(), "dd/MM/yyyy", { locale: it });
  
  // Create HTML template for the PDF
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Scheda Tecnica - ${product.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.4; }
        h1, h2 { text-align: center; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-top: 20px; }
        .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
        .product-info { display: grid; grid-template-columns: 1fr 1fr; grid-gap: 10px; }
        .label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .approval-section { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
        .signature-line { border-top: 1px solid #333; margin-top: 50px; width: 40%; display: inline-block; }
        .approval-boxes { display: flex; gap: 20px; margin: 20px 0; }
        .approval-box { border: 1px solid #333; width: 30px; height: 30px; display: inline-block; text-align: center; line-height: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${product.name || 'NOME PRODOTTO'}</h1>
        <p>${product.subtitle || ''}</p>
        <p>Codice Notifica Prodotto in Farmadati: ${product.code || '000000000'}</p>
        <h2>Scheda Tecnica Prodotto</h2>
      </div>
      
      <div class="product-info">
        <p><span class="label">Sede di Campionamento:</span> Laboratorio LFA – via Rondinella Arpino (FR)</p>
        <p><span class="label">Data:</span> ${formattedDate}</p>
        <p><span class="label">Ref.:</span> ${product.ref || product.name || 'NOME PRODOTTO'}</p>
        <p><span class="label">Contenuto:</span> ${product.content || ''} ℮</p>
        <p><span class="label">Macrocategoria:</span> ${product.category || ''}</p>
        <p><span class="label">Packaging Primario:</span> ${product.packaging || ''}</p>
        <p><span class="label">Accessorio:</span> ${product.accessory || ''}</p>
        <p><span class="label">Lotto:</span> ${product.batch || ''}</p>
        <p><span class="label">Aut. Min.:</span> ${product.authMinistry || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">TEST - CERTIFICAZIONI - STUDI SCIENTIFICI - TRIAL CLINICI</h3>
        <p><span class="label">TEST:</span> ${product.tests || ''}</p>
        <p><span class="label">CERTIFICAZIONI:</span> ${product.certifications || ''}</p>
        <p><span class="label">TRIAL CLINICI:</span> ${product.clinicalTrials || ''}</p>
        <p><span class="label">CLAIM/INDICAZIONI SALUTISTICHE:</span> ${product.claims || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">PRINCIPI ATTIVI DI ORIGINE VEGETALE - NATURALI IN FORMULA</h3>
        <p><span class="label">Attivi Naturali Selezionati:</span> ${product.naturalActives || ''}</p>
        <p><span class="label">Attivi Funzionali in formula:</span> ${product.functionalActives || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">COMPOSIZIONE – INGREDIENTI [i.n.c.i.]</h3>
        <p>${product.ingredients || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">TABELLA NUTRIZIONALE</h3>
        <p>${details.nutritionalInfo || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">INDICAZIONI</h3>
        <p>${details.indications || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">MODO D'USO / POSOLOGIA</h3>
        <p>${details.dosage || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">AVVERTENZE</h3>
        <p>${product.warnings || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">MODALITÀ DI CONSERVAZIONE DEL PRODOTTO</h3>
        <p>${product.conservationMethod || ''}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">AVVERTENZE SPECIALI</h3>
        <p>${product.specialWarnings || ''}</p>
      </div>
      
      <div class="approval-section">
        <h3>MODULO DI APPROVAZIONE</h3>
        <p>APPROVAZIONE CLIENTE</p>
        
        <div class="approval-boxes">
          <div class="approval-box">SI</div>
          <div class="approval-box">NO</div>
        </div>
        
        <p>NOTE___________________________________________________________________________________</p>
        
        <p>PER ACCETTAZIONE: apporre una firma/sigla su ogni pagina. Inserire di seguito luogo, data, timbro e firma negli appositi spazi</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div>
            <p>Luogo _______________________</p>
          </div>
          <div>
            <p>Data _______________________</p>
          </div>
        </div>
        
        <div style="margin-top: 60px;">
          <p>Timbro e Firma per Accettazione _______________________________________________________________</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
