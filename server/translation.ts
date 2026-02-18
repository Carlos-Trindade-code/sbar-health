import { invokeLLM } from "./_core/llm";

// Supported languages for translation
export const SUPPORTED_LANGUAGES = {
  'pt-BR': 'Portuguese (Brazil)',
  'en-US': 'English (US)',
  'es-ES': 'Spanish (Spain)',
  'fr-FR': 'French (France)',
  'zh-CN': 'Chinese (Simplified)',
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// In-memory cache for translations (in production, use Redis or similar)
const translationCache = new Map<string, { translation: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function getCacheKey(text: string, targetLang: SupportedLanguage): string {
  return `${targetLang}:${text.substring(0, 100)}:${text.length}`;
}

function getFromCache(text: string, targetLang: SupportedLanguage): string | null {
  const key = getCacheKey(text, targetLang);
  const cached = translationCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.translation;
  }
  
  if (cached) {
    translationCache.delete(key);
  }
  
  return null;
}

function setCache(text: string, targetLang: SupportedLanguage, translation: string): void {
  const key = getCacheKey(text, targetLang);
  translationCache.set(key, { translation, timestamp: Date.now() });
  
  // Clean old entries if cache is too large
  if (translationCache.size > 1000) {
    const entries = Array.from(translationCache.entries());
    const now = Date.now();
    entries.forEach(([k, v]) => {
      if (now - v.timestamp > CACHE_TTL) {
        translationCache.delete(k);
      }
    });
  }
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: SupportedLanguage;
  cached: boolean;
}

/**
 * Translate clinical content using LLM
 * Optimized for medical terminology and SBAR format
 */
export async function translateClinicalContent(
  text: string,
  targetLang: SupportedLanguage,
  sourceContext?: string
): Promise<TranslationResult> {
  // Check cache first
  const cached = getFromCache(text, targetLang);
  if (cached) {
    return {
      originalText: text,
      translatedText: cached,
      sourceLanguage: 'auto',
      targetLanguage: targetLang,
      cached: true,
    };
  }

  const targetLanguageName = SUPPORTED_LANGUAGES[targetLang];
  
  const systemPrompt = `You are a professional medical translator specializing in clinical documentation. 
Your task is to translate medical content accurately while:
1. Preserving medical terminology precision
2. Maintaining SBAR (Situation, Background, Assessment, Recommendation) structure if present
3. Keeping abbreviations that are internationally recognized (e.g., IV, ECG, MRI)
4. Adapting culturally specific terms when necessary
5. Preserving numerical values, dates, and measurements exactly

IMPORTANT: Return ONLY the translated text, without any explanations, notes, or formatting markers.`;

  const userPrompt = sourceContext 
    ? `Translate the following clinical content to ${targetLanguageName}. Context: ${sourceContext}\n\nText to translate:\n${text}`
    : `Translate the following clinical content to ${targetLanguageName}:\n\n${text}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const translatedText = response.choices[0]?.message?.content;
    
    if (!translatedText || typeof translatedText !== 'string') {
      throw new Error('Invalid translation response');
    }

    // Cache the result
    setCache(text, targetLang, translatedText);

    return {
      originalText: text,
      translatedText,
      sourceLanguage: 'auto',
      targetLanguage: targetLang,
      cached: false,
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Failed to translate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Translate multiple texts in batch
 */
export async function translateBatch(
  texts: string[],
  targetLang: SupportedLanguage
): Promise<TranslationResult[]> {
  const results: TranslationResult[] = [];
  
  for (const text of texts) {
    try {
      const result = await translateClinicalContent(text, targetLang);
      results.push(result);
    } catch (error) {
      // On error, return original text
      results.push({
        originalText: text,
        translatedText: text,
        sourceLanguage: 'auto',
        targetLanguage: targetLang,
        cached: false,
      });
    }
  }
  
  return results;
}

/**
 * Detect the language of a text (simplified detection)
 */
export function detectLanguage(text: string): SupportedLanguage {
  // Simple heuristic based on character patterns
  const hasChineseChars = /[\u4e00-\u9fff]/.test(text);
  if (hasChineseChars) return 'zh-CN';
  
  // Portuguese-specific patterns (check first due to unique characters)
  const hasPortugueseChars = /[ãõ]/i.test(text); // ã and õ are unique to Portuguese
  const portugueseWords = /\b(não|está|uma|para|com|mais|seu|sua|paciente|quadro|internado)\b/gi;
  if (hasPortugueseChars || (portugueseWords.test(text) && /[çáéíóúâêô]/i.test(text))) return 'pt-BR';
  
  // French-specific patterns (check before Spanish due to similar accents)
  const hasFrenchSpecific = /[èêîôûàù]/i.test(text); // French-specific accents
  const frenchWords = /\b(le|la|les|des|du|est|avec|dans|sur|une|sont|pour|cette|l[’']|qu[’']|d[’'])\b/gi;
  const frenchApostrophe = /[lLdD][’']/g;
  if ((hasFrenchSpecific && frenchWords.test(text)) || frenchApostrophe.test(text)) return 'fr-FR';
  
  // Spanish-specific patterns
  const hasSpanishSpecific = /[ñ¿¡]/i.test(text); // Unique Spanish characters
  const spanishWords = /\b(el|los|las|tiene|con|sus|incluyen|paciente|medicamentos)\b/gi;
  if (hasSpanishSpecific || (spanishWords.test(text) && /[áéíóú]/i.test(text))) return 'es-ES';
  
  // Default to English
  return 'en-US';
}
