import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateCosmeticPDF, generateSupplementPDF } from "./pdf";
import { generateCosmeticMarkdown, generateSupplementMarkdown } from "./markdown";
import { insertProductSchema, insertCosmeticDetailsSchema, insertSupplementDetailsSchema, insertGroupSchema } from "@shared/schema";
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
      // Get filters if provided
      const type = req.query.type as string | undefined;
      const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
      
      // Se l'utente è visualizzatore, controlla che abbia accesso ai gruppi richiesti
      if (req.user?.role === "visualizzatore") {
        // Se è stato specificato un groupId, verifica che l'utente abbia accesso
        if (groupId !== undefined) {
          const userAllowedGroups = req.user.allowedGroups || [];
          if (!userAllowedGroups.includes(groupId.toString())) {
            return res.status(403).json({ message: "Non hai accesso a questo gruppo di schede" });
          }
        } else {
          // Se non è stato specificato un groupId, filtra in base ai gruppi consentiti all'utente
          const userAllowedGroups = req.user.allowedGroups || [];
          if (userAllowedGroups.length > 0) {
            const allProducts = await storage.getProducts(type);
            const filteredProducts = allProducts.filter(product => 
              product.groupId !== null && 
              userAllowedGroups.includes(product.groupId.toString())
            );
            return res.json(filteredProducts);
          }
          // Se l'utente non ha gruppi assegnati, restituisci un array vuoto
          return res.json([]);
        }
      }
      
      const products = await storage.getProducts(type, groupId);
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
      
      // Se l'utente è visualizzatore, verifica che abbia accesso a questo gruppo
      if (req.user?.role === "visualizzatore" && product.groupId) {
        const userAllowedGroups = req.user.allowedGroups || [];
        if (!userAllowedGroups.includes(product.groupId.toString())) {
          return res.status(403).json({ message: "Non hai accesso a questa scheda" });
        }
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
      // Solo amministratori e compilatori possono modificare i prodotti
      if (req.user?.role !== "amministratore" && req.user?.role !== "compilatore") {
        return res.status(403).json({ message: "Non autorizzato a modificare prodotti" });
      }
      
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
      // Solo gli amministratori possono eliminare i prodotti
      if (req.user?.role !== "amministratore") {
        return res.status(403).json({ message: "Non autorizzato a eliminare prodotti" });
      }
      
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

  // Group Routes
  app.get("/api/groups", isAuthenticated, async (req, res, next) => {
    try {
      const groups = await storage.getGroups();
      
      // Se l'utente è visualizzatore, filtra i gruppi a cui ha accesso
      if (req.user?.role === "visualizzatore") {
        const userAllowedGroups = req.user.allowedGroups || [];
        const filteredGroups = groups.filter(group => 
          userAllowedGroups.includes(group.id.toString())
        );
        return res.json(filteredGroups);
      }
      
      res.json(groups);
    } catch (error) {
      next(error);
    }
  });
  
  // API per ottenere tutti gli utenti in un gruppo
  app.get("/api/groups/:id/users", isAuthenticated, async (req, res, next) => {
    try {
      // Solo gli amministratori possono vedere gli utenti di un gruppo
      if (req.user?.role !== "amministratore") {
        return res.status(403).json({ message: "Non autorizzato a visualizzare gli utenti del gruppo" });
      }
      
      const groupId = parseInt(req.params.id);
      if (isNaN(groupId)) {
        return res.status(400).json({ message: "ID gruppo non valido" });
      }
      
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Gruppo non trovato" });
      }
      
      // Ottieni tutti gli utenti
      const allUsers = await storage.getUsers();
      
      // Filtra gli utenti che hanno accesso a questo gruppo
      const groupUsers = allUsers.filter(user => {
        // Gli amministratori e i compilatori hanno accesso a tutti i gruppi
        if (user.role === "amministratore" || user.role === "compilatore") {
          return true;
        }
        
        // I visualizzatori hanno accesso solo ai gruppi loro assegnati
        if (user.role === "visualizzatore" && user.allowedGroups) {
          return user.allowedGroups.includes(groupId.toString());
        }
        
        return false;
      });
      
      res.json(groupUsers);
    } catch (error) {
      next(error);
    }
  });
  
  // API per ottenere tutti i prodotti in un gruppo
  app.get("/api/groups/:id/products", isAuthenticated, async (req, res, next) => {
    try {
      const groupId = parseInt(req.params.id);
      if (isNaN(groupId)) {
        return res.status(400).json({ message: "ID gruppo non valido" });
      }
      
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Gruppo non trovato" });
      }
      
      // Se l'utente è visualizzatore, verifica che abbia accesso a questo gruppo
      if (req.user?.role === "visualizzatore") {
        const userAllowedGroups = req.user.allowedGroups || [];
        if (!userAllowedGroups.includes(groupId.toString())) {
          return res.status(403).json({ message: "Non hai accesso a questo gruppo" });
        }
      }
      
      // Ottieni i prodotti del gruppo
      const products = await storage.getProducts(undefined, groupId);
      res.json(products);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/groups", isAuthenticated, async (req, res, next) => {
    try {
      // Solo admin e compilatori possono creare gruppi
      if (req.user?.role !== "amministratore" && req.user?.role !== "compilatore") {
        return res.status(403).json({ message: "Non autorizzato a creare gruppi" });
      }
      
      const validatedGroup = insertGroupSchema.parse(req.body);
      const newGroup = await storage.createGroup(validatedGroup);
      res.status(201).json(newGroup);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dati non validi", errors: error.errors });
      } else {
        next(error);
      }
    }
  });
  
  app.get("/api/groups/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID gruppo non valido" });
      }
      
      const group = await storage.getGroup(id);
      if (!group) {
        return res.status(404).json({ message: "Gruppo non trovato" });
      }
      
      res.json(group);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/groups/:id", isAuthenticated, async (req, res, next) => {
    try {
      // Solo admin e compilatori possono modificare gruppi
      if (req.user?.role !== "amministratore" && req.user?.role !== "compilatore") {
        return res.status(403).json({ message: "Non autorizzato a modificare gruppi" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID gruppo non valido" });
      }
      
      const validatedGroup = insertGroupSchema.partial().parse(req.body);
      const updatedGroup = await storage.updateGroup(id, validatedGroup);
      
      if (!updatedGroup) {
        return res.status(404).json({ message: "Gruppo non trovato" });
      }
      
      res.json(updatedGroup);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dati non validi", errors: error.errors });
      } else {
        next(error);
      }
    }
  });
  
  app.delete("/api/groups/:id", isAuthenticated, async (req, res, next) => {
    try {
      // Solo gli amministratori possono eliminare gruppi
      if (req.user?.role !== "amministratore") {
        return res.status(403).json({ message: "Non autorizzato a eliminare gruppi" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID gruppo non valido" });
      }
      
      const success = await storage.deleteGroup(id);
      if (!success) {
        return res.status(404).json({ message: "Gruppo non trovato" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Autosave Route
  app.post("/api/products/:id/autosave", isAuthenticated, async (req, res, next) => {
    try {
      // Solo admin e compilatori possono usare l'autosalvataggio
      if (req.user?.role !== "amministratore" && req.user?.role !== "compilatore") {
        return res.status(403).json({ message: "Non autorizzato" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID prodotto non valido" });
      }
      
      const data = req.body;
      if (!data) {
        return res.status(400).json({ message: "Dati di autosalvataggio richiesti" });
      }
      
      const success = await storage.autosaveProduct(id, data);
      if (!success) {
        return res.status(404).json({ message: "Prodotto non trovato" });
      }
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/products/:id/autosave", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID prodotto non valido" });
      }
      
      const data = await storage.getProductAutosave(id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });
  
  // Suggestions Route
  app.get("/api/suggestions", isAuthenticated, async (req, res, next) => {
    try {
      const { field, prefix } = req.query;
      
      if (!field || !prefix || typeof field !== 'string' || typeof prefix !== 'string') {
        return res.status(400).json({ message: "Campo e prefisso richiesti" });
      }
      
      if (prefix.length < 3) {
        return res.json([]);
      }
      
      const suggestions = await storage.getSuggestions(field, prefix);
      res.json(suggestions);
    } catch (error) {
      next(error);
    }
  });

  // User Admin Routes
  app.get("/api/admin/users", isAuthenticated, async (req, res, next) => {
    try {
      // Check if the user is an administrator
      if (req.user?.role !== "amministratore") {
        return res.status(403).json({ message: "Accesso non autorizzato" });
      }
      
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/users/:id/approve", isAuthenticated, async (req, res, next) => {
    try {
      // Check if the user is an administrator
      if (req.user?.role !== "amministratore") {
        return res.status(403).json({ message: "Accesso non autorizzato" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID non valido" });
      }
      
      const { allowedGroups } = req.body;
      
      // Se è stato fornito allowedGroups, assicurarsi che sia un array
      const updateData: any = { approved: true };
      if (allowedGroups) {
        if (!Array.isArray(allowedGroups)) {
          return res.status(400).json({ message: "allowedGroups deve essere un array" });
        }
        updateData.allowedGroups = allowedGroups;
      }
      
      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/users/:id/role", isAuthenticated, async (req, res, next) => {
    try {
      // Check if the user is an administrator
      if (req.user?.role !== "amministratore") {
        return res.status(403).json({ message: "Accesso non autorizzato" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID non valido" });
      }
      
      const { role } = req.body;
      if (!role || !["amministratore", "compilatore", "visualizzatore", "guest"].includes(role)) {
        return res.status(400).json({ message: "Ruolo non valido" });
      }
      
      const updatedUser = await storage.updateUser(id, { role });
      if (!updatedUser) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });
  
  // Endpoint per aggiornare i gruppi assegnati a un utente
  app.post("/api/admin/users/:id/update-groups", isAuthenticated, async (req, res, next) => {
    try {
      // Check if the user is an administrator
      if (req.user?.role !== "amministratore") {
        return res.status(403).json({ message: "Accesso non autorizzato" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID non valido" });
      }
      
      const { allowedGroups } = req.body;
      
      // Verifica che allowedGroups sia un array
      if (!Array.isArray(allowedGroups)) {
        return res.status(400).json({ message: "allowedGroups deve essere un array" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      // Verifica che l'utente sia un visualizzatore
      if (user.role !== "visualizzatore") {
        return res.status(400).json({ message: "Solo i visualizzatori possono avere gruppi assegnati" });
      }
      
      const updatedUser = await storage.updateUser(id, { allowedGroups });
      
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // DOCX/PDF Generation Route
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
      
      let docxBuffer;
      
      if (product.type === "cosmetic") {
        const details = await storage.getCosmeticDetailsByProductId(id);
        if (!details) {
          return res.status(404).json({ message: "Dettagli prodotto non trovati" });
        }
        docxBuffer = await generateCosmeticPDF(product, details);
      } else if (product.type === "supplement") {
        const details = await storage.getSupplementDetailsByProductId(id);
        if (!details) {
          return res.status(404).json({ message: "Dettagli prodotto non trovati" });
        }
        docxBuffer = await generateSupplementPDF(product, details);
      } else {
        return res.status(400).json({ message: "Tipo di prodotto non supportato" });
      }
      
      // Set headers for DOCX download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="scheda-tecnica-${product.name.replace(/\s+/g, '-').toLowerCase()}.docx"`);
      
      res.send(docxBuffer);
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
