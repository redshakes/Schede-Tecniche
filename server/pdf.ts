import { Product, CosmeticDetails, SupplementDetails } from "@shared/schema";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { createReport } from "docx-templates";
import { readFileSync } from "fs";
import { join } from "path";
import { PDFDocument } from "pdf-lib";
import { Buffer } from 'buffer';

// Colori del template
export const TEMPLATE_COLORS = {
  COSMETIC: {
    header: "#00B050", // Verde
    secondary: "#92D050" // Verde chiaro
  },
  SUPPLEMENT: {
    header: "#00B0F0", // Azzurro
    secondary: "#BDD7EE" // Azzurro chiaro
  }
};

/**
 * Genera un documento DOCX basato su un template per i prodotti cosmetici
 */
export async function generateCosmeticDOCX(product: Product, details: CosmeticDetails): Promise<Uint8Array> {
  const templatePath = join(process.cwd(), 'attached_assets/base.docx');
  let template;
  
  try {
    template = readFileSync(templatePath);
  } catch (error) {
    console.error("Errore durante la lettura del template:", error);
    // Fallback a un template vuoto
    template = readFileSync(join(process.cwd(), 'attached_assets/base.docx'));
  }
  
  // Format the date properly
  const formattedDate = product.date ? 
    format(new Date(product.date), "dd/MM/yyyy", { locale: it }) : 
    format(new Date(), "dd/MM/yyyy", { locale: it });
  
  // Preparazione dei dati per il template
  const data = {
    // Intestazione
    NOME_PRODOTTO: product.name || 'NOME PRODOTTO',
    SOTTOTITOLO: product.subtitle || '',
    CODICE: product.code || '000000000',
    
    // Dati prodotto
    DATA: formattedDate,
    REF: product.ref || product.name || 'NOME PRODOTTO',
    CONTENUTO: product.content || '',
    CATEGORIA: product.category || '',
    PACKAGING: product.packaging || '',
    ACCESSORIO: product.accessory || '',
    LOTTO: product.batch || '',
    CPNP: product.cpnp || '',
    
    // Analisi organolettica
    COLORE: details.color || '',
    PROFUMAZIONE: details.fragrance || '',
    PERCEZIONE: details.sensorial || '',
    ASSORBIBILITA: details.absorbability || '',
    
    // Analisi chimico-fisica
    PH: details.ph || '',
    VISCOSITA: details.viscosity || '',
    CBT: details.cbt || '',
    LIEVITI_MUFFE: details.yeastAndMold || '',
    ESCHERICHIA: details.escherichiaColi || '',
    PSEUDOMONAS: details.pseudomonas || '',
    
    // Altre sezioni
    INGREDIENTI: product.ingredients || '',
    TEST: product.tests || '',
    CERTIFICAZIONI: product.certifications || '',
    TRIAL_CLINICI: product.clinicalTrials || '',
    CLAIM: product.claims || '',
    ATTIVI_NATURALI: product.naturalActives || '',
    ATTIVI_FUNZIONALI: product.functionalActives || '',
    CARATTERISTICHE: product.characteristics || '',
    MODO_USO: product.usage || '',
    AVVERTENZE: product.warnings || ''
  };
  
  // Genera il report
  const buffer = await createReport({
    template,
    data
  });
  
  return buffer;
}

/**
 * Genera un documento DOCX basato su un template per i prodotti integratori
 */
export async function generateSupplementDOCX(product: Product, details: SupplementDetails): Promise<Uint8Array> {
  const templatePath = join(process.cwd(), 'attached_assets/base.docx');
  let template;
  
  try {
    template = readFileSync(templatePath);
  } catch (error) {
    console.error("Errore durante la lettura del template:", error);
    // Fallback a un template vuoto
    template = readFileSync(join(process.cwd(), 'attached_assets/base.docx'));
  }
  
  // Format the date properly
  const formattedDate = product.date ? 
    format(new Date(product.date), "dd/MM/yyyy", { locale: it }) : 
    format(new Date(), "dd/MM/yyyy", { locale: it });
  
  // Preparazione dei dati per il template
  const data = {
    // Intestazione
    NOME_PRODOTTO: product.name || 'NOME PRODOTTO',
    SOTTOTITOLO: product.subtitle || '',
    CODICE: product.code || '000000000',
    
    // Dati prodotto
    DATA: formattedDate,
    REF: product.ref || product.name || 'NOME PRODOTTO',
    CONTENUTO: product.content || '',
    CATEGORIA: product.category || '',
    PACKAGING: product.packaging || '',
    ACCESSORIO: product.accessory || '',
    LOTTO: product.batch || '',
    AUT_MIN: product.authMinistry || '',
    
    // Sezioni specifiche
    TEST: product.tests || '',
    CERTIFICAZIONI: product.certifications || '',
    TRIAL_CLINICI: product.clinicalTrials || '',
    CLAIM: product.claims || '',
    ATTIVI_NATURALI: product.naturalActives || '',
    ATTIVI_FUNZIONALI: product.functionalActives || '',
    INGREDIENTI: product.ingredients || '',
    INFO_NUTRIZIONALI: details.nutritionalInfo || '',
    INDICAZIONI: details.indications || '',
    POSOLOGIA: details.dosage || '',
    AVVERTENZE: product.warnings || '',
    CONSERVAZIONE: product.conservationMethod || '',
    AVV_SPECIALI: product.specialWarnings || ''
  };
  
  // Genera il report
  const buffer = await createReport({
    template,
    data
  });
  
  return buffer;
}

/**
 * Genera un PDF per i prodotti cosmetici
 */
export async function generateCosmeticPDF(
  product: Product,
  details: CosmeticDetails
): Promise<Buffer> {
  try {
    // Helper per formattare testo multilinea in HTML
    const formatMultilineText = (text: string | null): string => {
      if (!text) return '';
      return text.split('\n').map(line => `<div class="line">${line}</div>`).join('');
    };
    
    // Converti in HTML migliorato per la preview nel browser
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Scheda Tecnica: ${product.name}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 5px;
            overflow: hidden;
          }
          .header {
            background-color: ${TEMPLATE_COLORS.COSMETIC.header};
            color: white;
            padding: 15px;
            text-align: center;
          }
          .title-container {
            text-align: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
          }
          h1 { 
            margin: 0;
            font-size: 24px;
          }
          h2 { 
            color: ${TEMPLATE_COLORS.COSMETIC.header};
            font-size: 18px;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          .content {
            padding: 20px;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom: 20px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f2f2f2; 
            width: 35%;
          }
          .info-box {
            border: 1px solid #ddd;
            padding: 10px;
            background-color: white;
            margin-bottom: 20px;
          }
          .line {
            margin-bottom: 5px;
          }
          .footer {
            background-color: #f2f2f2;
            padding: 20px;
            border-top: 1px solid #ddd;
          }
          .approval-box {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 1px solid #666;
            margin-right: 30px;
            text-align: center;
            line-height: 40px;
            background-color: white;
          }
          .line-field {
            margin: 15px 0;
            border-bottom: 1px solid #999;
          }
          .signature {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SCHEDA TECNICA PRODOTTO</h1>
          </div>
          
          <div class="title-container">
            <h2 style="color: #333;">${product.name || 'NOME PRODOTTO'}</h2>
            ${product.subtitle ? `<p>${product.subtitle}</p>` : ''}
            <p>CPNP: ${product.cpnp || '—'}</p>
          </div>
          
          <div class="content">
            <table>
              <tr>
                <th>Sede di Campionamento</th>
                <td>Laboratorio LFA – Arpino (FR)</td>
              </tr>
              <tr>
                <th>Data</th>
                <td>${product.date || '—'}</td>
              </tr>
              <tr>
                <th>Riferimento</th>
                <td>${product.ref || '—'}</td>
              </tr>
              <tr>
                <th>Contenuto</th>
                <td>${product.content ? `${product.content} ℮` : '—'}</td>
              </tr>
              <tr>
                <th>Macrocategoria</th>
                <td>${product.category || '—'}</td>
              </tr>
              <tr>
                <th>Packaging Primario</th>
                <td>${product.packaging || '—'}</td>
              </tr>
              <tr>
                <th>Accessorio</th>
                <td>${product.accessory || '—'}</td>
              </tr>
              <tr>
                <th>Lotto</th>
                <td>${product.batch || '—'}</td>
              </tr>
              <tr>
                <th>CPNP</th>
                <td>${product.cpnp || '—'}</td>
              </tr>
            </table>
            
            <h2>ANALISI ORGANOLETTICA</h2>
            <table>
              <tr>
                <th>Stato/colore</th>
                <td>${details.color || '—'}</td>
              </tr>
              <tr>
                <th>Profumazione</th>
                <td>${details.fragrance || '—'}</td>
              </tr>
              <tr>
                <th>Percezione sensoriale</th>
                <td>${details.sensorial || '—'}</td>
              </tr>
              <tr>
                <th>Assorbibilità</th>
                <td>${details.absorbability || '—'}</td>
              </tr>
            </table>
            
            <h2>ANALISI CHIMICO-FISICA E MICROBIOLOGICA</h2>
            <table>
              <tr>
                <th>pH</th>
                <td>${details.ph || '—'}</td>
              </tr>
              <tr>
                <th>Viscosità</th>
                <td>${details.viscosity ? `${details.viscosity} cps` : '—'}</td>
              </tr>
              <tr>
                <th>CBT</th>
                <td>${details.cbt || '—'}</td>
              </tr>
              <tr>
                <th>Lieviti e muffe</th>
                <td>${details.yeastAndMold || '—'}</td>
              </tr>
              <tr>
                <th>Escherichia coli</th>
                <td>${details.escherichiaColi || '—'}</td>
              </tr>
              <tr>
                <th>Pseudomonas auriginosa</th>
                <td>${details.pseudomonas || '—'}</td>
              </tr>
            </table>
            
            <h2>COMPOSIZIONE – INGREDIENTI [i.n.c.i.]</h2>
            <div class="info-box">
              ${formatMultilineText(product.ingredients)}
            </div>
            
            <h2>TEST - CERTIFICAZIONI - STUDI - TRIAL CLINICI</h2>
            <table>
              <tr>
                <th>Test</th>
                <td>${product.tests || '—'}</td>
              </tr>
              <tr>
                <th>Certificazioni</th>
                <td>${product.certifications || '—'}</td>
              </tr>
              <tr>
                <th>Trial Clinici</th>
                <td>${product.clinicalTrials || '—'}</td>
              </tr>
              <tr>
                <th>Claim/Indicazioni</th>
                <td>${product.claims || '—'}</td>
              </tr>
            </table>
            
            <h2>PRINCIPI ATTIVI</h2>
            <table>
              <tr>
                <th>Attivi Naturali</th>
                <td>${product.naturalActives || '—'}</td>
              </tr>
              <tr>
                <th>Attivi Funzionali</th>
                <td>${product.functionalActives || '—'}</td>
              </tr>
            </table>
            
            <h2>CARATTERISTICHE PRINCIPALI</h2>
            <div class="info-box">
              ${formatMultilineText(product.characteristics)}
            </div>
            
            <h2>MODO D'USO</h2>
            <div class="info-box">
              ${formatMultilineText(product.usage)}
            </div>
            
            <h2>AVVERTENZE</h2>
            <div class="info-box">
              ${formatMultilineText(product.warnings)}
            </div>
            
            <div class="footer">
              <h3>MODULO DI APPROVAZIONE</h3>
              <p>APPROVAZIONE CLIENTE</p>
              
              <div>
                <div class="approval-box">SI</div>
                <div class="approval-box">NO</div>
              </div>
              
              <p>NOTE<span class="line-field">_____________________________________</span></p>
              
              <p>PER ACCETTAZIONE: apporre una firma/sigla su ogni pagina. Inserire di seguito luogo, data, timbro e firma negli appositi spazi</p>
              
              <div class="signature">
                <div>
                  <p>Luogo <span class="line-field">______________</span></p>
                </div>
                <div>
                  <p>Data <span class="line-field">______________</span></p>
                </div>
              </div>
              
              <p>Timbro e Firma per Accettazione <span class="line-field">__________________________</span></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return Buffer.from(html);
  } catch (error) {
    console.error('Errore nella generazione del PDF cosmetico:', error);
    throw new Error(`Errore nella generazione del PDF: ${error}`);
  }
}

/**
 * Genera un PDF per i prodotti integratori
 */
export async function generateSupplementPDF(
  product: Product,
  details: SupplementDetails
): Promise<Buffer> {
  try {
    // Helper per formattare testo multilinea in HTML
    const formatMultilineText = (text: string | null): string => {
      if (!text) return '';
      return text.split('\n').map(line => `<div class="line">${line}</div>`).join('');
    };
    
    // Converti in HTML migliorato per la preview nel browser
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Scheda Tecnica: ${product.name}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 5px;
            overflow: hidden;
          }
          .header {
            background-color: ${TEMPLATE_COLORS.SUPPLEMENT.header};
            color: white;
            padding: 15px;
            text-align: center;
          }
          .title-container {
            text-align: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
          }
          h1 { 
            margin: 0;
            font-size: 24px;
          }
          h2 { 
            color: ${TEMPLATE_COLORS.SUPPLEMENT.header};
            font-size: 18px;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          .content {
            padding: 20px;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom: 20px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f2f2f2; 
            width: 35%;
          }
          .info-box {
            border: 1px solid #ddd;
            padding: 10px;
            background-color: white;
            margin-bottom: 20px;
          }
          .line {
            margin-bottom: 5px;
          }
          .footer {
            background-color: #f2f2f2;
            padding: 20px;
            border-top: 1px solid #ddd;
          }
          .approval-box {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 1px solid #666;
            margin-right: 30px;
            text-align: center;
            line-height: 40px;
            background-color: white;
          }
          .line-field {
            margin: 15px 0;
            border-bottom: 1px solid #999;
          }
          .signature {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SCHEDA TECNICA PRODOTTO</h1>
          </div>
          
          <div class="title-container">
            <h2 style="color: #333;">${product.name || 'NOME PRODOTTO'}</h2>
            ${product.subtitle ? `<p>${product.subtitle}</p>` : ''}
            <p>Aut. Min.: ${product.authMinistry || '—'}</p>
          </div>
          
          <div class="content">
            <table>
              <tr>
                <th>Sede di Campionamento</th>
                <td>Laboratorio LFA – via Rondinella Arpino (FR)</td>
              </tr>
              <tr>
                <th>Data</th>
                <td>${product.date || '—'}</td>
              </tr>
              <tr>
                <th>Riferimento</th>
                <td>${product.ref || '—'}</td>
              </tr>
              <tr>
                <th>Contenuto</th>
                <td>${product.content ? `${product.content} ℮` : '—'}</td>
              </tr>
              <tr>
                <th>Macrocategoria</th>
                <td>${product.category || '—'}</td>
              </tr>
              <tr>
                <th>Packaging Primario</th>
                <td>${product.packaging || '—'}</td>
              </tr>
              <tr>
                <th>Accessorio</th>
                <td>${product.accessory || '—'}</td>
              </tr>
              <tr>
                <th>Lotto</th>
                <td>${product.batch || '—'}</td>
              </tr>
              <tr>
                <th>Autorizzazione Ministeriale</th>
                <td>${product.authMinistry || '—'}</td>
              </tr>
            </table>
            
            <h2>COMPOSIZIONE – INGREDIENTI</h2>
            <div class="info-box">
              ${formatMultilineText(product.ingredients)}
            </div>
            
            <h2>TABELLA NUTRIZIONALE</h2>
            <div class="info-box">
              ${formatMultilineText(details.nutritionalInfo)}
            </div>
            
            <h2>INDICAZIONI</h2>
            <div class="info-box">
              ${formatMultilineText(details.indications)}
            </div>
            
            <h2>TEST - CERTIFICAZIONI - STUDI - TRIAL CLINICI</h2>
            <table>
              <tr>
                <th>Test</th>
                <td>${product.tests || '—'}</td>
              </tr>
              <tr>
                <th>Certificazioni</th>
                <td>${product.certifications || '—'}</td>
              </tr>
              <tr>
                <th>Trial Clinici</th>
                <td>${product.clinicalTrials || '—'}</td>
              </tr>
              <tr>
                <th>Claim/Indicazioni</th>
                <td>${product.claims || '—'}</td>
              </tr>
            </table>
            
            <h2>PRINCIPI ATTIVI</h2>
            <table>
              <tr>
                <th>Attivi Naturali</th>
                <td>${product.naturalActives || '—'}</td>
              </tr>
              <tr>
                <th>Attivi Funzionali</th>
                <td>${product.functionalActives || '—'}</td>
              </tr>
            </table>
            
            <h2>CARATTERISTICHE PRINCIPALI</h2>
            <div class="info-box">
              ${formatMultilineText(product.characteristics)}
            </div>
            
            <h2>MODO D'USO / POSOLOGIA</h2>
            <div class="info-box">
              ${formatMultilineText(details.dosage)}
            </div>
            
            <h2>AVVERTENZE</h2>
            <div class="info-box">
              ${formatMultilineText(product.warnings)}
            </div>
            
            <h2>MODALITÀ DI CONSERVAZIONE</h2>
            <div class="info-box">
              ${formatMultilineText(product.conservationMethod)}
            </div>
            
            ${product.specialWarnings ? `
              <h2>AVVERTENZE SPECIALI</h2>
              <div class="info-box">
                ${formatMultilineText(product.specialWarnings)}
              </div>
            ` : ''}
            
            <div class="footer">
              <h3>MODULO DI APPROVAZIONE</h3>
              <p>APPROVAZIONE CLIENTE</p>
              
              <div>
                <div class="approval-box">SI</div>
                <div class="approval-box">NO</div>
              </div>
              
              <p>NOTE<span class="line-field">_____________________________________</span></p>
              
              <p>PER ACCETTAZIONE: apporre una firma/sigla su ogni pagina. Inserire di seguito luogo, data, timbro e firma negli appositi spazi</p>
              
              <div class="signature">
                <div>
                  <p>Luogo <span class="line-field">______________</span></p>
                </div>
                <div>
                  <p>Data <span class="line-field">______________</span></p>
                </div>
              </div>
              
              <p>Timbro e Firma per Accettazione <span class="line-field">__________________________</span></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return Buffer.from(html);
  } catch (error) {
    console.error('Errore nella generazione del PDF integratore:', error);
    throw new Error(`Errore nella generazione del PDF: ${error}`);
  }
}