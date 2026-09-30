import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { answerFinancialQuery, AssistantMessage } from '../../services/assistantService';
import { Sparkles, Send, ArrowRight, Bot, User, ShieldCheck } from 'lucide-react';

export const AssistantChat: React.FC = () => {
  const navigate = useNavigate();
  const { state, analytics } = useApp();

  const suggestedPrompts = [
    'How much did I spend on food?',
    'Where am I spending the most?',
    'Why did spending increase?',
    'How much can I save this month?',
    'What was my biggest expense?'
  ];

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello ${state.auth.user?.name?.split(' ')[0] || 'Aarav'}! I'm your guided financial intelligence copilot. I calculate answers directly from your active September ledger. Click a question below or ask me about your spending patterns.`,
      timestamp: 'Just now'
    }
  ]);

  const handleSend = (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Realistic typing delay
    setTimeout(() => {
      const res = answerFinancialQuery(q, state.expenses, analytics);
      const botMsg: AssistantMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: res.suggestedAction
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 550);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/90 to-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Guided Financial Assistant</h3>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Based on {state.expenses.length} confirmed transactions</span>
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
          Deterministic Rule Engine
        </span>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-blue-600" />}
            </div>

            <div
              className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs space-y-2.5'
              }`}
            >
              <div className="whitespace-pre-line font-medium leading-relaxed">{msg.text}</div>

              {msg.suggestedAction && (
                <div className="pt-2 border-t border-slate-200/60 mt-1">
                  <button
                    onClick={() => navigate(msg.suggestedAction!.route)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200/70 rounded-xl transition-all shadow-2xs hover:shadow-xs"
                  >
                    <span>{msg.suggestedAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <span
                className={`block text-[10px] font-mono mt-1 ${
                  msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Bot className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-2xs">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Question Chips */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Ask:</span>
          {suggestedPrompts.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => handleSend(p)}
              className="text-xs px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 rounded-xl border border-slate-200 text-slate-700 transition-all shadow-2xs font-medium"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3.5 border-t border-slate-200/80 bg-white flex items-center gap-2.5"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question about food expenses, top category, or savings..."
          className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 rounded-xl transition-all shadow-xs shadow-blue-500/20 shrink-0"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
