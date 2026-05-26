"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSendMail() {
    if (!email || !content) return;
    setSending(true);
    setStatus("idle");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, content }),
        }
      );
      if (res.ok) {
        setStatus("success");
        setEmail("");
        setContent("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <footer className="relative overflow-hidden">
      <img
        src="/footer-bg.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1714]/95 via-[#1a1714]/80 to-transparent" />

      <div className="relative z-10 pt-20 pb-8 px-6">
        <div className="max-w-5xl mx-auto">

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
            <div>
              <button className="flex items-center gap-2 mb-2" onClick={() => router.push("/")}>
              <img src="/nobelium.png" alt="Nobelium" className="w-8 h-8  " />
                <span className="text-lg font-semibold text-white">Nobelium</span>
              </button>
              <p className="text-sm text-white/50">Automate the work that runs on repeat.</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://github.com/nameunknwnn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </a>
              <a href="https://x.com/nameunknwn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/aditya-rawat-a1894a216/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="mailto:adirawat2016@gmail.com" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-semibold tracking-[0.15em] text-white/40 uppercase mb-1">Product</h3>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">How it works</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">Pricing</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">Impact</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">FAQ</a>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-semibold tracking-[0.15em] text-white/40 uppercase mb-1">Resources</h3>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">Blog</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">Use cases</a>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-semibold tracking-[0.15em] text-white/40 uppercase mb-1">Compare</h3>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">Overview</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">ChatGPT alternative</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">Claude alternative</a>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-semibold tracking-[0.15em] text-white/40 uppercase mb-1">Company</h3>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">Book a demo</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">About</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">Enterprise</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">Trust Center</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">Privacy</a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition">Terms</a>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-1">Send us a mail</h2>
            <p className="text-sm text-white/50 mb-4">Have a question or feedback? Drop us a message.</p>
            <div className="flex flex-col gap-2 max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your email"
                className="border border-white/20 bg-white/[0.06] text-white placeholder-white/35 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-white/40 transition"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Your message..."
                rows={3}
                className="border border-white/20 bg-white/[0.06] text-white placeholder-white/35 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-white/40 transition resize-none"
              />
              <button
                onClick={handleSendMail}
                disabled={sending || !email || !content}
                className="bg-white text-black rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed w-fit"
              >
                {sending ? "Sending..." : "Send Mail"}
              </button>
              {status === "success" && (
                <p className="text-sm text-green-400">Message sent successfully!</p>
              )}
              {status === "error" && (
                <p className="text-sm text-red-400">Failed to send. Please try again.</p>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/45">Made with love in Uttarakhand · © 2026 Nobelium Inc. All rights reserved.</p>
            <p className="text-xs text-white/35">Backed by Y Combinator</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
