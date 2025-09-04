import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default('user'), // 'user' | 'admin'
  // LGP360 Report Fields
  lgp360Data: jsonb("lgp360_data"), // Complete LGP360 report data
  lgp360UploadedAt: timestamp("lgp360_uploaded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title"),
  topic: text("topic").notNull(),
  summary: text("summary"),
  messages: jsonb("messages").notNull().default('[]'),
  messageCount: integer("message_count").default(0),
  userId: varchar("user_id"), // for future user authentication
  isStarred: boolean("is_starred").default(false),
  status: text("status").default('active'), // active, archived, deleted
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeBaseFiles = pgTable("knowledge_base_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalName: text("original_name").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  tags: text("tags").array().default([]),
  description: text("description"),
  isProcessed: boolean("is_processed").default(false),
  vectorStoreFileId: text("vector_store_file_id"),
  processingError: text("processing_error"),
  uploadedBy: varchar("uploaded_by"), // future user reference
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const promptTemplates = pgTable("prompt_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // "coaching", "reflection", "goal-setting", etc.
  description: text("description"),
  template: text("template").notNull(), // The prompt template with placeholders
  variables: text("variables").array().default([]), // Variable names in the template
  tags: text("tags").array().default([]),
  isDefault: boolean("is_default").default(false),
  usageCount: integer("usage_count").default(0),
  createdBy: varchar("created_by"), // future user reference
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const signupSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const createUserSchema = insertUserSchema; // For backend storage use

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// LGP360 Report Schema
export const lgp360ReportSchema = z.object({
  currentRole: z.string().min(1, "Current role is required"),
  organization: z.string().min(1, "Organization is required"),
  yearsInLeadership: z.number().min(0, "Years in leadership must be positive"),
  teamSize: z.number().min(0, "Team size must be positive"),
  industryExperience: z.string().min(1, "Industry experience is required"),
  primaryChallenges: z.array(z.string()).min(1, "At least one challenge must be selected"),
  leadershipGoals: z.array(z.string()).min(1, "At least one goal must be selected"),
  communicationStyle: z.string().min(1, "Communication style is required"),
  decisionMakingApproach: z.string().min(1, "Decision making approach is required"),
  conflictResolutionStyle: z.string().min(1, "Conflict resolution style is required"),
  motivationFactors: z.array(z.string()).min(1, "At least one motivation factor must be selected"),
  learningPreferences: z.array(z.string()).min(1, "At least one learning preference must be selected"),
  strengths: z.array(z.string()).min(1, "At least one strength must be listed"),
  growthAreas: z.array(z.string()).min(1, "At least one growth area must be listed"),
  previousCoaching: z.string().min(1, "Previous coaching experience is required"),
  expectations: z.string().min(1, "Expectations are required"),
  additionalNotes: z.string().optional(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
});

export const insertKnowledgeBaseFileSchema = createInsertSchema(knowledgeBaseFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromptTemplateSchema = createInsertSchema(promptTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type LGP360ReportData = z.infer<typeof lgp360ReportSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type KnowledgeBaseFile = typeof knowledgeBaseFiles.$inferSelect;
export type InsertKnowledgeBaseFile = z.infer<typeof insertKnowledgeBaseFileSchema>;
export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type InsertPromptTemplate = z.infer<typeof insertPromptTemplateSchema>;

export const messageSchema = z.object({
  id: z.string(),
  sender: z.enum(['user', 'ai']),
  text: z.string(),
  timestamp: z.string(),
});

export type Message = z.infer<typeof messageSchema>;
