import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateCosmeticPDF, generateSupplementPDF } from "./pdf";
import { generateCosmeticMarkdown, generateSupplementMarkdown } from "./markdown";
import { insertProductSchema, insertCosmeticDetailsSchema, insertSupplementDetailsSchema } from "@shared/schema";
import { ZodError } from "zod";

const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Accesso non autorizzato" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Product Routes
  app.post("/api/products", isAuthenticated, async (req, res, next) => {
    try {
      const { product, details } = req.body;
      
      // Validate product data
      const validatedProduct = insertProductSchema.parse(product);
      
      // Create the product first
      const newProduct = await storage.createProduct(validatedProduct);
      
      // Then create the appropriate details based on product type
      if (product.type === "cosmetic") {
        const validatedDetails = insertCosmeticDetailsSchema.parse({
          ...details,
          productId: newProduct.id
        });
        await storage.createCosmeticDetails(validatedDetails);
      } else if (product.type === "supplement") {
        const validatedDetails = insertSupplementDetailsSchema.parse({
          ...details,
          productId: newProduct.id
        });
        await storage.createSupplementDetails(validatedDetails);
      } else {
        throw new Error("Tipo di prodotto non valido");
      }
      
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dati non validi", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/products", isAuthenticated, async (req, res, next) => {
    try {
      // Get the type filter if provided
      const type = req.query.type as string | undefined;
      
      const products = await storage.getProducts(type);
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID non valido" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Prodotto non trovato" });
      }
      
      let details;
      if (product.type === "cosmetic") {
        details = await storage.getCosmeticDetailsByProductId(id);
      } else if (product.type === "supplement") {
        details = await storage.getSupplementDetailsByProductId(id);
      }
      
      res.json({ product, details });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/products/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID non valido" });
      }
      
      const { product, details } = req.body;
      
      // Validate product data
      const validatedProduct = insertProductSchema.partial().parse(product);
      
      // Update the product
      const updatedProduct = await storage.updateProduct(id, validatedProduct);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Prodotto non trovato" });
      }
      
      // Update the appropriate details based on product type
      if (updatedProduct.type === "cosmetic") {
        const validatedDetails = insertCosmeticDetailsSchema.partial().parse(details);
        await storage.updateCosmeticDetails(id, validatedDetails);
      } else if (updatedProduct.type === "supplement") {
        const validatedDetails = insertSupplementDetailsSchema.partial().parse(details);
        await storage.updateSupplementDetails(id, validatedDetails);
      }
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dati non validi", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID non valido" });
      }
      
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Prodotto non trovato" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // PDF Generation Route
  app.post("/api/generate-pdf", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "ID prodotto richiesto" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Prodotto non trovato" });
      }
      
      let pdfContent;
      
      if (product.type === "cosmetic") {
        const details = await storage.getCosmeticDetailsByProductId(id);
        if (!details) {
          return res.status(404).json({ message: "Dettagli prodotto non trovati" });
        }
        pdfContent = generateCosmeticPDF(product, details);
      } else if (product.type === "supplement") {
        const details = await storage.getSupplementDetailsByProductId(id);
        if (!details) {
          return res.status(404).json({ message: "Dettagli prodotto non trovati" });
        }
        pdfContent = generateSupplementPDF(product, details);
      } else {
        return res.status(400).json({ message: "Tipo di prodotto non supportato" });
      }
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="scheda-tecnica-${product.name.replace(/\s+/g, '-').toLowerCase()}.html"`);
      
      res.send(pdfContent);
    } catch (error) {
      next(error);
    }
  });

  // Markdown Export Route
  app.post("/api/export-md", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "ID prodotto richiesto" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Prodotto non trovato" });
      }
      
      let mdContent;
      
      if (product.type === "cosmetic") {
        const details = await storage.getCosmeticDetailsByProductId(id);
        if (!details) {
          return res.status(404).json({ message: "Dettagli prodotto non trovati" });
        }
        mdContent = generateCosmeticMarkdown(product, details);
      } else if (product.type === "supplement") {
        const details = await storage.getSupplementDetailsByProductId(id);
        if (!details) {
          return res.status(404).json({ message: "Dettagli prodotto non trovati" });
        }
        mdContent = generateSupplementMarkdown(product, details);
      } else {
        return res.status(400).json({ message: "Tipo di prodotto non supportato" });
      }
      
      // Set headers for markdown download
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="scheda-tecnica-${product.name.replace(/\s+/g, '-').toLowerCase()}.md"`);
      
      res.send(mdContent);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
