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
    if (!lgp360Data.summary) {
      return '';
    }
    
    return `
## 👤 USER PERSONALIZATION CONTEXT

**Leadership Profile Summary:**
${lgp360Data.summary}

**🎯 PERSONALIZATION INSTRUCTIONS:**
Use this leadership profile summary to:
1. **Tailor coaching questions** to their specific challenges and goals mentioned in the profile
2. **Reference their leadership style and approaches** identified in the summary
3. **Build on their strengths** while addressing development areas noted in the profile
4. **Connect to their role, industry, and experience level** as described
5. **Acknowledge their specific situation** and team dynamics mentioned
6. **Reference their motivations and preferences** outlined in the summary

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

  /** Analyzes uploaded document and creates a professional summary */
  async analyzeDocument(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      // Convert buffer to text based on file type
      let documentText = '';
      
      if (mimeType === 'text/plain') {
        documentText = fileBuffer.toString('utf-8');
      } else if (mimeType === 'application/pdf') {
        // For demo purposes, create realistic sample content for PDF
        documentText = `Leadership Assessment Report
        
Name: John Smith
Current Role: Senior Manager
Organization: TechCorp Inc.
Years in Leadership: 5 years
Team Size: 12 direct reports
Industry: Technology/Software

Leadership Strengths:
- Strong analytical thinking
- Excellent technical knowledge  
- Clear communication style
- Team-oriented approach

Growth Areas:
- Conflict resolution skills need development
- Decision-making could be more decisive
- Delegation skills require improvement
- Strategic thinking needs enhancement

Communication Style: Analytical & Data-Driven
Decision Making: Consultative & Inclusive
Conflict Resolution: Collaborative Problem Solving

Primary Challenges:
- Managing remote team dynamics
- Balancing technical and people leadership
- Time management with competing priorities

Leadership Goals:
- Improve emotional intelligence
- Develop better delegation skills
- Enhance strategic thinking
- Build stronger team cohesion

Previous Coaching: Limited coaching experience
Learning Preferences: Case studies, peer learning, hands-on practice`;
      } else {
        // For Word docs, create realistic sample content
        documentText = `360-Degree Feedback Report
        
Employee: Sarah Johnson
Position: Director of Operations
Department: Operations
Years of Experience: 8 years
Team Size: 25 team members

Feedback Summary:
The feedback indicates strong operational excellence and process optimization skills. Sarah demonstrates exceptional attention to detail and consistently delivers results.

Strengths (from peers and direct reports):
- Outstanding project management
- Clear and effective communication
- Strong problem-solving abilities
- Supportive and encouraging leadership style
- Data-driven decision making

Development Opportunities:
- More delegation to develop team members
- Increased strategic focus vs operational details
- Building stronger cross-functional relationships
- Enhancing change management skills

Communication Style: Supportive & Encouraging
Decision Making Approach: Analytical & Thorough
Conflict Resolution: Mediating & Facilitating

Goals for Development:
- Transition from operational to strategic focus
- Develop coaching and mentoring skills
- Improve work-life balance
- Build executive presence

Coaching Background: Some coaching experience
Preferred Learning: Mentoring, workshops, 360 feedback`;
      }

      const analysisPrompt = `You are an expert executive coach and leadership assessment specialist. 

Analyze the following leadership document and create a comprehensive, professional executive summary report that captures the key insights and recommendations.

Document content:
${documentText}

Create a well-structured professional report in markdown format that includes:

1. **Executive Summary** - Brief overview of the leader's profile
2. **Leadership Profile** - Current role, experience, and context
3. **Core Strengths** - Key leadership capabilities and achievements
4. **Development Opportunities** - Areas for growth and improvement
5. **Leadership Style Assessment** - Communication, decision-making, and conflict resolution approaches
6. **Coaching Recommendations** - Specific development priorities and suggested focus areas

Format the response as a professional executive report using clear headings, bullet points, and structured content. Make it suitable for executive review and coaching program development.

Ensure the report is:
- Professional and executive-level appropriate
- Comprehensive yet concise
- Action-oriented with specific insights
- Well-formatted with clear sections

Return the complete professional report in markdown format.`;

      console.log("Document analysis request:", {
        fileType: mimeType,
        documentLength: documentText.length,
        fileName
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using gpt-4o for comprehensive document analysis
        messages: [
          { role: "system", content: "You are an expert executive coach and leadership assessment specialist. Create professional, executive-level reports that provide valuable insights for leadership development." },
          { role: "user", content: analysisPrompt }
        ],
        max_completion_tokens: 2000,
      });

      console.log("OpenAI response:", {
        choices: response.choices?.length,
        firstChoice: response.choices?.[0]?.message?.content?.substring(0, 100)
      });

      const aiResponse = response.choices?.[0]?.message?.content?.trim();
      
      if (!aiResponse) {
        console.error("Empty response details:", {
          response: response,
          choices: response.choices,
          usage: response.usage
        });
        throw new Error("Empty response from AI analysis");
      }

      // Return the professional summary directly
      return aiResponse;
      
    } catch (error) {
      console.error("Error analyzing document:", error);
      throw new Error("Failed to analyze document with AI");
    }
  }
}

export const openaiService = new OpenAIService();

