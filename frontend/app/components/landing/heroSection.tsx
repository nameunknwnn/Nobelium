"use client";
import { useRouter } from "next/navigation";

export default function HeroSection() {

  const router = useRouter();
  return (
    <section className="relative h-screen min-h-[700px]">
      <img
        src="/hero-v3.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white gap-6 px-4 pt-16">
        <div className="flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 text-sm text-white/90 shadow-lg">
          <span>Built by engineer from the internet </span>
          <img src="/nobelium.png" alt="Nobelium" className="w-7 h-7  " />
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center leading-tight tracking-tight font-serif">
          Get Work Done{" "}
          <em className="italic font-normal">for You</em>
        </h1>

        <p className="max-w-2xl text-center text-white/85 text-base md:text-lg leading-relaxed">
          Orders entered. Quotes built. POs matched to invoices, automatically.
          <br />
          Nobelium agents handle the repetitive work across every app your team runs.
        </p>

        <div className="flex items-center gap-4 mt-4">
          <button className="bg-white text-black font-medium text-sm px-6 py-3 rounded-full shadow-lg hover:bg-white/90 transition-colors flex items-center gap-2" onClick={() => router.push("/signup")}>
            See it with your workflow <span>→</span>
          </button>
          <button className="flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 text-sm text-white/90 shadow-lg" onClick={() => router.push("http://nameunknwnn-website.vercel.app")}>
            connect with me <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
