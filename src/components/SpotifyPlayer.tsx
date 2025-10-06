const adicionarFaixaUnica = async () => {
    if (!singleUrl) {
      alert("Por favor, insira a URL da faixa.");
      return;
    }
    const convertedUrl = convertGitHubToRaw(singleUrl);
    
    // Validate URL accessibility
    try {
      const response = await fetch(convertedUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao validar URL:', error);
      alert('Erro: A URL fornecida não é acessível ou não existe. Verifique se o arquivo existe e é público.');
      return;
    }
    
    const fileName = decodeURIComponent(singleUrl.split('/').pop() || 'unknown');
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