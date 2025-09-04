import { Bot } from "lucide-react";
import type { Message } from "@shared/schema";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`chat-message flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] p-4 rounded-lg ${
        isUser 
          ? 'bg-primary text-primary-foreground rounded-br-sm' 
          : 'bg-card border border-border text-card-foreground rounded-bl-sm'
      }`}>
        {!isUser && (
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-primary text-xs" size={12} />
            </div>
            <div className="flex-1">
              <div className="text-sm leading-relaxed">{message.text}</div>
            </div>
          </div>
        )}
        {isUser && (
          <div className="text-sm leading-relaxed">{message.text}</div>
        )}
      </div>
    </div>
  );
}
