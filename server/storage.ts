import { 
  type User, 
  type InsertUser, 
  type Conversation, 
  type InsertConversation,
  type KnowledgeBaseFile,
  type InsertKnowledgeBaseFile,
  users, 
  conversations, 
  knowledgeBaseFiles
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversations(status?: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;
  searchConversations(query: string): Promise<Conversation[]>;
  getConversationsByTopic(topic: string): Promise<Conversation[]>;
  starConversation(id: string, isStarred: boolean): Promise<Conversation | undefined>;
  archiveConversation(id: string): Promise<Conversation | undefined>;
  
  // Knowledge base file operations
  createKnowledgeBaseFile(file: InsertKnowledgeBaseFile): Promise<KnowledgeBaseFile>;
  getKnowledgeBaseFiles(): Promise<KnowledgeBaseFile[]>;
  getKnowledgeBaseFile(id: string): Promise<KnowledgeBaseFile | undefined>;
  updateKnowledgeBaseFile(id: string, updates: Partial<KnowledgeBaseFile>): Promise<KnowledgeBaseFile | undefined>;
  deleteKnowledgeBaseFile(id: string): Promise<boolean>;
  searchKnowledgeBaseFiles(query: string): Promise<KnowledgeBaseFile[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Conversation operations
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(insertConversation).returning();
    return conversation;
  }

  async getConversations(status?: string): Promise<Conversation[]> {
    const query = db.select().from(conversations);
    if (status) {
      return await query.where(eq(conversations.status, status)).orderBy(desc(conversations.updatedAt));
    }
    return await query.where(eq(conversations.status, 'active')).orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const result = await db.delete(conversations).where(eq(conversations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchConversations(query: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.status, 'active'),
          or(
            ilike(conversations.title, `%${query}%`),
            ilike(conversations.summary, `%${query}%`),
            ilike(conversations.topic, `%${query}%`)
          )
        )
      )
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversationsByTopic(topic: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.topic, topic),
          eq(conversations.status, 'active')
        )
      )
      .orderBy(desc(conversations.updatedAt));
  }

  async starConversation(id: string, isStarred: boolean): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ isStarred, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  }

  async archiveConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  }

  // Knowledge base file operations
  async createKnowledgeBaseFile(file: InsertKnowledgeBaseFile): Promise<KnowledgeBaseFile> {
    const [kbFile] = await db.insert(knowledgeBaseFiles).values(file).returning();
    return kbFile;
  }

  async getKnowledgeBaseFiles(): Promise<KnowledgeBaseFile[]> {
    return await db.select().from(knowledgeBaseFiles).orderBy(knowledgeBaseFiles.createdAt);
  }

  async getKnowledgeBaseFile(id: string): Promise<KnowledgeBaseFile | undefined> {
    const [file] = await db.select().from(knowledgeBaseFiles).where(eq(knowledgeBaseFiles.id, id));
    return file;
  }

  async updateKnowledgeBaseFile(id: string, updates: Partial<KnowledgeBaseFile>): Promise<KnowledgeBaseFile | undefined> {
    const [file] = await db
      .update(knowledgeBaseFiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(knowledgeBaseFiles.id, id))
      .returning();
    return file;
  }

  async deleteKnowledgeBaseFile(id: string): Promise<boolean> {
    const result = await db.delete(knowledgeBaseFiles).where(eq(knowledgeBaseFiles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchKnowledgeBaseFiles(query: string): Promise<KnowledgeBaseFile[]> {
    return await db
      .select()
      .from(knowledgeBaseFiles)
      .where(
        or(
          ilike(knowledgeBaseFiles.originalName, `%${query}%`),
          ilike(knowledgeBaseFiles.description, `%${query}%`),
        )
      );
  }
}

export const storage = new DatabaseStorage();
