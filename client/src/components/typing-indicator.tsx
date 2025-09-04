export default function TypingIndicator() {
  return (
    <div className="mb-4" data-testid="typing-indicator">
      <div className="flex items-center space-x-2 bg-muted rounded-lg p-3 w-fit">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full pulse-animation"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full pulse-animation" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full pulse-animation" style={{animationDelay: '0.4s'}}></div>
        </div>
        <span className="text-sm text-muted-foreground">Coach is thinking...</span>
      </div>
    </div>
  );
}
