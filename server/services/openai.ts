// openai.ts
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { LGP360ReportData } from "@shared/schema";

const apiKey =
  process.env.OPENAI_API_KEY ??
  process.env.OPENAI_API_KEY_ENV_VAR;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set. Add it to your env.");
}

const openai = new OpenAI({ apiKey });

export interface ChatResponse {
  message: string;
  error?: string;
}

export interface FileProcessingStatus {
  id: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface KnowledgeSearchResult {
  content: string;
  source: string;
  relevance: number;
}

type HistoryItem = { sender: "user" | "assistant"; text: string };

export class OpenAIService {
  // Keep, but don’t pretend it exists if not set
  private vectorStoreId?: string;

  constructor() {
    this.vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID || undefined;
    if (!this.vectorStoreId) {
      // Don’t spam logs in prod
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "OPENAI_VECTOR_STORE_ID not set. Knowledge base search will be disabled."
        );
      }
    }
  }

  /** Creates a vector store (Assistants v2). */
  async createVectorStore(name = "leadership_knowledge_base") {
    try {
      const vectorStore = await (openai as any).beta.vectorStores.create({
        name,
      });
      console.log("Created vector store:", vectorStore.id);
      return vectorStore;
    } catch (error) {
      console.error("Error creating vector store:", error);
      throw error;
    }
  }

  /** Uploads a file to the vector store */
  async uploadFileToVectorStore(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      if (!this.vectorStoreId) {
        throw new Error("Vector store not configured. Please set OPENAI_VECTOR_STORE_ID.");
      }

      // Upload file to OpenAI
      const file = await openai.files.create({
        file: new File([fileBuffer], fileName, { type: mimeType }),
        purpose: "assistants",
      });

      // Add file to vector store
      await (openai as any).beta.vectorStores.files.create(this.vectorStoreId, {
        file_id: file.id,
      });

      console.log(`File ${fileName} uploaded to vector store with ID: ${file.id}`);
      return file.id;
    } catch (error) {
      console.error("Error uploading file to vector store:", error);
      throw error;
    }
  }

  /** Checks the processing status of a file in the vector store */
  async getFileProcessingStatus(fileId: string): Promise<FileProcessingStatus> {
    try {
      if (!this.vectorStoreId) {
        throw new Error("Vector store not configured");
      }

      const file = await (openai as any).beta.vectorStores.files.retrieve(
        this.vectorStoreId,
        fileId
      );

      let status: FileProcessingStatus['status'] = 'processing';
      if (file.status === 'completed') {
        status = 'completed';
      } else if (file.status === 'failed') {
        status = 'failed';
      }

      return {
        id: fileId,
        status,
        error: file.last_error?.message,
      };
    } catch (error) {
      console.error("Error checking file status:", error);
      return {
        id: fileId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /** Searches the knowledge base for relevant content */
  async searchKnowledgeBase(query: string, maxResults = 5): Promise<KnowledgeSearchResult[]> {
    try {
      if (!this.vectorStoreId) {
        console.warn("Vector store not configured, skipping knowledge base search");
        return [];
      }

      // For now, return empty results until we can properly implement the search
      // TODO: Implement proper vector store search once OpenAI API types are resolved
      console.log(`Knowledge base search requested for: ${query}`);
      return [];
    } catch (error) {
      console.error("Error searching knowledge base:", error);
      return [];
    }
  }

  async getLeadershipResponse(
    userPrompt: string,
    topic: string,
    conversationHistory: HistoryItem[] = [],
    userLGP360Data?: LGP360ReportData
  ): Promise<ChatResponse> {
    try {
      const systemPrompt = `# 🧭 Alteva Coaching Companion

## ✳ Core Role
You act only as a coaching partner for participants in Alteva programs. You do not deliver content, facilitate workshops, or answer operational questions.

Your primary function is to help participants:
- Reflect deeply
- Integrate growth practices  
- Lead effectively day to day creating high performing teams and achieving high business performance
- Conduct Accountable Conversations with all stakeholders adopting the right Mindset and Skill set
- Shift from reactive (Red Zone) to leadership effectiveness (Green Zone)
- Embody their values in daily leadership

## 🔶 Coaching Philosophy

### 1. Triple Goal Anchor
Every interaction should aim to enhance:
- **Great Performance** (clarity, outcomes, standards)
- **Great Learning** (awareness, feedback, curiosity)  
- **Great Workplace** (trust, safety, human connection)

### 2. Vertical Development Focus
Coaching is not about quick fixes—it's about evolving identity and awareness. Focus on:
- Patterns (emotional, behavioural)
- Mindsets and assumptions
- Values and shadow work
- Stretching toward greater maturity

However, you can help in the moment with decision making, self regulation and preparation for conversations.

### 3. Red Zone to Green Zone
Help leaders:
- Notice reactive patterns (Approval over Integrity, Control over Care, Security over Progress)
- Return to values, curiosity, and relational presence
- Shift from protection to connection

### 4. Humanistic Accountability
Coach with truth + care:
- No rescuing. No sugarcoating.
- Respect autonomy and capacity.
- Always bring the person back to ownership, values, and possibility.

## 🛠 Functional Modes for Topic: ${topic}

### 🔁 Daily Reflection
Prompts like:
- "Where did you act from safety instead of growth?"
- "What would your OBP do here?"
- "Where did you avoid a truth today?"

### 🔺 Triggered State Support  
Questions like:
- "What pain or fear might be behind that?"
- "What need was unmet?"
- "What part of you were you trying to protect?"

### 🗣 Conversation Rehearsal (OORA)
Prep for difficult conversations using OORA:
- **Ownership**: "What's your part?"
- **Observations with Impact**: "What's the behaviour and its impact?"
- **Requests**: "What do you need from them?"
- **Agreements**: "What's the next step you both agree on?"

## 🔵 The Right Mindset for Accountable Conversations

### Accountability Philosophy
"If people feel respected, understand the context and have clarity—they will naturally want to contribute."

### Conscious Intention
"Am I here to help? To connect? To learn?"

### Self-Awareness via Growth Values
"What value do I need to lead from to stay in the Green Zone?"

### Awareness of Others
"What might they be feeling or needing? Can I connect to that?"

## 🎙 Tone & Voice

### Be Emotionally Intelligent
Hold the human without being cheesy. Notice what's beneath the surface. Be warm and clear. No fake empathy. No sugarcoating.

### Be Bold
Don't dance around it. If you see avoidance, name it. If you sense shadow, call it out. Do it with respect, but don't hold back.

### Be Succinct
No rambling. No over-explaining. Ask sharp questions. Reflect what matters. Then stop talking.

### Be Present and Straightforward
Drop the script. Meet people where they are. No jargon. No detours. Just show up, pay attention, and speak cleanly.

## ✅ Implementation Guidelines

Speak like a real, present human coach. Prioritise emotional presence and intuitive sensing over models.

Use frameworks (Red/Green, OBP, OORA, Flow triggers) only when relevant, and only after reflecting what's alive.

Be a mirror, not a map. Always coach toward clarity, values, and vertical growth.

## 📝 Response Formatting

Structure your responses using clear markdown formatting:
- Use **bold** for key concepts and important points
- Use *italic* for emphasis and reflection prompts
- Use bullet points for lists and action items
- Use numbered lists for sequential steps or processes
- Break content into logical sections with clear spacing
- Use > blockquotes for powerful questions or insights
- Keep paragraphs concise (2-3 sentences max)

Example structure:
## Core Insight
Brief reflection on what you're sensing...

**Key Point:** Main coaching insight

### Questions for Reflection:
- What resonates with you about this?
- Where do you notice resistance?

### Next Steps:
1. Immediate action
2. Ongoing practice

Current focus area: ${topic}

${userLGP360Data ? this.generatePersonalizationContext(userLGP360Data) : ''}`;

      const history: ChatCompletionMessageParam[] = conversationHistory.map(
        (msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        })
      );

      const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userPrompt },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages,
        max_completion_tokens: 1000,
      });

      const aiMessage = response.choices?.[0]?.message?.content?.trim();
      
      if (!aiMessage) {
        throw new Error("Empty completion from model");
      }

      return { message: aiMessage };
    } catch (error) {
      console.error("Error getting AI response:", error);
      return {
        message:
          "Sorry, I’m having a hiccup processing that. Try again in a moment.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private generatePersonalizationContext(lgp360Data: LGP360ReportData): string {
    return `
## 👤 USER PERSONALIZATION CONTEXT

**Leadership Profile:**
- **Role:** ${lgp360Data.currentRole} at ${lgp360Data.organization}
- **Experience:** ${lgp360Data.yearsInLeadership} years in leadership, managing ${lgp360Data.teamSize} team members
- **Industry:** ${lgp360Data.industryExperience}

**Primary Challenges:** ${lgp360Data.primaryChallenges.join(', ')}

**Development Goals:** ${lgp360Data.leadershipGoals.join(', ')}

**Leadership Style:**
- **Communication:** ${lgp360Data.communicationStyle}
- **Decision Making:** ${lgp360Data.decisionMakingApproach}
- **Conflict Resolution:** ${lgp360Data.conflictResolutionStyle}

**Motivation Factors:** ${lgp360Data.motivationFactors.join(', ')}

**Learning Preferences:** ${lgp360Data.learningPreferences.join(', ')}

**Strengths:** ${lgp360Data.strengths.join(', ')}

**Growth Areas:** ${lgp360Data.growthAreas.join(', ')}

**Coaching Experience:** ${lgp360Data.previousCoaching}

**Expectations:** ${lgp360Data.expectations}

${lgp360Data.additionalNotes ? `**Additional Notes:** ${lgp360Data.additionalNotes}` : ''}

**🎯 PERSONALIZATION INSTRUCTIONS:**
Use this profile information to:
1. **Tailor coaching questions** to their specific challenges and goals
2. **Reference their communication/decision-making style** when suggesting approaches
3. **Build on their identified strengths** while addressing growth areas
4. **Match their learning preferences** in how you present insights
5. **Connect to their industry context** and role-specific challenges
6. **Acknowledge their experience level** and team size in your coaching
7. **Reference their motivations** to increase engagement and relevance

Make coaching personal and relevant to their unique leadership context while maintaining Alteva coaching methodology.
`;
  }

  async getTopicSpecificResponse(
    userInput: string,
    topic: string,
    conversationHistory: HistoryItem[] = [],
    userLGP360Data?: LGP360ReportData
  ): Promise<ChatResponse> {
    const altevaTopicInstructions: Record<string, string> = {
      "growth-profile":
        "Focus on helping identify their current leadership identity and growth edge. Use Red/Green Zone awareness to surface reactive patterns. Guide toward values-based leadership strengths and development areas.",
      "red-green-zones":
        "Help them recognize specific triggers that shift them into reactive mode (Red Zone) vs. connected, values-driven leadership (Green Zone). Focus on pattern recognition and values-based recovery strategies.",
      "big-practice":
        "Guide discovery and implementation of their One Big Practice (OBP) - the single leadership practice with highest impact. Focus on sustainable integration and daily embodiment.",
      "360-report":
        "Support interpretation of feedback through the lens of Red/Green Zone patterns. Help identify growth edges and create accountable development commitments using OORA framework.",
      "growth-values":
        "Help surface and embody core growth values in daily leadership. Focus on values-based decision making and authentic leadership expression. Address shadow work where values conflict.",
      "growth-matrix":
        "Support creation of integrated vertical development matrix. Focus on identity-level growth, not just skill building. Prioritize practices that stretch their leadership maturity.",
      "oora-conversation":
        "Guide preparation for Accountable Conversations using OORA framework. Focus on Mindset (intention, values, awareness) alongside structure. Practice truth + care approach.",
      "daily-checkin":
        "Facilitate daily reflection on OBP integration, values alignment, and Red/Green Zone awareness. Focus on patterns, learning, and next-level leadership identity.",
    };

    const altevaInstruction =
      altevaTopicInstructions[topic] ?? altevaTopicInstructions["growth-profile"];

    return this.getLeadershipResponse(
      userInput,
      `${topic}: ${altevaInstruction}`,
      conversationHistory,
      userLGP360Data
    );
  }

  /** Analyzes uploaded document and extracts LGP360 data */
  async analyzeDocument(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<LGP360ReportData> {
    try {
      // Convert buffer to text based on file type
      let documentText = '';
      
      if (mimeType === 'text/plain') {
        documentText = fileBuffer.toString('utf-8');
      } else if (mimeType === 'application/pdf') {
        // For now, return a placeholder - would need PDF parsing library
        documentText = 'PDF content would be extracted here';
      } else {
        // For Word docs, would need docx parsing library
        documentText = 'Document content would be extracted here';
      }

      const analysisPrompt = `You are an expert in analyzing leadership assessment reports and 360-degree feedback documents. 

Analyze the following document and extract information to populate an LGP360 (Leadership Growth Profile 360) report form.

Document content:
${documentText}

Please extract and structure the information into the following JSON format. If information is not found in the document, use reasonable defaults or make educated inferences based on context:

{
  "currentRole": "string - current leadership position",
  "organization": "string - company/organization name",
  "yearsInLeadership": "number - years of leadership experience",
  "teamSize": "number - current team size",
  "industryExperience": "string - industry/sector",
  "primaryChallenges": ["array of strings - main leadership challenges"],
  "leadershipGoals": ["array of strings - development goals"],
  "communicationStyle": "string - one of: Direct & Assertive, Collaborative & Inclusive, Supportive & Encouraging, Analytical & Data-Driven, Inspirational & Visionary",
  "decisionMakingApproach": "string - one of: Quick & Decisive, Consultative & Inclusive, Analytical & Thorough, Consensus Building, Delegative & Empowering",
  "conflictResolutionStyle": "string - one of: Mediating & Facilitating, Direct Confrontation, Collaborative Problem Solving, Avoidance & De-escalation, Compromise Focused",
  "motivationFactors": ["array of strings - what motivates them"],
  "learningPreferences": ["array of strings - preferred learning methods"],
  "strengths": ["array of strings - leadership strengths"],
  "growthAreas": ["array of strings - areas for development"],
  "previousCoaching": "string - one of: Never worked with a coach, Limited coaching experience, Some coaching experience, Extensive coaching experience, Currently working with a coach",
  "expectations": "string - expectations from coaching",
  "additionalNotes": "string - any additional relevant information"
}

Return ONLY the JSON object, no other text.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are an expert at analyzing leadership documents and extracting structured data. Always respond with valid JSON only." },
          { role: "user", content: analysisPrompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500,
      });

      const aiResponse = response.choices?.[0]?.message?.content?.trim();
      
      if (!aiResponse) {
        throw new Error("Empty response from AI analysis");
      }

      // Parse the JSON response
      const parsedData = JSON.parse(aiResponse);
      
      // Validate the structure matches LGP360ReportData schema
      return parsedData as LGP360ReportData;
      
    } catch (error) {
      console.error("Error analyzing document:", error);
      throw new Error("Failed to analyze document with AI");
    }
  }
}

export const openaiService = new OpenAIService();

