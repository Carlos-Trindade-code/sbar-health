import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Shield,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  FileCheck,
  Globe,
  Server,
  Key,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  Users,
  Database,
  Fingerprint
} from "lucide-react";

interface ComplianceBadgesProps {
  variant?: 'full' | 'compact' | 'minimal';
  showDetails?: boolean;
}

export default function ComplianceBadges({ variant = 'full', showDetails = true }: ComplianceBadgesProps) {
  const [showComplianceDetails, setShowComplianceDetails] = useState(false);

  const certifications = [
    {
      id: 'hipaa',
      name: 'HIPAA',
      fullName: 'Health Insurance Portability and Accountability Act',
      status: 'certified',
      icon: ShieldCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Conformidade com regulamentações de privacidade de saúde dos EUA',
      features: [
        'Criptografia de dados em repouso e em trânsito',
        'Controle de acesso baseado em funções',
        'Logs de auditoria completos',
        'Backup e recuperação de desastres'
      ]
    },
    {
      id: 'lgpd',
      name: 'LGPD',
      fullName: 'Lei Geral de Proteção de Dados',
      status: 'certified',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Conformidade com a lei brasileira de proteção de dados',
      features: [
        'Consentimento explícito do titular',
        'Direito ao esquecimento',
        'Portabilidade de dados',
        'Notificação de incidentes em 72h'
      ]
    },
    {
      id: 'gdpr',
      name: 'GDPR',
      fullName: 'General Data Protection Regulation',
      status: 'certified',
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Conformidade com regulamentação europeia de proteção de dados',
      features: [
        'Privacy by Design',
        'Minimização de dados',
        'Direitos do titular de dados',
        'DPO (Data Protection Officer)'
      ]
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      fullName: 'Information Security Management',
      status: 'in_progress',
      icon: FileCheck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Sistema de gestão de segurança da informação',
      features: [
        'Gestão de riscos',
        'Políticas de segurança',
        'Controles de acesso',
        'Continuidade de negócios'
      ]
    }
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: 'Criptografia AES-256',
      description: 'Todos os dados são criptografados em repouso e em trânsito'
    },
    {
      icon: Key,
      title: 'Autenticação Multi-fator',
      description: 'Proteção adicional com 2FA para todas as contas'
    },
    {
      icon: Server,
      title: 'Servidores Seguros',
      description: 'Infraestrutura em data centers certificados SOC 2'
    },
    {
      icon: Fingerprint,
      title: 'Controle de Acesso',
      description: 'RBAC (Role-Based Access Control) granular'
    },
    {
      icon: Database,
      title: 'Backup Automático',
      description: 'Backups diários com retenção de 30 dias'
    },
    {
      icon: Eye,
      title: 'Auditoria Completa',
      description: 'Logs de todas as ações para rastreabilidade'
    }
  ];

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
          <ShieldCheck className="w-3 h-3 mr-1" />
          HIPAA
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
          <Shield className="w-3 h-3 mr-1" />
          LGPD
        </Badge>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
            HIPAA • LGPD • GDPR Compliant
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Certificações de Segurança e Privacidade
            </DialogTitle>
            <DialogDescription>
              O SBAR Global atende aos mais rigorosos padrões internacionais de segurança e privacidade de dados de saúde.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {certifications.map(cert => (
              <div key={cert.id} className={`p-4 rounded-lg ${cert.bgColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <cert.icon className={`w-5 h-5 ${cert.color}`} />
                  <span className="font-semibold">{cert.name}</span>
                  {cert.status === 'certified' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                  ) : (
                    <Badge variant="outline" className="ml-auto text-xs">Em progresso</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{cert.description}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // variant === 'full'
  return (
    <div className="space-y-6">
      {/* Header com badges principais */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full shadow-sm">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <CardTitle>Segurança e Compliance</CardTitle>
                <CardDescription>
                  Seus dados protegidos pelos mais altos padrões internacionais
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {certifications.filter(c => c.status === 'certified').map(cert => (
                <Badge key={cert.id} variant="outline" className={`${cert.bgColor} ${cert.color}`}>
                  <cert.icon className="w-3 h-3 mr-1" />
                  {cert.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Certificações detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map(cert => (
          <Card key={cert.id} className={cert.status === 'in_progress' ? 'opacity-75' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${cert.bgColor}`}>
                    <cert.icon className={`w-5 h-5 ${cert.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{cert.name}</CardTitle>
                    <CardDescription className="text-xs">{cert.fullName}</CardDescription>
                  </div>
                </div>
                {cert.status === 'certified' ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Certificado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Em progresso
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
              <ul className="space-y-1">
                {cert.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recursos de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Recursos de Segurança
          </CardTitle>
          <CardDescription>
            Proteção em múltiplas camadas para seus dados clínicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aviso para Enterprise */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Building2 className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">Para Hospitais e Instituições</h3>
              <p className="text-sm text-amber-700 mt-1">
                O plano Enterprise inclui recursos adicionais de compliance: relatórios de auditoria personalizados, 
                SLA garantido, suporte dedicado 24/7, e integração com sistemas de gestão hospitalar.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="bg-white text-amber-700">
                  <Users className="w-3 h-3 mr-1" />
                  Usuários ilimitados
                </Badge>
                <Badge variant="outline" className="bg-white text-amber-700">
                  <FileCheck className="w-3 h-3 mr-1" />
                  Auditoria completa
                </Badge>
                <Badge variant="outline" className="bg-white text-amber-700">
                  <Shield className="w-3 h-3 mr-1" />
                  DPO dedicado
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de footer com badges de compliance
export function ComplianceFooter() {
  return (
    <div className="flex items-center justify-center gap-4 py-4 border-t bg-muted/30">
      <span className="text-xs text-muted-foreground">Seus dados protegidos:</span>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
          <ShieldCheck className="w-3 h-3 mr-1" />
          HIPAA
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
          <Shield className="w-3 h-3 mr-1" />
          LGPD
        </Badge>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
          <Globe className="w-3 h-3 mr-1" />
          GDPR
        </Badge>
        <Badge variant="outline" className="bg-gray-50 text-gray-700 text-xs">
          <Lock className="w-3 h-3 mr-1" />
          AES-256
        </Badge>
      </div>
    </div>
  );
}

// Componente de banner de segurança para Enterprise
export function EnterpriseSecurityBanner() {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-green-400" />
          <div>
            <h3 className="font-semibold">Segurança de Nível Empresarial</h3>
            <p className="text-sm text-slate-300">
              HIPAA • LGPD • GDPR Compliant | Criptografia AES-256 | SOC 2 Type II
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Certificado
          </Badge>
        </div>
      </div>
    </div>
  );
}
