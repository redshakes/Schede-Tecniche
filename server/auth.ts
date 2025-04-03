import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, User } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'lfa-tech-sheet-session-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        // Verificare credenziali
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Credenziali non valide" });
        }
        
        // Verificare se l'utente è approvato
        if (!user.approved) {
          return done(null, false, { message: "Il tuo account è in attesa di approvazione da parte di un amministratore" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Registrazione utente - non fa login automatico e richiede approvazione
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, name } = req.body;
      
      if (!username || !password || !email || !name) {
        return res.status(400).json({ message: "Tutti i campi sono obbligatori" });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username già esistente" });
      }

      // Crea l'utente con approvazione a false
      await storage.createUser({
        username,
        password: await hashPassword(password),
        email,
        name,
        role: "guest", // Ruolo provvisorio per utenti in attesa di approvazione
        approved: false
      });

      // Non facciamo login, mostriamo un messaggio che informa che la registrazione è in attesa di approvazione
      res.status(201).json({ 
        message: "Registrazione effettuata! La tua richiesta è in attesa di approvazione da parte di un amministratore."
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: User, info: { message: string }) => {
      if (err) return next(err);
      
      // Se autenticazione fallisce, mostra messaggio specifico di errore
      if (!user) {
        return res.status(401).json({ message: info?.message || "Credenziali non valide" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  // API per amministratori - Ottieni tutti gli utenti
  app.get("/api/admin/users", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Verifica se l'utente è amministratore
    if (req.user.role !== "amministratore") {
      return res.status(403).json({ message: "Accesso negato: Solo gli amministratori possono accedere" });
    }
    
    // Ottieni tutti gli utenti
    storage.getUsers().then((users: User[]) => {
      // Rimuovi le password per sicurezza
      const usersWithoutPasswords = users.map((user: User) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    }).catch((err: Error) => {
      res.status(500).json({ message: "Errore durante il recupero degli utenti" });
    });
  });
  
  // API per amministratori - Approva un utente
  app.post("/api/admin/users/:id/approve", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Verifica se l'utente è amministratore
      if (req.user.role !== "amministratore") {
        return res.status(403).json({ message: "Accesso negato: Solo gli amministratori possono approvare gli utenti" });
      }
      
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      // Approva l'utente
      await storage.updateUser(userId, { approved: true });
      
      res.json({ message: "Utente approvato con successo" });
    } catch (err) {
      res.status(500).json({ message: "Errore durante l'approvazione dell'utente" });
    }
  });
  
  // API per amministratori - Cambia ruolo utente
  app.post("/api/admin/users/:id/role", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Verifica se l'utente è amministratore
      if (req.user.role !== "amministratore") {
        return res.status(403).json({ message: "Accesso negato: Solo gli amministratori possono modificare i ruoli" });
      }
      
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!role || !["amministratore", "compilatore", "visualizzatore", "guest"].includes(role)) {
        return res.status(400).json({ message: "Ruolo non valido" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      // Cambia il ruolo dell'utente
      await storage.updateUser(userId, { role });
      
      res.json({ message: `Ruolo utente cambiato in ${role}` });
    } catch (err) {
      res.status(500).json({ message: "Errore durante la modifica del ruolo utente" });
    }
  });
}
