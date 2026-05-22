export default function NavigationBar() {
  return (
    <div className="flex justify-center ">
      <div className=" border-1 bg-black opacity-75 border-black z-50 fixed py-1.5 px-3 md:py-3 md:px-6  mt-3 shadow-2xl rounded-xl">
        <div className="flex space-x-16 ">
          <button className="text-md font-bold text-white">Nobelium</button>
          <div className="flex space-x-6">
            <button>product</button>
            <button>pricing</button>
            <button>enterprise</button>
            <button>blog</button>
            <button>about</button>
            <button>use cases</button>
          </div>
          <button className="border-gray-400 border-1 bg-gray-950  text-white hover:bg-gray-400 p-2 rounded-md ">
            Book a demo
          </button>
        </div>
      </div>
    </div>
  );
}
