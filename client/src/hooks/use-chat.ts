import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Message } from '@shared/schema';

interface ChatResponse {
  message: string;
  error?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const chatMutation = useMutation({
    mutationFn: async ({ message, topic }: { message: string; topic: string }) => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        topic,
        conversationHistory: messages
      });
      return response.json() as Promise<ChatResponse>;
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      setIsTyping(false);
      if (data.message) {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          sender: 'ai',
          text: data.message,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    },
    onError: (error) => {
      setIsTyping(false);
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const sendMessage = useCallback((text: string, topic: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate({ message: text, topic });
  }, [chatMutation]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    isLoading: chatMutation.isPending
  };
}
