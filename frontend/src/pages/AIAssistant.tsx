import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { MessageSquareCode, Send, Sparkles, Brain, RefreshCw, AlertCircle } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your RudhiraConnect AI Assistant. I can help answer questions regarding blood donation criteria, preparation tips, safety processes, and myth-busting facts.\n\nHow can I help you today? Please make sure to stay hydrated!',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Can I donate blood?',
    'Is donating blood safe?',
    'What are the preparation tips before donating?',
    'How often can I donate blood?',
    'Tell me about blood donation myths.',
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const updatedMessages = [...messages, { sender: 'user' as const, text }];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: text });
      setMessages([...updatedMessages, { sender: 'ai', text: res.data.response }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages([
        ...updatedMessages,
        {
          sender: 'ai',
          text: 'I apologize, but I encountered a connection issue. Please ensure your backend is running or consult our static Guidelines tab.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <DashboardLayout>
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">Blood Buddy AI</h2>
          <p className="text-xs text-slate-400">Interact with our Gemini-powered helper for FAQs and safety guidelines.</p>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          title="Clear Conversation"
          className="p-1.5 border border-slate-200 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-card text-xs font-semibold flex items-center gap-1 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Clear Chat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Chat Console (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-card shadow-sm flex flex-col h-[480px]">
          {/* Messages screen */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 text-xs leading-relaxed max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Icon avatar */}
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 font-bold ${
                    msg.sender === 'user'
                      ? 'bg-slate-950 text-white'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}
                >
                  {msg.sender === 'user' ? 'U' : <Brain className="h-4 w-4" />}
                </div>

                {/* Bubble content */}
                <div
                  className={`p-3.5 rounded-2xl whitespace-pre-line border ${
                    msg.sender === 'user'
                      ? 'bg-slate-950 text-slate-100 border-slate-950 rounded-tr-none'
                      : 'bg-slate-50 text-slate-700 border-slate-100 rounded-tl-none font-semibold'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 mr-auto text-xs max-w-[85%]">
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
                  <Brain className="h-4 w-4 animate-pulse" />
                </div>
                <div className="bg-slate-50 text-slate-500 border border-slate-100 p-3 rounded-2xl rounded-tl-none font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input console */}
          <form onSubmit={handleFormSubmit} className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-card flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about blood donation..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-card shadow transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Suggested Prompts (1 Column) */}
        <div className="bg-white border border-slate-100 rounded-card p-6 shadow-sm flex flex-col space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            <h3 className="font-bold text-slate-800 text-sm">Suggested Prompts</h3>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={loading}
                className="w-full text-left p-3 border border-slate-100 rounded-card text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all leading-snug cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="bg-red-50 border border-red-100 rounded-card p-3 flex gap-2 text-[10px] text-primary items-start">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              **AI Disclaimer:** This assistant provides information for educational purposes. For medical diagnoses or complex medication interactions, please consult a qualified clinician.
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
