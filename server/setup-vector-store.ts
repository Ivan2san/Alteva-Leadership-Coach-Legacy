import { OpenAIService } from './services/openai';

async function setupVectorStore() {
  try {
    console.log('Creating OpenAI vector store...');
    
    const openaiService = new OpenAIService();
    const vectorStore = await openaiService.createVectorStore("leadership_knowledge_base");
    
    console.log('\n✅ Vector store created successfully!');
    console.log('Vector Store ID:', vectorStore.id);
    console.log('\nTo complete setup:');
    console.log('1. Add this environment variable to your Replit secrets:');
    console.log(`   OPENAI_VECTOR_STORE_ID=${vectorStore.id}`);
    console.log('2. Restart the application');
    
    return vectorStore.id;
  } catch (error) {
    console.error('❌ Failed to create vector store:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupVectorStore();
}

export { setupVectorStore };