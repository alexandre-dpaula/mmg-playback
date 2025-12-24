import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type InvitationRole = 'vocal' | 'instrumental' | 'multimidia';

export interface Invitation {
  id: string;
  church_id: string;
  invited_by: string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  token: string;
  expires_at: string;
  created_at: string;
  accepted_at?: string;
}

export const useInvitations = () => {
  const { user, profile } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar convites da igreja (apenas para líderes)
  const fetchChurchInvitations = async () => {
    if (!user || !profile.churchId || profile.role !== 'lider') return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('church_id', profile.churchId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      toast.error('Erro ao carregar convites');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar convites do usuário (por email)
  const fetchMyInvitations = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*, churches(name)')
        .eq('email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar meus convites:', error);
      return [];
    }
  };

  // Criar novo convite
  const createInvitation = async (email: string, role: InvitationRole) => {
    if (!user || !profile.churchId || profile.role !== 'lider') {
      toast.error('Apenas líderes podem enviar convites');
      return null;
    }

    try {
      // Verificar se já existe convite pendente para este email
      const { data: existing } = await supabase
        .from('invitations')
        .select('id')
        .eq('church_id', profile.churchId)
        .eq('email', email)
        .eq('status', 'pending')
        .maybeSingle();

      if (existing) {
        toast.error('Já existe um convite pendente para este email');
        return null;
      }

      // Criar novo convite
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          church_id: profile.churchId,
          invited_by: user.id,
          email,
          role,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Convite enviado para ${email}`);

      // Atualizar lista local
      await fetchChurchInvitations();

      return data;
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      toast.error('Erro ao enviar convite');
      return null;
    }
  };

  // Aceitar convite
  const acceptInvitation = async (invitationId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      // Buscar dados do convite
      const { data: invitation, error: fetchError } = await supabase
        .from('invitations')
        .select('*, churches(id, name)')
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single();

      if (fetchError) throw fetchError;

      if (!invitation) {
        toast.error('Convite não encontrado ou já foi aceito');
        return false;
      }

      // Verificar se o convite expirou
      if (new Date(invitation.expires_at) < new Date()) {
        toast.error('Este convite expirou');
        return false;
      }

      // Atualizar usuário na tabela users_app
      const { error: updateUserError } = await supabase
        .from('users_app')
        .update({
          church_id: invitation.church_id,
          role: invitation.role,
        })
        .eq('auth_user_id', user.id);

      if (updateUserError) throw updateUserError;

      // Marcar convite como aceito
      const { error: updateInvitationError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitationId);

      if (updateInvitationError) throw updateInvitationError;

      toast.success(`Você agora faz parte da ${invitation.churches.name}! 🎉`);

      // Recarregar a página para atualizar o contexto
      window.location.href = '/';

      return true;
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      toast.error('Erro ao aceitar convite');
      return false;
    }
  };

  // Rejeitar convite
  const rejectInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'rejected' })
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Convite rejeitado');
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar convite:', error);
      toast.error('Erro ao rejeitar convite');
      return false;
    }
  };

  // Cancelar convite (líder)
  const cancelInvitation = async (invitationId: string) => {
    if (profile.role !== 'lider') {
      toast.error('Apenas líderes podem cancelar convites');
      return false;
    }

    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Convite cancelado');
      await fetchChurchInvitations();
      return true;
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      toast.error('Erro ao cancelar convite');
      return false;
    }
  };

  useEffect(() => {
    if (profile.role === 'lider' && profile.churchId) {
      fetchChurchInvitations();
    }
  }, [user, profile.churchId, profile.role]);

  return {
    invitations,
    isLoading,
    createInvitation,
    acceptInvitation,
    rejectInvitation,
    cancelInvitation,
    fetchMyInvitations,
    refreshInvitations: fetchChurchInvitations,
  };
};
