import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { isFeatureEnabled } from '@/hooks/useFeatureFlag';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles, 
  Sun, 
  Moon, 
  Sunrise,
  TrendingUp,
  Users,
  X,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MorningBriefProps {
  isDemo?: boolean;
  userName?: string;
  onNavigate?: (view: string) => void;
  onDismiss?: () => void;
}

// Dados mock para demo
const mockData = {
  criticalPatients: 2,
  criticalWithoutEvolution: 2,
  pendingDischarges: 3,
  evolutionsToday: 4,
  evolutionsTarget: 12,
  lastVisit: 'ontem às 18:42',
  tigerInsight: {
    patient: 'Maria Silva',
    days: 3,
    message: 'está no D3 sem melhora significativa. Considere revisar o plano terapêutico.',
    patientId: 1
  }
};

function getGreeting(): { text: string; icon: React.ReactNode; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { text: 'Bom dia', icon: <Sunrise className="w-5 h-5 text-amber-500" />, emoji: '☀️' };
  } else if (hour >= 12 && hour < 18) {
    return { text: 'Boa tarde', icon: <Sun className="w-5 h-5 text-orange-500" />, emoji: '🌤️' };
  } else {
    return { text: 'Boa noite', icon: <Moon className="w-5 h-5 text-indigo-400" />, emoji: '🌙' };
  }
}

export default function MorningBrief({ 
  isDemo = false, 
  userName = 'Dr. Carlos',
  onNavigate,
  onDismiss
}: MorningBriefProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showInsight, setShowInsight] = useState(true);
  const greeting = getGreeting();
  
  const data = mockData;
  const evolutionProgress = (data.evolutionsToday / data.evolutionsTarget) * 100;

  if (!isVisible) return null;

  return (
    <div className={cn(
      "mb-6 transition-all duration-500 ease-out",
      isCollapsed ? "opacity-90" : "opacity-100"
    )}>
      {/* Header com saudação */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {greeting.icon}
            <h2 className="text-xl font-semibold text-foreground">
              {greeting.text}, {userName}! {greeting.emoji}
            </h2>
          </div>
          {data.criticalPatients > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {data.criticalPatients} críticos
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Última visita: {data.lastVisit}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? 'Expandir' : 'Minimizar'}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Cards de Ação Prioritária */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Card Críticos */}
            <Card 
              className={cn(
                "border-l-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
                data.criticalWithoutEvolution > 0 
                  ? "border-l-red-500 bg-red-50/50" 
                  : "border-l-green-500 bg-green-50/50"
              )}
              onClick={() => onNavigate?.('dashboard')}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className={cn(
                        "w-4 h-4",
                        data.criticalWithoutEvolution > 0 ? "text-red-500" : "text-green-500"
                      )} />
                      <span className="text-sm font-medium text-muted-foreground">
                        Críticos sem evolução
                      </span>
                    </div>
                    <p className={cn(
                      "text-2xl font-bold",
                      data.criticalWithoutEvolution > 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {data.criticalWithoutEvolution}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.criticalWithoutEvolution > 0 
                        ? "há mais de 6h sem atualização"
                        : "todos atualizados ✓"
                      }
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Card Altas Pendentes */}
            <Card 
              className="border-l-4 border-l-amber-500 bg-amber-50/50 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
              onClick={() => onNavigate?.('dashboard')}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Altas pendentes
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">
                      {data.pendingDischarges}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      pacientes prontos para alta
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Card Evoluções do Dia */}
            <Card 
              className={`border-l-4 border-l-primary bg-primary/5 transition-all ${isFeatureEnabled('analytics') ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
              onClick={() => isFeatureEnabled('analytics') && onNavigate?.('analytics')}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Evoluções hoje
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-bold text-primary">
                        {data.evolutionsToday}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        / {data.evolutionsTarget}
                      </span>
                    </div>
                    <Progress 
                      value={evolutionProgress} 
                      className="h-1.5 mt-2"
                    />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerta Clínico */}
          {showInsight && data.tigerInsight && (
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 mb-4 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  
                  {/* Mensagem */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold text-amber-700">
                        Alerta Clínico
                      </span>
                    </div>
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">{data.tigerInsight.patient}</span>{' '}
                      {data.tigerInsight.message}
                    </p>
                    
                    {/* Ações */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button 
                        size="sm" 
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => onNavigate?.('patient')}
                      >
                        Ver paciente
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                        onClick={() => setShowInsight(false)}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Lembrar depois
                      </Button>
                    </div>
                  </div>

                  {/* Fechar */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-amber-400 hover:text-amber-600 hover:bg-amber-100"
                    onClick={() => setShowInsight(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-primary hover:text-white transition-colors"
              onClick={() => onNavigate?.('patient')}
            >
              <Zap className="w-4 h-4 mr-1" />
              Evoluir próximo crítico
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-primary hover:text-white transition-colors"
              onClick={() => onNavigate?.('dashboard')}
            >
              <FileText className="w-4 h-4 mr-1" />
              Ver pendências
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-primary hover:text-white transition-colors"
              onClick={() => onNavigate?.('dashboard')}
            >
              <Users className="w-4 h-4 mr-1" />
              Iniciar ronda
            </Button>
            {isFeatureEnabled('analytics') && (
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white hover:bg-primary hover:text-white transition-colors"
                onClick={() => onNavigate?.('analytics')}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Ver analytics
              </Button>
            )}
          </div>
        </>
      )}

      {/* Versão colapsada */}
      {isCollapsed && (
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant={data.criticalWithoutEvolution > 0 ? "destructive" : "secondary"}>
              {data.criticalWithoutEvolution} críticos
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {data.pendingDischarges} altas
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {data.evolutionsToday}/{data.evolutionsTarget} evoluções
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onNavigate?.('patient')}
            className="ml-auto"
          >
            <Zap className="w-4 h-4 mr-1" />
            Ação rápida
          </Button>
        </div>
      )}
    </div>
  );
}
