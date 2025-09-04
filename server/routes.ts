import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { insertConversationSchema, messageSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
