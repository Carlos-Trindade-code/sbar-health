import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Tipos de reação do Dr. Tigre
export type TigerMood = 
  | 'happy'      // Evolução salva, ação positiva
  | 'celebrating' // Meta batida, conquista
  | 'worried'    // Paciente crítico, alerta
  | 'sad'        // Erro, cancelamento
  | 'thinking'   // IA processando
  | 'waving'     // Boas-vindas
  | 'proud'      // Orgulho por conquista
  | 'sleeping'   // Idle/inativo
  | 'surprised'; // Notificação importante

interface TigerReactionProps {
  mood: TigerMood;
  message: string;
  subMessage?: string;
  duration?: number;
  onClose?: () => void;
}

// Configurações visuais para cada humor
const moodConfig: Record<TigerMood, {
  emoji: string;
  animation: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}> = {
  happy: {
    emoji: '😊',
    animation: 'animate-bounce-gentle',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-800',
  },
  celebrating: {
    emoji: '🎉',
    animation: 'animate-wiggle',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-800',
  },
  worried: {
    emoji: '😰',
    animation: 'animate-shake',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-800',
  },
  sad: {
    emoji: '😢',
    animation: 'animate-droop',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
  },
  thinking: {
    emoji: '🤔',
    animation: 'animate-pulse',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-800',
  },
  waving: {
    emoji: '👋',
    animation: 'animate-wave',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    textColor: 'text-teal-800',
  },
  proud: {
    emoji: '🏆',
    animation: 'animate-glow',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-800',
  },
  sleeping: {
    emoji: '😴',
    animation: 'animate-float',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
  },
  surprised: {
    emoji: '😲',
    animation: 'animate-pop',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-800',
  },
};

// Componente de reação individual
function TigerReactionToast({ mood, message, subMessage, duration = 3000, onClose }: TigerReactionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = moodConfig[mood];

  useEffect(() => {
    // Entrada
    requestAnimationFrame(() => setIsVisible(true));
    
    // Saída automática
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg',
        'border-2 backdrop-blur-sm',
        'transition-all duration-300 ease-out',
        config.bgColor,
        config.borderColor,
        isVisible && !isLeaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
      )}
    >
      {/* Mascote */}
      <div className={cn(
        'relative flex-shrink-0',
        config.animation
      )}>
        {/* Tigre base */}
        <div className="text-4xl">🐯</div>
        {/* Emoji de reação sobreposto */}
        <div className="absolute -top-1 -right-1 text-lg bg-white rounded-full p-0.5 shadow-sm">
          {config.emoji}
        </div>
      </div>

      {/* Mensagem */}
      <div className="flex flex-col">
        <span className={cn('font-semibold text-sm', config.textColor)}>
          {message}
        </span>
        {subMessage && (
          <span className="text-xs text-gray-500">
            {subMessage}
          </span>
        )}
      </div>

      {/* Botão fechar */}
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onClose?.(), 300);
        }}
        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Context para gerenciar reações globalmente
interface TigerReactionContextType {
  showReaction: (mood: TigerMood, message: string, subMessage?: string, duration?: number) => void;
  // Atalhos para reações comuns
  celebrate: (message: string, subMessage?: string) => void;
  success: (message: string, subMessage?: string) => void;
  warning: (message: string, subMessage?: string) => void;
  error: (message: string, subMessage?: string) => void;
  thinking: (message: string, subMessage?: string) => void;
  // Configuração
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const TigerReactionContext = createContext<TigerReactionContextType | null>(null);

interface Reaction {
  id: number;
  mood: TigerMood;
  message: string;
  subMessage?: string;
  duration: number;
}

export function TigerReactionProvider({ children }: { children: React.ReactNode }) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [nextId, setNextId] = useState(0);
  const [isEnabled, setIsEnabled] = useState(() => {
    const stored = localStorage.getItem('sbar_tiger_reactions_enabled');
    return stored === null ? false : stored === 'true'; // Desativado por padrão até nova logo
  });

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem('sbar_tiger_reactions_enabled', String(enabled));
  }, []);

  const showReaction = useCallback((mood: TigerMood, message: string, subMessage?: string, duration = 3000) => {
    if (!isEnabled) return; // Não mostrar se desativado
    const id = nextId;
    setNextId(prev => prev + 1);
    setReactions(prev => [...prev, { id, mood, message, subMessage, duration }]);
  }, [nextId, isEnabled]);

  const removeReaction = useCallback((id: number) => {
    setReactions(prev => prev.filter(r => r.id !== id));
  }, []);

  // Atalhos
  const celebrate = useCallback((message: string, subMessage?: string) => {
    showReaction('celebrating', message, subMessage, 4000);
  }, [showReaction]);

  const success = useCallback((message: string, subMessage?: string) => {
    showReaction('happy', message, subMessage);
  }, [showReaction]);

  const warning = useCallback((message: string, subMessage?: string) => {
    showReaction('worried', message, subMessage, 4000);
  }, [showReaction]);

  const error = useCallback((message: string, subMessage?: string) => {
    showReaction('sad', message, subMessage);
  }, [showReaction]);

  const thinking = useCallback((message: string, subMessage?: string) => {
    showReaction('thinking', message, subMessage, 5000);
  }, [showReaction]);

  return (
    <TigerReactionContext.Provider value={{ showReaction, celebrate, success, warning, error, thinking, isEnabled, setEnabled }}>
      {children}
      {/* Renderizar todas as reações ativas */}
      {reactions.map((reaction, index) => (
        <div
          key={reaction.id}
          style={{ transform: `translateY(-${index * 80}px)` }}
        >
          <TigerReactionToast
            mood={reaction.mood}
            message={reaction.message}
            subMessage={reaction.subMessage}
            duration={reaction.duration}
            onClose={() => removeReaction(reaction.id)}
          />
        </div>
      ))}
    </TigerReactionContext.Provider>
  );
}

// Hook para usar as reações
export function useTigerReaction() {
  const context = useContext(TigerReactionContext);
  if (!context) {
    throw new Error('useTigerReaction must be used within TigerReactionProvider');
  }
  return context;
}

// Componente de demonstração das reações
export function TigerReactionDemo() {
  const { showReaction, celebrate, success, warning, error, thinking } = useTigerReaction();

  return (
    <div className="flex flex-wrap gap-2 p-4">
      <button
        onClick={() => success('Evolução salva!', 'Paciente Maria Silva')}
        className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
      >
        😊 Feliz
      </button>
      <button
        onClick={() => celebrate('Meta batida!', '10 evoluções hoje')}
        className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
      >
        🎉 Comemorando
      </button>
      <button
        onClick={() => warning('Paciente crítico!', 'UTI-01 precisa de atenção')}
        className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
      >
        😰 Preocupado
      </button>
      <button
        onClick={() => error('Ação cancelada', 'Tente novamente')}
        className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
      >
        😢 Triste
      </button>
      <button
        onClick={() => thinking('Analisando dados...', 'IA processando')}
        className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
      >
        🤔 Pensando
      </button>
      <button
        onClick={() => showReaction('proud', 'Você é incrível!', 'Top 3 médicos da semana')}
        className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600"
      >
        🏆 Orgulhoso
      </button>
      <button
        onClick={() => showReaction('waving', 'Bem-vindo de volta!', 'Dr. Carlos')}
        className="px-3 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600"
      >
        👋 Acenando
      </button>
      <button
        onClick={() => showReaction('surprised', 'Nova funcionalidade!', 'Confira o DRG')}
        className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
      >
        😲 Surpreso
      </button>
    </div>
  );
}

export default TigerReactionToast;
