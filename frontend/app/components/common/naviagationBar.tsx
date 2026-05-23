export default function NavigationBar() {
  return (
    <div className="flex justify-center">
      <div className="z-50 fixed mt-4 bg-black/70 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl py-2.5 px-5">
        <div className="flex items-center gap-10">
          <button className="text-base font-semibold text-white tracking-tight flex items-center gap-1.5">
            <span className="inline-block w-5 h-5 rounded-md bg-white/20 border border-white/30" />
            Nobelium
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <button className="hover:text-white transition-colors">Product</button>
            <button className="hover:text-white transition-colors">Pricing</button>
            <button className="hover:text-white transition-colors">Enterprise</button>
            <button className="hover:text-white transition-colors">Blog</button>
            <button className="hover:text-white transition-colors">About</button>
            <button className="hover:text-white transition-colors flex items-center gap-1">
              Use Cases <span className="text-xs">▾</span>
            </button>
          </div>
          <button className="text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors px-4 py-1.5 rounded-lg shadow">
            Book a demo
          </button>
        </div>
      </div>
    </div>
  );
}
