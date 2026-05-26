"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

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

interface AgentSummary {
  id: string;
  title: string;
  watcheTool: string;
  updateTool: string;
  steps: Step[];
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

export default function AgentThreadPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<AgentThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [allAgents, setAllAgents] = useState<AgentSummary[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      await Promise.all([fetchThread(), fetchAllAgents()]);
    };
    init();
  }, [slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchAllAgents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/all-agents`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAllAgents(data.agents ?? []);
      }
    } catch {}
  };

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
      setAgent(data);
      setMessages(
        (data.messages ?? []).map((m: { role: string; message: { content: string } }) => ({
          role: m.role,
          content: m.message?.content ?? "",
        }))
      );
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

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          for (const line of part.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                if (!assistantAdded) {
                  setMessages((prev) => [...prev, { role: "assistant", content: data.token }]);
                  assistantAdded = true;
                } else {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last?.role === "assistant") {
                      updated[updated.length - 1] = {
                        ...last,
                        content: (last.content as string) + data.token,
                      };
                    }
                    return updated;
                  });
                }
              }
            } catch {}
          }
        }
      }

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
    <div className="h-screen bg-[#0e0e10] text-white flex overflow-hidden">
      {/* Sidebar — all workflows */}
      <aside
        className={`flex-shrink-0 border-r border-white/5 flex flex-col bg-[#0a0a0c] transition-all duration-200 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 min-w-[256px]">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/nobelium.png" alt="Nobelium" className="w-8 h-8  " />
            <span className="text-sm font-semibold tracking-tight">Nobelium</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/30 hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M11 3L6 8l5 5" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3 min-w-[256px]">
          <button
            onClick={() => router.push("/user")}
            className="w-full flex items-center gap-2 px-3 py-2 mb-3 rounded-lg border border-dashed border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors text-xs"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
            New automation
          </button>

          <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-3 mb-2">
            Workflows
          </p>
          <div className="space-y-0.5">
            {allAgents.map((a) => (
              <button
                key={a.id}
                onClick={() => router.push(`/user/${a.id}`)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors truncate ${
                  a.id === slug
                    ? "bg-white/[0.08] text-white"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                }`}
              >
                {a.title || "Untitled"}
              </button>
            ))}
            {allAgents.length === 0 && (
              <p className="text-xs text-white/15 px-3 py-2">No workflows yet</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 flex-shrink-0">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white/30 hover:text-white transition-colors p-1 mr-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 4h12M2 8h12M2 12h12" />
              </svg>
            </button>
          )}
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
          {/* LEFT DETAIL PANEL */}
          <aside className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col overflow-y-auto p-5 gap-6">
            <div>
              <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Automation</p>
              <h2 className="text-lg font-semibold leading-snug">{agent.title || "Untitled"}</h2>
            </div>

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
                  {msg.role === "user" ? (
                    <div className="max-w-[75%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed bg-white text-black">
                      {extractText(msg.content as string | { type: string; text: string }[])}
                    </div>
                  ) : (
                    <div className="max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-white/[0.05] border border-white/8 text-white/80 prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-white prose-code:text-emerald-300 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-white/[0.06] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg">
                      <ReactMarkdown>
                        {extractText(msg.content as string | { type: string; text: string }[])}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
              {sending && messages[messages.length - 1]?.role === "user" && (
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
    </div>
  );
}
