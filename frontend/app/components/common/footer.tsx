export default function Footer() {
  return (
    <div className="relative overflow-hidden bg-[#1a1714] min-h-screen">
      <img
        src={"/footer-bg.webp"}
        className="object-cover opacity-30"
        style={{ position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0 }}
      />

      <div className="relative z-10 pt-24 md:pt-32 lg:pt-40 pb-10 px-6">
        <div className="max-w-5xl mx-auto mb-12 md:mb-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-xl font-semibold text-white/90">Nobelium</div>
          <div className="flex items-center gap-2.5">
            <button className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white/75 hover:text-white bg-white/[0.04] hover:bg-white/15 border border-white/10 hover:border-white/25 transition text-sm">in</button>
            <button className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white/75 hover:text-white bg-white/[0.04] hover:bg-white/15 border border-white/10 hover:border-white/25 transition text-sm">li</button>
            <button className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white/75 hover:text-white bg-white/[0.04] hover:bg-white/15 border border-white/10 hover:border-white/25 transition text-sm">X</button>
            <button className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white/75 hover:text-white bg-white/[0.04] hover:bg-white/15 border border-white/10 hover:border-white/25 transition text-sm">✉</button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-16 md:mb-24">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-widest text-white/50 uppercase mb-2">Product</h3>
            <button className="text-sm text-white/75 hover:text-white text-left transition">How it works</button>
            <button className="text-sm text-white/75 hover:text-white text-left transition">Pricing</button>
            <button className="text-sm text-white/75 hover:text-white text-left transition">Impact</button>
            <button className="text-sm text-white/75 hover:text-white text-left transition">FAQ</button>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-widest text-white/50 uppercase mb-2">Resources</h3>
            <button className="text-sm text-white/75 hover:text-white text-left transition">Blog</button>
            <button className="text-sm text-white/75 hover:text-white text-left transition">Use Cases</button>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-widest text-white/50 uppercase mb-2">Compare</h3>
            <button className="text-sm text-white/75 hover:text-white text-left transition">Overview</button>
            <button className="text-sm text-white/75 hover:text-white text-left transition">ChatGPT alternative</button>
            <button className="text-sm text-white/75 hover:text-white text-left transition">Claude alternative</button>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-widest text-white/50 uppercase mb-2">Company</h3>
            <button className="text-sm text-white/75 hover:text-white text-left transition">Book a demo</button>
            <button className="text-sm text-white/75 hover:text-white text-left transition">About</button>
            <button className="text-sm text-white/75 hover:text-white text-left transition">Enterprise</button>
            <button className="text-sm text-white/75 hover:text-white text-left transition">Trust Center</button>
            <button className="text-sm text-white/75 hover:text-white text-left transition">Privacy</button>
            <button className="text-sm text-white/75 hover:text-white text-left transition">Terms</button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-10">
          <h2 className="text-lg font-semibold text-white/90 mb-1">Stay in the loop</h2>
          <p className="text-sm text-white/55 mb-3">Monthly notes on what we&apos;re building. No spam, unsubscribe anytime.</p>
          <div className="flex gap-2">
            <input
              placeholder="you@company.com"
              className="border border-white/20 bg-white/[0.06] text-white placeholder-white/35 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:border-white/40"
            />
            <button className="bg-white text-black rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/90 transition">Subscribe</button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto border-t border-white/15 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/55">Made with love in Uttarakhand · © 2026 Nobelium Inc. All rights reserved.</p>
          <p className="text-xs text-white/45">Backed by harkirat</p>
        </div>
      </div>
    </div>
  );
}
