import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage, chatWithGemini } from '../services/geminiService';

interface GameChatProps {
  gameId?: string;
  initialContext?: string;
}

const GameChat: React.FC<GameChatProps> = ({ gameId, initialContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialContext) {
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm your baseball AI assistant. I can help you analyze plays, explain strategies, and discuss the game. What would you like to know?"
        }
      ]);
    }
  }, [initialContext]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatWithGemini([...messages, userMessage]);
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-xl overflow-hidden">
      <div className="p-4 bg-gray-700/50 border-b border-gray-700">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#00FFC2]" />
          Baseball AI Assistant
        </h3>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <Bot className="w-6 h-6 text-[#00FFC2]" />
            )}
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-[#00FFC2] text-[#0A1A2F]'
                  : 'bg-gray-700/50'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === 'user' && (
              <User className="w-6 h-6 text-[#00FFC2]" />
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about the game, players, or strategies..."
            className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00FFC2]"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              isLoading || !inputMessage.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-[#00FFC2] text-[#0A1A2F] hover:bg-[#00FFC2]/90'
            }`}
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameChat; 