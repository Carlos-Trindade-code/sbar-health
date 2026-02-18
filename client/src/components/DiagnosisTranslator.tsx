import React, { useState } from 'react';
import { Languages, Check, Loader2, ChevronDown, Copy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'zh-CN';

const LANGUAGE_INFO: Record<SupportedLanguage, { flag: string; name: string; nativeName: string }> = {
  'pt-BR': { flag: '🇧🇷', name: 'Portuguese', nativeName: 'Português' },
  'en-US': { flag: '🇺🇸', name: 'English', nativeName: 'English' },
  'es-ES': { flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  'fr-FR': { flag: '🇫🇷', name: 'French', nativeName: 'Français' },
  'zh-CN': { flag: '🇨🇳', name: 'Chinese', nativeName: '中文' },
};

interface DiagnosisTranslatorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  showVoiceButton?: boolean;
  onVoiceInput?: () => void;
  isRecording?: boolean;
}

export function DiagnosisTranslator({
  value,
  onChange,
  label = 'Diagnóstico',
  placeholder = 'Descreva o diagnóstico',
  className,
  minHeight = '80px',
  showVoiceButton = false,
  onVoiceInput,
  isRecording = false,
}: DiagnosisTranslatorProps) {
  const { locale, t } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translatedTo, setTranslatedTo] = useState<SupportedLanguage | null>(null);
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  const translateMutation = trpc.translation.translate.useMutation({
    onSuccess: (result) => {
      setTranslatedText(result.translatedText);
      setTranslatedTo(result.targetLanguage as SupportedLanguage);
      setOriginalText(value);
      setShowTranslation(true);
      setIsTranslating(false);
      toast.success(`Traduzido para ${LANGUAGE_INFO[result.targetLanguage as SupportedLanguage].nativeName}`);
    },
    onError: (error) => {
      setIsTranslating(false);
      toast.error('Erro ao traduzir diagnóstico');
    },
  });

  const handleTranslate = (targetLang: SupportedLanguage) => {
    if (!value.trim()) {
      toast.error('Digite um diagnóstico para traduzir');
      return;
    }
    
    setIsTranslating(true);
    setTranslatedText(null);
    setTranslatedTo(null);
    translateMutation.mutate({
      text: value,
      targetLanguage: targetLang,
      context: 'medical_diagnosis',
    });
  };

  const handleUseTranslation = () => {
    if (translatedText) {
      onChange(translatedText);
      setShowTranslation(false);
      toast.success('Tradução aplicada ao campo');
    }
  };

  const handleCopyTranslation = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      toast.success('Tradução copiada');
    }
  };

  const handleRevertToOriginal = () => {
    if (originalText) {
      onChange(originalText);
      setShowTranslation(false);
      setTranslatedText(null);
      setTranslatedTo(null);
      toast.info('Texto original restaurado');
    }
  };

  // Filter out current locale from options
  const availableLanguages = (Object.keys(LANGUAGE_INFO) as SupportedLanguage[]).filter(
    (lang) => lang !== locale
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {translatedTo && showTranslation && (
          <Badge variant="secondary" className="gap-1">
            <span>{LANGUAGE_INFO[translatedTo].flag}</span>
            <span className="text-xs">{t('common.translated') || 'Traduzido'}</span>
          </Badge>
        )}
      </div>
      
      <div className="relative">
        <div className="flex gap-2">
          <Textarea
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              // Clear translation when text changes
              if (translatedText && e.target.value !== translatedText) {
                setShowTranslation(false);
              }
            }}
            className="flex-1"
            style={{ minHeight }}
          />
          
          <div className="flex flex-col gap-1">
            {/* Translation Button */}
            <TooltipProvider>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isTranslating || !value.trim()}
                      >
                        {isTranslating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : translatedTo && showTranslation ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Languages className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('common.translate') || 'Traduzir diagnóstico'}</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                    {t('common.translateTo') || 'Traduzir para'}
                  </div>
                  <DropdownMenuSeparator />
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
                      {translatedTo === lang && showTranslation && (
                        <Check className="h-4 w-4 text-green-500 ml-auto" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>

            {/* Voice Input Button (optional) */}
            {showVoiceButton && onVoiceInput && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={isRecording ? "destructive" : "outline"}
                      size="icon"
                      onClick={onVoiceInput}
                    >
                      {isRecording ? (
                        <div className="h-4 w-4 rounded-full bg-white animate-pulse" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isRecording ? 'Gravando...' : 'Entrada por voz'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Translation Preview */}
        {translatedText && showTranslation && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-dashed">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{translatedTo && LANGUAGE_INFO[translatedTo].flag}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {t('common.translatedVersion') || 'Versão traduzida'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCopyTranslation}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('common.copy') || 'Copiar'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleRevertToOriginal}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('common.revert') || 'Reverter'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap mb-3">{translatedText}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={handleUseTranslation}
            >
              <Check className="h-4 w-4 mr-2" />
              {t('common.useTranslation') || 'Usar esta tradução'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Component for displaying diagnosis with inline translation
interface DiagnosisDisplayProps {
  diagnosis: string;
  className?: string;
  showTranslateButton?: boolean;
}

export function DiagnosisDisplay({
  diagnosis,
  className,
  showTranslateButton = true,
}: DiagnosisDisplayProps) {
  const { locale, t } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translatedTo, setTranslatedTo] = useState<SupportedLanguage | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  const translateMutation = trpc.translation.translate.useMutation({
    onSuccess: (result) => {
      setTranslatedText(result.translatedText);
      setTranslatedTo(result.targetLanguage as SupportedLanguage);
      setShowTranslation(true);
      setIsTranslating(false);
    },
    onError: () => {
      setIsTranslating(false);
      toast.error('Erro ao traduzir');
    },
  });

  const handleTranslate = (targetLang: SupportedLanguage) => {
    if (!diagnosis.trim()) return;
    
    setIsTranslating(true);
    translateMutation.mutate({
      text: diagnosis,
      targetLanguage: targetLang,
      context: 'medical_diagnosis',
    });
  };

  const availableLanguages = (Object.keys(LANGUAGE_INFO) as SupportedLanguage[]).filter(
    (lang) => lang !== locale
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm whitespace-pre-wrap flex-1">
          {showTranslation && translatedText ? translatedText : diagnosis}
        </p>
        
        {showTranslateButton && diagnosis.trim() && (
          <TooltipProvider>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      disabled={isTranslating}
                    >
                      {isTranslating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Languages className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('common.translate') || 'Traduzir'}</p>
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
                    <span className="font-medium">{LANGUAGE_INFO[lang].nativeName}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        )}
      </div>

      {showTranslation && translatedTo && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{LANGUAGE_INFO[translatedTo].flag}</span>
          <span>{t('common.translatedFrom') || 'Traduzido do'} {t('common.original') || 'original'}</span>
          <button
            onClick={() => setShowTranslation(false)}
            className="text-primary hover:underline ml-auto"
          >
            {t('common.showOriginal') || 'Ver original'}
          </button>
        </div>
      )}
    </div>
  );
}

export default DiagnosisTranslator;
