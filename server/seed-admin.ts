import { storage } from "./storage";

const ADMIN_USER = {
  email: "admin@leadership-coach.app",
  password: "LeaderCoach2025#Admin",
  fullName: "Admin User", 
  role: "admin" as const,
};

export async function seedAdminUser() {
  try {
    // Check if the email column exists (schema migrated)
    try {
      await storage.getUserByEmail("test@example.com");
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === '42703') {
        console.log("Database schema not migrated yet. Skipping admin seeding.");
        return null;
      }
    }

    // Check if admin user already exists
    const existingAdmin = await storage.getUserByEmail(ADMIN_USER.email);
    
    if (existingAdmin) {
      console.log("Admin user already exists:", ADMIN_USER.email);
      return existingAdmin;
    }

    // Create admin user
    console.log("Creating admin user...");
    const adminUser = await storage.createUser(ADMIN_USER);
    
    console.log("Admin user created successfully:");
    console.log("Email:", ADMIN_USER.email);
    console.log("Password:", ADMIN_USER.password);
    console.log("Please change the password after first login!");
    
    return adminUser;
  } catch (error) {
    console.error("Error seeding admin user:", error);
    throw error;
  }
}

export async function migrateExistingData(adminUserId: string) {
  try {
    console.log("Migrating existing data to admin user...");
    
    // Update conversations to belong to admin user
    const { db } = await import("./db");
    const { conversations } = await import("@shared/schema");
    const { eq, isNull } = await import("drizzle-orm");
    
    // Find conversations without userId
    const orphanedConversations = await db.select().from(conversations).where(isNull(conversations.userId));
    
    if (orphanedConversations.length > 0) {
      // Assign orphaned conversations to admin user
      await db
        .update(conversations)
        .set({ userId: adminUserId })
        .where(isNull(conversations.userId));
      
      console.log(`Migrated ${orphanedConversations.length} conversations to admin user`);
    }

    // Update knowledge base files to belong to admin user
    const { knowledgeBaseFiles } = await import("@shared/schema");
    
    const orphanedFiles = await db.select().from(knowledgeBaseFiles).where(isNull(knowledgeBaseFiles.uploadedBy));
    
    if (orphanedFiles.length > 0) {
      await db
        .update(knowledgeBaseFiles)
        .set({ uploadedBy: adminUserId })
        .where(isNull(knowledgeBaseFiles.uploadedBy));
      
      console.log(`Migrated ${orphanedFiles.length} knowledge base files to admin user`);
    }

    // Update prompt templates to belong to admin user
    const { promptTemplates } = await import("@shared/schema");
    
    const orphanedTemplates = await db.select().from(promptTemplates).where(isNull(promptTemplates.createdBy));
    
    if (orphanedTemplates.length > 0) {
      await db
        .update(promptTemplates)
        .set({ createdBy: adminUserId })
        .where(isNull(promptTemplates.createdBy));
      
      console.log(`Migrated ${orphanedTemplates.length} prompt templates to admin user`);
    }

    console.log("Data migration completed successfully!");
  } catch (error) {
    console.error("Error migrating existing data:", error);
    throw error;
  }
}

// Auto-run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdminUser()
    .then((adminUser) => {
      if (adminUser) {
        return migrateExistingData(adminUser.id);
      }
    })
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}