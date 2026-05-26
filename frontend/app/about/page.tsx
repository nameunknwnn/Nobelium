"use client";

import NavigationBar from "../components/common/naviagationBar";
import Footer from "../components/common/footer";

const highlights = [
  {
    title: "AI Agent Pipeline",
    description:
      "Full-stack agent orchestration — users describe a task in natural language and the backend decomposes it into a multi-step pipeline with watcher/updater tool selection, step generation, and streamed execution.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    title: "Streaming Agent Responses",
    description:
      "Real-time Server-Sent Events (SSE) stream agent reasoning and execution steps to the frontend as they happen, giving users live visibility into what the agent is doing.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "JWT Auth with HTTP-Only Cookies",
    description:
      "Secure authentication system using JWT tokens stored in HTTP-only cookies, with middleware-protected routes and automatic token validation.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "Google Sheets & Docs Automation",
    description:
      "Agents can read, write, and update Google Sheets and Docs programmatically — enabling workflows like auto-populating spreadsheets from email data.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125M12 15.375c0-.621-.504-1.125-1.125-1.125" />
      </svg>
    ),
  },
  {
    title: "Python + FastAPI Backend",
    description:
      "High-performance async backend built with FastAPI, featuring CORS middleware, structured route handlers, and clean separation of concerns across auth, agents, and integrations.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
];

const frontendHighlights = [
  {
    title: "Cinematic Hero Section",
    description:
      "Full-viewport hero with a background image, layered gradients, glassmorphism pill badges, and serif/italic typography — crafted to feel premium and editorial.",
  },
  {
    title: "Interactive Agent Catalog",
    description:
      "Tabbed, data-driven component that dynamically switches between agent workflows with animated cards, color-coded tool badges, and before/after time comparisons.",
  },
  {
    title: "Glassmorphism Navigation",
    description:
      "Floating pill-shaped navbar with backdrop blur, translucent background, and subtle border glow — fixed-position with smooth hover transitions.",
  },
  {
    title: "Real-Time Chat Interface",
    description:
      "Agent dashboard with auto-resizing textarea, SSE-streamed markdown rendering, and a responsive card grid for previous automations.",
  },
  {
    title: "Responsive Grid Layouts",
    description:
      "Mobile-first design with CSS grid and flexbox — the footer, catalog, and dashboard all adapt seamlessly across breakpoints.",
  },
  {
    title: "Micro-Interactions & Polish",
    description:
      "Loading spinners, disabled-state styling, hover color transitions, tracking-tight typography, and consistent spacing that makes the UI feel alive.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0e0e10] text-white">
      <NavigationBar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase font-semibold mb-4">
            About This Project
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight mb-6">
            Nobelium — a clone of{" "}
            <em className="italic text-[#5c8a5c]">Trelium</em>
          </h1>
          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            This is a product I built to showcase the work I did on Nobelium.
            It&apos;s a full-stack AI agent platform inspired by Trelium, where
            users can describe a task in plain English and an AI agent
            orchestrates the entire workflow — from watching Gmail to updating
            Google Sheets — automatically.
          </p>
        </div>
      </section>

      {/* Project Highlights */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase font-semibold mb-3">
              What&apos;s Under the Hood
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold">
              Project Highlights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {highlights.map((item, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 group-hover:text-white/90 transition-colors mb-4">
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-white/45 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Landing Page / Frontend Craft */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase font-semibold mb-3">
              Craft & Attention to Detail
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold">
              Frontend Work
            </h2>
            <p className="text-white/50 text-sm mt-3 max-w-xl mx-auto">
              The landing page was intentionally designed to demonstrate a high
              level of core frontend craftsmanship — from layout composition to
              micro-interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frontendHighlights.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 bg-white/[0.03] border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#5c8a5c]/20 border border-[#5c8a5c]/30 flex items-center justify-center text-[#5c8a5c] text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/45 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase font-semibold mb-3">
            Built With
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              "Next.js",
              "React",
              "TypeScript",
              "Tailwind CSS",
              "FastAPI",
              "Python",
              "Google APIs",
              "OpenAI",
              "JWT Auth",
              "SSE Streaming",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full text-sm border border-white/10 bg-white/[0.04] text-white/70"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
