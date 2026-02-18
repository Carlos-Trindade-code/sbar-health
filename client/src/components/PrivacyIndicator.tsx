import { Lock, Eye, EyeOff, Shield, Users, Building2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type PrivacyLevel = 'team-only' | 'hospital-anonymous' | 'public';

interface PrivacyIndicatorProps {
  level: PrivacyLevel;
  showLabel?: boolean;
  showTooltip?: boolean;
  showPopover?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const privacyConfig = {
  'team-only': {
    icon: Lock,
    label: 'Privado',
    sublabel: 'Apenas sua equipe',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeVariant: 'default' as const,
    description: 'Esta informação é visível APENAS para membros autorizados da sua equipe.',
    whoCanSee: [
      { icon: Users, text: 'Membros da sua equipe', allowed: true },
      { icon: Building2, text: 'Gestores do hospital', allowed: false },
      { icon: Eye, text: 'Outros médicos', allowed: false },
    ],
    securityFeatures: [
      'Criptografia ponta-a-ponta',
      'Acesso apenas por convite',
      'Histórico de acessos auditável',
    ],
  },
  'hospital-anonymous': {
    icon: Shield,
    label: 'Anonimizado',
    sublabel: 'Dados agregados',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeVariant: 'secondary' as const,
    description: 'O hospital vê apenas estatísticas agregadas, SEM identificação de pacientes ou conteúdo de evoluções.',
    whoCanSee: [
      { icon: Users, text: 'Sua equipe (dados completos)', allowed: true },
      { icon: Building2, text: 'Hospital (apenas estatísticas)', allowed: true },
      { icon: Eye, text: 'Conteúdo das evoluções', allowed: false },
    ],
    securityFeatures: [
      'Dados pessoais removidos',
      'Apenas métricas numéricas',
      'Impossível rastrear indivíduos',
    ],
  },
  'public': {
    icon: Eye,
    label: 'Público',
    sublabel: 'Visível para todos',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    badgeVariant: 'outline' as const,
    description: 'Esta informação pode ser vista por qualquer usuário do sistema.',
    whoCanSee: [
      { icon: Users, text: 'Todos os usuários', allowed: true },
    ],
    securityFeatures: [],
  },
};

export function PrivacyIndicator({
  level,
  showLabel = true,
  showTooltip = true,
  showPopover = false,
  className,
  size = 'md',
}: PrivacyIndicatorProps) {
  const config = privacyConfig[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const content = (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 font-medium transition-all',
        config.bgColor,
        config.borderColor,
        config.color,
        'border',
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );

  if (showPopover) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="cursor-pointer hover:opacity-80 transition-opacity">
            {content}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          {/* Header */}
          <div className={cn('p-4 rounded-t-lg', config.bgColor)}>
            <div className="flex items-center gap-2">
              <Icon className={cn('w-5 h-5', config.color)} />
              <div>
                <p className={cn('font-semibold', config.color)}>{config.label}</p>
                <p className="text-xs text-muted-foreground">{config.sublabel}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 border-b">
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>

          {/* Who Can See */}
          <div className="p-4 space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Quem pode ver?
            </h4>
            <div className="space-y-2">
              {config.whoCanSee.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <item.icon className={cn(
                    'w-4 h-4',
                    item.allowed ? 'text-green-500' : 'text-red-400'
                  )} />
                  <span className={item.allowed ? '' : 'text-muted-foreground line-through'}>
                    {item.text}
                  </span>
                  {item.allowed ? (
                    <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700 border-green-200">
                      ✓ Sim
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-auto text-xs bg-red-50 text-red-700 border-red-200">
                      ✗ Não
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security Features */}
          {config.securityFeatures.length > 0 && (
            <div className="p-4 bg-muted/30 border-t">
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Recursos de Segurança
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {config.securityFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="text-green-500">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// Privacy Banner Component for sections
interface PrivacyBannerProps {
  level: PrivacyLevel;
  className?: string;
}

export function PrivacyBanner({ level, className }: PrivacyBannerProps) {
  const config = privacyConfig[level];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn('w-5 h-5', config.color)} />
      <div className="flex-1">
        <p className={cn('font-medium text-sm', config.color)}>
          {config.label}: {config.sublabel}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {config.description}
        </p>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 text-sm" align="end">
          <h4 className="font-medium mb-2">Quem pode ver?</h4>
          <div className="space-y-1">
            {config.whoCanSee.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {item.allowed ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-red-400">✗</span>
                )}
                <span className={item.allowed ? '' : 'text-muted-foreground'}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Team Invite System Component
interface TeamInviteProps {
  teamName: string;
  teamId: string;
  isAdmin: boolean;
  onGenerateLink?: () => void;
  className?: string;
}

export function TeamInviteSystem({
  teamName,
  teamId,
  isAdmin,
  onGenerateLink,
  className,
}: TeamInviteProps) {
  const inviteLink = `${window.location.origin}/join/${teamId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  return (
    <div className={cn('p-4 rounded-lg border bg-card', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Lock className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold">Convites da Equipe</h3>
        <Badge variant="outline" className="ml-auto">
          {isAdmin ? 'Admin' : 'Membro'}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Apenas administradores podem gerar links de convite. Novos membros precisam de aprovação.
      </p>

      {isAdmin ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Copiar
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ Este link expira em 7 dias e pode ser usado apenas uma vez.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p>Você não tem permissão para gerar links de convite.</p>
          <p className="mt-1">Solicite ao administrador da equipe: <strong>{teamName}</strong></p>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-green-600 mt-0.5" />
          <div className="text-xs text-green-800">
            <p className="font-medium">Sua privacidade está protegida</p>
            <p className="mt-1">
              Conversas e evoluções são visíveis APENAS para membros da equipe. 
              O hospital NÃO tem acesso ao conteúdo das suas comunicações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyIndicator;
