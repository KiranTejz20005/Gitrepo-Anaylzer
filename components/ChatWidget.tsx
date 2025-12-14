import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ProfileAnalysis, GitHubUser } from '../types';

interface ChatWidgetProps {
  user: GitHubUser;
  analysis: ProfileAnalysis;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ user, analysis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Chat session ref to maintain history
  const chatSession = useRef<Chat | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && !chatSession.current && process.env.API_KEY) {
       const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
       
       const context = `
         You are a specialized AI assistant analyzing a GitHub Profile.
         
         **Profile Context**:
         - User: ${user.name || user.login} (@${user.login})
         - Bio: ${user.bio || 'No bio'}
         - Professional Persona: ${analysis.professionalPersona}
         - Technical Skills: ${analysis.technicalSkills.join(', ')}
         - Profile Summary: ${analysis.profileSummary}
         - Overall Impression: ${analysis.overallImpression}
         
         **Repository Highlights**:
         ${analysis.repoAnalyses.map(r => `- ${r.name}: ${r.summary} (Score: ${r.score})`).join('\n')}

         **Strict Instructions**:
         1. Answer questions ONLY related to this specific developer profile, their skills, repositories, or career advice based on the data provided.
         2. If the user asks general questions (e.g., "What is the capital of France?", "Write a poem about dogs"), politely decline and steer them back to the profile analysis.
         3. Be concise, professional, and supportive.
         4. Do not make up facts about the user that are not in the context.
       `;

       chatSession.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: context,
          }
       });

       setMessages([{ role: 'model', text: `Hi! I've analyzed @${user.login}'s profile. I can answer questions about their skills, projects, or provide career insights.` }]);
    }
  }, [isOpen, user, analysis]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSession.current) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Create a placeholder message for the model response
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      const result = await chatSession.current.sendMessageStream({ message: userMsg });
      
      let fullText = "";
      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          setMessages(prev => {
            const newArr = [...prev];
            // Update the last message (the placeholder)
            if (newArr.length > 0) {
              newArr[newArr.length - 1].text = fullText;
            }
            return newArr;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => {
         // Replace the empty placeholder with error text if it exists, or add new error message
         const newArr = [...prev];
         if (newArr.length > 0 && newArr[newArr.length - 1].role === 'model' && newArr[newArr.length - 1].text === "") {
             newArr[newArr.length - 1].text = "Sorry, I encountered an error. Please try again.";
         } else {
             newArr.push({ role: 'model', text: "Sorry, I encountered an error. Please try again." });
         }
         return newArr;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-900/30 transition-all transform hover:scale-105 z-50 flex items-center gap-2 group border border-blue-400/30"
        >
          <MessageSquare size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">
            Ask AI Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-[#0b0f19] border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col animate-fade-in-up overflow-hidden ring-1 ring-white/10">
          
          {/* Header */}
          <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-2 text-white font-medium">
              <Sparkles size={16} className="text-blue-400" />
              Profile Assistant
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                     msg.role === 'user' 
                     ? 'bg-slate-700 border-slate-600 text-slate-300' 
                     : 'bg-blue-900/30 border-blue-800 text-blue-400'
                 }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                 </div>
                 <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
                 }`}>
                    {msg.text}
                 </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.text === "" && (
               <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                 </div>
                 <div className="bg-slate-800 border border-slate-700/50 p-3 rounded-2xl rounded-tl-none text-slate-400 text-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                    </div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-slate-800/80 border-t border-slate-700 backdrop-blur-md">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about skills, projects..."
                className="w-full pl-4 pr-10 py-3 bg-[#0f1420] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-sm transition-all"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-blue-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;