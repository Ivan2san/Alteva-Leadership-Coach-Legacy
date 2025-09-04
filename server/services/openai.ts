// openai.ts
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

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
      // SDK path is beta.vectorStores
      const vectorStore = await (openai as any).beta.vectorStores.create({
        name,
      });
      return vectorStore;
    } catch (error) {
      console.error("Error creating vector store:", error);
      throw error;
    }
  }

  async getLeadershipResponse(
    userPrompt: string,
    topic: string,
    conversationHistory: HistoryItem[] = []
  ): Promise<ChatResponse> {
    try {
      const systemPrompt = `You are a leadership development coach with extensive expertise...

Use evidence-based practices, provide actionable next steps, and reference frameworks. 
Topic: ${topic}`;

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

      console.log("Making API call with payload:", {
        model: "gpt-4",
        messageCount: messages.length,
        userPrompt: userPrompt.substring(0, 100)
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4", // Using stable model instead of gpt-5
        messages,
        max_completion_tokens: 1000, // Fixed parameter name
        // No temperature parameter - using default
      });

      console.log("Full API Response:", JSON.stringify(response, null, 2));

      const aiMessage = response.choices?.[0]?.message?.content?.trim();
      console.log("Extracted AI message:", aiMessage ? "Present" : "Missing");
      console.log("AI message length:", aiMessage ? aiMessage.length : 0);
      
      if (!aiMessage) {
        console.error("Response structure:", {
          choices: response.choices?.length || 0,
          firstChoice: response.choices?.[0] || null,
          message: response.choices?.[0]?.message || null
        });
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

  async getTopicSpecificResponse(
    userInput: string,
    topic: string,
    conversationHistory: HistoryItem[] = []
  ): Promise<ChatResponse> {
    const topicInstructions: Record<string, string> = {
      "growth-profile":
        "Help the user understand strengths and growth areas. Use assessments and give next steps.",
      "red-green-zones":
        "Identify helpful (green) and limiting (red) behaviours. Offer trigger management strategies.",
      "big-practice":
        "Help select and implement the One Big Practice with highest impact.",
      "360-report":
        "Interpret 360 feedback and build a targeted development plan.",
      "growth-values":
        "Surface core values and align actions; resolve value conflicts.",
      "growth-matrix":
        "Create an integrated growth matrix with priorities and execution.",
      "oora-conversation":
        "Prepare conversations using OORA; emphasise structure and outcomes.",
      "daily-checkin":
        "Guide daily reflection on One Big Practice and values alignment.",
    };

    const specificInstruction =
      topicInstructions[topic] ?? topicInstructions["growth-profile"];

    return this.getLeadershipResponse(
      userInput,
      `${topic}: ${specificInstruction}`,
      conversationHistory
    );
  }
}

export const openaiService = new OpenAIService();

