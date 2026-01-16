import { supabase } from "@/lib/supabase";

type NotificationType =
  | "new_playlist"
  | "new_track"
  | "updated_track"
  | "new_member"
  | "new_event"
  | "track_key_changed"
  | "track_cifra_changed";

interface CreateNotificationParams {
  churchId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  createdBy?: string;
}

/**
 * Cria uma notificação no banco de dados
 */
export async function createNotification({
  churchId,
  type,
  title,
  message,
  metadata = {},
  createdBy,
}: CreateNotificationParams): Promise<void> {
  try {
    const { error } = await supabase
      .from("notifications")
      .insert({
        church_id: churchId,
        type,
        title,
        message,
        metadata,
        created_by: createdBy || null,
        read: false,
      });

    if (error) {
      console.error("Erro ao criar notificação:", error);
      // Não lança erro para não interromper o fluxo principal
    }
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    // Não lança erro para não interromper o fluxo principal
  }
}
