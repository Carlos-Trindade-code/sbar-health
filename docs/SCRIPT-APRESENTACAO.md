# Script de Apresentação - SBAR Global

## Instruções para o Apresentador

Este script foi criado para você apresentar o SBAR Global ao desenvolvedor. Tempo estimado: 15-20 minutos. Abra os screenshots correspondentes durante cada seção.

---

## ABERTURA (2 minutos)

> "Olá! Vou te apresentar o SBAR Global, uma plataforma de inteligência clínica que desenvolvi para revolucionar a forma como médicos documentam e acompanham seus pacientes."

> "O nome SBAR vem de um protocolo internacional de comunicação médica: **Situação, Background, Avaliação e Recomendação**. É usado em hospitais do mundo todo para padronizar a passagem de informações entre profissionais de saúde."

> "O problema que resolvemos: médicos perdem muito tempo com documentação manual, informações ficam fragmentadas, e não existe visibilidade sobre pacientes críticos. O SBAR Global resolve tudo isso."

---

## TELA 1: DASHBOARD - MORNING BRIEF (3 minutos)

*[Mostrar screenshot: 01-dashboard-morning-brief.webp]*

> "Esta é a primeira coisa que o médico vê ao abrir o app. Chamamos de **Morning Brief** - um resumo inteligente do dia."

**Destacar:**

> "Repare na saudação personalizada no topo - 'Bom dia, Dr. Carlos'. O sistema identifica o horário e o nome do médico logado."

> "Esses três cards coloridos são o coração do sistema:"
> - "**Vermelho**: Pacientes críticos que estão há mais de 6 horas sem evolução. Isso é urgente."
> - "**Amarelo**: Altas pendentes - pacientes prontos para ir embora mas que ainda precisam de documentação."
> - "**Verde**: Progresso do dia - quantas evoluções o médico já fez."

> "Aqui embaixo temos o **Dr. Tigre**, nosso mascote. Ele dá sugestões proativas baseadas nos dados. Por exemplo: 'Maria Silva está no D3 sem melhora. Considere revisar o plano terapêutico.'"

> "Os botões de ação rápida permitem que o médico vá direto ao que importa: evoluir o próximo crítico, ver pendências, ou iniciar a ronda."

---

## TELA 2: PACIENTE EXPANDIDO (2 minutos)

*[Mostrar screenshot: 02-paciente-expandido.webp]*

> "Quando o médico clica em um paciente, ele expande e mostra todas as informações relevantes."

**Destacar:**

> "Temos o nome, leito, diagnóstico principal, e um badge de gravidade - neste caso, 'Crítico' em vermelho."

> "O sistema mostra há quanto tempo foi a última evolução - isso ajuda a identificar pacientes negligenciados."

> "Aqui temos a **probabilidade de alta** calculada por IA. Neste exemplo, 65%. Isso ajuda o médico a planejar."

> "Os botões de ação: Nova Evolução SBAR, Análise IA, Histórico e Dar Alta. Tudo que o médico precisa em um lugar."

---

## TELA 3: FORMULÁRIO SBAR (2 minutos)

*[Mostrar screenshot: 03-formulario-sbar.webp]*

> "Este é o coração do sistema - o formulário de evolução SBAR."

**Destacar:**

> "Seguimos o protocolo internacional com quatro campos:"
> - "**S - Situação**: O que está acontecendo agora com o paciente"
> - "**B - Background**: Histórico relevante"
> - "**A - Avaliação**: O que o médico acha do quadro"
> - "**R - Recomendação**: Próximos passos e plano terapêutico"

> "O diferencial: cada campo tem um botão **Ditar**. O médico pode falar ao invés de digitar. Isso economiza muito tempo durante a ronda."

> "Filosofia de **zero fricção**: nenhum campo é obrigatório. O médico preenche o que faz sentido para aquele momento."

---

## TELA 4: ANALYTICS (2 minutos)

*[Mostrar screenshot: 04-analytics.webp]*

> "Esta tela é para gestores e o próprio médico acompanhar sua produtividade."

**Destacar:**

> "KPIs principais: 156 internações no mês, 142 altas, média de 4.8 dias de internação, 577 evoluções."

> "O gráfico de **Atividade Semanal** mostra quando a equipe está mais ativa. Útil para dimensionar plantões."

> "O gráfico de **Convênios** mostra a distribuição: 45% SUS, 25% Unimed, etc. Importante para o financeiro do hospital."

> "E aqui temos o **Ranking de Médicos** - gamificação saudável. Quem está fazendo mais evoluções? Isso incentiva a equipe."

---

## TELA 5: CONFIGURAÇÕES (1 minuto)

*[Mostrar screenshot: 05-configuracoes.webp]*

> "Área de configurações do usuário."

**Destacar:**

> "Perfil com nome, email, especialidade e CRM."

> "Controle do plano: mostra quantos pacientes e análises de IA o usuário já consumiu. Botão de upgrade para Enterprise."

> "Lista de hospitais vinculados - um médico pode trabalhar em vários hospitais."

> "Grid de funcionalidades: cada módulo pode ser ativado ou desativado. Chat da Equipe, Escala, DRG, IA Preditor, etc."

---

## TELA 6: SISTEMA DE EQUIPES (3 minutos)

*[Mostrar screenshot: 06-equipes-permissoes.webp]*

> "Este é o sistema de **gerenciamento de equipes** - uma das funcionalidades mais importantes."

**Destacar:**

> "Uma equipe representa um grupo de profissionais que trabalham juntos. Por exemplo: 'Equipe Clínica HC' no Hospital das Clínicas."

> "O sistema de convites é simples: gera um link único que pode ser copiado ou enviado por email."

> "Repare na **hierarquia de permissões**:"
> - "**Administrador** (laranja): Controle total. Aprova novos membros, gerencia permissões."
> - "**Editor** (azul): Pode criar e editar suas próprias evoluções."
> - "**Leitor** (verde): Só visualiza. Útil para residentes em observação."
> - "**Usuário de Dados** (roxo): Vê apenas dados não-sensíveis. Para secretárias e gestores."

> "O criador da equipe tem uma coroa - ele não pode ser removido ou rebaixado."

---

## TELA 7: CONVITES PENDENTES (2 minutos)

*[Mostrar screenshot: 07-convites-pendentes.webp]*

> "Quando alguém é convidado para uma equipe, o convite fica **pendente** até um admin aprovar."

**Destacar:**

> "A lista mostra quem foi convidado, por quem, e qual papel foi sugerido."

> "O admin pode aprovar ou rejeitar. Ao aprovar, ele pode mudar o papel se quiser."

> "Isso garante segurança: ninguém entra na equipe sem aprovação de um administrador."

---

## TECNOLOGIAS (1 minuto)

> "Sobre a stack técnica:"

> "**Frontend**: React 19 com TypeScript e Tailwind CSS 4. Componentes do shadcn/ui para consistência visual."

> "**Backend**: Node.js com Express e tRPC - isso garante tipagem end-to-end, do banco até o frontend."

> "**Banco de Dados**: MySQL ou TiDB, com Drizzle ORM para queries type-safe."

> "**Autenticação**: OAuth 2.0 com JWT."

> "**IA**: Integração com LLM para análise de evoluções e predição de alta."

---

## FECHAMENTO (1 minuto)

> "O SBAR Global está pronto para uso. O código está bem estruturado, com testes automatizados e documentação."

> "**Próximos passos** que podemos desenvolver juntos:"
> - "Sala de Recuperação Cirúrgica com escalas de dor"
> - "Bot de WhatsApp para receber evoluções"
> - "Notificações push em tempo real"

> "Alguma dúvida sobre o que viu?"

---

## DICAS PARA A APRESENTAÇÃO

1. **Mantenha o ritmo** - Não se aprofunde demais em cada tela
2. **Foque no problema** - Sempre conecte a funcionalidade com o problema que resolve
3. **Seja visual** - Aponte para os elementos na tela enquanto fala
4. **Deixe espaço para perguntas** - Pause após cada seção principal
5. **Termine com ação** - Pergunte o que o dev gostaria de implementar primeiro

---

*Script criado em 31/01/2026*
*Tempo total estimado: 15-20 minutos*
