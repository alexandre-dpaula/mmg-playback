export const SELECTED_EVENT_STORAGE_KEY = "mmg-selected-event";
const SELECTED_EVENT_EVENT = "mmg-selected-event-changed";
const CACHE_VERSION_KEY = "mmg-cache-version";
const CURRENT_CACHE_VERSION = "4.0"; // Incrementado para forçar limpeza completa

// Lista de chaves antigas que devem ser removidas
const DEPRECATED_KEYS = [
  "ensaio-vocal",
  "festa-tabernaculos",
  "ensaio_vocal",
  "festa_tabernaculos",
  "sb-",
  "tanstack",
  "react-query",
];

export const clearOldCaches = async () => {
  if (typeof window === "undefined") return;

  const currentVersion = window.localStorage.getItem(CACHE_VERSION_KEY);

  // Se a versão mudou ou não existe, limpar caches antigos
  if (currentVersion !== CURRENT_CACHE_VERSION) {
    console.log("Limpando caches antigos...");

    // Limpar apenas chaves obsoletas específicas (não tudo)
    const keysToRemove = [
      "ensaio-vocal",
      "festa-tabernaculos",
      "ensaio_vocal",
      "festa_tabernaculos",
    ];

    // Remover apenas chaves obsoletas conhecidas
    keysToRemove.forEach(key => {
      if (window.localStorage.getItem(key)) {
        console.log('Removendo cache antigo:', key);
        window.localStorage.removeItem(key);
      }
    });

    // Atualizar versão do cache
    window.localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
    console.log("Caches antigos limpos!");
  }
};

export const getSelectedEventId = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SELECTED_EVENT_STORAGE_KEY);
};

export const setSelectedEventId = (eventId: string | null) => {
  if (typeof window === "undefined") return;
  if (eventId) {
    window.localStorage.setItem(SELECTED_EVENT_STORAGE_KEY, eventId);
  } else {
    window.localStorage.removeItem(SELECTED_EVENT_STORAGE_KEY);
  }
  window.dispatchEvent(new Event(SELECTED_EVENT_EVENT));
};

export const onSelectedEventChange = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(SELECTED_EVENT_EVENT, handler);
  return () => window.removeEventListener(SELECTED_EVENT_EVENT, handler);
};

export const SELECTED_EVENT_EVENT_NAME = SELECTED_EVENT_EVENT;
