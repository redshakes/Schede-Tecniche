import { Product, CosmeticDetails, SupplementDetails } from "@shared/schema";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// Function to generate Markdown content for cosmetic products
export function generateCosmeticMarkdown(
  product: Product,
  details: CosmeticDetails
): string {
  // Format the date properly
  const formattedDate = product.date ? 
    format(new Date(product.date), "dd/MM/yyyy", { locale: it }) : 
    format(new Date(), "dd/MM/yyyy", { locale: it });
  
  return `# ${product.name || 'NOME PRODOTTO'}

${product.subtitle || ''}

Codice Notifica Prodotto in Farmadati: ${product.code || '000000000'}

## Scheda Tecnica Prodotto

**Sede di Campionamento:** Laboratorio LFA – Arpino (FR)  
**Data:** ${formattedDate}  
**Ref.:** ${product.ref || product.name || 'NOME PRODOTTO'}  
**Contenuto:** ${product.content || ''} ℮  
**Macrocategoria:** ${product.category || ''}  
**Packaging Primario:** ${product.packaging || ''}  
**Accessorio:** ${product.accessory || ''}  
**Lotto:** ${product.batch || ''}  
**CPNP:** ${product.cpnp || ''}  

## ANALISI ORGANOLETTICA

**Analisi Organolettica Stato/colore:** ${details.color || ''}  
**Profumazione:** ${details.fragrance || ''}  
**Percezione sensoriale:** ${details.sensorial || ''}  
**Assorbibilità:** ${details.absorbability || ''}  

## ANALISI CHIMICO-FISICA E MICROBIOLOGICA

**pH:** ${details.ph || ''}  
**Viscosità:** ${details.viscosity || ''} cps  
**CBT:** ${details.cbt || ''}  
**Lieviti e muffe:** ${details.yeastAndMold || ''}  
**Escherichia coli:** ${details.escherichiaColi || ''}  
**Pseudomonas auriginosa:** ${details.pseudomonas || ''}  

## COMPOSIZIONE – INGREDIENTI [i.n.c.i.]

${product.ingredients || ''}

## TEST - CERTIFICAZIONI - STUDI SCIENTIFICI - TRIAL CLINICI

**TEST:** ${product.tests || ''}  
**CERTIFICAZIONI:** ${product.certifications || ''}  
**TRIAL CLINICI:** ${product.clinicalTrials || ''}  
**CLAIM/INDICAZIONI SALUTISTICHE:** ${product.claims || ''}  

## PRINCIPI ATTIVI DI ORIGINE VEGETALE - NATURALI IN FORMULA

**Attivi Naturali Selezionati:** ${product.naturalActives || ''}  
**Attivi Funzionali in formula:** ${product.functionalActives || ''}  

## CARATTERISTICHE PRINCIPALI

${product.characteristics || ''}

## MODO D'USO

${product.usage || ''}

## AVVERTENZE

${product.warnings || ''}

## MODULO DI APPROVAZIONE

APPROVAZIONE CLIENTE

- [ ] SI
- [ ] NO

NOTE___________________________________________________________________________________

PER ACCETTAZIONE: apporre una firma/sigla su ogni pagina. Inserire di seguito luogo, data, timbro e firma negli appositi spazi

Luogo _______________________ Data _______________________

Timbro e Firma per Accettazione _______________________________________________________________
`;
}

// Function to generate Markdown content for supplement products
export function generateSupplementMarkdown(
  product: Product,
  details: SupplementDetails
): string {
  // Format the date properly
  const formattedDate = product.date ? 
    format(new Date(product.date), "dd/MM/yyyy", { locale: it }) : 
    format(new Date(), "dd/MM/yyyy", { locale: it });
  
  return `# ${product.name || 'NOME PRODOTTO'}

${product.subtitle || ''}

Codice Notifica Prodotto in Farmadati: ${product.code || '000000000'}

## Scheda Tecnica Prodotto

**Sede di Campionamento:** Laboratorio LFA – via Rondinella Arpino (FR)  
**Data:** ${formattedDate}  
**Ref.:** ${product.ref || product.name || 'NOME PRODOTTO'}  
**Contenuto:** ${product.content || ''} ℮  
**Macrocategoria:** ${product.category || ''}  
**Packaging Primario:** ${product.packaging || ''}  
**Accessorio:** ${product.accessory || ''}  
**Lotto:** ${product.batch || ''}  
**Aut. Min.:** ${product.authMinistry || ''}  

## TEST - CERTIFICAZIONI - STUDI SCIENTIFICI - TRIAL CLINICI

**TEST:** ${product.tests || ''}  
**CERTIFICAZIONI:** ${product.certifications || ''}  
**TRIAL CLINICI:** ${product.clinicalTrials || ''}  
**CLAIM/INDICAZIONI SALUTISTICHE:** ${product.claims || ''}  

## PRINCIPI ATTIVI DI ORIGINE VEGETALE - NATURALI IN FORMULA

**Attivi Naturali Selezionati:** ${product.naturalActives || ''}  
**Attivi Funzionali in formula:** ${product.functionalActives || ''}  

## COMPOSIZIONE – INGREDIENTI [i.n.c.i.]

${product.ingredients || ''}

## TABELLA NUTRIZIONALE

${details.nutritionalInfo || ''}

## INDICAZIONI

${details.indications || ''}

## MODO D'USO / POSOLOGIA

${details.dosage || ''}

## AVVERTENZE

${product.warnings || ''}

## MODALITÀ DI CONSERVAZIONE DEL PRODOTTO

${product.conservationMethod || ''}

## AVVERTENZE SPECIALI

${product.specialWarnings || ''}

## MODULO DI APPROVAZIONE

APPROVAZIONE CLIENTE

- [ ] SI
- [ ] NO

NOTE___________________________________________________________________________________

PER ACCETTAZIONE: apporre una firma/sigla su ogni pagina. Inserire di seguito luogo, data, timbro e firma negli appositi spazi

Luogo _______________________ Data _______________________

Timbro e Firma per Accettazione _______________________________________________________________
`;
}
