/**
 * Feature Flags - Controle de visibilidade de funcionalidades por fase de lançamento
 * 
 * Fase 1 (Lançamento): Core - Dashboard, Pacientes, SBAR, Equipes, Configurações
 * Fase 2 (2-4 semanas): Analytics, Chat de Equipe, Notificações Push
 * Fase 3 (1-2 meses): DRG, Sala de Recuperação, Gamificação, Internacionalização
 */

export type FeaturePhase = 'phase1' | 'phase2' | 'phase3';

export interface FeatureFlag {
  key: string;
  name: string;
  phase: FeaturePhase;
  enabled: boolean;
  description: string;
}

// Fase atual do sistema - altere aqui para habilitar novas funcionalidades
export const CURRENT_PHASE: FeaturePhase = 'phase1';

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Fase 1 - Core (sempre habilitado)
  dashboard: { key: 'dashboard', name: 'Dashboard', phase: 'phase1', enabled: true, description: 'Painel principal com visão geral' },
  patients: { key: 'patients', name: 'Pacientes', phase: 'phase1', enabled: true, description: 'Gestão de pacientes e internações' },
  sbar: { key: 'sbar', name: 'Evoluções SBAR', phase: 'phase1', enabled: true, description: 'Criação e gestão de evoluções SBAR' },
  teams: { key: 'teams', name: 'Equipes', phase: 'phase1', enabled: true, description: 'Gestão de equipes médicas' },
  settings: { key: 'settings', name: 'Configurações', phase: 'phase1', enabled: true, description: 'Configurações do perfil e sistema' },
  support: { key: 'support', name: 'Suporte', phase: 'phase1', enabled: true, description: 'FAQ e ajuda' },
  pwa: { key: 'pwa', name: 'Instalação PWA', phase: 'phase1', enabled: true, description: 'Instalar como app' },
  documentImport: { key: 'documentImport', name: 'Importação de Documentos', phase: 'phase1', enabled: true, description: 'Upload de PDF/foto com OCR' },
  voiceInput: { key: 'voiceInput', name: 'Entrada por Voz', phase: 'phase1', enabled: true, description: 'Cadastro por áudio' },
  onboarding: { key: 'onboarding', name: 'Onboarding', phase: 'phase1', enabled: true, description: 'Tutorial e cadastro inicial' },
  
  // Fase 2 - Expansão
  analytics: { key: 'analytics', name: 'Analytics', phase: 'phase2', enabled: false, description: 'Métricas de produtividade' },
  teamChat: { key: 'teamChat', name: 'Chat de Equipe', phase: 'phase2', enabled: false, description: 'Comunicação entre equipes' },
  pushNotifications: { key: 'pushNotifications', name: 'Push Notifications', phase: 'phase2', enabled: false, description: 'Notificações nativas' },
  hospitalDashboard: { key: 'hospitalDashboard', name: 'Dashboard Hospital', phase: 'phase2', enabled: false, description: 'Painel por hospital' },
  
  // Fase 3 - Avançado
  drg: { key: 'drg', name: 'Sistema DRG', phase: 'phase3', enabled: false, description: 'Classificação DRG' },
  drgPredictor: { key: 'drgPredictor', name: 'IA Preditor DRG', phase: 'phase3', enabled: false, description: 'Predição de DRG por IA' },
  recoveryRoom: { key: 'recoveryRoom', name: 'Sala de Recuperação', phase: 'phase3', enabled: false, description: 'Monitoramento pós-cirúrgico' },
  gamification: { key: 'gamification', name: 'Gamificação', phase: 'phase3', enabled: false, description: 'Pontos e conquistas' },
  i18n: { key: 'i18n', name: 'Internacionalização', phase: 'phase3', enabled: false, description: 'Suporte multi-idioma' },
  enterprise: { key: 'enterprise', name: 'Enterprise', phase: 'phase3', enabled: false, description: 'Painel empresarial' },
  translation: { key: 'translation', name: 'Tradução Automática', phase: 'phase3', enabled: false, description: 'Tradução de diagnósticos' },
};

/**
 * Verifica se uma funcionalidade está habilitada
 */
export function isFeatureEnabled(featureKey: string): boolean {
  const flag = FEATURE_FLAGS[featureKey];
  if (!flag) return false;
  return flag.enabled;
}

/**
 * Habilita todas as funcionalidades até uma determinada fase
 */
export function enablePhase(phase: FeaturePhase): void {
  const phaseOrder: FeaturePhase[] = ['phase1', 'phase2', 'phase3'];
  const phaseIndex = phaseOrder.indexOf(phase);
  
  Object.values(FEATURE_FLAGS).forEach(flag => {
    const flagPhaseIndex = phaseOrder.indexOf(flag.phase);
    flag.enabled = flagPhaseIndex <= phaseIndex;
  });
}

// Inicializar com a fase atual
enablePhase(CURRENT_PHASE);
