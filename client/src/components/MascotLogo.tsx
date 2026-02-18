import { cn } from '@/lib/utils';

// Logo original SBAR Global - estetoscópio + globo estilizado em "SB"
const SBAR_LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663030272605/ubKvZkApcgNYgZfg.png";

interface MascotLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  variant?: 'default' | 'circle' | 'rounded';
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const textSizes = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
};

export function MascotLogo({
  size = 'md',
  className,
  showName = false,
  variant = 'rounded',
}: MascotLogoProps) {
  const variantClasses = {
    default: '',
    circle: 'rounded-full',
    rounded: 'rounded-lg',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src={SBAR_LOGO_URL}
        alt="SBAR Global"
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          'object-cover shadow-sm border-2 border-white'
        )}
      />
      {showName && (
        <span className={cn('font-bold text-foreground', textSizes[size])}>
          SBAR Global
        </span>
      )}
    </div>
  );
}

// Header Logo Component - combines logo with text
interface HeaderLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HeaderLogo({ size = 'md', className }: HeaderLogoProps) {
  const logoSizes = {
    sm: { img: 'w-7 h-7', text: 'text-base' },
    md: { img: 'w-9 h-9', text: 'text-xl' },
    lg: { img: 'w-11 h-11', text: 'text-2xl' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src={SBAR_LOGO_URL}
        alt="SBAR Global"
        className={cn(
          logoSizes[size].img,
          'rounded-lg object-cover shadow-sm border-2 border-primary/20'
        )}
      />
      <span className={cn('font-bold', logoSizes[size].text)}>
        SBAR Global
      </span>
    </div>
  );
}

// Favicon-style small logo
export function MascotIcon({ className }: { className?: string }) {
  return (
    <img
      src={SBAR_LOGO_URL}
      alt="SBAR Global"
      className={cn('w-8 h-8 rounded-lg object-cover', className)}
    />
  );
}

export default MascotLogo;
