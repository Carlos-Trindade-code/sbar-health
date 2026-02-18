import { isFeatureEnabled, FEATURE_FLAGS, type FeatureFlag } from '../../../shared/featureFlags';

/**
 * Hook para verificar se uma funcionalidade está habilitada
 */
export function useFeatureFlag(featureKey: string): boolean {
  return isFeatureEnabled(featureKey);
}

/**
 * Hook para obter todas as feature flags
 */
export function useFeatureFlags(): Record<string, FeatureFlag> {
  return FEATURE_FLAGS;
}

export { isFeatureEnabled };
