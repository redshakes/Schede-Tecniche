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
  getProducts(type?: string, groupId?: number): Promise<Product[]>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  autosaveProduct(id: number, data: any): Promise<boolean>;
  getProductAutosave(id: number): Promise<any>;
  
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
  
  // Metodi per l'autosalvataggio dei prodotti
  async autosaveProduct(id: number, data: any): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) return false;
    
    product.lastAutosave = data;
    product.updatedAt = new Date();
    
    this.products.set(id, product);
    return true;
  }
  
  async getProductAutosave(id: number): Promise<any> {
    const product = this.products.get(id);
    if (!product) return null;
    
    return product.lastAutosave;
  }
  
  // Metodo per i suggerimenti in base ai caratteri digitati
  async getSuggestions(field: string, prefix: string): Promise<string[]> {
    if (!this.fieldValues.has(field) || prefix.length < 3) {
      return [];
    }
    
    const values = this.fieldValues.get(field)!;
    const prefixLower = prefix.toLowerCase();
    return Array.from(values)
      .filter(value => value.toLowerCase().includes(prefixLower))
      .slice(0, 10); // limit results
  }

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

    // Creare 4 utenti iniziali (uno per ogni ruolo)
    this.createInitialUsers();
  }

  private async createInitialUsers() {
    // Password comuni per tutti gli account: "admin"
    // La password è già hashata nel formato corretto per comparePasswords
    const commonPassword = "6d7220ea1133a7c7818422aab9e7dd0e4c8aaf7464d9ab183e2786d02804d27c96e86307a0e4ae58ed5fa3d204658288eeca9c719ff83c3e63f3aa5f83146818.e61e913d9b01a32c13b0a458ea5d1b68";
    
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

  async getProducts(type?: string, groupId?: number): Promise<Product[]> {
    let allProducts = Array.from(this.products.values());
    
    if (type) {
      allProducts = allProducts.filter(product => product.type === type);
    }
    
    if (groupId !== undefined) {
      allProducts = allProducts.filter(product => product.groupId === groupId);
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
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
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
