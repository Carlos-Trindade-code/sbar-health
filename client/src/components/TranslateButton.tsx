import React, { useState } from 'react';
import { Languages, Check, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { trpc } from '@/lib/trpc';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'zh-CN';

const LANGUAGE_INFO: Record<SupportedLanguage, { flag: string; name: string; nativeName: string }> = {
  'pt-BR': { flag: '🇧🇷', name: 'Portuguese', nativeName: 'Português' },
  'en-US': { flag: '🇺🇸', name: 'English', nativeName: 'English' },
  'es-ES': { flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  'fr-FR': { flag: '🇫🇷', name: 'French', nativeName: 'Français' },
  'zh-CN': { flag: '🇨🇳', name: 'Chinese', nativeName: '中文' },
};

interface TranslateButtonProps {
  text: string;
  onTranslated: (translatedText: string, targetLang: SupportedLanguage) => void;
  context?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
  showLabel?: boolean;
}

export function TranslateButton({
  text,
  onTranslated,
  context,
  size = 'sm',
  variant = 'ghost',
  className,
  showLabel = false,
}: TranslateButtonProps) {
  const { locale } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedTo, setTranslatedTo] = useState<SupportedLanguage | null>(null);

  const translateMutation = trpc.translation.translate.useMutation({
    onSuccess: (result) => {
      onTranslated(result.translatedText, result.targetLanguage as SupportedLanguage);
      setTranslatedTo(result.targetLanguage as SupportedLanguage);
      setIsTranslating(false);
    },
    onError: () => {
      setIsTranslating(false);
    },
  });

  const handleTranslate = (targetLang: SupportedLanguage) => {
    if (!text.trim()) return;
    
    setIsTranslating(true);
    setTranslatedTo(null);
    translateMutation.mutate({
      text,
      targetLanguage: targetLang,
      context,
    });
  };

  // Filter out current locale from options
  const availableLanguages = (Object.keys(LANGUAGE_INFO) as SupportedLanguage[]).filter(
    (lang) => lang !== locale
  );

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant={variant}
                size={size}
                className={cn('gap-1.5', className)}
                disabled={isTranslating || !text.trim()}
              >
                {isTranslating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : translatedTo ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Languages className="h-4 w-4" />
                )}
                {showLabel && (
                  <span className="hidden sm:inline">
                    {translatedTo ? LANGUAGE_INFO[translatedTo].flag : 'Traduzir'}
                  </span>
                )}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Traduzir conteúdo</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          {availableLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleTranslate(lang)}
              className="gap-2 cursor-pointer"
            >
              <span className="text-lg">{LANGUAGE_INFO[lang].flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{LANGUAGE_INFO[lang].nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  {LANGUAGE_INFO[lang].name}
                </span>
              </div>
              {translatedTo === lang && (
                <Check className="h-4 w-4 text-green-500 ml-auto" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}

// Inline translation component for displaying translated text
interface TranslatedTextProps {
  original: string;
  translated: string | null;
  targetLang: SupportedLanguage | null;
  showOriginal?: boolean;
}

export function TranslatedText({
  original,
  translated,
  targetLang,
  showOriginal = true,
}: TranslatedTextProps) {
  const [showTranslation, setShowTranslation] = useState(true);

  if (!translated || !targetLang) {
    return <span>{original}</span>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">{LANGUAGE_INFO[targetLang].flag}</span>
        <span className="text-xs text-muted-foreground">
          Traduzido para {LANGUAGE_INFO[targetLang].nativeName}
        </span>
        {showOriginal && (
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="text-xs text-primary hover:underline ml-auto"
          >
            {showTranslation ? 'Ver original' : 'Ver tradução'}
          </button>
        )}
      </div>
      <p className="whitespace-pre-wrap">
        {showTranslation ? translated : original}
      </p>
    </div>
  );
}

// Hook for managing translation state
export function useTranslationState() {
  const [translations, setTranslations] = useState<
    Record<string, { text: string; lang: SupportedLanguage }>
  >({});

  const setTranslation = (key: string, text: string, lang: SupportedLanguage) => {
    setTranslations((prev) => ({
      ...prev,
      [key]: { text, lang },
    }));
  };

  const getTranslation = (key: string) => translations[key] || null;

  const clearTranslations = () => setTranslations({});

  return {
    translations,
    setTranslation,
    getTranslation,
    clearTranslations,
  };
}

export default TranslateButton;
