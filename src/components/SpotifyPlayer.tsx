React.useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    if (!currentTrack) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      return;
    }
    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error('Erro ao reproduzir:', error);
        setIsPlaying(false);
        alert(`Erro ao reproduzir a faixa "${currentTrack.title}": ${error.message}`);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);