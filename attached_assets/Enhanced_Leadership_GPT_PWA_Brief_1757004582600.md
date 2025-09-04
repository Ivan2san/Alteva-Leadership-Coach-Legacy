# Enhanced Simple Leadership GPT PWA - Replit Project Brief

## Project Goal
Create a simple mobile-first PWA that replicates the functionality of an existing custom GPT for leadership development. The app should provide an external interface for clients to access the same AI-powered conversations they currently get in the custom GPT, leveraging the OpenAI Responses API to manage instructions and a knowledge base of up to 20,000 pages.




## Core Requirements

### 1. Main Screen - 8 Action Buttons
Create a clean front screen with exactly 8 buttons arranged in a mobile-friendly grid:

1. **"Get Clear on Your Leadership Growth Profile"**
2. **"Identify Your Red and Green Zone Behaviours"**
3. **"Establish Your One Big Practice"**
4. **"360 Report"**
5. **"Identify your Leadership Growth Values"**
6. **"Finalise your Leadership Growth Matrix"**
7. **"Prepare for a Conversation using OORA"**
8. **"Daily Check-In on OBP and Values"**

### 2. Prompt Selection Flow
When a user clicks any button:
- Show a screen with 3-5 pre-written prompts related to that topic
- Display prompts as selectable cards or buttons
- Include an option for "Write your own prompt" 
- Allow users to either select a prompt directly OR use them as inspiration to write their own

### 3. Simple Chat Interface
After prompt selection:
- Open a basic chat interface
- Send the selected/written prompt to the AI
- Display AI response in chat format
- Allow follow-up conversation
- Include a "Back to Main Menu" button




### 4. Technical Specifications

**Backend - OpenAI Responses API Integration:**

- **API Selection:** Utilize the **OpenAI Responses API** as the core of the backend. This API is a superset of the Chat Completions API and provides the necessary features to replicate the custom GPT's functionality, including instruction-following and knowledge base retrieval.

- **Knowledge Base Management:**
    - Create a **vector store** within your OpenAI account. This vector store will house the 20,000 pages of knowledge base content.
    - Upload the knowledge base documents to the vector store. The Responses API will automatically handle the chunking, indexing, and embedding of the documents.
    - When a user sends a prompt, include the `file_search` tool in your API call, referencing the vector store ID. This will enable the model to retrieve relevant information from your knowledge base to inform its responses.

- **Instructions (System Prompt):**
    - The "instructions" for the GPT will be managed through the `system_prompt` parameter in the Responses API call. This will guide the AI's personality, tone, and the structure of its responses, ensuring it aligns with the leadership development context.

- **Simplified API Calls:** The Responses API allows for a single API call to manage the conversation, including the user's prompt, the system instructions, and the knowledge base search. This simplifies the backend logic and reduces latency.

**Frontend - Keep It Simple:**
- Basic HTML/CSS/JavaScript (or React if preferred)
- Mobile-first responsive design
- Minimal features - focus on core functionality

**PWA Basics:**
- Web App Manifest for mobile installation
- Basic service worker for offline capability
- Fast loading and smooth navigation




### 5. UI Requirements

**Design Principles:**
- Clean, professional look suitable for business users
- Large, touch-friendly buttons
- Clear typography and good contrast
- Minimal distractions - focus on the 8 main actions

**Layout:**
- Header with simple branding
- 8-button grid on main screen (2x4 or 4x2 layout for mobile)
- Prompt selection screen with clear options
- Basic chat interface with message bubbles
- Simple navigation between screens

### 6. Content Strategy
For each of the 8 buttons, create 3-5 sample prompts that:
- Are professionally written for leadership development
- Cover different aspects of that topic
- Provide good starting points for conversations
- Match the quality and style of the existing custom GPT

### 7. User Flow (Simple)
1. User sees main screen with 8 buttons
2. User taps one button (e.g., "Get Clear on Your Leadership Growth Profile")
3. Screen shows 4 sample prompts + "Write your own" option
4. User selects a prompt or writes their own
5. Chat interface opens with AI conversation, powered by the Responses API and the knowledge base.
6. User can continue chatting or return to main menu




## What NOT to Include
- Complex features or advanced functionality
- User accounts or login systems
- Data storage beyond basic conversation history
- Multiple conversation threads
- Advanced UI animations or effects
- Anything beyond the core 8-button → prompt selection → chat flow

## Success Criteria
- Replicates the core functionality of your existing custom GPT, including the use of the knowledge base.
- Provides external access for clients who can't use the custom GPT.
- Simple, intuitive interface that requires no learning curve.
- Professional appearance suitable for business clients.
- Fast, reliable performance on mobile devices.

## Development Priority
Focus on getting the basic functionality working first:
1. Set up the OpenAI Responses API with the knowledge base in a vector store.
2. 8-button main screen.
3. One working button with prompt selection.
4. Basic chat interface with AI integration, pulling from the knowledge base.
5. Expand to all 8 buttons.
6. Polish and optimize.

The goal is to create the simplest possible external interface that gives clients the same AI-powered leadership conversations they get from your custom GPT, with the full backing of your extensive knowledge base.



## OpenAI Responses API Implementation Guide

### Setting Up the Knowledge Base

**Step 1: Prepare Your Knowledge Base Files**
- Collect all your leadership development content (up to 20,000 pages)
- Supported formats: PDF, DOCX, TXT, MD, and other text-based formats
- Organize files logically for easier management

**Step 2: Create Vector Store**
```javascript
// Create a vector store for your knowledge base
const vectorStore = await openai.vectorStores.create({
  name: "leadership_knowledge_base"
});
```

**Step 3: Upload Files to Vector Store**
```javascript
// Upload files to the vector store
const fileUpload = await openai.files.create({
  file: fs.createReadStream("path/to/your/leadership-content.pdf"),
  purpose: "assistants"
});

// Add file to vector store
await openai.vectorStores.files.create({
  vector_store_id: vectorStore.id,
  file_id: fileUpload.id
});
```

### Implementing the Chat Interface

**Basic API Call Structure:**
```javascript
const response = await openai.responses.create({
  model: "gpt-4o",
  input: userPrompt,
  instructions: `You are a leadership development coach with extensive expertise in helping professionals grow their leadership capabilities. Use the knowledge base to provide comprehensive, actionable advice. Always maintain a supportive, professional tone and provide specific examples when possible.`,
  tools: [{
    type: "file_search",
    vector_store_ids: [vectorStore.id]
  }]
});
```

### Key Implementation Benefits

**Simplified Architecture:**
- Single API call handles conversation, instructions, and knowledge base search
- No need to manage separate embedding or retrieval systems
- Built-in conversation state management

**Enhanced Capabilities:**
- Automatic relevance scoring for knowledge base content
- Structured output support for consistent responses
- Native web search integration if needed for current information

**Cost Efficiency:**
- Optimized token usage through intelligent retrieval
- Reduced API calls compared to traditional RAG implementations
- Built-in caching for frequently accessed content

### Sample Implementation for Leadership Topics

**Example: "Get Clear on Your Leadership Growth Profile" Implementation**
```javascript
async function handleLeadershipProfile(userInput) {
  const response = await openai.responses.create({
    model: "gpt-4o",
    input: userInput,
    instructions: `Focus on helping the user understand their current leadership strengths and growth areas. Reference relevant assessment frameworks and development models from the knowledge base. Provide actionable next steps.`,
    tools: [{
      type: "file_search",
      vector_store_ids: [vectorStore.id],
      max_num_results: 5
    }]
  });
  
  return response.output_text;
}
```

This implementation ensures that users receive the same quality of leadership guidance as your custom GPT, with full access to your comprehensive knowledge base, while maintaining the simple, intuitive interface that makes the tool accessible to all clients.

