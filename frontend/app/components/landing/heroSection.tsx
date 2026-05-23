export default function HeroSection() {
  return (
    <div>
      <div className="relative h-screen min-h-[700px]">
        <img src="/hero-v3.webp" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-6 px-4">
          <div className="flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/90 shadow-lg">
            Built by engineers from
            <img src="/globe.svg" alt="globe" className="h-4 w-4" />
            and backed by
            <span className="font-bold text-orange-400">Y</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center leading-tight drop-shadow-xl [font-family:var(--font-jansta)]">
            Get Work Done{" "}
            <span className="italic underline underline-offset-4 font-serif">
              for You
            </span>
          </h1>

          <p className="max-w-xl text-center text-white/80 text-base md:text-lg leading-relaxed">
            Reports created. Invoices generated. Customers updated.
            <br />
            Nobelium agents produce the finished work across every app you use.
          </p>

          <div className="flex items-center gap-4 mt-2">
            <button className="bg-white text-black font-medium text-sm px-6 py-2.5 rounded-xl shadow-lg hover:bg-white/90 transition-colors flex items-center gap-1.5">
              Book a free demo <span>→</span>
            </button>
            <button className="text-white font-medium text-sm px-6 py-2.5 rounded-xl border border-white/40 hover:bg-white/10 transition-colors flex items-center gap-1.5">
              Talk to Sales <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
