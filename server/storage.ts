import { users, products, cosmeticDetails, supplementDetails } from "@shared/schema";
import type { User, InsertUser, Product, InsertProduct, CosmeticDetails, InsertCosmeticDetails, SupplementDetails, InsertSupplementDetails } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(type?: string): Promise<Product[]>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cosmetic details operations
  createCosmeticDetails(details: InsertCosmeticDetails): Promise<CosmeticDetails>;
  getCosmeticDetailsByProductId(productId: number): Promise<CosmeticDetails | undefined>;
  updateCosmeticDetails(productId: number, details: Partial<InsertCosmeticDetails>): Promise<CosmeticDetails | undefined>;
  
  // Supplement details operations
  createSupplementDetails(details: InsertSupplementDetails): Promise<SupplementDetails>;
  getSupplementDetailsByProductId(productId: number): Promise<SupplementDetails | undefined>;
  updateSupplementDetails(productId: number, details: Partial<InsertSupplementDetails>): Promise<SupplementDetails | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cosmeticDetails: Map<number, CosmeticDetails>;
  private supplementDetails: Map<number, SupplementDetails>;
  private userId: number;
  private productId: number;
  private cosmeticId: number;
  private supplementId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cosmeticDetails = new Map();
    this.supplementDetails = new Map();
    this.userId = 1;
    this.productId = 1;
    this.cosmeticId = 1;
    this.supplementId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
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
      ...insertUser, 
      id, 
      createdAt,
      role: insertUser.role || "visualizzatore",
      approved: insertUser.approved !== undefined ? insertUser.approved : false
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
    
    const updatedUser: User = {
      ...existingUser,
      ...userUpdate
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
      
      // Override con i valori inseriti
      ...insertProduct
    };
    
    this.products.set(id, product);
    return product;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(type?: string): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());
    if (type) {
      return allProducts.filter(product => product.type === type);
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
