"use client";

import NavigationBar from "../components/common/naviagationBar";
import Footer from "../components/common/footer";

const videos = [
  {
    id: "I_wNKdLoyCk",
    title: "Making the frontend",
    description: "learning about trelium and starting building the frontend from scratch",
  },
  {
    id: "txkH3B0w82w",
    title: "Making the frontend (continued)",
    description: "building the frontend from scratch",
  },
  {
    id: "_KyghtwhSfo",
    title: "Building the Backend",
    description: "Building the backend from scratch ",
  },
  {
    id: "GYA24KLOOZs",
    title: "Integrating the frontend and the Backend",
    description: "making connectinons between the fastapi be and the next js react frontend",
  },
  {
    id: "hM9MRj4Jv5E",
    title: "Integrating the frontend and the Backend and adding the oauth",
    description: "making connectinons between the fastapi be and the next js react frontend",
  },
  {
    id: "AGW-YFgrGNc",
    title: "Completing the v1",
    description: "trying to make the complete v1 version",
  },
  {
    id: "_kGeC9vx4-0",
    title: "fixing basic bugs ",
    description: "fixing the backend oauth bugs and other sql bugs",
  },
  {
    id: "oyGL7sIhtVY",
    title: "finishing the v1 of nobelium clone of trelium ",
    description: "completing the v1 and deploying the changes.",
  },
];

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-[#0e0e10] text-white">
      <NavigationBar />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase font-semibold mb-4">
            Proof of Work
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight mb-6">
            Build Sessions &{" "}
            <em className="italic text-[#5c8a5c]">Live Streams</em>
          </h1>
          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Every feature in Nobelium was built live. These streams are the
            unedited proof of work — from the first line of code to the final
            deployment.
          </p>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all group"
            >
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="p-5">
                <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-white/90">
                  {video.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
