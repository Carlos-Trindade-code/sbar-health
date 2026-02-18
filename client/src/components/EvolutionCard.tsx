import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Lock, Languages, Loader2, X, Edit3, Check, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';

type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'zh-CN';

const LANGUAGE_INFO: Record<SupportedLanguage, { flag: string; name: string }> = {
  'pt-BR': { flag: '🇧🇷', name: 'Português' },
  'en-US': { flag: '🇺🇸', name: 'English' },
  'es-ES': { flag: '🇪🇸', name: 'Español' },
  'fr-FR': { flag: '🇫🇷', name: 'Français' },
  'zh-CN': { flag: '🇨🇳', name: '中文' },
};

interface Evolution {
  id: number;
  authorId?: number;
  situation?: string | null;
  background?: string | null;
  assessment?: string | null;
  recommendation?: string | null;
  createdAt: Date | string;
  lockedAt?: Date | string | null;
  lastEditedById?: number | null;
  lastEditedAt?: Date | string | null;
  author?: { name?: string | null } | null;
  lastEditor?: { name?: string | null } | null;
}

interface EvolutionCardProps {
  evolution: Evolution;
  showTranslation?: boolean;
  onEdited?: () => void;
}

export function EvolutionCard({ evolution, showTranslation = true, onEdited }: EvolutionCardProps) {
  const { user } = useAuth();
  const [translations, setTranslations] = useState<Record<string, string> | null>(null);
  const [translatedTo, setTranslatedTo] = useState<SupportedLanguage | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSituation, setEditSituation] = useState(evolution.situation || '');
  const [editBackground, setEditBackground] = useState(evolution.background || '');
  const [editAssessment, setEditAssessment] = useState(evolution.assessment || '');
  const [editRecommendation, setEditRecommendation] = useState(evolution.recommendation || '');

  const isAuthor = user?.id === evolution.authorId;

  const editMutation = trpc.evolutions.edit.useMutation({
    onSuccess: () => {
      toast.success('Evolução atualizada!');
      setIsEditing(false);
      onEdited?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const translateEvolution = trpc.translation.translateEvolution.useMutation({
    onSuccess: (result) => {
      setTranslations(result.translations);
      setTranslatedTo(result.targetLanguage as SupportedLanguage);
      setIsTranslating(false);
      toast.success(`Traduzido para ${LANGUAGE_INFO[result.targetLanguage as SupportedLanguage].name}`);
    },
    onError: (error) => {
      setIsTranslating(false);
      toast.error('Erro ao traduzir: ' + error.message);
    },
  });

  const handleTranslate = (targetLang: SupportedLanguage) => {
    setIsTranslating(true);
    translateEvolution.mutate({
      evolutionId: evolution.id,
      targetLanguage: targetLang,
    });
  };

  const clearTranslation = () => {
    setTranslations(null);
    setTranslatedTo(null);
  };

  const handleStartEdit = () => {
    setEditSituation(evolution.situation || '');
    setEditBackground(evolution.background || '');
    setEditAssessment(evolution.assessment || '');
    setEditRecommendation(evolution.recommendation || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    editMutation.mutate({
      evolutionId: evolution.id,
      situation: editSituation,
      background: editBackground,
      assessment: editAssessment,
      recommendation: editRecommendation,
    });
  };

  const getText = (field: 'situation' | 'background' | 'assessment' | 'recommendation') => {
    if (translations && translations[field]) {
      return translations[field];
    }
    return evolution[field] || '';
  };

  const getLabel = (field: string) => {
    const labels: Record<string, Record<string, string>> = {
      situation: { 'pt-BR': 'Situação', 'en-US': 'Situation', 'es-ES': 'Situación', 'fr-FR': 'Situation', 'zh-CN': '现状' },
      background: { 'pt-BR': 'Background', 'en-US': 'Background', 'es-ES': 'Antecedentes', 'fr-FR': 'Contexte', 'zh-CN': '背景' },
      assessment: { 'pt-BR': 'Avaliação', 'en-US': 'Assessment', 'es-ES': 'Evaluación', 'fr-FR': 'Évaluation', 'zh-CN': '评估' },
      recommendation: { 'pt-BR': 'Recomendação', 'en-US': 'Recommendation', 'es-ES': 'Recomendación', 'fr-FR': 'Recommandation', 'zh-CN': '建议' },
    };
    return labels[field]?.[translatedTo || 'pt-BR'] || labels[field]?.['pt-BR'] || field;
  };

  return (
    <Card className="relative">
      {evolution.lockedAt && !isEditing && (
        <div className="absolute top-4 right-4">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {new Date(evolution.createdAt).toLocaleString()}
            {evolution.author?.name && <span>• {evolution.author.name}</span>}
          </div>
          
          <div className="flex items-center gap-1">
            {isAuthor && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartEdit}
                className="h-7 px-2 text-xs"
                title="Editar evolução"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Editar
              </Button>
            )}
            
            {isEditing && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveEdit}
                  className="h-7 px-2 text-xs"
                  disabled={editMutation.isPending}
                >
                  {editMutation.isPending ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  Salvar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="h-7 px-2 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancelar
                </Button>
              </>
            )}

            {showTranslation && !isEditing && (
              <>
                {translatedTo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTranslation}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    {LANGUAGE_INFO[translatedTo].flag}
                  </Button>
                )}
                
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    disabled={isTranslating}
                  >
                    {isTranslating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Languages className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
                    <div className="bg-popover border rounded-md shadow-md p-1 min-w-[140px]">
                      {(Object.keys(LANGUAGE_INFO) as SupportedLanguage[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleTranslate(lang)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent rounded-sm"
                          disabled={isTranslating}
                        >
                          <span>{LANGUAGE_INFO[lang].flag}</span>
                          <span>{LANGUAGE_INFO[lang].name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {translatedTo && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <span>{LANGUAGE_INFO[translatedTo].flag}</span>
            <span>Traduzido para {LANGUAGE_INFO[translatedTo].name}</span>
          </div>
        )}
        
        {/* Last edited info */}
        {evolution.lastEditedAt && evolution.lastEditedById && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
            <AlertCircle className="w-3 h-3" />
            <span>
              Editado em {new Date(evolution.lastEditedAt).toLocaleString()}
              {(evolution as any).lastEditorName && ` por ${(evolution as any).lastEditorName}`}
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {isEditing ? (
          <>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-primary">Situação</p>
              <Textarea value={editSituation} onChange={(e) => setEditSituation(e.target.value)} className="min-h-[60px] text-sm" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold" style={{ color: 'oklch(0.45 0.05 250)' }}>Background</p>
              <Textarea value={editBackground} onChange={(e) => setEditBackground(e.target.value)} className="min-h-[60px] text-sm" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold" style={{ color: 'oklch(0.75 0.15 85)' }}>Avaliação</p>
              <Textarea value={editAssessment} onChange={(e) => setEditAssessment(e.target.value)} className="min-h-[60px] text-sm" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold" style={{ color: 'oklch(0.65 0.18 145)' }}>Recomendação</p>
              <Textarea value={editRecommendation} onChange={(e) => setEditRecommendation(e.target.value)} className="min-h-[60px] text-sm" />
            </div>
          </>
        ) : (
          <>
            {(evolution.situation || translations?.situation) && (
              <div className="sbar-section sbar-s">
                <p className="text-xs font-semibold text-primary mb-1">{getLabel('situation')}</p>
                <p className="text-sm whitespace-pre-wrap">{getText('situation')}</p>
              </div>
            )}
            
            {(evolution.background || translations?.background) && (
              <div className="sbar-section sbar-b">
                <p className="text-xs font-semibold mb-1" style={{ color: 'oklch(0.45 0.05 250)' }}>{getLabel('background')}</p>
                <p className="text-sm whitespace-pre-wrap">{getText('background')}</p>
              </div>
            )}
            
            {(evolution.assessment || translations?.assessment) && (
              <div className="sbar-section sbar-a">
                <p className="text-xs font-semibold mb-1" style={{ color: 'oklch(0.75 0.15 85)' }}>{getLabel('assessment')}</p>
                <p className="text-sm whitespace-pre-wrap">{getText('assessment')}</p>
              </div>
            )}
            
            {(evolution.recommendation || translations?.recommendation) && (
              <div className="sbar-section sbar-r">
                <p className="text-xs font-semibold mb-1" style={{ color: 'oklch(0.65 0.18 145)' }}>{getLabel('recommendation')}</p>
                <p className="text-sm whitespace-pre-wrap">{getText('recommendation')}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default EvolutionCard;
