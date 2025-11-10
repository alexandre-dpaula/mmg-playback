import { useQuery } from "@tanstack/react-query";

const GOOGLE_DOCS_URL_REGEX = /docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/;

export const extractDocId = (url: string): string | null => {
  const match = url.match(GOOGLE_DOCS_URL_REGEX);
  return match ? match[1] : null;
};

export const isGoogleDocsUrl = (url?: string): boolean => {
  if (!url) return false;
  return GOOGLE_DOCS_URL_REGEX.test(url);
};

const fetchGoogleDocContent = async (docId: string): Promise<string> => {
  try {
    // Converte para formato de exportação de texto do Google Docs
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

    const response = await fetch(exportUrl);

    if (!response.ok) {
      throw new Error(`Erro ao buscar documento: ${response.status}`);
    }

    const content = await response.text();
    return content;
  } catch (error) {
    console.error("Erro ao buscar conteúdo do Google Docs:", error);
    throw error;
  }
};

export const useGoogleDoc = (cifra?: string) => {
  const docId = cifra ? extractDocId(cifra) : null;

  return useQuery<string, Error>({
    queryKey: ["google-doc", docId],
    queryFn: () => {
      if (!docId) {
        throw new Error("ID do documento não encontrado");
      }
      return fetchGoogleDocContent(docId);
    },
    enabled: !!docId && isGoogleDocsUrl(cifra),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 1,
  });
};
