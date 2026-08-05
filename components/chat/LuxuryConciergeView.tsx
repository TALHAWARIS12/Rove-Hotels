"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  MoreVertical,
  X,
  Send,
  ChevronRight,
  Utensils,
  Waves,
  Car,
  MapPin,
  Bell,
  Home,
  Bed,
  Gift,
  PhoneCall,
  Globe,
  Shield,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  User,
  Smartphone,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { DubaiSkylineVector } from "./DubaiSkylineVector";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  feedbackGiven?: "up" | "down" | null;
}

const QUICK_ACTIONS = [
  {
    id: "breakfast",
    text: "Breakfast hours",
    query: "What are the breakfast hours and pricing at Rove Downtown Dubai?",
    icon: Utensils,
  },
  {
    id: "pool_gym",
    text: "Pool & gym",
    query: "What are the rooftop pool and 24/7 gym opening hours and rules?",
    icon: Waves,
  },
  {
    id: "airport",
    text: "Airport transfer",
    query: "Does Rove Downtown offer airport transfers or taxi bookings?",
    icon: Car,
  },
  {
    id: "nearby",
    text: "Things to do nearby",
    query: "What are the top attractions near Rove Downtown Dubai, like Burj Khalifa and Dubai Mall?",
    icon: MapPin,
  },
  {
    id: "services",
    text: "Hotel services",
    query: "What guest services, luggage storage, and amenities are available at the hotel?",
    icon: Bell,
  },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "ru", label: "Русский" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
];

export default function LuxuryConciergeView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const [sessionId, setSessionId] = useState<string>("");
  const [isDesktopFrameMode, setIsDesktopFrameMode] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState("09:41");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session and time
  useEffect(() => {
    let savedSession = localStorage.getItem("rove_chat_session_id");
    if (!savedSession) {
      savedSession = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem("rove_chat_session_id", savedSession);
    }
    setSessionId(savedSession);

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const mins = now.getMinutes().toString().padStart(2, "0");
    setCurrentTimeStr(`${hours}:${mins}`);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  // Handle message sending to API stream
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || isStreaming) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const userMessageId = `user_${Date.now()}`;
    const assistantMessageId = `asst_${Date.now()}`;

    const updatedMessages: Message[] = [
      ...messages,
      { id: userMessageId, role: "user", content: query, timestamp: timeString },
      { id: assistantMessageId, role: "assistant", content: "", timestamp: timeString },
    ];

    setMessages(updatedMessages);
    if (!textToSend) setInput("");
    setIsStreaming(true);
    inputRef.current?.focus();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          sessionId: sessionId || "default_session",
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      if (!response.body) {
        const text = await response.text();
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMessageId ? { ...m, content: text } : m))
        );
        setIsStreaming(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: accumulatedText } : m
          )
        );
      }
    } catch (err) {
      console.error("Error streaming concierge response:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content:
                  "I apologize, but I'm having trouble retrieving live records right now. Please try asking your question again!",
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, feedbackGiven: rating === 5 ? "up" : "down" } : m
      )
    );
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, rating }),
      });
    } catch (e) {
      console.warn("Feedback submission error:", e);
    }
  };

  const startNewChat = () => {
    const newSession = `session_${Date.now()}`;
    localStorage.setItem("rove_chat_session_id", newSession);
    setSessionId(newSession);
    setMessages([]);
    setIsMenuOpen(false);
  };

  // Main UI Content Renderer inside the device view
  const renderAppContent = () => (
    <div className="relative flex flex-col h-full w-full bg-[#F7F4EF] text-[#1C232B] overflow-hidden select-none">
      
      {/* ── 1. LUXURY HEADER BAR ───────────────────────────────── */}
      <header className="sticky top-0 z-30 w-full bg-[#1C232B] text-white px-5 py-3.5 flex items-center justify-between shadow-md border-b border-[#2C3540]">
        {/* Left space/Logo link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity"
          aria-label="Rove Downtown Home"
        >
          <div className="w-6 h-6 rounded-md bg-[#C9A15A] text-[#1C232B] font-extrabold text-xs flex items-center justify-center font-display">
            R
          </div>
        </Link>

        {/* Centered Brand Typography */}
        <div className="text-center flex flex-col items-center justify-center">
          <span className="font-display font-medium text-[15px] sm:text-[16px] tracking-[0.38em] text-white leading-tight">
            R O V E
          </span>
          <span className="text-[9.5px] sm:text-[10px] font-semibold tracking-[0.22em] text-[#C9A15A] uppercase mt-0.5 opacity-95">
            DOWNTOWN DUBAI
          </span>
        </div>

        {/* Right 3-Dot Menu Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[#E5DFD5] transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
          title="Menu"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* ── 2. SCROLLABLE HERO & CHAT BODY ───────────────────── */}
      <div className="relative flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-4 scrollbar-none">
        
        {/* Dubai Skyline SVG Background Vector */}
        <DubaiSkylineVector opacity={0.32} strokeColor="#C9A15A" />

        {/* Status Badge Indicator */}
        <div className="relative z-10 flex items-center justify-center gap-2 pt-1 pb-2">
          <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-[#5A626C]">
            AI Hotel Assistant
          </span>
        </div>

        {/* Initial Hero Welcome Card (Matches Reference Image) */}
        {messages.length === 0 && (
          <div className="relative z-10 space-y-4 animate-fade-in">
            {/* Avatar & Welcome Bubble Container */}
            <div className="flex items-start gap-3">
              {/* Avatar Circle ("R DUBAI") */}
              <div className="w-10 h-10 min-w-10 rounded-full bg-[#1C232B] text-white border border-[#3A434D] shadow-sm flex flex-col items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-display font-extrabold text-[13px] leading-none tracking-tight text-white">
                  R
                </span>
                <span className="text-[6.5px] font-bold tracking-tighter text-[#C9A15A] leading-none mt-[1px]">
                  DUBAI
                </span>
              </div>

              {/* Welcome Message Card */}
              <div className="flex-1 bg-white rounded-[22px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)] border border-[#EBE5DB] text-[#1C232B] space-y-3">
                <h2 className="font-bold text-[16px] sm:text-[17px] leading-snug text-[#1C232B]">
                  👋 Welcome to Rove <br />
                  Downtown Dubai!
                </h2>
                
                <p className="text-[14px] text-[#4A5059] leading-relaxed">
                  How can I assist you today?
                </p>

                {/* Multilingual Support Banner */}
                <div className="bg-[#F6F2EB] border border-[#E8E1D5] rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-[12.5px] text-[#4A5059] font-medium">
                  <span className="text-base leading-none">🌍</span>
                  <span>You can ask your questions in any language.</span>
                </div>

                <div className="text-right text-[10px] text-[#9EA3AB] font-mono pt-0.5">
                  {currentTimeStr}
                </div>
              </div>
            </div>

            {/* Quick Answer Pills (Vertical Stacked Action Buttons) */}
            <div className="w-full space-y-2.5 pt-1" role="list">
              {QUICK_ACTIONS.map(({ id, text, query, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleSendMessage(query)}
                  disabled={isStreaming}
                  className="w-full bg-white/95 backdrop-blur-sm border border-[#E5DFD5] hover:border-[#C9A15A]/60 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(201,161,90,0.12)] active:scale-[0.99] transition-all duration-200 rounded-full px-4 py-3.5 flex items-center justify-between group cursor-pointer"
                  role="listitem"
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-4 h-4 text-[#7A6B58] group-hover:text-[#C9A15A] transition-colors" />
                    <span className="font-medium text-[14px] text-[#2C3238] group-hover:text-[#1C232B]">
                      {text}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#B0A79B] group-hover:translate-x-0.5 group-hover:text-[#C9A15A] transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Conversation Stream Mode */}
        {messages.length > 0 && (
          <div className="relative z-10 space-y-4 pt-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 animate-fade-in ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                {msg.role === "assistant" ? (
                  <div className="w-9 h-9 min-w-9 rounded-full bg-[#1C232B] text-white border border-[#3A434D] shadow-sm flex flex-col items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-display font-extrabold text-[12px] leading-none text-white">
                      R
                    </span>
                    <span className="text-[6px] font-bold tracking-tighter text-[#C9A15A] leading-none mt-[1px]">
                      DUBAI
                    </span>
                  </div>
                ) : (
                  <div className="w-9 h-9 min-w-9 rounded-full bg-[#C9A15A] text-[#1C232B] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4 text-[#1C232B]" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-[20px] p-4 text-[13.5px] leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#1C232B] text-white rounded-tr-xs"
                      : "bg-white text-[#1C232B] border border-[#EBE5DB] rounded-tl-xs shadow-[0_3px_16px_rgba(0,0,0,0.04)]"
                  }`}
                >
                  {msg.role === "assistant" && !msg.content ? (
                    <div className="flex items-center gap-1.5 py-1 px-1">
                      <span className="w-2 h-2 rounded-full bg-[#C9A15A] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-[#C9A15A] animate-bounce" style={{ animationDelay: "200ms" }} />
                      <span className="w-2 h-2 rounded-full bg-[#C9A15A] animate-bounce" style={{ animationDelay: "400ms" }} />
                    </div>
                  ) : (
                    <div className={msg.role === "assistant" ? "prose prose-sm max-w-none text-[#1C232B] prose-p:my-1 prose-li:my-0.5" : ""}>
                      {msg.role === "assistant" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  )}

                  {/* Feedback Controls for Assistant */}
                  {msg.role === "assistant" && msg.content && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0EBE1] text-[10.5px]">
                      <span className="flex items-center gap-1 text-[#2E7D32] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Rove Info
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFeedback(msg.id, 5)}
                          className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                            msg.feedbackGiven === "up" ? "text-[#2E7D32]" : "text-gray-400"
                          }`}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 1)}
                          className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                            msg.feedbackGiven === "down" ? "text-red-500" : "text-gray-400"
                          }`}
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.timestamp && (
                    <div className={`text-[9.5px] mt-1 font-mono text-right ${msg.role === "user" ? "text-gray-400" : "text-gray-400"}`}>
                      {msg.timestamp}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* ── 3. FLOATING FIXED INPUT BAR ──────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-[#F7F4EF] via-[#F7F4EF]/95 to-transparent backdrop-blur-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative max-w-lg mx-auto"
        >
          <div className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#E5DFD5] rounded-full p-1.5 pl-5 flex items-center gap-2 transition-shadow focus-within:shadow-[0_6px_28px_rgba(201,161,90,0.2)] focus-within:border-[#C9A15A]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="w-full bg-transparent text-[14px] text-[#1C232B] placeholder:text-[#9EA3AB] focus:outline-none pr-1"
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="w-10 h-10 min-w-10 rounded-full bg-[#1C232B] hover:bg-[#C9A15A] disabled:opacity-40 text-white flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="text-center mt-2">
            <span className="text-[10px] tracking-[0.1em] uppercase text-[#9EA3AB] font-semibold">
              Powered by AL BAYAN AI
            </span>
          </div>
        </form>
      </div>

      {/* ── 4. SLIDE-IN 3-DOT OVERLAY MENU ───────────────────── */}
      {isMenuOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full bg-[#1C232B] text-white rounded-t-[28px] p-6 space-y-5 border-t border-[#3A434D] animate-slide-up max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2C3540]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C9A15A] text-[#1C232B] font-extrabold text-sm flex items-center justify-center font-display">
                  R
                </div>
                <div>
                  <h3 className="font-display text-sm tracking-widest text-white">ROVE DOWNTOWN DUBAI</h3>
                  <p className="text-[10px] text-[#C9A15A]">Guest Navigation &amp; Services</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-300"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Navigation Links */}
            <div className="space-y-1.5 text-sm">
              {[
                { label: "Home Page", href: "/", icon: Home },
                { label: "Rover Rooms & Suites", href: "/#rooms", icon: Bed },
                { label: "Dining at TGIF & The Daily", href: "/#dining", icon: Utensils },
                { label: "Rooftop Pool & 24/7 Gym", href: "/#pool", icon: Waves },
                { label: "Special Offers & Packages", href: "/#offers", icon: Gift },
                { label: "Contact Front Desk (+971 4 561 9000)", href: "tel:+97145619000", icon: PhoneCall },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-gray-200 font-medium"
                >
                  <Icon className="w-4 h-4 text-[#C9A15A]" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Language Selector */}
            <div className="pt-3 border-t border-[#2C3540]">
              <div className="flex items-center gap-2 text-xs text-[#C9A15A] font-semibold mb-2.5">
                <Globe className="w-3.5 h-3.5" />
                <span>SELECT PREFERRED LANGUAGE</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      selectedLang === lang.code
                        ? "bg-[#C9A15A] text-[#1C232B] font-bold border-[#C9A15A]"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar inside Menu */}
            <div className="pt-3 border-t border-[#2C3540] flex items-center gap-3">
              <button
                onClick={startNewChat}
                className="flex-1 flex items-center justify-center gap-2 bg-[#C9A15A] text-[#1C232B] font-bold py-3 rounded-xl text-xs hover:bg-[#b58e49] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Start New Chat</span>
              </button>
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3 px-4 rounded-xl text-xs hover:bg-white/20 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <div className="min-h-dvh bg-[#151A21] text-white flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 font-sans">
      
      {/* Top Bar for Desktop View Controls */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[430px] mb-3 px-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C9A15A]" />
          <span className="font-mono text-[11px] text-gray-300">ROVE QR ENTRY APP</span>
        </div>
        <button
          onClick={() => setIsDesktopFrameMode(!isDesktopFrameMode)}
          className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors bg-white/10 px-2.5 py-1 rounded-md text-[11px] cursor-pointer"
        >
          {isDesktopFrameMode ? (
            <>
              <Maximize2 className="w-3 h-3 text-[#C9A15A]" />
              <span>Expand View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3 text-[#C9A15A]" />
              <span>Mobile Mockup</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container Adaptation */}
      <div
        className={`w-full transition-all duration-300 ${
          isDesktopFrameMode
            ? "sm:max-w-[430px] sm:h-[860px] sm:max-h-[92dvh] sm:rounded-[40px] sm:border-[8px] sm:border-[#1C232B] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden h-dvh"
            : "max-w-3xl h-dvh sm:h-[90dvh] sm:rounded-2xl sm:border border-white/10 overflow-hidden shadow-2xl"
        }`}
      >
        {renderAppContent()}
      </div>
    </div>
  );
}
