import React from "react";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Navbar } from "@/components/Navbar";
import { DEFAULT_PLAYLIST, useGooglePlaylist } from "@/hooks/useGooglePlaylist";

const Index = () => {
  const { data: playlistData } = useGooglePlaylist();
  const title = playlistData?.title ?? DEFAULT_PLAYLIST.title;
  const description = playlistData?.description ?? DEFAULT_PLAYLIST.description;
  const [filter, setFilter] = React.useState<"all" | "vocal" | "instrumental">("all");

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Navbar filter={filter} onFilterChange={setFilter} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold md:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-white/60">
            {description}
          </p>
        </header>
        <SpotifyPlayer filter={filter} />
        <div className="text-center">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );
};

export default Index;
