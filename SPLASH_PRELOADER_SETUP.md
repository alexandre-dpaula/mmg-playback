# Configuração do Splash Screen e Preloader

## Arquivos necessários

### 1. Vídeo Splash (Google Drive)
- **URL Atual**: `https://drive.google.com/file/d/1ITGG0jnSU7XTbmprBmnU3WytxsIlPqwQ/view?usp=sharing`
- **Descrição**: Vídeo que será exibido na tela splash (apenas em dispositivos móveis)
- **Formato**: MP4
- **Configuração**: O vídeo é carregado diretamente do Google Drive
- **Recomendações**:
  - Duração: 2-5 segundos
  - Resolução: 1080x1920 (vertical/portrait) ou 1920x1080 (horizontal/landscape)
  - Tamanho: Recomendado < 10MB para carregamento rápido
  - O arquivo deve ter permissão de visualização pública no Google Drive

### 2. preloader.jpg
- **Localização**: `/public/preloader.jpg`
- **Descrição**: Imagem que será exibida no centro do preloader enquanto a planilha carrega
- **Formato**: JPG ou JPEG
- **Recomendações**:
  - Resolução: 512x512 ou 1024x1024 (quadrada)
  - Tamanho: Recomendado < 500KB
  - A imagem será exibida com borda arredondada e um spinner ao redor

## Como funciona

### Mobile (largura < 768px)
1. **Splash Screen**: Vídeo `splash.mp4` é reproduzido automaticamente
2. **Preloader**: Após o vídeo terminar, o preloader com `preloader.jpg` aparece enquanto a planilha carrega
3. **Conteúdo**: Quando os dados são carregados, o app é exibido

### Desktop (largura >= 768px)
1. **Preloader**: O preloader com `preloader.jpg` aparece diretamente (pula o splash)
2. **Conteúdo**: Quando os dados são carregados, o app é exibido

## Estrutura de pastas

```
MMG - Ensaio Vocal/
├── public/
│   └── preloader.jpg   ← Imagem do preloader
├── src/
│   └── components/
│       ├── SplashScreen.tsx  (vídeo carregado do Google Drive)
│       └── Preloader.tsx     (usa preloader.jpg)
└── ...
```

## Personalização

### Trocar o vídeo splash
Para usar outro vídeo do Google Drive, edite o arquivo `src/components/SplashScreen.tsx`:

1. Faça upload do novo vídeo no Google Drive
2. Configure as permissões para "Qualquer pessoa com o link pode visualizar"
3. Copie o ID do arquivo da URL (a parte entre `/d/` e `/view`)
4. Substitua na linha 48:
```typescript
<source src="https://drive.google.com/uc?export=download&id=SEU_ID_AQUI" type="video/mp4" />
```

### Ajustar duração mínima do splash
Edite o arquivo `src/components/SplashScreen.tsx`, linha que contém o timeout:
```typescript
setTimeout(onComplete, 1000); // Altere 1000 para a duração em ms
```

### Ajustar cores e estilo do preloader
Edite o arquivo `src/components/Preloader.tsx` para personalizar:
- Cores do spinner (linha com `border-t-[#1DB954]`)
- Textos de carregamento
- Tamanho da imagem (classes `w-32 h-32`)

### Desabilitar splash em mobile
Se quiser desabilitar o splash em mobile, edite `src/pages/Index.tsx`:
```typescript
const isMobile = React.useMemo(() => {
  return false; // Sempre retorna false para desabilitar splash
}, []);
```
