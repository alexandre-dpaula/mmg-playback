import React, { useEffect, useState } from "react";
import { ArrowLeft, Bell, Music, Users, Edit3, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: any;
  created_at: string;
  created_by: string | null;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "new_playlist":
      return <Plus className="w-5 h-5 text-[#1DB954]" />;
    case "new_track":
      return <Music className="w-5 h-5 text-blue-400" />;
    case "updated_track":
      return <Edit3 className="w-5 h-5 text-yellow-400" />;
    case "new_member":
      return <Users className="w-5 h-5 text-purple-400" />;
    case "new_event":
      return <Bell className="w-5 h-5 text-orange-400" />;
    default:
      return <Bell className="w-5 h-5 text-white/60" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "new_playlist":
      return "from-[#1DB954]/10 to-[#1DB954]/5 border-[#1DB954]/20";
    case "new_track":
      return "from-blue-500/10 to-blue-500/5 border-blue-500/20";
    case "updated_track":
      return "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20";
    case "new_member":
      return "from-purple-500/10 to-purple-500/5 border-purple-500/20";
    case "new_event":
      return "from-orange-500/10 to-orange-500/5 border-orange-500/20";
    default:
      return "from-white/5 to-white/2 border-white/10";
  }
};

const SettingsNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (!profile?.churchId) {
      setIsLoading(false);
      return;
    }

    loadNotifications();
    loadNotificationSettings();
    const unsubscribe = subscribeToNotifications();

    // Marca todas as notificações como lidas quando a página é aberta
    markAllAsRead();

    return unsubscribe;
  }, [profile?.churchId]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);

      // Busca o church_id do perfil do usuário
      if (!profile?.churchId) {
        setIsLoading(false);
        setNotifications([]);
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("church_id", profile.churchId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        // Se a tabela não existir, não mostrar erro
        if (error.code !== '42P01') {
          console.error("Erro ao carregar notificações:", error);
          toast.error("Erro ao carregar notificações");
        }
        setNotifications([]);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast.error("Erro ao carregar notificações");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
            toast.success("Nova notificação recebida!");
          } else if (payload.eventType === "DELETE") {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadNotificationSettings = async () => {
    try {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("notifications_enabled")
        .eq("id", profile.id)
        .single();

      if (error) {
        // Se a coluna não existir, não mostrar erro
        if (error.code !== '42703' && error.code !== '42P01') {
          console.error("Erro ao carregar configurações de notificações:", error);
        }
        return;
      }

      setNotificationsEnabled(data?.notifications_enabled ?? true);
    } catch (error) {
      console.error("Erro ao carregar configurações de notificações:", error);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    try {
      setNotificationsEnabled(enabled);

      if (!profile?.id) return;

      const { error } = await supabase
        .from("profiles")
        .update({ notifications_enabled: enabled })
        .eq("id", profile.id);

      if (error) {
        // Se a coluna não existir, não mostrar erro
        if (error.code !== '42703' && error.code !== '42P01') {
          console.error("Erro ao atualizar configurações:", error);
          toast.error("Erro ao atualizar configurações");
          setNotificationsEnabled(!enabled);
        }
        return;
      }

      toast.success(
        enabled
          ? "Notificações ativadas"
          : "Notificações desativadas"
      );
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      toast.error("Erro ao atualizar configurações");
      setNotificationsEnabled(!enabled);
    }
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
    } catch (error) {
      console.error("Erro ao marcar notificações como lidas:", error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Notificação removida");
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
      toast.error("Erro ao remover notificação");
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "Data inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#1DB954]/20 border-t-[#1DB954] rounded-full animate-spin"></div>
          <p className="text-white/60 text-sm">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-20 md:pt-0 pb-32 md:pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 py-6">
        {/* Header com Toggle */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">
              {notificationsEnabled ? "Ativas" : "Inativas"}
            </span>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
              className="data-[state=checked]:bg-[#1DB954]"
            />
          </div>
        </div>

        {/* Título */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-[#1DB954]/10">
            <Bell className="w-8 h-8 text-[#1DB954]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notificações da Equipe</h1>
            <p className="text-white/60 text-sm">
              {notifications.length === 0
                ? "Nenhuma notificação ainda"
                : `${notifications.length} ${notifications.length === 1 ? "notificação" : "notificações"}`}
            </p>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Bell className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhuma notificação</h3>
              <p className="text-white/60 text-sm max-w-sm mx-auto">
                Quando houver novidades na equipe, você verá as notificações aqui.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 sm:p-5 transition-all duration-200 hover:scale-[1.01] ${getNotificationColor(
                  notification.type
                )}`}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-white/70 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-white/50">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>

                  {/* Botão de deletar (apenas para líderes) */}
                  {profile.role === "lider" && (
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="flex-shrink-0 p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all"
                      aria-label="Remover notificação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-white/60 text-center">
            As notificações são atualizadas em tempo real para toda a equipe
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsNotifications;
