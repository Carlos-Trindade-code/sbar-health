# SBAR Global — Domínio, Custos e Escalabilidade

## 1. Domínio sbarhealth.com

### Propriedade
- O domínio **sbarhealth.com** é registrado no nome de quem o comprou (você ou sua empresa)
- Para verificar: acesse o painel do registrador onde foi comprado (GoDaddy, Namecheap, Google Domains, Registro.br, etc.)
- O WHOIS do domínio mostra o proprietário registrado
- **Você é o dono legal** do domínio desde que esteja no seu nome/CNPJ

### Onde verificar
- Acesse https://who.is/whois/sbarhealth.com para ver dados públicos
- Acesse o painel do seu registrador para gerenciar DNS, renovação e transferência
- O domínio precisa ser renovado anualmente (custo típico: US$ 10-15/ano para .com)

---

## 2. Custos Reais de Manutenção (Cenário Atual)

### Hospedagem via Manus (atual)
| Item | Custo Estimado |
|------|---------------|
| Manus Platform (hospedagem + banco) | Incluído na assinatura Manus |
| Domínio .com (renovação anual) | ~US$ 12/ano |
| SSL/HTTPS | Incluído (Let's Encrypt automático) |
| **Total mensal atual** | **~US$ 1/mês** (só domínio) |

### Se migrar para infraestrutura própria
| Item | Custo Mensal |
|------|-------------|
| VPS/Cloud (2 vCPU, 4GB RAM) | US$ 20-40/mês |
| Banco de dados gerenciado (MySQL/PlanetScale) | US$ 0-29/mês |
| CDN + SSL (Cloudflare) | Grátis |
| Storage S3 (imagens, arquivos) | US$ 5-10/mês |
| Domínio | ~US$ 1/mês |
| OpenAI API (IA para SBAR) | US$ 10-50/mês (depende do uso) |
| **Total mensal (infra própria)** | **US$ 36-130/mês** |

---

## 3. Escalabilidade — E se chegar a 500 mil usuários?

### Cenário de 500K usuários
A arquitetura precisaria evoluir significativamente:

| Componente | Solução para 500K+ | Custo Estimado/mês |
|-----------|--------------------|--------------------|
| Servidores de aplicação | Kubernetes (EKS/GKE) com auto-scaling, 8-16 pods | US$ 500-1.500 |
| Banco de dados | MySQL gerenciado (RDS/PlanetScale) com réplicas de leitura | US$ 200-800 |
| Cache (Redis) | ElastiCache/Upstash para sessões e queries frequentes | US$ 50-200 |
| CDN global | Cloudflare Pro/Business | US$ 20-200 |
| Storage S3 | Armazenamento de arquivos e backups | US$ 50-200 |
| API de IA (OpenAI) | Alto volume de análises SBAR | US$ 500-5.000 |
| Monitoramento (Datadog/Sentry) | Logs, métricas, alertas | US$ 100-300 |
| Backup e DR | Backup automático + disaster recovery | US$ 100-300 |
| **Total estimado 500K usuários** | | **US$ 1.520 - 8.500/mês** |

### Receita potencial com 500K usuários
| Cenário | Cálculo | Receita/mês |
|---------|---------|-------------|
| 5% pagantes no Básico (R$ 24,99) | 25.000 × R$ 24,99 | R$ 624.750 |
| 2% pagantes no Pro (R$ 49,99) | 10.000 × R$ 49,99 | R$ 499.900 |
| 0.5% Enterprise (R$ 99/usuário) | 2.500 × R$ 99 | R$ 247.500 |
| **Total potencial** | | **R$ 1.372.150/mês** |

> **Margem bruta estimada**: ~95% (custos de infra representam ~5% da receita)

### Caminho de escalabilidade
1. **0-1K usuários**: Manus hosting (atual) — custo zero adicional
2. **1K-10K**: VPS dedicado + PlanetScale — ~US$ 100/mês
3. **10K-100K**: Cloud gerenciado (AWS/GCP) — ~US$ 500-2K/mês
4. **100K-500K+**: Kubernetes + microserviços — ~US$ 2K-8K/mês

---

## 4. Sobre vincular sbarhealth.com ao sistema

### Via Manus (recomendado para agora)
- Acesse **Settings > Domains** no painel de gerenciamento do Manus
- Adicione `sbarhealth.com` como domínio personalizado
- Configure o DNS no seu registrador apontando para os servidores Manus
- O SSL é configurado automaticamente

### Para o futuro (infraestrutura própria)
- Quando o volume justificar, migrar para AWS/GCP/Vercel
- O código é exportável via GitHub (Settings > GitHub no Manus)
- A migração é viável porque o stack é padrão (React + Express + MySQL)

---

## 5. Sobre Pagamentos (Stripe)

Para implementar cobrança real dos planos:
1. Criar conta no Stripe (stripe.com)
2. Integrar via `webdev_add_feature("stripe")` no Manus
3. Configurar os planos (Free/Básico/Pro/Enterprise) como Products no Stripe
4. Implementar checkout, webhooks e portal do cliente
5. O Stripe cobra 2.9% + R$ 0,39 por transação

---

## Resumo Executivo

| Pergunta | Resposta |
|----------|---------|
| O domínio é meu? | Sim, se registrado no seu nome/CNPJ |
| Custo atual? | ~US$ 1/mês (só domínio) |
| Custo com 500K usuários? | US$ 1.5K-8.5K/mês |
| Receita potencial 500K? | R$ 1.3M+/mês |
| Margem? | ~95% |
| Posso vincular sbarhealth.com? | Sim, via Settings > Domains no Manus |
