export const SELECTED_EVENT_STORAGE_KEY = "mmg-selected-event";
const SELECTED_EVENT_EVENT = "mmg-selected-event-changed";

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
