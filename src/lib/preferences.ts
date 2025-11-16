export const SELECTED_EVENT_STORAGE_KEY = "mmg-selected-event";
const SELECTED_EVENT_EVENT = "mmg-selected-event-changed";
const CACHE_VERSION_KEY = "mmg-cache-version";
const CURRENT_CACHE_VERSION = "2.0"; // Incrementar para forçar limpeza

// Lista de chaves antigas que devem ser removidas
const DEPRECATED_KEYS = [
  "ensaio-vocal",
  "festa-tabernaculos",
  "ensaio_vocal",
  "festa_tabernaculos",
];

export const clearOldCaches = () => {
  if (typeof window === "undefined") return;

  const currentVersion = window.localStorage.getItem(CACHE_VERSION_KEY);

  // Se a versão mudou ou não existe, limpar caches antigos
  if (currentVersion !== CURRENT_CACHE_VERSION) {
    console.log("Limpando caches antigos...");

    // Remover chaves deprecated específicas
    DEPRECATED_KEYS.forEach(key => {
      window.localStorage.removeItem(key);
    });

    // Limpar todas as chaves que não sejam essenciais
    const keysToKeep = [
      SELECTED_EVENT_STORAGE_KEY,
      "mmg_local_auth",
      "mmg_local_profile",
      CACHE_VERSION_KEY,
    ];

    // Iterar sobre todas as chaves do localStorage
    const allKeys = Object.keys(window.localStorage);
    allKeys.forEach(key => {
      // Se a chave não está na lista de manter, remover
      if (!keysToKeep.includes(key) && !key.startsWith("supabase.")) {
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
