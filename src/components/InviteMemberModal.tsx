import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInvitations, type InvitationRole } from '@/hooks/useInvitations';
import { Mail, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { createInvitation } = useInvitations();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InvitationRole>('vocal');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Digite um email válido');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Digite um email válido');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createInvitation(email, role);
      if (result) {
        // Limpar formulário e fechar modal
        setEmail('');
        setRole('vocal');
        onOpenChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Convidar Membro
          </DialogTitle>
          <DialogDescription>
            Envie um convite para adicionar um novo membro à sua igreja
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email do membro</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="membro@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              O membro receberá um convite para se juntar à igreja
            </p>
          </div>

          {/* Papel */}
          <div className="space-y-2">
            <Label htmlFor="role">Papel</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as InvitationRole)}
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vocal">Vocal</SelectItem>
                <SelectItem value="instrumental">Instrumental</SelectItem>
                <SelectItem value="multimidia">Multimídia</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Escolha o papel do membro na equipe
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
