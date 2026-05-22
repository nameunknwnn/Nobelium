export default function HeroSection() {
  return (
    <div>
      <div className="relative h-250 ">
        <img src="/hero-v3.webp" className="w-full h-full object-cover " />
        <div className="text-white absolute flex flex-col justify-center inset-0 items-center pb-90  ">
          <div className="pb-10 ">
            <div className=" flex flex row gap-2 border-1 border-gray-400 shadow-2xl shadow-black  rounded-2xl px-3 bg-gray-700 opacity-75">
              build by engineers from{" "}
              {<img src={"/globe.svg"} alt="globe" className="h-4.5 pt-1.5" />}
            </div>
          </div>
          <div className="flex gap-2 pb-8 ">
            <h1 className="text-3xl ">GET WORK DONE</h1>
            <h1 className="underline text-3xl">for you</h1>
          </div>
          <div className="max-w-2xl text-lg text-center mx-auto">
            Reports created. Invoices generated. Customers updated. Nobelium
            agents produce the finished work across every app you use.
          </div>
          <div className="max-w-2xl  space-x-2 mx-auto">
            <button className="border-1 border-white shadow-2xl w-50  p-2 rounded-xl bg-white text-black">
              book a free demo
            </button>
            <button className="border-1 border-white shadow-2xl w-50 p-2 rounded-xl bg-white text-black">
              talk to sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
