import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Check,
  X,
  Zap,
  Crown,
  Building2,
  Sparkles,
  MessageSquare,
  Database,
  Users,
  Brain,
  Clock,
  Shield,
  Headphones,
  Gift
} from "lucide-react";

// Plan definitions
export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuito',
    description: 'Para experimentar o sistema',
    price: { monthly: 0, yearly: 0 },
    priceLabel: 'Grátis',
    trialDays: 30,
    limits: {
      patients: 5,
      teams: 1,
      teamMembers: 3,
      hospitals: 1,
      evolutionsPerMonth: 30,
      historyDays: 30,
      aiUsesPerDay: 10,
      whatsappMessages: 0
    },
    features: [
      { name: '5 pacientes ativos', included: true },
      { name: '1 equipe (até 3 membros)', included: true },
      { name: '1 hospital', included: true },
      { name: '30 evoluções/mês', included: true },
      { name: 'Histórico 30 dias', included: true },
      { name: 'IA: 10 usos/dia', included: true },
      { name: 'Marca d\'água em exportações', included: true, negative: true },
      { name: 'WhatsApp Bot', included: false },
      { name: 'Preditor de alta avançado', included: false },
      { name: 'API REST', included: false },
    ],
    badge: null,
    color: 'border-gray-200'
  },
  basic: {
    id: 'basic',
    name: 'Básico',
    description: 'Para médicos individuais',
    price: { monthly: 24.90, yearly: 238.90 },
    priceLabel: 'R$ 24,90',
    trialDays: 0,
    limits: {
      patients: 25,
      teams: 3,
      teamMembers: 5,
      hospitals: 3,
      evolutionsPerMonth: -1, // unlimited
      historyDays: 180,
      aiUsesPerDay: 30,
      whatsappMessages: 0
    },
    features: [
      { name: '25 pacientes ativos', included: true },
      { name: '3 equipes (5 membros cada)', included: true },
      { name: '3 hospitais', included: true },
      { name: 'Evoluções ilimitadas', included: true },
      { name: 'Histórico 6 meses', included: true },
      { name: 'IA: 30 usos/dia', included: true },
      { name: 'Preditor de alta básico', included: true },
      { name: 'Suporte por email (48h)', included: true },
      { name: 'WhatsApp Bot', included: false },
      { name: 'API REST', included: false },
    ],
    badge: null,
    color: 'border-blue-200'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Para equipes médicas',
    price: { monthly: 49.90, yearly: 478.90 },
    priceLabel: 'R$ 49,90',
    trialDays: 0,
    limits: {
      patients: -1, // unlimited
      teams: -1,
      teamMembers: -1,
      hospitals: -1,
      evolutionsPerMonth: -1,
      historyDays: -1, // unlimited
      aiUsesPerDay: 100,
      whatsappMessages: 200
    },
    features: [
      { name: 'Pacientes ilimitados', included: true },
      { name: 'Equipes ilimitadas', included: true },
      { name: 'Hospitais ilimitados', included: true },
      { name: 'Histórico ilimitado', included: true },
      { name: 'IA: 100 usos/dia', included: true },
      { name: 'WhatsApp Bot: 200 msg/dia', included: true },
      { name: 'Preditor ML avançado', included: true },
      { name: 'API REST básica', included: true },
      { name: 'Suporte por chat (24h)', included: true },
      { name: 'Relatórios avançados', included: true },
    ],
    badge: 'Mais Popular',
    color: 'border-primary'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para hospitais e redes',
    price: { monthly: 0, yearly: 0 },
    priceLabel: 'Sob consulta',
    trialDays: 0,
    limits: {
      patients: -1,
      teams: -1,
      teamMembers: -1,
      hospitals: -1,
      evolutionsPerMonth: -1,
      historyDays: -1,
      aiUsesPerDay: -1,
      whatsappMessages: -1
    },
    features: [
      { name: 'Tudo do Pro', included: true },
      { name: 'Mínimo 20 usuários', included: true },
      { name: 'On-premise opcional', included: true },
      { name: 'SSO/LDAP', included: true },
      { name: 'White-label', included: true },
      { name: 'SLA 99.9%', included: true },
      { name: 'Gerente de conta dedicado', included: true },
      { name: 'Treinamento personalizado', included: true },
      { name: 'Integração HL7/FHIR', included: true },
      { name: 'Suporte 24/7', included: true },
    ],
    badge: 'Hospitais',
    color: 'border-purple-400'
  }
};

// Add-ons for Pro plan
export const ADDONS = [
  {
    id: 'ai-unlimited',
    name: 'IA Ilimitada',
    description: 'Uso ilimitado de IA para análises e predições',
    price: 15,
    icon: Brain
  },
  {
    id: 'whatsapp-unlimited',
    name: 'WhatsApp Ilimitado',
    description: 'Mensagens ilimitadas via WhatsApp Bot',
    price: 25,
    icon: MessageSquare
  },
  {
    id: 'extra-user',
    name: 'Usuário Extra',
    description: 'Adicionar mais um usuário à sua conta',
    price: 15,
    icon: Users
  },
  {
    id: 'storage-100gb',
    name: 'Storage 100GB',
    description: 'Armazenamento adicional para arquivos e imagens',
    price: 15,
    icon: Database
  },
  {
    id: 'api-integration',
    name: 'Integração API',
    description: 'Acesso avançado à API REST com webhooks',
    price: 50,
    icon: Zap
  }
];

interface PricingPlansProps {
  currentPlan?: string;
  onSelectPlan?: (planId: string) => void;
  isDemo?: boolean;
}

export default function PricingPlans({ currentPlan = 'free', onSelectPlan, isDemo = false }: PricingPlansProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const handleSelectPlan = (planId: string) => {
    if (planId === 'enterprise') {
      toast.info("Entre em contato conosco", {
        description: "Nossa equipe entrará em contato para uma proposta personalizada."
      });
      return;
    }
    
    setSelectedPlan(planId);
    setShowUpgradeDialog(true);
  };

  const handleConfirmUpgrade = () => {
    if (isDemo) {
      toast.success("Upgrade simulado com sucesso!", {
        description: `Você agora está no plano ${PLANS[selectedPlan as keyof typeof PLANS]?.name}`
      });
    }
    if (onSelectPlan && selectedPlan) {
      onSelectPlan(selectedPlan);
    }
    setShowUpgradeDialog(false);
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateTotal = () => {
    const plan = PLANS[selectedPlan as keyof typeof PLANS];
    if (!plan) return 0;
    
    const planPrice = isYearly ? plan.price.yearly : plan.price.monthly;
    const addonsPrice = selectedAddons.reduce((total, addonId) => {
      const addon = ADDONS.find(a => a.id === addonId);
      return total + (addon?.price || 0);
    }, 0);
    
    return planPrice + addonsPrice;
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm ${!isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
          Mensal
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <span className={`text-sm ${isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
          Anual
        </span>
        {isYearly && (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Gift className="w-3 h-3 mr-1" />
            2 meses grátis
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.values(PLANS).map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${plan.color} ${plan.id === 'pro' ? 'border-2 shadow-lg' : ''}`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className={plan.id === 'pro' ? 'bg-primary' : 'bg-purple-500'}>
                  {plan.id === 'pro' ? <Sparkles className="w-3 h-3 mr-1" /> : <Building2 className="w-3 h-3 mr-1" />}
                  {plan.badge}
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="text-center">
              <div className="mb-6">
                {plan.price.monthly > 0 ? (
                  <>
                    <span className="text-4xl font-bold">
                      R$ {isYearly ? (plan.price.yearly / 12).toFixed(0) : plan.price.monthly.toFixed(0)}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                    {isYearly && (
                      <p className="text-sm text-muted-foreground mt-1">
                        R$ {plan.price.yearly.toFixed(0)}/ano
                      </p>
                    )}
                  </>
                ) : plan.id === 'free' ? (
                  <span className="text-4xl font-bold">Grátis</span>
                ) : (
                  <span className="text-2xl font-bold">Sob consulta</span>
                )}
              </div>
              
              <ul className="space-y-2 text-left">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    {feature.included ? (
                      'negative' in feature && feature.negative ? (
                        <X className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      )
                    ) : (
                      <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={!feature.included ? 'text-muted-foreground' : ''}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full"
                variant={plan.id === currentPlan ? 'outline' : plan.id === 'pro' ? 'default' : 'secondary'}
                disabled={plan.id === currentPlan}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.id === currentPlan ? 'Plano Atual' : 
                 plan.id === 'enterprise' ? 'Falar com Vendas' :
                 plan.id === 'free' ? 'Começar Grátis' : 'Fazer Upgrade'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add-ons Section (only for Pro) */}
      {currentPlan === 'pro' && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4 text-center">Add-ons Disponíveis</h3>
          <p className="text-center text-muted-foreground mb-6">
            Expanda as capacidades do seu plano Pro com recursos adicionais
          </p>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ADDONS.map((addon) => (
              <Card 
                key={addon.id}
                className={`cursor-pointer transition-all ${
                  selectedAddons.includes(addon.id) ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => toggleAddon(addon.id)}
              >
                <CardContent className="p-4 text-center">
                  <addon.icon className={`w-8 h-8 mx-auto mb-2 ${
                    selectedAddons.includes(addon.id) ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <h4 className="font-medium text-sm">{addon.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{addon.description}</p>
                  <p className="text-lg font-bold mt-2">+R$ {addon.price}/mês</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Upgrade</DialogTitle>
            <DialogDescription>
              Você está prestes a fazer upgrade para o plano {PLANS[selectedPlan as keyof typeof PLANS]?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <span>Plano {PLANS[selectedPlan as keyof typeof PLANS]?.name}</span>
              <span className="font-semibold">
                R$ {isYearly 
                  ? (PLANS[selectedPlan as keyof typeof PLANS]?.price.yearly / 12).toFixed(2)
                  : PLANS[selectedPlan as keyof typeof PLANS]?.price.monthly.toFixed(2)
                }/mês
              </span>
            </div>
            
            {selectedAddons.length > 0 && (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Add-ons selecionados:</p>
                  {selectedAddons.map(addonId => {
                    const addon = ADDONS.find(a => a.id === addonId);
                    return (
                      <div key={addonId} className="flex justify-between items-center text-sm">
                        <span>{addon?.name}</span>
                        <span>+R$ {addon?.price}/mês</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span>R$ {calculateTotal().toFixed(2)}/mês</span>
              </div>
              {isYearly && (
                <p className="text-sm text-muted-foreground text-right">
                  R$ {(calculateTotal() * 10).toFixed(2)}/ano (2 meses grátis)
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmUpgrade}>
              Confirmar Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Usage Limits Display Component
interface UsageLimitsProps {
  plan: keyof typeof PLANS;
  usage: {
    patients: number;
    evolutions: number;
    aiUses: number;
    whatsappMessages: number;
  };
}

export function UsageLimits({ plan, usage }: UsageLimitsProps) {
  const planLimits = PLANS[plan].limits;
  
  const getPercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((current / limit) * 100, 100);
  };
  
  const getColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-primary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Uso do Plano {PLANS[plan].name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Patients */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Pacientes Ativos</span>
            <span>
              {usage.patients} / {planLimits.patients === -1 ? '∞' : planLimits.patients}
            </span>
          </div>
          <Progress 
            value={getPercentage(usage.patients, planLimits.patients)} 
            className={getColor(getPercentage(usage.patients, planLimits.patients))}
          />
        </div>
        
        {/* Evolutions */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Evoluções este mês</span>
            <span>
              {usage.evolutions} / {planLimits.evolutionsPerMonth === -1 ? '∞' : planLimits.evolutionsPerMonth}
            </span>
          </div>
          <Progress 
            value={getPercentage(usage.evolutions, planLimits.evolutionsPerMonth)} 
            className={getColor(getPercentage(usage.evolutions, planLimits.evolutionsPerMonth))}
          />
        </div>
        
        {/* AI Uses */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Usos de IA hoje</span>
            <span>
              {usage.aiUses} / {planLimits.aiUsesPerDay === -1 ? '∞' : planLimits.aiUsesPerDay}
            </span>
          </div>
          <Progress 
            value={getPercentage(usage.aiUses, planLimits.aiUsesPerDay)} 
            className={getColor(getPercentage(usage.aiUses, planLimits.aiUsesPerDay))}
          />
        </div>
        
        {/* WhatsApp (only for Pro+) */}
        {planLimits.whatsappMessages > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>WhatsApp hoje</span>
              <span>
                {usage.whatsappMessages} / {planLimits.whatsappMessages === -1 ? '∞' : planLimits.whatsappMessages}
              </span>
            </div>
            <Progress 
              value={getPercentage(usage.whatsappMessages, planLimits.whatsappMessages)} 
              className={getColor(getPercentage(usage.whatsappMessages, planLimits.whatsappMessages))}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Trial Banner Component
interface TrialBannerProps {
  daysRemaining: number;
  onUpgrade: () => void;
}

export function TrialBanner({ daysRemaining, onUpgrade }: TrialBannerProps) {
  if (daysRemaining <= 0) return null;
  
  const urgency = daysRemaining <= 7;
  
  return (
    <div className={`p-4 rounded-lg flex items-center justify-between ${
      urgency ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          urgency ? 'bg-amber-100' : 'bg-blue-100'
        }`}>
          <Clock className={`w-5 h-5 ${urgency ? 'text-amber-600' : 'text-blue-600'}`} />
        </div>
        <div>
          <p className="font-medium">
            {urgency ? '⚠️ ' : ''}Período de teste: {daysRemaining} dias restantes
          </p>
          <p className="text-sm text-muted-foreground">
            {urgency 
              ? 'Faça upgrade agora para não perder acesso aos seus dados'
              : 'Aproveite todos os recursos premium durante o teste'}
          </p>
        </div>
      </div>
      <Button 
        onClick={onUpgrade}
        variant={urgency ? 'default' : 'outline'}
        className={urgency ? 'bg-amber-600 hover:bg-amber-700' : ''}
      >
        <Crown className="w-4 h-4 mr-2" />
        Fazer Upgrade
      </Button>
    </div>
  );
}
