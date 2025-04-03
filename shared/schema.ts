import { pgTable, text, serial, integer, timestamp, boolean, unique, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Groups table
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("visualizzatore"), // "amministratore", "compilatore", "visualizzatore"
  approved: boolean("approved").notNull().default(false),
  allowedGroups: text("allowed_groups").array(), // Array of group IDs the user has access to (for visualizzatore)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subtitle: text("subtitle"),
  type: text("type").notNull(), // 'cosmetic' or 'supplement'
  code: text("code"),
  ref: text("ref"),
  date: text("date"),
  content: text("content"),
  category: text("category"),
  packaging: text("packaging"),
  accessory: text("accessory"),
  batch: text("batch"),
  cpnp: text("cpnp"),
  authMinistry: text("auth_ministry"),
  ingredients: text("ingredients"),
  tests: text("tests"),
  certifications: text("certifications"),
  clinicalTrials: text("clinical_trials"),
  claims: text("claims"),
  naturalActives: text("natural_actives"),
  functionalActives: text("functional_actives"),
  characteristics: text("characteristics"),
  usage: text("usage"),
  warnings: text("warnings"),
  conservationMethod: text("conservation_method"),
  specialWarnings: text("special_warnings"),
  groupId: integer("group_id").references(() => groups.id), // Group this product belongs to
  isComplete: boolean("is_complete").notNull().default(false), // Whether this product sheet is complete
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastAutosave: jsonb("last_autosave"), // Autosaved content
});

// Cosmetic details table
export const cosmeticDetails = pgTable("cosmetic_details", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  color: text("color"),
  fragrance: text("fragrance"),
  sensorial: text("sensorial"),
  absorbability: text("absorbability"),
  ph: text("ph"),
  viscosity: text("viscosity"),
  cbt: text("cbt"),
  yeastAndMold: text("yeast_and_mold"),
  escherichiaColi: text("escherichia_coli"),
  pseudomonas: text("pseudomonas"),
}, (table) => {
  return {
    productIdKey: unique("cosmetic_details_product_id_key").on(table.productId),
  };
});

// Supplement details table
export const supplementDetails = pgTable("supplement_details", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  nutritionalInfo: text("nutritional_info"),
  indications: text("indications"),
  dosage: text("dosage"),
}, (table) => {
  return {
    productIdKey: unique("supplement_details_product_id_key").on(table.productId),
  };
});

// Create schemas for validation
export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastAutosave: true,
});

export const insertCosmeticDetailsSchema = createInsertSchema(cosmeticDetails).omit({
  id: true,
});

export const insertSupplementDetailsSchema = createInsertSchema(supplementDetails).omit({
  id: true,
});

// Combine product and details for frontend
export const productWithDetailsSchema = z.object({
  product: insertProductSchema,
  details: z.union([insertCosmeticDetailsSchema, insertSupplementDetailsSchema])
});

// Export types
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertCosmeticDetails = z.infer<typeof insertCosmeticDetailsSchema>;
export type CosmeticDetails = typeof cosmeticDetails.$inferSelect;
export type InsertSupplementDetails = z.infer<typeof insertSupplementDetailsSchema>;
export type SupplementDetails = typeof supplementDetails.$inferSelect;
export type ProductWithDetails = z.infer<typeof productWithDetailsSchema>;
