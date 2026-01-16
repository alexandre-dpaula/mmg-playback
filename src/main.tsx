import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { initViewportFix } from "./utils/viewport-fix";
import { initPerformanceUtils } from "./utils/performance";
import { initAndroidFixes } from "./utils/android-fixes";

// Fix crítico para Safari iOS - viewport height
initViewportFix();

// Fixes específicos para Android Chrome
initAndroidFixes();

// Inicializa utilitários de performance e limpeza automática
initPerformanceUtils();

createRoot(document.getElementById("root")!).render(<App />);

// Version check and auto-reload
let isReloading = false; // Prevenir múltiplos reloads
const checkVersion = async () => {
  if (isReloading) return; // Não verificar se já está recarregando

  try {
    const response = await fetch('/version.json?' + Date.now(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const data = await response.json();
    const currentVersion = localStorage.getItem('app_version');

    if (currentVersion && currentVersion !== data.version) {
      console.log('🔄 Nova versão detectada! Limpando cache e recarregando...');
      isReloading = true; // Marcar como recarregando
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      localStorage.setItem('app_version', data.version);
      window.location.reload();
    } else if (!currentVersion) {
      // Primeira vez, apenas salvar a versão
      localStorage.setItem('app_version', data.version);
    }
  } catch (error) {
    console.error('Erro ao verificar versão:', error);
  }
};

// Check version on load and every 2 minutes (reduzido de 60s para evitar overhead)
checkVersion();
setInterval(checkVersion, 120000);

// Service Worker desabilitado temporariamente para melhorar performance
// Register Service Worker for PWA
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/sw.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }
