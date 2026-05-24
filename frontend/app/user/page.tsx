"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface Agent {
  id: string;
  title: string;
  watcheTool: string;
  updateTool: string;
  steps: { step: number; text: string }[];
}

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, {
        credentials: "include",
      });
      if (res.status !== 200) {
        router.push("/signin");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (loading) return;
    fetchAgents();
  }, [loading]);

  const fetchAgents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/all-agents`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents ?? []);
      }
    } catch {}
  };

  const handleSend = async () => {
    if (!prompt.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.thread_id) {
        router.push(`/user/${data.thread_id}`);
      }
    } catch {
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
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-white/15 border border-white/20" />
          <span className="font-semibold tracking-tight text-white">Nobelium</span>
        </div>
        <button
          onClick={() => (window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/google/oauth`)}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/80 hover:text-white"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Connect Google
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-2xl flex flex-col items-center gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">What would you like to automate?</h1>
            <p className="text-white/40 text-sm">Describe your task and the AI agent will handle it for you.</p>
          </div>

          {/* Input card */}
          <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-4 shadow-xl">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Monitor Gmail for order emails and auto-reply with a confirmation..."
              rows={3}
              className="w-full bg-transparent text-white placeholder-white/25 text-sm resize-none outline-none leading-relaxed"
            />
            <div className="flex items-center justify-end mt-3 pt-3 border-t border-white/5">
              <button
                onClick={handleSend}
                disabled={!prompt.trim() || sending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1 8l14-7-5 7 5 7-14-7z" />
                  </svg>
                )}
                {sending ? "Running..." : "Run agent"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Previous automations */}
      {agents.length > 0 && (
        <section className="px-6 pb-10 max-w-5xl mx-auto w-full">
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Previous automations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => router.push(`/user/${agent.id}`)}
                className="text-left bg-white/[0.03] hover:bg-white/[0.07] border border-white/8 hover:border-white/15 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white leading-snug">{agent.title || "Untitled"}</p>
                  <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3 3h10v10h-2V6.414L4.707 12.707l-1.414-1.414L9.586 5H3V3z" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {agent.watcheTool && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {agent.watcheTool}
                    </span>
                  )}
                  {agent.updateTool && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {agent.updateTool}
                    </span>
                  )}
                </div>
                {agent.steps?.length > 0 && (
                  <p className="text-xs text-white/30 mt-2">{agent.steps.length} step{agent.steps.length !== 1 ? "s" : ""}</p>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
