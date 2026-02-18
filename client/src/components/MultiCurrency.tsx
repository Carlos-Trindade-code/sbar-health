import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Euro, Globe } from "lucide-react";

export type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'ARS' | 'CLP' | 'MXN' | 'COP';

interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rate: number; // Taxa de conversão para BRL
}

const currencies: Currency[] = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', flag: '🇧🇷', rate: 1 },
  { code: 'USD', symbol: '$', name: 'Dólar Americano', flag: '🇺🇸', rate: 0.20 },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rate: 0.18 },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina', flag: '🇬🇧', rate: 0.16 },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino', flag: '🇦🇷', rate: 170 },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno', flag: '🇨🇱', rate: 180 },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', flag: '🇲🇽', rate: 3.4 },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano', flag: '🇨🇴', rate: 800 },
];

interface MultiCurrencyProps {
  selectedCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  variant?: 'full' | 'compact';
}

export function CurrencySelector({ selectedCurrency, onCurrencyChange, variant = 'full' }: MultiCurrencyProps) {
  const selected = currencies.find(c => c.code === selectedCurrency) || currencies[0];

  if (variant === 'compact') {
    return (
      <Select value={selectedCurrency} onValueChange={(v) => onCurrencyChange(v as CurrencyCode)}>
        <SelectTrigger className="w-24">
          <SelectValue>
            <span className="flex items-center gap-1">
              <span>{selected.flag}</span>
              <span>{selected.code}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {currencies.map(currency => (
            <SelectItem key={currency.code} value={currency.code}>
              <span className="flex items-center gap-2">
                <span>{currency.flag}</span>
                <span>{currency.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={selectedCurrency} onValueChange={(v) => onCurrencyChange(v as CurrencyCode)}>
      <SelectTrigger className="w-full">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span className="text-lg">{selected.flag}</span>
            <span>{selected.name}</span>
            <Badge variant="outline" className="ml-auto">{selected.symbol}</Badge>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {currencies.map(currency => (
          <SelectItem key={currency.code} value={currency.code}>
            <span className="flex items-center gap-2 w-full">
              <span className="text-lg">{currency.flag}</span>
              <span className="flex-1">{currency.name}</span>
              <Badge variant="outline">{currency.symbol}</Badge>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Função para formatar preço em qualquer moeda
export function formatPrice(priceInBRL: number, currencyCode: CurrencyCode): string {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  const convertedPrice = priceInBRL * currency.rate;
  
  return new Intl.NumberFormat(getLocale(currencyCode), {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currencyCode === 'CLP' || currencyCode === 'COP' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'CLP' || currencyCode === 'COP' ? 0 : 2,
  }).format(convertedPrice);
}

function getLocale(currencyCode: CurrencyCode): string {
  const locales: Record<CurrencyCode, string> = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    ARS: 'es-AR',
    CLP: 'es-CL',
    MXN: 'es-MX',
    COP: 'es-CO',
  };
  return locales[currencyCode];
}

// Componente de preço com moeda
interface PriceDisplayProps {
  priceInBRL: number;
  currency: CurrencyCode;
  size?: 'sm' | 'md' | 'lg';
  showOriginal?: boolean;
}

export function PriceDisplay({ priceInBRL, currency, size = 'md', showOriginal = false }: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-3xl font-bold'
  };

  return (
    <div className="flex flex-col">
      <span className={sizeClasses[size]}>
        {formatPrice(priceInBRL, currency)}
      </span>
      {showOriginal && currency !== 'BRL' && (
        <span className="text-xs text-muted-foreground">
          ≈ {formatPrice(priceInBRL, 'BRL')}
        </span>
      )}
    </div>
  );
}

// Hook para gerenciar moeda selecionada
export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    // Detectar moeda baseado no timezone/locale do navegador
    const locale = navigator.language;
    if (locale.startsWith('pt')) return 'BRL';
    if (locale.startsWith('es-AR')) return 'ARS';
    if (locale.startsWith('es-CL')) return 'CLP';
    if (locale.startsWith('es-MX')) return 'MXN';
    if (locale.startsWith('es-CO')) return 'COP';
    if (locale.startsWith('en-GB')) return 'GBP';
    if (locale.startsWith('en')) return 'USD';
    if (locale.startsWith('de') || locale.startsWith('fr') || locale.startsWith('it')) return 'EUR';
    return 'USD';
  });

  return {
    currency,
    setCurrency,
    formatPrice: (priceInBRL: number) => formatPrice(priceInBRL, currency),
  };
}

// Tabela de preços com múltiplas moedas
interface PricingTableProps {
  plans: {
    name: string;
    priceMonthlyBRL: number;
    priceYearlyBRL: number;
    features: string[];
    popular?: boolean;
  }[];
  currency: CurrencyCode;
  billingPeriod: 'monthly' | 'yearly';
}

export function PricingTable({ plans, currency, billingPeriod }: PricingTableProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan, idx) => (
        <div 
          key={idx}
          className={`p-6 rounded-xl border ${plan.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border'}`}
        >
          {plan.popular && (
            <Badge className="mb-4">Mais Popular</Badge>
          )}
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <div className="mt-4">
            <PriceDisplay 
              priceInBRL={billingPeriod === 'monthly' ? plan.priceMonthlyBRL : plan.priceYearlyBRL}
              currency={currency}
              size="lg"
              showOriginal
            />
            <span className="text-sm text-muted-foreground">
              /{billingPeriod === 'monthly' ? 'mês' : 'ano'}
            </span>
          </div>
          <ul className="mt-6 space-y-2">
            {plan.features.map((feature, fidx) => (
              <li key={fidx} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <Button className="w-full mt-6" variant={plan.popular ? 'default' : 'outline'}>
            Começar agora
          </Button>
        </div>
      ))}
    </div>
  );
}

export default CurrencySelector;
