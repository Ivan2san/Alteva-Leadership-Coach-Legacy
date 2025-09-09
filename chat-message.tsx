import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@shared/schema";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`chat-message flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] p-5 rounded-lg shadow-sm ${
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
              <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none
                prose-headings:text-card-foreground prose-headings:font-semibold prose-headings:mb-2
                prose-p:text-card-foreground prose-p:my-2 prose-p:leading-relaxed
                prose-ul:text-card-foreground prose-ul:my-2 prose-ul:ml-4
                prose-ol:text-card-foreground prose-ol:my-2 prose-ol:ml-4
                prose-li:text-card-foreground prose-li:my-0.5
                prose-strong:text-card-foreground prose-strong:font-semibold
                prose-em:text-card-foreground
                prose-code:text-card-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                prose-pre:bg-muted prose-pre:text-card-foreground prose-pre:p-3 prose-pre:rounded-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
        {isUser && (
          <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none
            prose-headings:text-primary-foreground prose-headings:font-semibold prose-headings:mb-2
            prose-p:text-primary-foreground prose-p:my-2 prose-p:leading-relaxed
            prose-ul:text-primary-foreground prose-ul:my-2 prose-ul:ml-4
            prose-ol:text-primary-foreground prose-ol:my-2 prose-ol:ml-4
            prose-li:text-primary-foreground prose-li:my-0.5
            prose-strong:text-primary-foreground prose-strong:font-semibold
            prose-em:text-primary-foreground
            prose-code:text-primary-foreground prose-code:bg-primary/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-pre:bg-primary/20 prose-pre:text-primary-foreground prose-pre:p-3 prose-pre:rounded-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
