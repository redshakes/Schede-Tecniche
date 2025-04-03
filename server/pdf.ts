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
  const templatePath = join(process.cwd(), 'public/templates/cosmetic_template.docx');
  const template = readFileSync(templatePath);
  
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
  const templatePath = join(process.cwd(), 'public/templates/supplement_template.docx');
  const template = readFileSync(templatePath);
  
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
): Promise<Uint8Array> {
  try {
    // Prima genera il DOCX
    const docxBuffer = await generateCosmeticDOCX(product, details);
    
    // Implementa la conversione da DOCX a PDF
    // Nota: in ambiente reale, convertiremmo il DOCX in PDF
    // Poiché la conversione DOCX->PDF è complessa in Node.js senza dipendenze
    // esterne come LibreOffice, restituiremo il DOCX per ora
    
    return Buffer.from(docxBuffer);
  } catch (error) {
    console.error("Errore durante la generazione del PDF cosmetic:", error);
    throw error;
  }
}

/**
 * Genera un PDF per i prodotti integratori
 */
export async function generateSupplementPDF(
  product: Product,
  details: SupplementDetails
): Promise<Uint8Array> {
  try {
    // Prima genera il DOCX
    const docxBuffer = await generateSupplementDOCX(product, details);
    
    // Implementa la conversione da DOCX a PDF
    // Nota: in ambiente reale, convertiremmo il DOCX in PDF
    // Poiché la conversione DOCX->PDF è complessa in Node.js senza dipendenze
    // esterne come LibreOffice, restituiremo il DOCX per ora
    
    return Buffer.from(docxBuffer);
  } catch (error) {
    console.error("Errore durante la generazione del PDF supplement:", error);
    throw error;
  }
}
