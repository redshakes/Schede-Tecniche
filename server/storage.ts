import { users, products, cosmeticDetails, supplementDetails, groups } from "@shared/schema";
import type { User, InsertUser, Product, InsertProduct, CosmeticDetails, InsertCosmeticDetails, SupplementDetails, InsertSupplementDetails, Group, InsertGroup } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // Group operations
  createGroup(group: InsertGroup): Promise<Group>;
  getGroup(id: number): Promise<Group | undefined>;
  getGroups(): Promise<Group[]>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(type?: string, groupId?: number, approvedOnly?: boolean): Promise<Product[]>; // approvedOnly per visualizzatori
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  autosaveProduct(id: number, data: any): Promise<boolean>;
  getProductAutosave(id: number): Promise<any>;
  
  // Product completion and approval operations
  checkProductCompleteness(id: number): Promise<boolean>;
  updateProductCompleteness(id: number): Promise<Product | undefined>;
  approveProduct(productId: number, userId: number): Promise<Product | undefined>;
  unapproveProduct(productId: number): Promise<Product | undefined>;
  
  // Cosmetic details operations
  createCosmeticDetails(details: InsertCosmeticDetails): Promise<CosmeticDetails>;
  getCosmeticDetailsByProductId(productId: number): Promise<CosmeticDetails | undefined>;
  updateCosmeticDetails(productId: number, details: Partial<InsertCosmeticDetails>): Promise<CosmeticDetails | undefined>;
  
  // Supplement details operations
  createSupplementDetails(details: InsertSupplementDetails): Promise<SupplementDetails>;
  getSupplementDetailsByProductId(productId: number): Promise<SupplementDetails | undefined>;
  updateSupplementDetails(productId: number, details: Partial<InsertSupplementDetails>): Promise<SupplementDetails | undefined>;
  
  // Suggestion operations
  getSuggestions(field: string, prefix: string): Promise<string[]>;
  
  // Session store
  sessionStore: session.Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cosmeticDetails: Map<number, CosmeticDetails>;
  private supplementDetails: Map<number, SupplementDetails>;
  private groups: Map<number, Group>;
  private fieldValues: Map<string, Set<string>>;
  private userId: number;
  private productId: number;
  private cosmeticId: number;
  private supplementId: number;
  private groupId: number;
  sessionStore: session.Store;
  
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cosmeticDetails = new Map();
    this.supplementDetails = new Map();
    this.groups = new Map();
    this.fieldValues = new Map();
    this.userId = 1;
    this.productId = 1;
    this.cosmeticId = 1;
    this.supplementId = 1;
    this.groupId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });

    // Setup iniziale con dati di esempio e configurazione
    this.initializeData();
  }
  
  // Metodo per inizializzare tutti i dati 
  private async initializeData() {
    // Crea utenti
    await this.createInitialUsers();
    
    // Crea prodotti di esempio
    await this.createSampleProducts();
    
    // Configura l'accesso del visualizzatore al gruppo predefinito
    const users = await this.getUsers();
    const visualizzatore = users.find(user => user.role === 'visualizzatore');
    if (visualizzatore) {
      visualizzatore.allowedGroups = ["1"]; // Assegna l'accesso al gruppo con ID 1
      this.users.set(visualizzatore.id, visualizzatore);
    }
  }
  
  // Implementazione metodi dei gruppi
  async createGroup(group: InsertGroup): Promise<Group> {
    const id = this.groupId++;
    const createdAt = new Date();
    
    const newGroup: Group = {
      ...group,
      id,
      createdAt,
      description: group.description || null
    };
    
    this.groups.set(id, newGroup);
    return newGroup;
  }
  
  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }
  
  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }
  
  async updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined> {
    const existingGroup = this.groups.get(id);
    if (!existingGroup) return undefined;
    
    const updatedGroup: Group = {
      ...existingGroup,
      ...group
    };
    
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }
  
  async deleteGroup(id: number): Promise<boolean> {
    return this.groups.delete(id);
  }
  
  // Metodo per ottenere suggerimenti
  async getSuggestions(field: string, prefix: string): Promise<string[]> {
    if (!this.fieldValues.has(field)) {
      return [];
    }
    
    const prefixLower = prefix.toLowerCase();
    const fieldSet = this.fieldValues.get(field)!;
    
    return Array.from(fieldSet)
      .filter(value => value.toLowerCase().includes(prefixLower))
      .slice(0, 10); // limit results
  }

  // Autosave
  async autosaveProduct(id: number, data: any): Promise<boolean> {
    const product = await this.getProduct(id);
    if (!product) return false;
    
    product.lastAutosave = data;
    this.products.set(id, product);
    return true;
  }
  
  async getProductAutosave(id: number): Promise<any> {
    const product = await this.getProduct(id);
    return product?.lastAutosave || null;
  }
  
  // Crea prodotti di esempio per testing
  private async createSampleProducts() {
    // Primo prodotto - Cosmetico
    const cosmeticProduct: InsertProduct = {
      name: "Crema Idratante Antirughe",
      subtitle: "Con Acido Ialuronico",
      type: "cosmetic",
      code: "COS-001",
      ref: "LFA-COS-001",
      date: new Date().toISOString().split('T')[0],
      content: "50ml",
      category: "Creme Viso",
      packaging: "Vasetto in vetro con tappo in alluminio",
      batch: "LFA2023-01",
      cpnp: "IT12345",
      ingredients: "Aqua, Glycerin, Hydroxyethylcellulose, Sodium Hyaluronate, Tocopherol, Parfum, Phenoxyethanol",
      naturalActives: "Acido Ialuronico, Vitamina E",
      functionalActives: "Complesso idratante, Antiossidanti",
      characteristics: "Crema dalla texture leggera e facilmente assorbibile",
      usage: "Applicare mattina e sera sul viso pulito e asciutto con movimenti circolari",
      warnings: "Evitare il contatto con gli occhi",
      groupId: 1,
      isComplete: true,
      isApproved: true,
      approvedBy: 1,
      approvedDate: new Date()
    };
    
    const createdCosmetic = await this.createProduct(cosmeticProduct);
    
    const cosmeticDetailsData: InsertCosmeticDetails = {
      productId: createdCosmetic.id,
      color: "Bianco perlescente",
      fragrance: "Delicata, note floreali",
      sensorial: "Texture leggera e setosa",
      absorbability: "Rapido assorbimento",
      ph: "5.5",
      viscosity: "Media",
      cbt: "< 100 UFC/g",
      yeastAndMold: "< 10 UFC/g",
      escherichiaColi: "Assente",
      pseudomonas: "Assente"
    };
    
    await this.createCosmeticDetails(cosmeticDetailsData);
    
    // Secondo prodotto - Integratore
    const supplementProduct: InsertProduct = {
      name: "Vitamina C Complex",
      subtitle: "Con Rosa Canina e Bioflavonoidi",
      type: "supplement",
      code: "SUP-001",
      ref: "LFA-SUP-001",
      date: new Date().toISOString().split('T')[0],
      content: "60 compresse",
      category: "Integratori Vitaminici",
      packaging: "Flacone in HDPE con tappo di sicurezza",
      batch: "LFA2023-02",
      authMinistry: "IT-AUT-12345",
      ingredients: "Acido L-ascorbico, Estratto secco di Rosa canina, Bioflavonoidi da agrumi, Cellulosa microcristallina, Magnesio stearato",
      naturalActives: "Rosa canina, Bioflavonoidi",
      functionalActives: "Vitamina C",
      characteristics: "Integratore alimentare con vitamina C ad alta biodisponibilità",
      warnings: "Non superare la dose giornaliera consigliata. Tenere fuori dalla portata dei bambini di età inferiore a 3 anni",
      conservationMethod: "Conservare in luogo fresco e asciutto, al riparo dalla luce",
      groupId: 1,
      isComplete: true,
      isApproved: false
    };
    
    const createdSupplement = await this.createProduct(supplementProduct);
    
    const supplementDetailsData: InsertSupplementDetails = {
      productId: createdSupplement.id,
      nutritionalInfo: "Vitamina C: 1000 mg (1250% VNR*)\nRosa canina e.s.: 200 mg\nBioflavonoidi: 100 mg\n*VNR: Valori Nutritivi di Riferimento",
      indications: "Integratore alimentare utile in caso di carenza o aumentato fabbisogno di vitamina C. Contribuisce alla normale funzione del sistema immunitario e alla protezione delle cellule dallo stress ossidativo",
      dosage: "1 compressa al giorno, preferibilmente ai pasti"
    };
    
    await this.createSupplementDetails(supplementDetailsData);
  }

  private async createInitialUsers() {
    // Funzione per hashare password direttamente qui
    const hashPassword = async (password: string) => {
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      return `${buf.toString("hex")}.${salt}`;
    };
    
    // Creare una password "admin" hashata
    const commonPassword = await hashPassword("admin");
    
    // Amministratore
    const admin = {
      id: this.userId++,
      username: "admin",
      password: commonPassword, // password: admin
      email: "admin@example.com",
      name: "Amministratore",
      company: "LFA",
      role: "amministratore",
      approved: true,
      allowedGroups: [],
      createdAt: new Date()
    };
    this.users.set(admin.id, admin);

    // Compilatore
    const compiler = {
      id: this.userId++,
      username: "compilatore",
      password: commonPassword, // password: admin
      email: "compilatore@example.com",
      name: "Compilatore LFA",
      company: "LFA",
      role: "compilatore",
      approved: true,
      allowedGroups: [],
      createdAt: new Date()
    };
    this.users.set(compiler.id, compiler);

    // Visualizzatore
    const viewer = {
      id: this.userId++,
      username: "visualizzatore",
      password: commonPassword, // password: admin
      email: "visualizzatore@example.com",
      name: "Visualizzatore LFA",
      company: "LFA",
      role: "visualizzatore",
      approved: true,
      allowedGroups: [],
      createdAt: new Date()
    };
    this.users.set(viewer.id, viewer);

    // Guest
    const guest = {
      id: this.userId++,
      username: "guest",
      password: commonPassword, // password: admin
      email: "guest@example.com",
      name: "Guest LFA",
      company: "LFA",
      role: "guest",
      approved: false,
      allowedGroups: [],
      createdAt: new Date()
    };
    this.users.set(guest.id, guest);
    
    // Creiamo anche un gruppo di default
    const defaultGroup = {
      id: this.groupId++,
      name: "Gruppo Default",
      description: "Gruppo predefinito per tutte le schede tecniche",
      createdAt: new Date()
    };
    this.groups.set(defaultGroup.id, defaultGroup);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    
    // Assicuriamoci che i campi obbligatori siano impostati
    const user: User = { 
      id, 
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      name: insertUser.name,
      company: insertUser.company || null,
      createdAt,
      role: insertUser.role || "visualizzatore",
      approved: insertUser.approved !== undefined ? insertUser.approved : false,
      allowedGroups: insertUser.allowedGroups || null
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    // Gestiamo esplicitamente il campo company per evitare problemi di tipo
    const updatedUser: User = {
      ...existingUser,
      username: userUpdate.username !== undefined ? userUpdate.username : existingUser.username,
      password: userUpdate.password !== undefined ? userUpdate.password : existingUser.password,
      email: userUpdate.email !== undefined ? userUpdate.email : existingUser.email,
      name: userUpdate.name !== undefined ? userUpdate.name : existingUser.name,
      company: userUpdate.company !== undefined ? userUpdate.company : existingUser.company,
      role: userUpdate.role !== undefined ? userUpdate.role : existingUser.role,
      approved: userUpdate.approved !== undefined ? userUpdate.approved : existingUser.approved,
      allowedGroups: userUpdate.allowedGroups !== undefined ? userUpdate.allowedGroups : existingUser.allowedGroups
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product methods
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    // Per assicurarci che tutti i campi siano impostati correttamente
    const product: Product = { 
      // Valori di default per tutti i campi
      id,
      createdAt,
      updatedAt,
      subtitle: null,
      code: null,
      ref: null,
      date: null,
      content: null,
      category: null,
      packaging: null,
      accessory: null,
      batch: null,
      cpnp: null,
      authMinistry: null,
      ingredients: null,
      tests: null,
      certifications: null,
      clinicalTrials: null,
      claims: null,
      naturalActives: null,
      functionalActives: null,
      characteristics: null,
      usage: null,
      warnings: null,
      conservationMethod: null,
      specialWarnings: null,
      groupId: null,
      isComplete: false,
      isApproved: false,
      approvedBy: null,
      approvedDate: null,
      lastAutosave: null,
      
      // Override con i valori inseriti
      ...insertProduct
    };
    
    this.products.set(id, product);
    
    // Store field values for autocomplete suggestions
    this.storeFieldValues(product);
    
    return product;
  }
  
  // Metodo di utilità per memorizzare i valori dei campi per i suggerimenti
  private storeFieldValues(product: Product): void {
    Object.entries(product).forEach(([field, value]) => {
      // Saltiamo campi che non sono stringhe o sono vuoti/null
      if (typeof value !== 'string' || !value) return;
      
      if (!this.fieldValues.has(field)) {
        this.fieldValues.set(field, new Set());
      }
      
      const fieldSet = this.fieldValues.get(field)!;
      fieldSet.add(value);
    });
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(type?: string, groupId?: number, approvedOnly?: boolean): Promise<Product[]> {
    let allProducts = Array.from(this.products.values());
    
    if (type) {
      allProducts = allProducts.filter(product => product.type === type);
    }
    
    if (groupId !== undefined) {
      allProducts = allProducts.filter(product => product.groupId === groupId);
    }
    
    // Se è richiesto di filtrare solo i prodotti approvati (per i visualizzatori)
    if (approvedOnly) {
      allProducts = allProducts.filter(product => product.isApproved === true);
    }
    
    return allProducts;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...product,
      updatedAt: new Date()
    };
    
    this.products.set(id, updatedProduct);
    
    // Aggiorna automaticamente lo stato di completezza
    await this.updateProductCompleteness(id);
    
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Metodi per gestire l'approvazione e la completezza
  async checkProductCompleteness(id: number): Promise<boolean> {
    const product = await this.getProduct(id);
    if (!product) return false;
    
    // Verifica campi obbligatori per tutti i prodotti
    const requiredFields = [
      'name', 'type', 'code', 'date', 'content', 'category', 
      'packaging', 'ingredients', 'characteristics', 'usage'
    ];
    
    // Controlla se tutti i campi obbligatori sono compilati
    const isComplete = requiredFields.every(field => 
      product[field as keyof Product] !== null && 
      product[field as keyof Product] !== undefined && 
      product[field as keyof Product] !== '');
    
    // Verifica campi specifici per tipo di prodotto
    let detailsComplete = false;
    
    if (product.type === 'cosmetic') {
      const details = await this.getCosmeticDetailsByProductId(id);
      if (details) {
        const cosmeticRequiredFields = ['color', 'fragrance', 'ph'];
        detailsComplete = cosmeticRequiredFields.every(field => 
          details[field as keyof CosmeticDetails] !== null && 
          details[field as keyof CosmeticDetails] !== undefined &&
          details[field as keyof CosmeticDetails] !== '');
      }
    } else if (product.type === 'supplement') {
      const details = await this.getSupplementDetailsByProductId(id);
      if (details) {
        const supplementRequiredFields = ['nutritionalInfo', 'indications', 'dosage'];
        detailsComplete = supplementRequiredFields.every(field => 
          details[field as keyof SupplementDetails] !== null && 
          details[field as keyof SupplementDetails] !== undefined &&
          details[field as keyof SupplementDetails] !== '');
      }
    }
    
    return isComplete && detailsComplete;
  }
  
  async updateProductCompleteness(id: number): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const isComplete = await this.checkProductCompleteness(id);
    
    // Aggiorna lo stato di completezza se è cambiato
    if (product.isComplete !== isComplete) {
      product.isComplete = isComplete;
      product.updatedAt = new Date();
      this.products.set(id, product);
    }
    
    return product;
  }
  
  async approveProduct(productId: number, userId: number): Promise<Product | undefined> {
    const product = await this.getProduct(productId);
    const user = await this.getUser(userId);
    
    if (!product || !user) return undefined;
    
    // Verifica che l'utente sia un amministratore
    if (user.role !== 'amministratore') return undefined;
    
    // Imposta lo stato di approvazione
    product.isApproved = true;
    product.approvedBy = userId;
    product.approvedDate = new Date();
    product.updatedAt = new Date();
    
    this.products.set(productId, product);
    return product;
  }
  
  async unapproveProduct(productId: number): Promise<Product | undefined> {
    const product = await this.getProduct(productId);
    if (!product) return undefined;
    
    // Rimuovi l'approvazione
    product.isApproved = false;
    product.approvedBy = null;
    product.approvedDate = null;
    product.updatedAt = new Date();
    
    this.products.set(productId, product);
    return product;
  }

  // Cosmetic details methods
  async createCosmeticDetails(details: InsertCosmeticDetails): Promise<CosmeticDetails> {
    const id = this.cosmeticId++;
    
    // Imposta tutti i campi con valori predefiniti
    const cosmeticDetails: CosmeticDetails = { 
      id,
      color: null,
      fragrance: null,
      sensorial: null,
      absorbability: null,
      ph: null,
      viscosity: null,
      cbt: null,
      yeastAndMold: null,
      escherichiaColi: null,
      pseudomonas: null,
      ...details
    };
    
    this.cosmeticDetails.set(cosmeticDetails.productId, cosmeticDetails);
    return cosmeticDetails;
  }

  async getCosmeticDetailsByProductId(productId: number): Promise<CosmeticDetails | undefined> {
    return Array.from(this.cosmeticDetails.values()).find(
      (details) => details.productId === productId
    );
  }

  async updateCosmeticDetails(productId: number, details: Partial<InsertCosmeticDetails>): Promise<CosmeticDetails | undefined> {
    const existingDetails = Array.from(this.cosmeticDetails.values()).find(
      (d) => d.productId === productId
    );
    
    if (!existingDetails) return undefined;
    
    const updatedDetails: CosmeticDetails = {
      ...existingDetails,
      ...details
    };
    
    this.cosmeticDetails.set(productId, updatedDetails);
    return updatedDetails;
  }

  // Supplement details methods
  async createSupplementDetails(details: InsertSupplementDetails): Promise<SupplementDetails> {
    const id = this.supplementId++;
    
    // Imposta tutti i campi con valori predefiniti
    const supplementDetails: SupplementDetails = { 
      id,
      nutritionalInfo: null,
      indications: null,
      dosage: null,
      ...details
    };
    
    this.supplementDetails.set(supplementDetails.productId, supplementDetails);
    return supplementDetails;
  }

  async getSupplementDetailsByProductId(productId: number): Promise<SupplementDetails | undefined> {
    return Array.from(this.supplementDetails.values()).find(
      (details) => details.productId === productId
    );
  }

  async updateSupplementDetails(productId: number, details: Partial<InsertSupplementDetails>): Promise<SupplementDetails | undefined> {
    const existingDetails = Array.from(this.supplementDetails.values()).find(
      (d) => d.productId === productId
    );
    
    if (!existingDetails) return undefined;
    
    const updatedDetails: SupplementDetails = {
      ...existingDetails,
      ...details
    };
    
    this.supplementDetails.set(productId, updatedDetails);
    return updatedDetails;
  }
}

export const storage = new MemStorage();