"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Step {
  step: number;
  text: string;
}

interface Message {
  role: string;
  content: string | { type: string; text: string }[];
}

interface AgentThread {
  id: string;
  title: string;
  watcheTool: string;
  updateTool: string;
  steps: Step[];
  message: string | Message[];
}

function extractText(content: string | { type: string; text: string }[]): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n");
  }
  return "";
}

function parseMessages(raw: string | Message[]): Message[] {
  if (!raw) return [];
  try {
    const parsed: Message[] = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed.filter((m) => m.role === "user" || m.role === "assistant");
  } catch {
    return [];
  }
}

export default function AgentThreadPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<AgentThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const init = async () => {
      const authRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, {
        credentials: "include",
      });
      if (authRes.status !== 200) {
        router.push("/signin");
        return;
      }
      await fetchThread();
    };
    init();
  }, [slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchThread = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/agent/${slug}`, {
        credentials: "include",
      });
      if (!res.ok) {
        router.push("/user");
        return;
      }
      const data = await res.json();
      const t: AgentThread = data.agent;
      setAgent(t);
      setMessages(parseMessages(t.message));
    } catch {
      router.push("/user");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!prompt.trim() || sending) return;
    const userMsg: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setSending(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt: userMsg.content, thread_id: slug }),
      });
      const data = await res.json();
      const newMsgs = data.response?.messages ?? [];
      const parsed = parseMessages(newMsgs);
      // append only the new assistant reply
      const lastAssistant = [...parsed].reverse().find((m) => m.role === "assistant");
      if (lastAssistant) {
        setMessages((prev) => [...prev, lastAssistant]);
      }
      // refresh metadata (steps may have updated)
      await fetchThread();
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 140) + "px";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="h-screen bg-[#0e0e10] text-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => router.push("/user")}
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <span className="text-white/10">|</span>
        <span className="text-sm font-medium text-white/70 truncate">{agent.title || "Untitled Automation"}</span>
      </header>

      {/* Body: split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <aside className="w-80 flex-shrink-0 border-r border-white/5 flex flex-col overflow-y-auto p-5 gap-6">
          {/* Title */}
          <div>
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Automation</p>
            <h2 className="text-lg font-semibold leading-snug">{agent.title || "Untitled"}</h2>
          </div>

          {/* Apps */}
          <div>
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Apps</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.04] border border-white/8 rounded-xl p-3">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Watches</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-xs text-white font-medium truncate">{agent.watcheTool || "—"}</span>
                </div>
              </div>
              <div className="bg-white/[0.04] border border-white/8 rounded-xl p-3">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Updates</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-white font-medium truncate">{agent.updateTool || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          {agent.steps?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Steps</p>
              <ol className="space-y-2">
                {agent.steps.map((s) => (
                  <li key={s.step} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/8 border border-white/10 text-[10px] font-semibold text-white/50 flex items-center justify-center mt-0.5">
                      {s.step}
                    </span>
                    <span className="text-xs text-white/60 leading-relaxed">{s.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </aside>

        {/* RIGHT PANEL — conversation */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-white/20">No messages yet. Continue the conversation below.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-white text-black rounded-br-sm"
                      : "bg-white/[0.05] border border-white/8 text-white/80 rounded-bl-sm"
                  }`}
                >
                  {extractText(msg.content as string | { type: string; text: string }[])}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white/[0.05] border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 px-6 pb-6">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  autoResize();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Continue the conversation..."
                rows={1}
                className="w-full bg-transparent text-white placeholder-white/20 text-sm resize-none outline-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/5">
                <span className="text-[11px] text-white/20">Enter to send · Shift+Enter for new line</span>
                <button
                  onClick={handleSend}
                  disabled={!prompt.trim() || sending}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <span className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M1 8l14-7-5 7 5 7-14-7z" />
                    </svg>
                  )}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
