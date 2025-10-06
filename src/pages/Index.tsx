import SpotifyPlayer from "@/components/SpotifyPlayer";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            ARRANJOS VOCAIS
          </p>
          <h1 className="text-4xl font-bold md:text-5xl">
            MMG — Festa dos Tabernáculos
          </h1>
          <p className="max-w-2xl text-white/60">
            Crie, organize e ouça seus arranjos vocais com uma interface envolvente e inspirada no clima da celebração.
          </p>
        </header>
        <SpotifyPlayer />
        <div className="text-center">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );
};

export default Index;