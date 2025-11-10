import SpotifyPlayer from "@/components/SpotifyPlayer";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { DEFAULT_PLAYLIST, useGooglePlaylist } from "@/hooks/useGooglePlaylist";

const Index = () => {
  const { data: playlistData } = useGooglePlaylist();
  const title = playlistData?.title ?? DEFAULT_PLAYLIST.title;
  const description = playlistData?.description ?? DEFAULT_PLAYLIST.description;

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold md:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-white/60">
            {description}
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
