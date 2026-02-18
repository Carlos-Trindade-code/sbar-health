import { useTranslation, Locale } from '@/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'full';
  className?: string;
}

export function LanguageSelector({ variant = 'default', className = '' }: LanguageSelectorProps) {
  const { locale, setLocale, locales, currentLocaleInfo } = useTranslation();

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={className}>
            <span className="text-lg">{currentLocaleInfo.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc.code}
              onClick={() => setLocale(loc.code)}
              className="flex items-center gap-2"
            >
              <span className="text-lg">{loc.flag}</span>
              <span>{loc.nativeName}</span>
              {locale === loc.code && <Check className="h-4 w-4 ml-auto text-emerald-500" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`space-y-2 ${className}`}>
        {locales.map((loc) => (
          <button
            key={loc.code}
            onClick={() => setLocale(loc.code)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              locale === loc.code
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
            }`}
          >
            <span className="text-2xl">{loc.flag}</span>
            <div className="text-left">
              <div className="font-medium">{loc.nativeName}</div>
              <div className="text-sm text-gray-500">{loc.name}</div>
            </div>
            {locale === loc.code && (
              <Check className="h-5 w-5 ml-auto text-emerald-500" />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className}`}>
          <Globe className="h-4 w-4" />
          <span>{currentLocaleInfo.flag}</span>
          <span className="hidden sm:inline">{currentLocaleInfo.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => setLocale(loc.code)}
            className="flex items-center gap-2"
          >
            <span className="text-lg">{loc.flag}</span>
            <span className="flex-1">{loc.nativeName}</span>
            {locale === loc.code && <Check className="h-4 w-4 text-emerald-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
