import { useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { useTranslation, type Locale } from '@/i18n';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * Component that syncs the user's language preference with the database.
 * Should be placed inside both I18nProvider and AuthProvider.
 */
export function I18nSync() {
  const { user } = useAuth();
  const { locale, setLocale } = useTranslation();
  const initialSyncDone = useRef(false);
  const lastSavedLocale = useRef<Locale | null>(null);

  // Query to get user's preferred language from database
  const { data: languageData } = trpc.profile.getLanguage.useQuery(undefined, {
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to save language preference
  const updateLanguage = trpc.profile.updateLanguage.useMutation();

  // Sync from database to local state on initial load
  useEffect(() => {
    if (languageData?.language && !initialSyncDone.current && user) {
      const dbLocale = languageData.language as Locale;
      if (dbLocale !== locale) {
        setLocale(dbLocale);
      }
      lastSavedLocale.current = dbLocale;
      initialSyncDone.current = true;
    }
  }, [languageData, locale, setLocale, user]);

  // Save to database when locale changes (after initial sync)
  useEffect(() => {
    if (
      user &&
      initialSyncDone.current &&
      locale !== lastSavedLocale.current
    ) {
      lastSavedLocale.current = locale;
      updateLanguage.mutate({ language: locale });
    }
  }, [locale, user, updateLanguage]);

  return null;
}

export default I18nSync;
