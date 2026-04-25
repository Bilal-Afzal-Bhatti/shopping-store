// src/components/Chatbot.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, ShoppingBag, Loader2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

interface Message {
  id:        string;
  role:      'bot' | 'user';
  text:      string;
  options?:  string[];
  products?: Product[];
  time:      Date;
}

interface Product {
  _id:      string;
  name:     string;
  price:    number;
  image:    string;
  discount?: string;
}

const formatText = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/~~(.*?)~~/g,     '<s>$1</s>')
    .replace(/\n/g,            '<br/>');
};

export default function Chatbot() {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id:      '1',
      role:    'bot',
      text:    "👋 Hi! Welcome to **EXCLUSIVE**. I'm your shopping assistant. How can I help you?",
      options: ['🛍️ Browse Products', '📦 Track Order', '🚚 Shipping Info', '💳 Payment Options'],
      time:    new Date(),
    },
  ]);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const userId     = localStorage.getItem('userId') ?? undefined;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id:   Date.now().toString(),
      role: 'user',
      text,
      time: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axiosInstance.post('/chatbot/message', {
        message: text,
        userId,
      });

      const { reply, options, data } = res.data;

      const botMsg: Message = {
        id:       Date.now().toString() + '_bot',
        role:     'bot',
        text:     reply,
        options,
        products: data?.type === 'products' ? data.products : undefined,
        time:     new Date(),
      };
      setMessages(prev => [...prev, botMsg]);

    } catch {
      setMessages(prev => [...prev, {
        id:   Date.now().toString() + '_err',
        role: 'bot',
        text: "⚠️ Sorry, I'm having trouble connecting. Please try again.",
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#DB4444] text-white
                   rounded-full shadow-lg flex items-center justify-center
                   hover:bg-[#c33d3d] transition-colors"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={22} />
              </motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <MessageCircle size={22} />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* ── Chat window ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[400px]
                       bg-white rounded-2xl shadow-2xl border border-gray-100
                       flex flex-col overflow-hidden"
            style={{ maxHeight: '75vh' }}
          >
            {/* Header */}
            <div className="bg-[#DB4444] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm leading-none">EXCLUSIVE Assistant</p>
                <p className="text-red-200 text-xs mt-0.5">Always here to help</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
                 style={{ scrollbarWidth: 'thin' }}>
              {messages.map((msg) => (
                <div key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.role === 'bot' ? 'bg-[#DB4444]' : 'bg-gray-800'
                  }`}>
                    {msg.role === 'bot'
                      ? <Bot size={14} className="text-white" />
                      : <User size={14} className="text-white" />
                    }
                  </div>

                  <div className={`flex flex-col gap-1.5 max-w-[78%] ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}>
                    {/* Bubble */}
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#DB4444] text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                      dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                    />

                    {/* Product cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="flex flex-col gap-2 w-full mt-1">
                        {msg.products.map((p) => (
                          <div key={p._id}
                            className="flex items-center gap-2.5 bg-white border border-gray-200
                                       rounded-xl p-2.5 hover:shadow-md transition cursor-pointer"
                            onClick={() => window.location.href = `/product/${p.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <img src={p.image} alt={p.name}
                              className="w-12 h-12 object-contain rounded-lg bg-gray-50 shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/48x48?text=?'; }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                              <p className="text-xs text-[#DB4444] font-bold">${p.price}</p>
                            </div>
                            {p.discount && p.discount !== 'No Discount' && (
                              <span className="text-[10px] bg-[#DB4444] text-white px-1.5 py-0.5 rounded-md font-bold shrink-0">
                                {p.discount}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick options */}
                    {msg.options && msg.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.options.map((opt) => (
                          <button key={opt} onClick={() => sendMessage(opt)}
                            className="text-xs px-3 py-1.5 rounded-full border border-[#DB4444]
                                       text-[#DB4444] hover:bg-[#DB4444] hover:text-white
                                       transition-all font-medium"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Time */}
                    <span className="text-[10px] text-gray-400 px-1">
                      {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2.5 items-end">
                  <div className="w-7 h-7 rounded-full bg-[#DB4444] flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i}
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <ShoppingBag size={15} className="text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800
                             placeholder-gray-400 min-w-0"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 bg-[#DB4444] text-white rounded-lg flex items-center
                             justify-center hover:bg-[#c33d3d] transition disabled:opacity-40
                             disabled:cursor-not-allowed shrink-0"
                >
                  {loading
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Send size={14} />
                  }
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-1.5">
                Powered by EXCLUSIVE AI
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}