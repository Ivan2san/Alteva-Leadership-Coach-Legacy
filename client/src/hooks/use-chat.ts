import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Message, Conversation } from '@shared/schema';

interface ChatResponse {
  message: string;
  error?: string;
}

// Auto-generate conversation title from first message
const generateConversationTitle = (firstMessage: string, topic: string): string => {
  const maxLength = 50;
  const clean = firstMessage.replace(/[^\w\s]/g, '').trim();
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).trim() + '...';
};

export function useChat(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Load conversation if resuming
  useEffect(() => {
    if (conversationId) {
      setIsLoading(true);
      fetch(`/api/conversations/${conversationId}`)
        .then(response => response.json())
        .then((conversation: Conversation) => {
          const loadedMessages = Array.isArray(conversation.messages) ? conversation.messages as Message[] : [];
          setMessages(loadedMessages);
          setCurrentConversationId(conversation.id);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [conversationId]);

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: { topic: string; title: string; messages: Message[] }) => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: data.topic,
          title: data.title,
          messages: data.messages,
          messageCount: data.messages.length,
          lastMessageAt: new Date(),
          status: 'active'
        }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json();
    },
    onSuccess: (newConversation) => {
      setCurrentConversationId(newConversation.id);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  // Update conversation mutation
  const updateConversationMutation = useMutation({
    mutationFn: async (data: { id: string; messages: Message[] }) => {
      const response = await fetch(`/api/conversations/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: data.messages,
          messageCount: data.messages.length,
          lastMessageAt: new Date(),
        }),
      });
      if (!response.ok) throw new Error('Failed to update conversation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async ({ message, topic }: { message: string; topic: string }) => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        topic,
        conversationHistory: messages,
        conversationId: currentConversationId
      });
      return response.json() as Promise<ChatResponse>;
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data, variables) => {
      setIsTyping(false);
      if (data.message) {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          sender: 'ai',
          text: data.message,
          timestamp: new Date().toISOString()
        };
        const updatedMessages = [...messages, aiMessage];
        setMessages(updatedMessages);

        // Auto-save conversation
        if (currentConversationId) {
          updateConversationMutation.mutate({
            id: currentConversationId,
            messages: updatedMessages
          });
        } else if (updatedMessages.length >= 2) {
          // Create new conversation after first exchange
          const title = generateConversationTitle(updatedMessages[0].text, variables.topic);
          createConversationMutation.mutate({
            topic: variables.topic,
            title,
            messages: updatedMessages
          });
        }
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
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    chatMutation.mutate({ message: text, topic });
  }, [chatMutation, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(undefined);
  }, []);

  const saveConversation = useCallback(async (title?: string) => {
    if (messages.length === 0) return null;
    
    if (currentConversationId) {
      // Update existing conversation
      await updateConversationMutation.mutateAsync({
        id: currentConversationId,
        messages
      });
      return currentConversationId;
    } else {
      // Create new conversation
      const defaultTitle = messages.length > 0 
        ? generateConversationTitle(messages[0].text, 'general')
        : 'New Conversation';
      
      const result = await createConversationMutation.mutateAsync({
        topic: 'general',
        title: title || defaultTitle,
        messages
      });
      return result.id;
    }
  }, [messages, currentConversationId, updateConversationMutation, createConversationMutation]);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    saveConversation,
    currentConversationId,
    isLoading: chatMutation.isPending || isLoading,
    isConnected: !!currentConversationId
  };
}
