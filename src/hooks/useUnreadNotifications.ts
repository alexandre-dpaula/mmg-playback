import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export const useUnreadNotifications = () => {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id || !profile?.churchId) {
      setIsLoading(false);
      setUnreadCount(0);
      return;
    }

    loadUnreadCount();
    const unsubscribe = subscribeToNotifications();
    return unsubscribe;
  }, [profile?.id, profile?.churchId]);

  const loadUnreadCount = async () => {
    try {
      setIsLoading(true);

      // Busca o church_id do perfil do usuário
      if (!profile?.churchId) {
        setIsLoading(false);
        setUnreadCount(0);
        return;
      }

      // Conta notificações não lidas
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("church_id", profile.churchId)
        .eq("read", false);

      if (error) {
        // Se a tabela não existir, não mostrar erro no console
        if (error.code !== '42P01') {
          console.error("Erro ao carregar contador de notificações:", error);
        }
        setUnreadCount(0);
        return;
      }

      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Erro ao carregar contador de notificações:", error);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel("unread-notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          // Recarrega o contador quando houver mudanças, mas só se churchId existir
          if (profile?.churchId) {
            loadUnreadCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAllAsRead = async () => {
    try {
      if (!profile?.churchId) return;

      // Marca todas as notificações como lidas
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("church_id", profile.churchId)
        .eq("read", false);

      if (error) throw error;
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar notificações como lidas:", error);
    }
  };

  return {
    unreadCount,
    isLoading,
    markAllAsRead,
    refresh: loadUnreadCount,
  };
};
