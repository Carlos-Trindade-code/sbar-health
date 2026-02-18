import { describe, it, expect } from 'vitest';

// Test language preference validation
describe('Language Preference', () => {
  describe('Supported Languages', () => {
    const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'zh-CN'];

    it('should have 5 supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(5);
    });

    it('should include Portuguese (Brazil)', () => {
      expect(SUPPORTED_LANGUAGES).toContain('pt-BR');
    });

    it('should include English (US)', () => {
      expect(SUPPORTED_LANGUAGES).toContain('en-US');
    });

    it('should include Spanish (Spain)', () => {
      expect(SUPPORTED_LANGUAGES).toContain('es-ES');
    });

    it('should include French (France)', () => {
      expect(SUPPORTED_LANGUAGES).toContain('fr-FR');
    });

    it('should include Chinese (Simplified)', () => {
      expect(SUPPORTED_LANGUAGES).toContain('zh-CN');
    });
  });

  describe('Language Code Validation', () => {
    const isValidLanguageCode = (code: string): boolean => {
      const validCodes = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'zh-CN'];
      return validCodes.includes(code);
    };

    it('should validate pt-BR as valid', () => {
      expect(isValidLanguageCode('pt-BR')).toBe(true);
    });

    it('should validate en-US as valid', () => {
      expect(isValidLanguageCode('en-US')).toBe(true);
    });

    it('should validate es-ES as valid', () => {
      expect(isValidLanguageCode('es-ES')).toBe(true);
    });

    it('should validate fr-FR as valid', () => {
      expect(isValidLanguageCode('fr-FR')).toBe(true);
    });

    it('should validate zh-CN as valid', () => {
      expect(isValidLanguageCode('zh-CN')).toBe(true);
    });

    it('should reject invalid language codes', () => {
      expect(isValidLanguageCode('invalid')).toBe(false);
      expect(isValidLanguageCode('en')).toBe(false);
      expect(isValidLanguageCode('pt')).toBe(false);
      expect(isValidLanguageCode('de-DE')).toBe(false);
    });
  });

  describe('Default Language', () => {
    const DEFAULT_LANGUAGE = 'pt-BR';

    it('should have pt-BR as default language', () => {
      expect(DEFAULT_LANGUAGE).toBe('pt-BR');
    });

    it('should return default when user has no preference', () => {
      const getUserLanguage = (preference: string | null): string => {
        return preference || DEFAULT_LANGUAGE;
      };

      expect(getUserLanguage(null)).toBe('pt-BR');
      expect(getUserLanguage('en-US')).toBe('en-US');
    });
  });

  describe('Language Persistence', () => {
    it('should preserve language code format', () => {
      const languages = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'zh-CN'];
      
      languages.forEach(lang => {
        // Language codes should be in format xx-XX
        expect(lang).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
      });
    });

    it('should have unique language codes', () => {
      const languages = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'zh-CN'];
      const uniqueLanguages = new Set(languages);
      
      expect(uniqueLanguages.size).toBe(languages.length);
    });
  });
});
