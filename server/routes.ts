import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { insertConversationSchema, messageSchema, insertKnowledgeBaseFileSchema } from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, topic, conversationHistory } = req.body;

      if (!message || !topic) {
        return res.status(400).json({ error: "Message and topic are required" });
      }

      // Validate conversation history if provided
      if (conversationHistory) {
        const historySchema = z.array(messageSchema);
        const validationResult = historySchema.safeParse(conversationHistory);
        if (!validationResult.success) {
          return res.status(400).json({ error: "Invalid conversation history format" });
        }
      }

      const response = await openaiService.getTopicSpecificResponse(
        message, 
        topic, 
        conversationHistory || []
      );

      res.json(response);
    } catch (error) {
      console.error("Chat endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Save conversation endpoint
  app.post("/api/conversations", async (req, res) => {
    try {
      const validationResult = insertConversationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid conversation data" });
      }

      const conversation = await storage.createConversation(validationResult.data);
      res.json(conversation);
    } catch (error) {
      console.error("Save conversation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get conversations endpoint
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Knowledge Base File endpoints
  const objectStorageService = new ObjectStorageService();

  // Get upload URL for knowledge base files
  app.post("/api/knowledge-base/upload-url", async (req, res) => {
    try {
      const { fileName } = req.body;
      
      if (!fileName) {
        return res.status(400).json({ error: "fileName is required" });
      }

      const uploadURL = await objectStorageService.getKnowledgeBaseUploadURL(fileName);
      res.json({ uploadURL });
    } catch (error) {
      console.error("Upload URL generation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Process uploaded file and save metadata
  app.post("/api/knowledge-base/files", async (req, res) => {
    try {
      const { 
        originalName, 
        fileName, 
        filePath, 
        fileSize, 
        mimeType, 
        tags, 
        description 
      } = req.body;

      // Validate required fields
      if (!originalName || !fileName || !filePath || !fileSize || !mimeType) {
        return res.status(400).json({ 
          error: "originalName, fileName, filePath, fileSize, and mimeType are required" 
        });
      }

      // Create knowledge base file record
      const fileData = {
        originalName,
        fileName,
        filePath: objectStorageService.normalizeKnowledgeBaseFilePath(filePath),
        fileSize,
        mimeType,
        tags: tags || [],
        description: description || null,
        isProcessed: false,
      };

      const kbFile = await storage.createKnowledgeBaseFile(fileData);
      
      // TODO: Trigger background processing for vector store upload
      // For now, mark as processed immediately
      await storage.updateKnowledgeBaseFile(kbFile.id, { isProcessed: true });

      res.json(kbFile);
    } catch (error) {
      console.error("Knowledge base file creation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all knowledge base files
  app.get("/api/knowledge-base/files", async (req, res) => {
    try {
      const files = await storage.getKnowledgeBaseFiles();
      res.json(files);
    } catch (error) {
      console.error("Get knowledge base files error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get specific knowledge base file
  app.get("/api/knowledge-base/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getKnowledgeBaseFile(id);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      res.json(file);
    } catch (error) {
      console.error("Get knowledge base file error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update knowledge base file
  app.patch("/api/knowledge-base/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedFile = await storage.updateKnowledgeBaseFile(id, updates);
      
      if (!updatedFile) {
        return res.status(404).json({ error: "File not found" });
      }

      res.json(updatedFile);
    } catch (error) {
      console.error("Update knowledge base file error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete knowledge base file
  app.delete("/api/knowledge-base/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get file details first
      const file = await storage.getKnowledgeBaseFile(id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Delete from storage
      const deleted = await storage.deleteKnowledgeBaseFile(id);
      
      if (!deleted) {
        return res.status(500).json({ error: "Failed to delete file" });
      }

      // TODO: Also delete from object storage and vector store

      res.json({ success: true });
    } catch (error) {
      console.error("Delete knowledge base file error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Search knowledge base files
  app.get("/api/knowledge-base/search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query 'q' is required" });
      }

      const files = await storage.searchKnowledgeBaseFiles(q);
      res.json(files);
    } catch (error) {
      console.error("Search knowledge base files error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve knowledge base files
  app.get("/kb/:fileName(*)", async (req, res) => {
    try {
      const fileName = req.params.fileName;
      const objectFile = await objectStorageService.getKnowledgeBaseFile(`/kb/${fileName}`);
      
      // For now, allow public access to knowledge base files
      // TODO: Implement proper access control
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Serve knowledge base file error:", error);
      if (error instanceof Error && error.name === "ObjectNotFoundError") {
        return res.status(404).json({ error: "File not found" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
