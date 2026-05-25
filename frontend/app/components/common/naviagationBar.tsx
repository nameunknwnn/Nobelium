"use client";

import { useRouter } from "next/navigation";

export default function NavigationBar() {
  const router = useRouter();
  return (
    <div className="flex justify-center">
      <nav className="z-50 fixed top-4 bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full py-2 px-6">
        <div className="flex items-center gap-8">
          <button className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
            <span className="inline-block w-5 h-5 rounded-md bg-white/20 border border-white/30" />
            Nobelium
          </button>
          <div className="hidden md:flex items-center gap-5 text-[13px] text-white/70">
            <button className="hover:text-white transition-colors">Product</button>
            <button className="hover:text-white transition-colors">Pricing</button>
            <button className="hover:text-white transition-colors">Enterprise</button>
            <button className="hover:text-white transition-colors">Blog</button>
            <button className="hover:text-white transition-colors">About</button>
            <button className="hover:text-white transition-colors flex items-center gap-1">
              Use Cases <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <button
            className="text-[13px] font-medium bg-white text-black hover:bg-white/90 transition-colors px-4 py-1.5 rounded-lg shadow-sm"
            onClick={() => router.push("/signup")}
          >
            Book a demo
          </button>
        </div>
      </nav>
    </div>
  );
}
