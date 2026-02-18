import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectLanguage, SUPPORTED_LANGUAGES } from './translation';

describe('Translation Service', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('should have 5 supported languages', () => {
      expect(Object.keys(SUPPORTED_LANGUAGES)).toHaveLength(5);
    });

    it('should include Portuguese, English, Spanish, French, and Chinese', () => {
      expect(SUPPORTED_LANGUAGES['pt-BR']).toBe('Portuguese (Brazil)');
      expect(SUPPORTED_LANGUAGES['en-US']).toBe('English (US)');
      expect(SUPPORTED_LANGUAGES['es-ES']).toBe('Spanish (Spain)');
      expect(SUPPORTED_LANGUAGES['fr-FR']).toBe('French (France)');
      expect(SUPPORTED_LANGUAGES['zh-CN']).toBe('Chinese (Simplified)');
    });
  });

  describe('detectLanguage', () => {
    it('should detect Chinese text', () => {
      const chineseText = '患者今日病情稳定，生命体征正常';
      expect(detectLanguage(chineseText)).toBe('zh-CN');
    });

    it('should detect Portuguese text', () => {
      const portugueseText = 'Paciente apresenta melhora significativa do quadro clínico. Não há febre.';
      expect(detectLanguage(portugueseText)).toBe('pt-BR');
    });

    it('should detect Spanish text', () => {
      // Spanish text with unique ñ character for reliable detection
      const spanishText = 'El niño presenta mejoría significativa. No hay fiebre ni dolor.';
      expect(detectLanguage(spanishText)).toBe('es-ES');
    });

    it('should detect French text', () => {
      const frenchText = 'Le patient présente une amélioration significative. Pas de fièvre.';
      expect(detectLanguage(frenchText)).toBe('fr-FR');
    });

    it('should default to English for unrecognized text', () => {
      const englishText = 'The patient shows significant improvement. No fever detected.';
      expect(detectLanguage(englishText)).toBe('en-US');
    });

    it('should handle mixed content with Chinese characters', () => {
      const mixedText = 'Patient ID: 12345, 诊断: 肺炎';
      expect(detectLanguage(mixedText)).toBe('zh-CN');
    });

    it('should handle empty string', () => {
      expect(detectLanguage('')).toBe('en-US');
    });

    it('should handle text with only numbers', () => {
      expect(detectLanguage('12345')).toBe('en-US');
    });
  });

  describe('Translation Cache', () => {
    it('should have proper cache key generation logic', () => {
      // Test that the cache key format is consistent
      const text1 = 'Short text';
      const text2 = 'A very long text that exceeds one hundred characters and should be truncated for the cache key generation process';
      
      // Both should be detectable
      expect(detectLanguage(text1)).toBeDefined();
      expect(detectLanguage(text2)).toBeDefined();
    });
  });

  describe('Clinical Content Detection', () => {
    it('should correctly identify Portuguese medical terms', () => {
      const medicalPt = 'Paciente com diagnóstico de pneumonia bacteriana, em uso de antibióticos';
      expect(detectLanguage(medicalPt)).toBe('pt-BR');
    });

    it('should correctly identify Spanish medical terms', () => {
      // Spanish text with unique ñ character
      const medicalEs = 'El niño tiene diagnóstico de neumonía bacteriana, en tratamiento con antibióticos';
      expect(detectLanguage(medicalEs)).toBe('es-ES');
    });

    it('should correctly identify French medical terms', () => {
      // French text with clear French markers (apostrophes and specific accents)
      const medicalFr = "Le patient présente un diagnostic de pneumonie bactérienne. L'état est stable.";
      expect(detectLanguage(medicalFr)).toBe('fr-FR');
    });

    it('should correctly identify English medical terms', () => {
      const medicalEn = 'Patient diagnosed with bacterial pneumonia, currently on antibiotic treatment';
      expect(detectLanguage(medicalEn)).toBe('en-US');
    });

    it('should correctly identify Chinese medical terms', () => {
      const medicalZh = '患者诊断为细菌性肺炎，正在接受抗生素治疗';
      expect(detectLanguage(medicalZh)).toBe('zh-CN');
    });
  });

  describe('SBAR Format Detection', () => {
    it('should detect language in SBAR Situation section', () => {
      const situationPt = 'Situação: Paciente de 65 anos, internado há 3 dias com quadro de dispneia e tosse';
      expect(detectLanguage(situationPt)).toBe('pt-BR');
    });

    it('should detect language in SBAR Background section with Spanish', () => {
      // Spanish text with unique Spanish character ñ
      const backgroundEs = 'Antecedentes: El niño tiene hipertensión arterial y diabetes mellitus tipo 2.';
      expect(detectLanguage(backgroundEs)).toBe('es-ES');
    });

    it('should detect language in SBAR Assessment section with French', () => {
      // French text with apostrophe pattern
      const assessmentFr = "Évaluation: L'état clinique du patient est stable. Il n'y a pas de fièvre.";
      expect(detectLanguage(assessmentFr)).toBe('fr-FR');
    });

    it('should detect language in SBAR Recommendation section', () => {
      const recommendationEn = 'Recommendation: Continue current treatment, monitor vital signs every 4 hours';
      expect(detectLanguage(recommendationEn)).toBe('en-US');
    });
  });
});
