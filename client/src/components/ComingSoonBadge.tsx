import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComingSoonBadgeProps {
  variant?: "coming-soon" | "beta" | "premium";
  size?: "sm" | "md";
  tooltip?: string;
  className?: string;
}

export function ComingSoonBadge({ 
  variant = "coming-soon", 
  size = "sm",
  tooltip,
  className 
}: ComingSoonBadgeProps) {
  const variants = {
    "coming-soon": {
      label: "Em breve",
      icon: Clock,
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      defaultTooltip: "Esta funcionalidade estará disponível em breve"
    },
    "beta": {
      label: "Beta",
      icon: Sparkles,
      className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      defaultTooltip: "Funcionalidade em fase de testes"
    },
    "premium": {
      label: "Premium",
      icon: Lock,
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      defaultTooltip: "Disponível nos planos pagos"
    }
  };

  const config = variants[variant];
  const Icon = config.icon;

  const badge = (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1 font-normal border",
        config.className,
        size === "sm" ? "text-xs px-1.5 py-0" : "text-sm px-2 py-0.5",
        className
      )}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      {config.label}
    </Badge>
  );

  if (tooltip || config.defaultTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip || config.defaultTooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}

// Wrapper component for features that are coming soon
interface ComingSoonWrapperProps {
  children: React.ReactNode;
  variant?: "coming-soon" | "beta" | "premium";
  message?: string;
  disabled?: boolean;
  className?: string;
}

export function ComingSoonWrapper({
  children,
  variant = "coming-soon",
  message,
  disabled = true,
  className
}: ComingSoonWrapperProps) {
  const messages = {
    "coming-soon": "Esta funcionalidade estará disponível em breve!",
    "beta": "Esta funcionalidade está em fase de testes.",
    "premium": "Faça upgrade para acessar esta funcionalidade."
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      // Show toast or notification
      import("sonner").then(({ toast }) => {
        toast.info(message || messages[variant]);
      });
    }
  };

  return (
    <div 
      className={cn(
        "relative",
        disabled && "cursor-not-allowed",
        className
      )}
      onClick={handleClick}
    >
      <div className={cn(disabled && "opacity-50 pointer-events-none")}>
        {children}
      </div>
      {disabled && (
        <div className="absolute top-1 right-1">
          <ComingSoonBadge variant={variant} />
        </div>
      )}
    </div>
  );
}

export default ComingSoonBadge;
