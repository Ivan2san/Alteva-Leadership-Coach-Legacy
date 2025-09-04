import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  message: string;
  error?: string;
}

export class OpenAIService {
  private vectorStoreId: string;

  constructor() {
    this.vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID || "";
    if (!this.vectorStoreId) {
      console.warn("OPENAI_VECTOR_STORE_ID not set. Knowledge base search will not be available.");
    }
  }

  async createVectorStore(name: string = "leadership_knowledge_base") {
    try {
      const vectorStore = await openai.vectorStores.create({
        name: name
      });
      return vectorStore;
    } catch (error) {
      console.error("Error creating vector store:", error);
      throw error;
    }
  }

  async getLeadershipResponse(userPrompt: string, topic: string, conversationHistory: any[] = []): Promise<ChatResponse> {
    try {
      const systemPrompt = `You are a leadership development coach with extensive expertise in helping professionals grow their leadership capabilities. 

You have access to a comprehensive knowledge base containing leadership development frameworks, assessment tools, and proven methodologies. Use this knowledge base to provide comprehensive, actionable advice.

Always maintain a supportive, professional tone and provide specific examples when possible. Focus on practical, implementable strategies that align with the user's specific topic: ${topic}.

Key principles:
- Draw from evidence-based leadership development practices
- Provide actionable next steps
- Ask clarifying questions when helpful
- Reference relevant frameworks and models from the knowledge base
- Maintain confidentiality and professional coaching standards`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text
        })),
        { role: "user" as const, content: userPrompt }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        // Vector store integration will be added in future update
      });

      const aiMessage = response.choices[0]?.message?.content;
      
      if (!aiMessage) {
        throw new Error("No response from AI");
      }

      return {
        message: aiMessage
      };

    } catch (error) {
      console.error("Error getting AI response:", error);
      return {
        message: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getTopicSpecificResponse(userInput: string, topic: string, conversationHistory: any[] = []): Promise<ChatResponse> {
    const topicInstructions = {
      'growth-profile': 'Focus on helping the user understand their current leadership strengths and growth areas. Reference relevant assessment frameworks and development models from the knowledge base. Provide actionable next steps.',
      'red-green-zones': 'Help the user identify behaviors that serve them well (green zone) and those that limit effectiveness (red zone). Provide strategies for managing triggers and operating in the green zone.',
      'big-practice': 'Guide the user in identifying and implementing their One Big Practice - the single leadership practice that will have the biggest impact on their effectiveness.',
      '360-report': 'Assist with interpreting 360 feedback results and creating targeted development plans. Help bridge gaps between self-perception and others\' feedback.',
      'growth-values': 'Help identify core values and how they should guide leadership growth. Focus on aligning actions with values and resolving value conflicts.',
      'growth-matrix': 'Support creating a comprehensive leadership growth matrix that integrates all development areas. Focus on prioritization and implementation.',
      'oora-conversation': 'Guide preparation for conversations using the OORA framework. Focus on structure, outcomes, and effective communication strategies.',
      'daily-checkin': 'Facilitate daily reflection on One Big Practice and values alignment. Provide frameworks for continuous improvement and accountability.'
    };

    const specificInstruction = topicInstructions[topic as keyof typeof topicInstructions] || topicInstructions['growth-profile'];

    return this.getLeadershipResponse(userInput, `${topic}: ${specificInstruction}`, conversationHistory);
  }
}

export const openaiService = new OpenAIService();
