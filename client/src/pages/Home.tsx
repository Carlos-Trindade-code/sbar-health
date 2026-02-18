import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ArrowRight,
  BarChart3, 
  Brain, 
  CheckCircle2,
  Clock, 
  FileText, 
  Hospital, 
  Mic, 
  Play,
  Shield, 
  Sparkles,
  Star,
  Stethoscope, 
  Users, 
  Zap,
  Quote,
  TrendingUp,
  Heart,
  Award,
  Globe,
  ChevronDown
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/i18n";

type Currency = 'BRL' | 'USD' | 'EUR';

interface PriceConfig {
  basic: { monthly: number; yearly: number };
  pro: { monthly: number; yearly: number };
  enterprise: { monthly: number; yearly: number };
  symbol: string;
  code: Currency;
}

const PRICES: Record<Currency, PriceConfig> = {
  BRL: {
    basic: { monthly: 29.90, yearly: 23.90 },
    pro: { monthly: 69.90, yearly: 55.90 },
    enterprise: { monthly: 149.90, yearly: 119.90 },
    symbol: 'R$',
    code: 'BRL',
  },
  USD: {
    basic: { monthly: 9.90, yearly: 7.90 },
    pro: { monthly: 19.90, yearly: 15.90 },
    enterprise: { monthly: 49.90, yearly: 39.90 },
    symbol: '$',
    code: 'USD',
  },
  EUR: {
    basic: { monthly: 8.90, yearly: 7.10 },
    pro: { monthly: 17.90, yearly: 14.30 },
    enterprise: { monthly: 44.90, yearly: 35.90 },
    symbol: '€',
    code: 'EUR',
  },
};

const COUNTRY_CURRENCY_MAP: Record<string, Currency> = {
  'BR': 'BRL', 'PT': 'EUR', 'AO': 'USD', 'MZ': 'USD',
  'US': 'USD', 'GB': 'USD', 'AU': 'USD', 'CA': 'USD',
  'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 'BE': 'EUR', 'AT': 'EUR', 'IE': 'EUR', 'FI': 'EUR', 'GR': 'EUR', 'LU': 'EUR',
  'MX': 'USD', 'AR': 'USD', 'CO': 'USD', 'CL': 'USD', 'PE': 'USD',
  'CN': 'USD', 'JP': 'USD', 'KR': 'USD', 'IN': 'USD',
};

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { t, locale } = useTranslation();
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  // Detect currency by geolocation
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const stored = localStorage.getItem('sbar-currency') as Currency;
        if (stored && PRICES[stored]) {
          setCurrency(stored);
          return;
        }
        const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        if (response.ok) {
          const data = await response.json();
          const detected = COUNTRY_CURRENCY_MAP[data.country_code] || 'USD';
          setCurrency(detected);
          localStorage.setItem('sbar-currency', detected);
        }
      } catch {
        // Default to BRL if locale is pt-BR, otherwise USD
        const fallback = locale.startsWith('pt') ? 'BRL' : locale.startsWith('es') ? 'USD' : 'USD';
        setCurrency(fallback);
      }
    };
    detectCurrency();
  }, [locale]);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    localStorage.setItem('sbar-currency', c);
    setCurrencyDropdownOpen(false);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.onboardingCompleted) {
        setLocation("/welcome");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [isAuthenticated, user, setLocation]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="flex flex-col items-center gap-4">
          <Stethoscope className="w-12 h-12 text-primary animate-bounce" />
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Zap, title: t('landing.features.register'), description: t('landing.features.registerDesc'), color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { icon: FileText, title: t('landing.features.sbar'), description: t('landing.features.sbarDesc'), color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { icon: Brain, title: t('landing.features.ai'), description: t('landing.features.aiDesc'), color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { icon: BarChart3, title: t('landing.features.analytics'), description: t('landing.features.analyticsDesc'), color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { icon: Shield, title: t('landing.features.lgpd'), description: t('landing.features.lgpdDesc'), color: "text-red-500", bgColor: "bg-red-500/10" },
    { icon: Users, title: t('landing.features.collab'), description: t('landing.features.collabDesc'), color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  ];

  const testimonials = [
    { quote: t('landing.testimonials.t1'), author: t('landing.testimonials.t1Author'), role: t('landing.testimonials.t1Role'), avatar: "\uD83D\uDC69\u200D\u2695\uFE0F", rating: 5 },
    { quote: t('landing.testimonials.t2'), author: t('landing.testimonials.t2Author'), role: t('landing.testimonials.t2Role'), avatar: "\uD83D\uDC68\u200D\u2695\uFE0F", rating: 5 },
    { quote: t('landing.testimonials.t3'), author: t('landing.testimonials.t3Author'), role: t('landing.testimonials.t3Role'), avatar: "\uD83D\uDC68\u200D\u2695\uFE0F", rating: 5 },
  ];

  const stats = [
    { value: "2.500+", label: t('landing.social.doctors'), icon: Users },
    { value: "150.000+", label: t('landing.social.evolutions'), icon: FileText },
    { value: "45", label: t('landing.social.hospitals'), icon: Hospital },
    { value: "98%", label: t('landing.social.satisfaction'), icon: Heart },
  ];

  const prices = PRICES[currency];
  const formatPrice = (value: number) => {
    if (currency === 'BRL') return `R$ ${value.toFixed(2).replace('.', ',')}`;
    if (currency === 'EUR') return `€${value.toFixed(2)}`;
    return `$${value.toFixed(2)}`;
  };

  const plans = [
    {
      name: t('landing.pricing.basic.name'),
      price: formatPrice(billingPeriod === 'monthly' ? prices.basic.monthly : prices.basic.yearly),
      period: billingPeriod === 'monthly' ? t('landing.pricing.perMonth') : t('landing.pricing.perYear'),
      description: t('landing.pricing.basic.description'),
      features: [t('landing.pricing.basic.f1'), t('landing.pricing.basic.f2'), t('landing.pricing.basic.f3'), t('landing.pricing.basic.f4'), t('landing.pricing.basic.f5')],
      highlighted: false,
      cta: t('landing.pricing.startTrial'),
    },
    {
      name: t('landing.pricing.pro.name'),
      price: formatPrice(billingPeriod === 'monthly' ? prices.pro.monthly : prices.pro.yearly),
      period: billingPeriod === 'monthly' ? t('landing.pricing.perMonth') : t('landing.pricing.perYear'),
      description: t('landing.pricing.pro.description'),
      features: [t('landing.pricing.pro.f1'), t('landing.pricing.pro.f2'), t('landing.pricing.pro.f3'), t('landing.pricing.pro.f4'), t('landing.pricing.pro.f5'), t('landing.pricing.pro.f6')],
      highlighted: true,
      cta: t('landing.pricing.startTrial'),
    },
    {
      name: t('landing.pricing.enterprise.name'),
      price: formatPrice(billingPeriod === 'monthly' ? prices.enterprise.monthly : prices.enterprise.yearly),
      period: billingPeriod === 'monthly' ? (t('landing.pricing.perUser') + t('landing.pricing.perMonth')) : (t('landing.pricing.perUser') + t('landing.pricing.perYear')),
      description: t('landing.pricing.enterprise.description'),
      features: [t('landing.pricing.enterprise.f1'), t('landing.pricing.enterprise.f2'), t('landing.pricing.enterprise.f3'), t('landing.pricing.enterprise.f4'), t('landing.pricing.enterprise.f5'), t('landing.pricing.enterprise.f6')],
      highlighted: false,
      cta: t('landing.pricing.contactSales'),
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SBAR Health
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('nav.features')}
            </a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('nav.testimonials')}
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('nav.pricing')}
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSelector variant="compact" />
            <Button variant="ghost" size="sm" onClick={() => setLocation('/demo')}>
              {t('nav.demo')}
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setLocation('/login')}>
              {t('nav.login')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 relative">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  {t('landing.hero.badge')}
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  {t('landing.hero.title')}
                  <br />
                  <span className="bg-gradient-to-r from-primary via-primary to-emerald-500 bg-clip-text text-transparent">
                    {t('landing.hero.titleHighlight')}
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                  {t('landing.hero.subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="text-lg px-8 h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 group"
                  onClick={() => setLocation('/login')}
                >
                  <span>{t('landing.hero.cta')}</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 h-14 border-2 hover:bg-primary/5 group"
                  onClick={() => setLocation('/demo')}
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  {t('landing.hero.demo')}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>{t('landing.hero.noCard')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>{t('landing.hero.lgpdCompliant')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>{t('landing.hero.cancelAnytime')}</span>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="relative lg:pl-8">
              <div className="relative">
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit max-w-xs bg-white rounded-2xl shadow-xl p-4 border z-10 animate-bounce-gentle">
                  <p className="text-sm font-medium text-foreground">
                    "{t('landing.hero.speechBubble')}"
                  </p>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b rotate-45" />
                </div>

                <div className="mt-16 rounded-2xl border-2 shadow-2xl overflow-hidden bg-card relative">
                  <div className="p-3 border-b bg-muted/50 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-background rounded-lg px-3 py-1 text-xs text-muted-foreground">
                      app.sbarhealth.com/dashboard
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: t('patients.title'), value: "12", color: "text-primary" },
                        { label: t('patients.critical'), value: "2", color: "text-red-500" },
                        { label: t('patients.discharged'), value: "3", color: "text-emerald-500" },
                        { label: t('navigation.evolutions'), value: "8", color: "text-blue-500" }
                      ].map((stat, i) => (
                        <div key={i} className="bg-muted/30 rounded-lg p-2 text-center">
                          <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {[
                        { name: "Maria Silva", bed: "UTI-01", status: "critical" },
                        { name: "João Santos", bed: "ENF-12", status: "high" },
                        { name: "Ana Costa", bed: "ENF-08", status: "medium" }
                      ].map((patient, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border-l-4",
                            patient.status === "critical" && "border-l-red-500 bg-red-50",
                            patient.status === "high" && "border-l-amber-500 bg-amber-50",
                            patient.status === "medium" && "border-l-emerald-500 bg-emerald-50"
                          )}
                        >
                          <div>
                            <p className="font-medium text-sm">{patient.name}</p>
                            <p className="text-xs text-muted-foreground">{patient.bed}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {patient.status === "critical" ? t('patients.critical') : patient.status === "high" ? "Alto" : t('patients.stable')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="absolute -right-4 top-1/3 bg-white rounded-xl shadow-lg p-3 border animate-float">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <span className="text-xs font-medium">IA: 85% {t('patients.discharged').toLowerCase()} 2d</span>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 z-20">
                  <div className="w-16 h-16 rounded-full bg-primary shadow-lg flex items-center justify-center animate-bounce-gentle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Stats */}
      <section className="py-12 bg-muted/30 border-y">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">{t('landing.features.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card 
                key={i} 
                className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <CardHeader>
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                    feature.bgColor
                  )}>
                    <feature.icon className={cn("w-7 h-7", feature.color)} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">{t('landing.testimonials.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.testimonials.title')}
            </h2>
          </div>

          <div className="relative">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
              <CardContent className="p-8 md:p-12">
                <Quote className="w-12 h-12 text-primary/20 mb-6" />
                <p className="text-xl md:text-2xl font-medium text-foreground mb-8 leading-relaxed">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{testimonials[activeTestimonial].avatar}</div>
                    <div>
                      <p className="font-semibold">{testimonials[activeTestimonial].author}</p>
                      <p className="text-sm text-muted-foreground">{testimonials[activeTestimonial].role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    i === activeTestimonial 
                      ? "bg-primary w-8" 
                      : "bg-primary/30 hover:bg-primary/50"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">{t('landing.pricing.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.pricing.subtitle')}
            </p>
          </div>

          {/* Billing Toggle + Currency Selector */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            {/* Billing Period Toggle */}
            <div className="flex items-center gap-3 bg-muted rounded-full p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all",
                  billingPeriod === 'monthly' ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('landing.pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  billingPeriod === 'yearly' ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('landing.pricing.yearly')}
                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-0">
                  {t('landing.pricing.yearlyDiscount')}
                </Badge>
              </button>
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-colors text-sm"
              >
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{currency}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
              {currencyDropdownOpen && (
                <div className="absolute top-full mt-1 right-0 bg-background border rounded-lg shadow-lg z-20 min-w-[140px]">
                  {(['BRL', 'USD', 'EUR'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => handleCurrencyChange(c)}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center justify-between",
                        c === currency && "bg-primary/5 text-primary font-medium"
                      )}
                    >
                      <span>{c === 'BRL' ? 'R$ Real' : c === 'USD' ? '$ Dollar' : '\u20AC Euro'}</span>
                      {c === currency && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <Card 
                key={i} 
                className={cn(
                  "relative transition-all duration-300 hover:shadow-xl",
                  plan.highlighted 
                    ? "border-2 border-primary shadow-xl scale-105 bg-gradient-to-b from-primary/5 to-background" 
                    : "hover:-translate-y-1"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Award className="w-3 h-3 mr-1" />
                      {t('landing.pricing.mostPopular')}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      {t('landing.pricing.yearlyDiscount')}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={cn(
                      "w-full mt-6",
                      plan.highlighted
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                    onClick={() => setLocation('/login')}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
              backgroundSize: '30px 30px' 
            }} 
          />
        </div>

        <div className="container max-w-4xl text-center relative z-10">
          <Stethoscope className="w-16 h-16 text-primary mb-6 animate-bounce-gentle" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 h-14 bg-white text-primary hover:bg-white/90 shadow-lg"
              onClick={() => setLocation('/login')}
            >
              {t('landing.hero.cta')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 h-14 border-2 border-white/30 text-white hover:bg-white/10"
              onClick={() => setLocation('/demo')}
            >
              <Play className="w-5 h-5 mr-2" />
              {t('landing.hero.demo')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl">SBAR Health</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.terms')}</a>
              <a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.privacy')}</a>
              <a href="/support" className="hover:text-foreground transition-colors">{t('landing.footer.support')}</a>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 SBAR Health. {t('landing.footer.rights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
