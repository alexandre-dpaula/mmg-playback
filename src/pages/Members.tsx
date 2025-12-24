import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  UserPlus,
  Search,
  Crown,
  Mic2,
  Music,
  Mail,
  MoreVertical,
  Trash2,
  Edit,
  Video
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { useAuth } from "@/context/AuthContext";

interface Member {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  auth_user_id: string;
}

export default function Members() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Fetch church members
  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ["church-members"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user's church
      const { data: userApp } = await supabase
        .from("users_app")
        .select("church_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!userApp?.church_id) {
        return [];
      }

      // Get all members from the same church
      const { data, error } = await supabase
        .from("users_app")
        .select("*")
        .eq("church_id", userApp.church_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Member[];
    },
  });

  const filteredMembers = members?.filter((member) => {
    const matchesSearch = member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "lider":
      case "leader":
        return <Crown className="w-5 h-5 text-[#1DB954]" />;
      case "vocal":
        return <Mic2 className="w-5 h-5 text-blue-500" />;
      case "instrumental":
        return <Music className="w-5 h-5 text-purple-500" />;
      case "multimidia":
        return <Video className="w-5 h-5 text-orange-500" />;
      default:
        return <Users className="w-5 h-5 text-white/60" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "lider":
      case "leader":
        return "Líder";
      case "vocal":
        return "Vocal";
      case "instrumental":
        return "Instrumental";
      case "multimidia":
        return "Multimídia";
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "lider":
      case "leader":
        return "bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/30";
      case "vocal":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "instrumental":
        return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      case "multimidia":
        return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;

    const { error } = await supabase
      .from("users_app")
      .delete()
      .eq("id", memberId);

    if (error) {
      toast.error("Erro ao remover membro");
      return;
    }

    toast.success("Membro removido com sucesso");
    refetch();
  };

  const stats = {
    total: members?.length || 0,
    leaders: members?.filter((m) => m.role === "lider" || m.role === "leader").length || 0,
    vocals: members?.filter((m) => m.role === "vocal").length || 0,
    instrumentals: members?.filter((m) => m.role === "instrumental").length || 0,
    multimidia: members?.filter((m) => m.role === "multimidia").length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-20 md:pt-0 pb-32 md:pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <header className="space-y-2 mb-6 sm:mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#1DB954] font-semibold">
            EQUIPE
          </p>
          <h1 className="text-3xl font-bold">Membros da Igreja</h1>
          <p className="text-white/60">Gerencie os membros da sua equipe ministerial.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#181818] to-[#101010] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-white/60" />
              <p className="text-xs text-white/60">Total</p>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-[#181818] to-[#101010] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-[#1DB954]" />
              <p className="text-xs text-white/60">Líderes</p>
            </div>
            <p className="text-2xl font-bold">{stats.leaders}</p>
          </div>
          <div className="bg-gradient-to-br from-[#181818] to-[#101010] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Mic2 className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-white/60">Vocais</p>
            </div>
            <p className="text-2xl font-bold">{stats.vocals}</p>
          </div>
          <div className="bg-gradient-to-br from-[#181818] to-[#101010] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Music className="w-4 h-4 text-purple-500" />
              <p className="text-xs text-white/60">Instrumentais</p>
            </div>
            <p className="text-2xl font-bold">{stats.instrumentals}</p>
          </div>
          <div className="bg-gradient-to-br from-[#181818] to-[#101010] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-orange-500" />
              <p className="text-xs text-white/60">Multimídia</p>
            </div>
            <p className="text-2xl font-bold">{stats.multimidia}</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              placeholder="Buscar membro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#181818] border-white/10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={roleFilter === "all" ? "default" : "outline"}
              onClick={() => setRoleFilter("all")}
              className={roleFilter === "all" ? "bg-[#1DB954] hover:bg-[#1DB954]/90" : ""}
            >
              Todos
            </Button>
            <Button
              variant={roleFilter === "leader" ? "default" : "outline"}
              onClick={() => setRoleFilter("leader")}
              className={roleFilter === "leader" ? "bg-[#1DB954] hover:bg-[#1DB954]/90" : ""}
            >
              <Crown className="w-4 h-4 mr-2" />
              Líderes
            </Button>
            <Button
              variant={roleFilter === "vocal" ? "default" : "outline"}
              onClick={() => setRoleFilter("vocal")}
              className={roleFilter === "vocal" ? "bg-blue-500 hover:bg-blue-500/90" : ""}
            >
              <Mic2 className="w-4 h-4 mr-2" />
              Vocais
            </Button>
            <Button
              variant={roleFilter === "instrumental" ? "default" : "outline"}
              onClick={() => setRoleFilter("instrumental")}
              className={roleFilter === "instrumental" ? "bg-purple-500 hover:bg-purple-500/90" : ""}
            >
              <Music className="w-4 h-4 mr-2" />
              Instrumentais
            </Button>
          </div>

          {profile.role === 'lider' && (
            <Button
              className="bg-[#1DB954] hover:bg-[#1DB954]/90 gap-2"
              onClick={() => setInviteModalOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              Convidar Membro
            </Button>
          )}
        </div>

        {/* Members Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMembers && filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#181818] to-[#101010] p-5 hover:border-[#1DB954]/40 transition-all duration-200"
              >
                {/* Role Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    <span>{getRoleLabel(member.role)}</span>
                  </div>
                </div>

                {/* Member Info */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {member.full_name || "Sem nome"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <p className="text-xs text-white/40">
                      Membro desde {new Date(member.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Nenhum membro encontrado</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteMemberModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
    </div>
  );
}
