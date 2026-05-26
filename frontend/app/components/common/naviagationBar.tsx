"use client";

import { useRouter } from "next/navigation";

export default function NavigationBar() {
  const router = useRouter();
  return (
    <div className="flex justify-center">
      <nav className="z-50 fixed top-4 bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full py-2 px-6">
        <div className="flex items-center gap-8">
          <button className="text-sm   font-semibold text-white tracking-tight flex items-center gap-1.5" onClick={() => router.push("/")}>
              <img src="/nobelium.png" alt="Nobelium" className="w-8 h-8  " />
            Nobelium
          </button>
          <div className="hidden md:flex items-center gap-5 text-[13px] text-white/70">
            <button className="hover:text-white transition-colors" onClick={() => router.push("/user")}>Product</button>
            <button className="hover:text-white transition-colors" onClick={() => router.push("/blogs")}>Blog</button>
            <button className="hover:text-white transition-colors" onClick={() => router.push("/about")}>About</button>
          </div>
          <button
            className="text-[13px] font-medium bg-white text-black hover:bg-white/90 transition-colors px-4 py-1.5 rounded-lg shadow-sm"
            onClick={() => router.push("/signup")}
          >
            Get Started
          </button>
        </div>
      </nav>
    </div>
  );
}
