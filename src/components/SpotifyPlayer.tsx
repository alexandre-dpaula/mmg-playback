const adicionarFaixaUnica = async () => {
    if (!singleUrl) {
      alert("Por favor, insira a URL da faixa.");
      return;
    }
    const convertedUrl = convertGitHubToRaw(singleUrl);
    
    const fileName = singleUrl.split('/').pop() || 'unknown';
    const title = formatTitle(fileName);
    const newTrack: Track = {
      id: Date.now().toString(),
      url: convertedUrl,
      title: title,
      fileName: fileName,
    };
    
    setTracks(prev => [...prev, newTrack]);
    setSingleUrl("");
  };