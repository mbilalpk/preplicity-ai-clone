import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../supabase/client";
import { Search, ArrowUp, Copy, Share2, Edit3, Loader, Globe, Mic, Image as ImageIcon, MoreHorizontal, Zap, Sun, BookOpen, BarChart2, FlaskConical } from 'lucide-react';

export default function QueryBox() {
  const { user } = useUser();
  const location = useLocation();
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHomePage, setIsHomePage] = useState(true);
  const chatEndRef = useRef(null);

  const suggestionButtons = [
    { icon: Zap, label: 'Troubleshoot' },
    { icon: Sun, label: 'Learn' },
    { icon: BookOpen, label: 'Summarize' },
    { icon: BarChart2, label: 'Analyze' },
    { icon: FlaskConical, label: 'Sports' }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  // Reset state when "?new=true" is in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("new") === "true") {
      setQuestion("");
      setResponse("");
      setHistory([]);
      setIsHomePage(true);
    }
  }, [location]);

  const askQuestion = async () => {
    if (!question.trim()) return;

    // Add user question to history and switch to chat view
    const newHistory = [...history, { type: 'user', text: question }];
    setHistory(newHistory);
    setIsHomePage(false);
    setLoading(true);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: question }]
        })
      });

      const data = await res.json();
      const answer = data?.choices?.[0]?.message?.content || "No answer.";
      
      // Add AI response to history
      setHistory(prev => [...prev, { type: 'ai', text: answer }]);
      setResponse(answer);

      await supabase.from("queries").insert([
        {
          question,
          response: answer,
          user_email: user?.primaryEmailAddress?.emailAddress,
        },
      ]);
    } catch (err) {
      console.error("Error:", err);
      setHistory(prev => [...prev, { type: 'ai', text: "Sorry, I couldn't fetch a response. Please try again." }]);
    } finally {
      setLoading(false);
    }

    setQuestion("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const handleSuggestionClick = (label) => {
    setQuestion(`Help me ${label.toLowerCase()}`);
  };

  // Home Page View
  if (isHomePage && history.length === 0) {
    return (
      <div className="ml-64 flex-1 flex flex-col items-center justify-center p-4 bg-[#FBFBFA]">
        <div className="w-full max-w-2xl">
          <h1 className="text-center text-6xl font-light text-gray-600 mb-8" style={{fontFamily: "'Helvetica Neue', sans-serif"}}>
            perplexity
          </h1>
          
          {/* Search Input */}
          <div className="relative w-full shadow-sm">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="p-1.5 rounded-md hover:bg-gray-200">
                <Search size={20} className="text-gray-500" />
              </button>
              <span className="h-5 w-px bg-gray-300"></span>
              <button className="p-1.5 rounded-md hover:bg-gray-200">
                <ImageIcon size={20} className="text-gray-500" />
              </button>
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or @mention a Space"
              className="w-full bg-white border border-gray-300 rounded-xl py-4 pl-28 pr-28 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
              rows={1}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="p-1.5 rounded-md hover:bg-gray-200">
                <Globe size={20} className="text-gray-500" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-gray-200">
                <Mic size={20} className="text-gray-500" />
              </button>
              <button 
                onClick={askQuestion} 
                className="p-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors" 
                disabled={!question.trim()}
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </div>

          {/* Suggestion Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {suggestionButtons.map(({icon: Icon, label}) => (
              <button 
                key={label} 
                onClick={() => handleSuggestionClick(label)}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700"
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Chat Page View
  return (
    <div className="ml-64 flex-1 flex flex-col h-screen bg-[#FBFBFA]">
      {/* Header */}
      <header className="flex justify-end items-center p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <MoreHorizontal size={20}/>
          </button>
          <button className="px-4 py-2 text-sm font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600">
            Share
          </button>
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {history.map((item, index) => (
            <div key={index} className="mb-8">
              {item.type === 'user' ? (
                <div className="text-xl font-semibold mb-6 text-gray-800">
                  {item.text}
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.5L3.5 6.5V17.5L12 21.5L20.5 17.5V6.5L12 2.5Z" stroke="#0D9488" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M12 13.5L3.5 9.5" stroke="#0D9488" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M12 13.5V21.5" stroke="#0D9488" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M12 13.5L20.5 9.5" stroke="#0D9488" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M16.75 4.5L7.25 9.5" stroke="#0D9488" strokeWidth="2" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h2 className="font-bold text-gray-800">Answer</h2>
                  </div>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap pl-10">
                    {item.text}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 pl-10">
                    <button className="flex items-center gap-1 hover:text-gray-900">
                      <Share2 size={16}/> Share
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-900">
                      <Copy size={16}/> Export
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-900">
                      <Edit3 size={16}/> Rewrite
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex items-center pl-10">
              <Loader className="animate-spin text-teal-600 mr-3" size={18} />
              <p className="text-gray-600">Thinking...</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Bottom Search Input */}
      <div className="p-4 md:px-8 md:pb-8 border-t border-gray-200 bg-[#FBFBFA]">
        <div className="max-w-3xl mx-auto">
          <div className="relative w-full shadow-sm">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="p-1.5 rounded-md hover:bg-gray-200">
                <Search size={20} className="text-gray-500" />
              </button>
              <span className="h-5 w-px bg-gray-300"></span>
              <button className="p-1.5 rounded-md hover:bg-gray-200">
                <ImageIcon size={20} className="text-gray-500" />
              </button>
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up..."
              className="w-full bg-white border border-gray-300 rounded-xl py-4 pl-28 pr-28 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
              rows={1}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="p-1.5 rounded-md hover:bg-gray-200">
                <Globe size={20} className="text-gray-500" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-gray-200">
                <Mic size={20} className="text-gray-500" />
              </button>
              <button 
                onClick={askQuestion} 
                className="p-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors" 
                disabled={!question.trim()}
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}