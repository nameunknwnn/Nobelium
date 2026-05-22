export default function Footer() {
  return (
    <div className="relative ">
      <img src={"/footer-bg.webp"} className="h-full w-full object-cover " />

      <div className="pt-10 absolute inset-0 flex justify-center">
        <div className="max-w-250 w-full">
          <div className="flex justify-between ">
            <div className="text-xl text-white">Nobelium</div>
            <div className="text-xl text-white space-x-3">
              <button className="border-1 rounded-xl p-2 ">in</button>
              <button className="border-1 rounded-xl p-2 ">li</button>
              <button className="border-1 rounded-xl p-2 ">X</button>
              <button className="border-1 rounded-xl p-2 ">Mail</button>
            </div>
          </div>

          <div className="flex flex-row justify-evenly ">
            <div className="flex flex-col items-start">
              <h1>product</h1>
              <button>how it works</button>
              <button>pricing</button>
              <button>impact</button>
              <button>faq</button>
            </div>
            <div className="flex flex-col items-start">
              <h1>Resources</h1>
              <button>Blog</button>
              <button>Use Cases</button>
            </div>
            <div className="flex flex-col items-start">
              <h1>Compare</h1>
              <button>Overview</button>
              <button>Chatgpt alternative</button>
              <button>Claude alternative</button>
            </div>
            <div className="flex flex-col items-start">
              <h1>Company</h1>
              <button>Book a demo</button>
              <button>about</button>
              <button>Enterprise</button>
              <button>Trust Center</button>
              <button>Privacy</button>
              <button>Terms</button>
            </div>
          </div>

          <div className="flex flex-col">
            <h1>Stay in the loop</h1>
            <span>
              Monthly notes on what we’re building. No spam, unsubscribe
              anytime.
            </span>
            <div>
              <input
                placeholder="you@company.com"
                className="border-1 border-gray-400 opacity-60 w-100"
              />
              <button>Subscribe</button>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="h-0.1  w-full  border-1 border-gray-500" />
            <div className="flex justify-between">
              <div>
                Made with love in Uttarakhand · © 2026 Nobelium Inc. All rights reserved.
              </div>
              <div>Backed by harkirat</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
