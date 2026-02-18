# SBAR Global - TODO

## Core Features
- [x] Schema do banco: hospitais, equipes, pacientes, evoluções, planos
- [x] Sistema de permissões granulares (médico/admin/hospital)
- [x] Cadastro ultrarrápido de pacientes com detecção de duplicatas
- [x] Speech-to-Text para preenchimento por voz
- [x] Dashboard principal com visão por hospital e prioridade
- [x] Indicadores visuais de criticidade em tempo real
- [x] Evolução SBAR com salvamento automático de rascunhos
- [x] Histórico temporal completo de evoluções
- [x] IA preditiva: probabilidade de alta e tempo de internação
- [x] Analytics de produtividade da equipe médica
- [x] Dashboard executivo para hospitais
- [x] Sistema de planos (Free/Pro/Enterprise)
- [x] Onboarding interativo com demo guiada
- [x] Compartilhamento seguro entre equipes

## UI/UX
- [x] Design system clínico: cores, tipografia, componentes
- [x] Interface responsiva para rounds médicos
- [x] Navegação otimizada para velocidade
- [x] Estados de loading e empty states
- [x] Feedback visual em ações críticas

## Compliance
- [x] LGPD: anonimização de dados agregados
- [x] Auditoria de acessos (activity logs)
- [x] Logs de alterações em evoluções (locked evolutions)

## Pending Improvements
- [ ] Notificações push em tempo real
- [ ] Exportação de relatórios PDF
- [ ] Integração com sistemas hospitalares (HL7/FHIR)
- [ ] App mobile nativo
- [x] Multi-idioma (EN/ES) - implementado com 5 idiomas (PT, EN, ES, FR, CN)

## Demo Mode
- [x] Criar modo demo sem autenticação para testes
- [x] Dados mockados de pacientes, evoluções e analytics
- [x] Navegação completa por todas as funcionalidades
- [x] Integração de todos os novos componentes no demo
- [x] Testes unitários v2 (45 testes passando)

## New Features - FAB Master & Navigation (v2.0)
- [x] FAB Master flutuante (botão mestre) em todas as páginas
- [x] Menu contextual: Foto→OCR, Áudio→Transcrição, Manual
- [x] Ações rápidas: Cadastrar, Evoluir, Dar Alta, Arquivar
- [x] Navegação sanfona (accordion) para expandir/colapsar seções
- [x] Campo aberto para colar evoluções com IA estruturando em SBAR
- [x] Feedback visual (check) para ações completadas

## New Features - Monetization System (v2.0)
- [x] Sistema de trial 30 dias com acesso completo
- [x] Plano FREE: 5 pacientes, 1 equipe, 30 evoluções/mês
- [x] Plano BÁSICO ($4.99): 25 pacientes, 3 equipes
- [x] Plano PRO ($9.99): Ilimitado + WhatsApp Bot
- [x] Plano ENTERPRISE ($15-25/usuário): White-label, SSO
- [x] Add-ons pay-per-use: IA extra, WhatsApp, Storage
- [x] Controle de limites em tempo real
- [x] Upgrade/downgrade de planos

## New Features - Team Collaboration (v2.0)
- [x] Chat de equipe para comunicação interna
- [x] Escala de trabalho (mês/ano/semana/dia)
- [x] Redistribuição inteligente de pacientes
- [x] Gamificação: pódium de médicos mais ativos

## New Features - Hospital Dashboard Advanced (v2.0)
- [x] Consumo de suprimentos por médico
- [x] Taxa de complicações por cirurgião
- [x] Relatórios para gestores (diário/sob demanda)
- [x] Exportação com nome, leito, hospital, nº atendimento

## New Features - Advanced (v2.0)
- [ ] WhatsApp Bot para evoluções e consultas
- [ ] Alta da equipe vs Alta hospitalar
- [ ] Configurações personalizadas por equipe
- [x] Internacionalização (PT, EN, ES, CN) - implementado com 5 idiomas

## Bug Fixes
- [x] Corrigir erro de import HospitalDashboard em App.tsx


## New Features - Hospital & Team Management (v2.1)
- [x] Lista pesquisável de hospitais públicos e privados do Brasil
- [x] Criação de hospital/clínica/consultório personalizado
- [x] Criação de equipes flexíveis (ensino, consultório, plantão)
- [x] Suporte para médicos em formação (residentes, internos)
- [x] Sistema de lembretes para acompanhamento de pacientes
- [x] Integração dos novos recursos ao modo Demo


## Navegação Sanfona (Accordion)
- [x] Refatorar Demo.tsx para navegação sanfona inline
- [x] Detalhes de paciente expandem na mesma tela (sem trocar página)
- [x] Evoluções SBAR expandem inline
- [x] Configurações em accordion (perfil, plano, hospitais, funcionalidades)
- [x] Eliminar trocas de página desnecessárias

## Animações
- [x] Animações suaves de abertura/fechamento nos cartões de paciente
- [x] Transições fluidas no estilo sanfona


## Modo Offline
- [x] Hook useOfflineSync para detectar conexão e gerenciar fila
- [x] Armazenamento local (IndexedDB/localStorage) para evoluções pendentes
- [x] Indicador visual de status de conexão
- [x] Sincronização automática quando conexão restaurada
- [x] Fila de operações pendentes com retry
- [x] Feedback visual de sincronização em progresso


## Geolocalização
- [x] Hook useGeolocation para capturar localização do médico
- [x] Indicador visual de localização no header
- [x] Registrar coordenadas nas evoluções SBAR
- [x] Mostrar hospital mais próximo baseado na localização
- [x] Adicionar mascote tigre médico ao sistema


## Privacidade e Segurança
- [x] Componente PrivacyIndicator com badge "Privado" e tooltip explicativo
- [x] Sistema de convites por link gerado por admin da equipe
- [x] Indicador visual de quem pode ver cada informação
- [x] Separação clara: hospital vê dados agregados, equipe vê evoluções
- [x] Ícone de cadeado nas conversas de equipe
- [x] Substituir ícone estetoscopio pelo mascote Dr. Tigre em todo o sistema


## Sistema DRG (Diagnosis Related Groups)
- [x] Classificação automática de pacientes por diagnóstico, procedimentos, idade e comorbidades
- [x] Cálculo de peso relativo e índice de case-mix
- [x] Comparação com benchmarks populacionais
- [x] Estimativa de consumo de recursos (diárias, materiais, medicamentos)
- [x] Dashboard de análise de custos vs reembolso
- [x] Grupos MDC (Major Diagnostic Categories)

## Sala de Recuperação Cirúrgica
- [ ] Monitoramento em tempo real de pacientes pós-operatórios
- [ ] Alertas automáticos: necessidade de opioides, alteração hemodinâmica
- [ ] Notificações push para equipe de cuidado
- [ ] Atualizações automáticas para cirurgiões
- [ ] Escalas integradas: dor (EVA), Aldrete, sedação (Ramsay)
- [ ] Timeline de eventos pós-operatórios


## Refatoração DRG (Guia Oficial)
- [x] Inputs corretos: CID-10 Principal, CIDs Secundários, Procedimentos, Idade/Sexo, Condição de Alta
- [x] Motor com CC (Complication/Comorbidity) e MCC (Major CC)
- [x] Outputs: Peso Relativo, ALOS, Custo Esperado
- [x] Módulo de Codificação em Tempo Real (durante jornada, não só na alta)
- [x] Alertas de Desvio (Variance Tracking) para altas previstas não realizadas
- [x] Dashboard Custo Real vs Custo DRG
- [x] Visão Gestor Hospitalar: CMI, rentabilidade por especialidade, negociação contratos
- [x] Visão Líder Clínico: comparação médicos, outliers, tempo médio por DRG
- [x] KPIs: Permanência Real vs Esperada, Taxa Readmissão, Índice Case-Mix


## Machine Learning - Predição DRG
- [x] Modelo de classificação para predição de DRG
- [x] Features: CID-10 Principal, CIDs Secundários, Procedimentos, Idade, Sexo
- [x] Outputs: DRG provável, nível de confiança, alternativas
- [x] Interface de entrada de dados do paciente
- [x] Visualização de probabilidades por DRG
- [x] Explicabilidade do modelo (quais features influenciaram)
- [x] Integração com sistema DRG existente


## Correções Críticas de UX (Prioridade Máxima)

### Menus e Navegação
- [x] Menu do mascote (tigre) - deve abrir menu sanfona
- [x] Menu do nome do usuário - deve abrir dropdown com opções
- [x] Botão Sair no demo - adicionar opção de logout

### Sistema de Equipes e Convites
- [x] Criar equipe visível e funcional
- [x] Convidar pessoas por link (copiar/colar)
- [x] Opção de enviar convite por email
- [x] Permissões: só autor edita própria evolução
- [x] Arquivar equipe com notificação aos admins
- [x] Aba de equipes arquivadas (desarquivar por admin)

### Confirmações de Ação
- [x] Arquivar paciente - confirmar ação antes de executar
- [x] Nova evolução - perguntar qual paciente evoluir
- [x] Salvar/Editar/Cancelar em todos os comandos
- [x] Permitir cancelar ações destrutivas

### FAB Master e Novo Paciente
- [x] Novo paciente - pedir número de registro
- [x] Novo paciente - vincular a hospital/equipe
- [x] Campos opcionais, não obrigatórios (zero fricção)

### Hospitais e Configurações
- [x] Adicionar hospital à equipe (botão faltando)
- [x] Uso solo + exportar dados (copiar/colar ou arquivo)

### Filosofia Zero Fricção
- [x] Remover campos obrigatórios desnecessários
- [x] Mostrar valor ANTES de pedir dados
- [x] Não bloquear usuário por omissão de dados


## Sistema de Permissões de Equipe (v2.2)
- [x] Hierarquia de papéis: Admin, Editor, Leitor, Usuário de Dados
- [x] Admin: criador da equipe, aprova novos membros, promove outros a admin
- [x] Editor: cria/edita evoluções próprias, convida colegas (pendente aprovação)
- [x] Leitor: apenas visualiza evoluções e dados clínicos
- [x] Usuário de Dados: secretárias/gestores - apenas dados não-sensíveis
- [x] Fluxo de convite com aprovação pendente por admin
- [x] Múltiplos admins por equipe
- [x] Lista de convites pendentes para admins aprovarem
- [x] Definir papel ao aprovar novo membro


## Sistema de Reações do Mascote Dr. Tigre (v2.3)
- [x] Componente TigerReaction com estados emocionais animados
- [x] Reação feliz: evolução salva, alta concedida
- [x] Reação comemorando: meta batida, conquista desbloqueada
- [x] Reação preocupado: paciente crítico, alerta
- [x] Reação triste: erro, cancelamento
- [x] Reação pensando: análise IA em progresso
- [x] Animações suaves de entrada/saída
- [x] Integração com ações do Demo


## UX Premium - Morning Brief e Landing Page (v2.4)
- [x] Componente MorningBrief com saudação personalizada
- [x] Cards de ação prioritária (críticos, altas, evoluções)
- [x] Insight contextual do Dr. Tigre
- [x] Quick actions (atalhos rápidos)
- [x] Redesign premium da landing page
- [x] Hero section com proposta de valor clara
- [x] Social proof e credibilidade
- [x] CTA impactante com animação


## Melhorias Críticas do Sistema Real (v2.5)

### Prioridade Alta
- [x] Implementar hierarquia de permissões no backend (Admin/Editor/Leitor/Usuário de Dados)
- [x] Criar middleware de autorização por papel no tRPC
- [x] Validar pertencimento à equipe nas queries de pacientes
- [x] Restringir acesso a dados sensíveis para Usuário de Dados

### Prioridade Média
- [x] Migrar MorningBrief do Demo para Dashboard real
- [x] Migrar sistema de reações do mascote Dr. Tigre para sistema real
- [x] Corrigir criação de equipe - permitir selecionar hospital

### Prioridade Baixa
- [ ] Implementar busca global (Command+K) - próxima fase
- [ ] Criar onboarding guiado para novos usuários - próxima fase


## Melhorias de UX (v2.6)
- [x] Busca global (Command+K) - encontrar pacientes rapidamente
- [x] Onboarding guiado - tour interativo para novos usuários
- [x] Opção para desativar reações do mascote nas configurações


## Sistema de Hospitais Pré-cadastrados (v2.7)
- [x] Tabela de redes hospitalares (Mater Dei, Einstein, Sírio, Rede D'Or, etc.)
- [x] Tabela de unidades por rede (Mater Dei Contorno, Mater Dei Santo Agostinho, etc.)
- [x] Seed com principais hospitais públicos e privados do Brasil
- [x] Busca de hospital existente ao invés de criar do zero
- [x] Vínculo opcional: equipe pode ou não estar vinculada a hospital
- [ ] Se equipe vinculada a hospital, médico automaticamente vinculado - próxima fase
- [x] Relação N:N entre equipe e hospitais (equipe pode atender em múltiplos hospitais)
- [ ] Dashboard admin para plano Enterprise (ver usuários por hospital) - próxima fase

## Paridade Demo vs Sistema Real (v2.7)
- [x] Verificar e migrar componentes faltantes do Demo para Dashboard real
- [x] TeamChat - comunicação interna da equipe
- [x] OfflineIndicator - indicador de modo offline
- [x] LocationIndicator - indicador de localização
- [x] RemindersSystem - sistema de lembretes
- [ ] WorkSchedule - escala de trabalho - próxima fase
- [ ] HospitalExecutiveDashboard - dashboard executivo - próxima fase
- [ ] DRGSystem - sistema de classificação DRG - próxima fase
- [ ] RecoveryRoom - sala de recuperação cirúrgica - próxima fase
- [ ] DRGPredictor - predição de DRG com ML - próxima fase
- [ ] ExportData - exportação de dados - próxima fase


## Usabilidade Zero Fricção (v2.8) - PRIORIDADE MÁXIMA

### Navegação Sanfona no Dashboard Real
- [x] Clicar na seta do paciente expande detalhes inline (não troca página)
- [x] Expandir mostra: dados do paciente, última evolução, ações rápidas
- [x] Botão de recuo (colapsar) visível e intuitivo
- [x] Animação suave de abertura/fechamento
- [x] Múltiplos pacientes podem estar expandidos ao mesmo tempo

### Confirmações de Ação (Salvar/Editar/Cancelar)
- [x] Toda ação destrutiva pede confirmação antes de executar
- [x] Botões claros: Salvar (verde), Editar (azul), Cancelar (cinza)
- [x] Feedback visual após cada ação (toast + reação do mascote)
- [ ] Opção de desfazer ações recentes (undo) - próxima fase

### Dashboard Enterprise B2C (Somente Dados)
- [x] Interface separada para gestores hospitalares
- [x] Visualização de dados agregados (sem acesso a evoluções)
- [x] Métricas: pacientes por equipe, tempo médio de internação, taxa de alta
- [x] Filtros por período, equipe, especialidade
- [x] Exportação de relatórios (CSV/PDF)
- [x] Sem acesso a dados clínicos sensíveis

### Eliminar Cliques Desnecessários
- [x] Ações mais comuns acessíveis com 1 clique
- [x] Atalhos de teclado para ações frequentes (Command+K)
- [x] Auto-preenchimento inteligente baseado em contexto
- [x] Campos opcionais colapsados por padrão
- [x] Valores padrão sensatos pré-preenchidos



## Correção Navegação Sanfona (v2.9) - BUG FIX
- [x] Corrigir expansão dos cards de pacientes ao clicar na seta lateral (já funcionava)
- [x] Garantir que detalhes expandem inline (não troca página)
- [x] Mostrar última evolução SBAR resumida ao expandir
- [x] Ações rápidas visíveis na área expandida

## WhatsApp Bot Integration (v3.0)
- [x] Bot WhatsApp para receber evoluções e consultas
- [x] Atualização do sistema em tempo real via WhatsApp
- [x] Modo offline: guardar mensagens e processar quando sinal voltar
- [x] Sincronização bidirecional WhatsApp <-> Sistema
- [x] Comandos de voz transcritos para texto

## Funcionalidade Mundial (v3.0)
- [x] Multi-idioma: PT, EN, ES, FR, CN
- [x] Multi-moeda: BRL, USD, EUR, GBP, ARS, CLP, MXN, COP
- [x] Conversão automática de moedas
- [x] Preços regionalizados por país
- [x] Fuso horário automático por localização

## Compliance e Segurança (v3.0) - CRÍTICO
- [x] Certificação HIPAA visível para Enterprise
- [x] Certificação LGPD visível para todos os planos
- [x] Badges de compliance no Dashboard Enterprise
- [x] Criptografia AES-256 documentada
- [x] Recursos de segurança visíveis (SOC 2, MFA, RBAC)
- [x] Auditoria de acessos documentada
- [ ] Política de privacidade clara e acessível - próxima fase
- [ ] Termos de uso com consentimento explícito - próxima fase



## Internacionalização i18n (v3.1)
- [x] Criar estrutura de arquivos de tradução (pt-BR, en-US, es-ES)
- [x] Hook useTranslation para acessar traduções
- [x] Contexto de idioma com persistência (localStorage)
- [x] Seletor de idioma no header da landing page
- [x] Seletor de idioma completo nas configurações (aba Perfil)
- [x] Detecção automática baseada no navegador
- [x] Traduções completas para navegação, dashboard, settings
- [x] Traduções para mensagens de erro e feedback
- [x] Traduções para componentes de compliance e segurança

## Expansão de Idiomas (v3.2)
- [x] Criar arquivo de tradução Francês (fr-FR)
- [x] Criar arquivo de tradução Mandarim (zh-CN)
- [x] Atualizar contexto de idioma com novos locales
- [x] Adicionar bandeiras e labels para novos idiomas


## Tradução Automática de Conteúdo Clínico (v3.3)
- [x] Criar serviço de tradução no backend usando LLM
- [x] Criar procedimentos tRPC para tradução de texto
- [x] Implementar componente TranslateButton no frontend
- [x] Integrar tradução nas evoluções SBAR (EvolutionCard)
- [x] Detecção automática de idioma (5 idiomas)
- [x] Cache de traduções para evitar chamadas repetidas (1h TTL)


## Preferência de Idioma no Perfil (v3.4)
- [x] Adicionar campo preferredLanguage no schema do usuário
- [x] Migrar banco de dados com novo campo
- [x] Criar procedimento tRPC para atualizar preferência de idioma
- [x] Carregar preferência do usuário ao fazer login
- [x] Sincronizar contexto i18n com preferência do banco (I18nSync)
- [x] Atualizar Settings para salvar no banco automaticamente


## Tradução Automática de Diagnósticos (v3.5)
- [x] Identificar campos de diagnóstico na tela de admissão
- [x] Criar componente DiagnosisTranslator reutilizável
- [x] Integrar tradução no diagnóstico principal (NewPatient)
- [x] Criar componente DiagnosisDisplay para visualização
- [x] Adicionar botão de tradução inline no Dashboard
- [x] Suporte a tradução bidirecional (de/para qualquer idioma)


## Sala de Recuperação Cirúrgica Avançada (v3.6)
- [x] Evolução SBAR do paciente na RPA
- [x] Edição de dados do paciente (leito, status, cirurgia)
- [x] Passagem de plantão com SBAR estruturado
- [x] Seletor de colega para transferir responsabilidade
- [x] Notificação ao colega sobre status do paciente
- [x] Alta da Sala de Recuperação com SBAR final
- [x] Notificação automática ao cirurgião sobre alta
- [x] Histórico de passagens de plantão


## Sistema de Notificações Push (v3.7)
- [x] Criar serviço de notificações no backend
- [x] Tabela de notificações no banco de dados (expandida com metadata)
- [x] Procedimentos tRPC para criar/listar/marcar como lida
- [x] Componente NotificationCenter no frontend
- [x] Badge de contagem de notificações não lidas
- [x] Dropdown com lista de notificações recentes
- [x] Notificação de passagem de plantão (handoff)
- [x] Notificação de atualização de status do paciente
- [x] Notificação de alta da RPA (discharge)
- [x] Som de alerta para notificações críticas


## Web Push API - Notificações Nativas (v3.8)
- [x] Gerar e configurar VAPID keys
- [x] Criar service worker para receber push (sw.js)
- [x] Implementar backend para envio de push (web-push)
- [x] Tabela de push subscriptions no banco de dados
- [x] Componente PushNotificationManager no frontend
- [x] Solicitar permissão do navegador
- [x] Registrar subscription no servidor
- [x] Aba de Notificações nas Configurações
- [x] Enviar push de passagem de plantão
- [x] Enviar push de alta da RPA
- [x] Enviar push de status crítico
- [x] Testar notificação push


## Melhorias no Cadastro de Pacientes (v3.9)

### Plano de Saúde
- [x] Adicionar campo de plano de saúde no cadastro de pacientes (InsuranceSelector)
- [x] Opções: Particular, principais convênios (Unimed, Bradesco, SulAmérica, Amil, etc.)
- [x] Opção de adicionar convênio personalizado

### Seleção Inteligente de Hospital
- [x] Mostrar apenas hospitais vinculados ao médico no dropdown
- [x] Opção de vincular novo hospital
- [x] Busca inteligente ao digitar nome do hospital
- [x] Sugerir hospital existente se nome similar for encontrado
- [x] Opção de aceitar sugestão ou criar novo hospital
- [x] Garantir unicidade de nomes para dados Enterprise fidedignos

### Seleção de Equipe
- [x] Mostrar apenas equipes das quais o usuário participa
- [x] Opção de criar nova equipe inline

### Sistema CID-10 2022 Inteligente
- [x] Criar base de dados CID-10 2022 completa (CID10Search)
- [x] Busca por código (ex: J18.9) ou nome da doença
- [x] Autocomplete com filtro em tempo real
- [x] Exibir código + descrição nas sugestões

### Tutorial de Onboarding
- [x] Criar tutorial com slides deslizáveis (swipe) - OnboardingTutorial
- [x] Bolinhas de navegação embaixo
- [x] Mostrar no primeiro acesso automaticamente
- [x] Opção de pular tutorial
- [x] Conteúdo: 7 slides (boas-vindas, pacientes, hospital, equipe, SBAR, notificações, tradução)
- [x] Navegação por teclado e swipe

### Idioma por Geolocalização
- [x] Seletor de idioma visível nas configurações (LanguageSelector)
- [x] Detectar idioma automaticamente por geolocalização (ipapi.co)
- [x] Mapear país → idioma padrão (40+ países mapeados)


## Correção e Melhoria do Tutorial (v3.10)
- [x] Corrigir erro no console do tutorial (DialogTitle/DialogDescription)
- [x] Adicionar slide sobre chat seguro intra-equipe (MessageSquareLock)
- [x] Explicar que apenas membros da equipe leem as mensagens
- [x] Mencionar chat extra-equipe para comunicação sigilosa
- [x] Redirecionar para cadastro inicial (/onboarding) após conclusão
- [x] Garantir que tutorial abre apenas no primeiro acesso (localStorage)


---

# V1.0 "PULSE" - Versão de Validação

## Importação de Documentos
- [x] Upload de PDF com lista de pacientes (DocumentImporter)
- [x] Upload de foto de ficha/prontuário
- [x] OCR/IA para extrair texto de imagens (invokeLLM com image_url)
- [x] Suporte a múltiplos formatos (PDF, JPG, PNG)

## Detecção de Pacientes por IA
- [x] Analisar documento e identificar possíveis pacientes (analyzeDocument)
- [x] Extrair campos: nome, idade, diagnóstico, leito, convênio
- [x] Mostrar confiança da detecção (%)
- [x] Listar todos os pacientes encontrados com cards

## Fluxo de Validação Humana
- [x] Tela de revisão antes de salvar
- [x] Checkbox para selecionar/deselecionar cada paciente
- [x] Botão Editar para corrigir campos inline
- [x] Botão Cancelar para ignorar paciente
- [x] Confirmação final antes de salvar no banco
- [x] Nunca salvar automaticamente sem confirmação

## Entrada por Áudio Melhorada
- [x] Transcrição de áudio para texto (VoicePatientInput)
- [x] Estruturação automática dos dados falados (analyzeVoice)
- [x] Detectar nome, diagnóstico, leito, CID-10 por contexto
- [x] Preview antes de salvar (botão Aplicar)

## Badges "Em Breve"
- [x] Componente ComingSoonBadge (coming-soon, beta, premium)
- [x] WhatsApp → "Em breve" (na aba de Settings)
- [x] ComingSoonWrapper para features desabilitadas

## Suporte Básico
- [x] Página de FAQ com 4 categorias e 15+ perguntas (/support)
- [x] Botão "Reportar problema" com tipos (bug, sugestão, dúvida)
- [x] Formulário de feedback com assunto e descrição
- [x] Contato por email (suporte@sbarglobal.com)
- [x] Informação de versão v1.0.0 "Pulse"


## Tutorial Interativo de Importação (v1.0.1)
- [x] Criar componente ImportTutorial com 4 passos guiados
- [x] Passo 1: Escolher método de entrada (documento, foto, áudio)
- [x] Passo 2: Upload do arquivo com dicas visuais e animação
- [x] Passo 3: Revisão dos dados detectados pela IA (95% precisão)
- [x] Passo 4: Confirmação e salvamento (Selecionar/Editar/Ignorar)
- [x] Dicas contextuais em cada etapa (Lightbulb)
- [x] Navegação por bolinhas e botões Anterior/Próximo
- [x] Opção de "Não mostrar novamente" (localStorage)
- [x] Hook useImportTutorial para controle de exibição
- [x] Integrar na tela de Novo Paciente (abre automaticamente)


## Instalação como App (PWA) (v1.0.2)
- [x] Criar página InstallApp com instruções visuais (/install)
- [x] Instruções para iOS (Safari → Compartilhar → Adicionar à Tela)
- [x] Instruções para Android (Chrome → Menu → Instalar app)
- [x] Instruções para Desktop (Chrome/Edge)
- [x] Detectar dispositivo automaticamente e mostrar aba relevante
- [x] Aba "App" nas Configurações com link para /install
- [x] Botão de instalação nativo quando disponível (beforeinstallprompt)
- [x] FAQ sobre instalação PWA
- [x] Benefícios visuais (acesso rápido, tela cheia, notificações, grátis)


## Integração PWA como TabsContent (v1.0.3)
- [x] Criar componente InstallAppTab extraído da página InstallApp
- [x] Remover redirecionamento da aba App nas Configurações
- [x] Integrar como TabsContent value="install"
- [x] Manter estilo sanfonado/acordeão para instruções
- [ ] Remover rota /install separada (opcional - manter para acesso direto)

## Bugs Reportados (v1.0.4)
- [x] PDF não é lido corretamente no DocumentImporter para cadastrar pacientes
- [x] Página Analytics mostra erro e não tem opção de voltar

## Fase 1 - Preparação para Publicação (v1.1.0)
- [x] Criar sistema de feature flags (shared/featureFlags.ts)
- [x] Ocultar rota/menu Analytics (Fase 2)
- [x] Ocultar rota/menu Chat de Equipe (Fase 2)
- [x] Ocultar rota/menu DRG e DRG Predictor (Fase 3)
- [x] Ocultar rota/menu Sala de Recuperação (Fase 3)
- [x] Ocultar Enterprise Dashboard e Hospital Dashboard (Fase 3)
- [x] Ocultar funcionalidades de Internacionalização (Fase 3)
- [x] Ocultar seletor de idioma e botão de tradução
- [x] Filtrar slides do OnboardingTutorial (5 slides em vez de 8)
- [x] Corrigir chaves de tradução do onboarding em en-US, es-ES, fr-FR, zh-CN
- [x] Corrigir bottom nav para usar bg-background (modo escuro)
- [x] Escrever testes para feature flags (11 testes)
- [x] Testar versão Fase 1 completa (142 testes passando)
- [x] Salvar checkpoint final para publicação

## Pré-Publicação (v1.1.1)
- [x] Substituir mascote Dr. Tigre por logo original SBAR Global (evitar direitos autorais)
- [x] Rodar checklist de pré-publicação completa
- [ ] Campo de texto livre unificado na aba Manual (próxima iteração)
- [ ] Criptografia a nível de campo para dados sensíveis (próxima iteração)

## Confirmação antes de criar SBAR (v1.1.2)
- [x] Adicionar passo de confirmação com resumo dos dados antes de salvar novo SBAR
- [x] Mostrar resumo formatado: paciente, leito, S, B, A, R
- [x] Botões Confirmar e Voltar para Editar
- [x] Confirmação no cadastro de paciente (PatientConfirmation)
- [x] Confirmação na finalização de evolução SBAR (EvolutionConfirmation)
- [x] Avisos de campos opcionais não preenchidos
- [x] Corrigido bottom bar da Evolution para modo escuro

## Campo de Texto Livre na aba Manual (v1.1.3)
- [x] Adicionar textarea grande na aba Manual para colar texto livre
- [x] Criar procedimento backend analyzeText para processar texto colado com IA
- [x] Detectar automaticamente se há 1 ou múltiplos pacientes no texto
- [x] Estruturar cada paciente em formato SBAR (S, B, A, R)
- [x] Extrair dados: nome, leito, diagnóstico, CID-10, idade, convênio
- [x] Mostrar lista de pacientes detectados com revisão individual
- [x] Permitir editar/remover pacientes antes de confirmar
- [x] Integrar com fluxo de confirmação existente (PatientConfirmation)

## Bugs (v1.1.4)
- [x] Nomes sobrepostos na parte superior da página de Configurações
- [x] Analytics removido da bottom nav do Settings (feature flag phase1)
- [x] Bottom nav do Settings corrigida para modo escuro (bg-background)
- [x] Scrollbar horizontal oculta nas tabs

## Remoção completa do mascote/logo tigre (v1.1.5)
- [x] Remover todas as referências visuais ao mascote Dr. Tigre
- [x] Substituir por ícone genérico do sistema até nova logo ser fornecida
- [x] Remover seção "Dr. Tigre" das Configurações
- [x] Desativar reações do mascote por padrão
- [x] Substituir "Insight do Dr. Tigre" por "Alerta Clínico" no Dashboard
- [x] Substituir "Dr. Tigre" por mensagem genérica na Landing Page
- [x] Substituir emoji tigre por ícone estetóscopio na Landing Page
- [x] Header do Dashboard agora usa ícone estetóscopio em vez de MascotLogo

## Bugs (v1.1.6)
- [x] Mascote/tigre removido do header da Demo (substituído por estetóscopio)
- [x] Analytics e Hospital removidos da bottom nav da Demo
- [x] Reações do tigre desativadas na Demo (no-op)
- [x] "Ver analytics" oculto nos quick actions do MorningBrief (feature flag)
- [x] Card Evoluções hoje não navega para analytics quando feature desabilitada
- [x] Bottom nav da Demo corrigida para bg-background (modo escuro)

## Bugs (v1.1.7)
- [x] Remover mascote tigre da landing page (Home.tsx) - header superior esquerdo
- [x] Investigar e corrigir "1 error" que aparece na landing page (badge vermelho inferior esquerdo) - era Vite WebSocket HMR overlay (dev only) + warnings de DialogDescription corrigidos em 4 componentes

## Bugs (v1.1.8)
- [x] Comando de voz investigado: funciona via Web Speech API (requer HTTPS + Chrome + permissão de microfone). Mensagem de erro melhorada no componente.
- [x] Botão Voz/Colar/Importar agrupados no header do NewPatient
- [x] Importação agora usa hospital/equipe selecionados no formulário
- [x] Importação agora salva pacientes em batch com hospital/equipe selecionados
- [x] "Iniciar ronda" agora navega para evolução do primeiro paciente
- [x] Botões Ver pendências e Altas pendentes agora funcionam corretamente
- [x] "Evoluções hoje" agora mostra toast informativo em vez de navegar para analytics (desabilitado na fase 1)
- [x] Sistema resetado para primeiro uso: onboarding reativado, dados limpos, fluxo novo médico funcional

## Bugs Críticos (v1.1.9)
- [x] Evoluções salvam corretamente no banco (corrigido getDraftEvolution retornando null)
- [x] Após finalizar evolução, redireciona ao dashboard automaticamente
- [x] Equipe criada durante onboarding pelo próprio usuário (comportamento correto)
- [x] Botões editar/excluir equipes adicionados e funcionando na Settings
- [x] Nova equipe aparece imediatamente na lista (TeamManager reescrito com tRPC)
- [x] Contador de evoluções usa dados reais do banco (todayEvolutionCount)
- [x] Clicar em "Evoluções hoje" mostra toast informativo com resumo
- [x] Fluxo completo testado: onboarding > hospital > equipe > 5 pacientes > evolução > dashboard
- [x] Colar texto testado com sucesso (3 pacientes importados via IA). Voz requer HTTPS+Chrome. PDF disponível no NewPatient.

## Feature: Equipe vinculada a múltiplos hospitais (v1.2.0)
- [x] Tabela pivot team_hospitals já existia no schema (reutilizada)
- [x] Tabela pivot team_hospitals já existia no schema, dados migrados via onboarding
- [x] Backend atualizado: procedures addHospital, removeHospital, hospitals; create aceita hospitalIds array
- [x] Frontend atualizado: Settings mostra hospitais vinculados com badges, combobox para vincular/desvincular
- [x] Dashboard filtra pacientes por hospitais vinculados via pivot
- [x] Testado: equipe vinculada a 2 hospitais simultaneamente, vincular/desvincular funciona

## Feature: Filtro de pacientes por hospital no Dashboard (v1.2.1)
- [x] Filtro funcional de hospital no Dashboard: "Todos hospitais" busca de todos via byMultipleHospitals, hospital específico filtra corretamente, header atualiza com nome do hospital

## Auditoria Completa para Produção (v1.2.2)

### Bugs Reportados
- [x] Banner "Críticos sem evolução" funciona - navega para evolução do primeiro paciente crítico
- [x] Banner "Altas pendentes" funciona - scroll para primeiro paciente com prioridade baixa
- [x] Banner "Evoluções hoje" funciona - navega para evolução do primeiro paciente sem evolução
- [x] Paciente com alta/arquivado é removido do feed (status muda de 'active' para 'discharged'/'archived')

### Auditoria Dashboard
- [x] Header: logo, nome hospital, busca global (Cmd+K), notificações, perfil do usuário
- [x] Morning Brief: saudação, cards de stats, quick actions
- [x] Filtros: busca por texto, filtro hospital, filtro equipe
- [x] Lista de pacientes: expandir/colapsar, badge prioridade, ações rápidas
- [x] Ações em paciente expandido: evoluir, editar, arquivar, dar alta
- [x] Bottom nav: Início, Novo, Config
- [x] FAB (botão verde +)
- [x] Botão "Iniciar ronda"
- [x] Botão "Evoluir próximo crítico"
- [x] Botão "Ver pendências"

### Auditoria Novo Paciente
- [x] Formulário manual: nome, leito, hospital, equipe, diagnóstico, prioridade
- [x] Botão Voz: reconhecimento de voz (requer HTTPS+Chrome)
- [x] Botão Colar: colar texto e analisar com IA (testado com sucesso)
- [x] Botão Importar: importar arquivo PDF/foto
- [x] Salvar e voltar ao dashboard

### Auditoria Evolução
- [x] Formulário SBAR: Situação, Background, Avaliação, Recomendação
- [x] Sinais vitais
- [x] Auto-save de rascunho
- [x] Finalizar evolução e redirecionar ao dashboard
- [x] Histórico de evoluções anteriores (PatientDetail implementado)

### Auditoria Settings
- [x] Aba Perfil: nome, especialidade, CRM, idioma
- [x] Aba Hospitais: listar, criar, editar, excluir
- [x] Aba Equipes: listar, criar, editar, excluir, vincular hospitais
- [x] Aba Notificações: configurações de push
- [x] Aba Plano: mostra dados reais (pacientes ativos/limite, análises IA/limite)
- [x] Aba App: instruções de instalação PWA

## Bugs Corrigidos (v1.2.3)
- [x] Aba Plano mostrava "0/10" fixo → Agora busca contagem real do banco (planStats procedure)
- [x] Dark mode no card de última evolução do Dashboard → Corrigido
- [x] OnboardingTour aparecia para usuários que já completaram → Corrigido
- [x] Página PatientDetail era placeholder → Implementada com histórico completo de internações e evoluções SBAR

## Proteção de Propriedade Intelectual (v2.10)
- [x] Remover todas as referências visíveis ao "Manus" no frontend (ManusDialog.tsx corrigido)
- [x] Remover referências ao "Manus" em comentários HTML e código-fonte visível ao usuário
- [x] Verificar que nenhuma menção restou no navegador (view-source, DevTools)

## Melhorias da Auditoria de UX (v2.11) - PRIORIDADE ALTA
- [x] Edição de paciente: botão Editar no card expandido do dashboard (inline, estilo sanfona)
- [x] Corrigir botão Análise IA no dashboard para navegar à aba IA da evolução
- [x] Exportação de relatório SBAR em PDF (imprimir, email, prontuário físico) - botão PDF no PatientDetail
- [x] Ronda guiada: fluxo paciente por paciente em ordem de prioridade (com indicador de progresso)
- [x] Melhorar extração de convênio na importação IA (prompt melhorado para detectar operadoras, SUS, particular)

## Bugs e Melhorias v2.13 - Reportados pelo Usuário
- [x] Hospitais: edição inline com nome e código (botão editar/salvar/cancelar)
- [x] Equipes: suporte a múltiplos hospitais por equipe (Select + badges com X para desvincular)
- [x] Equipes: desvincular hospital de equipe (botão X ao lado de cada hospital)
- [x] Equipes: CRUD completo (criar com múltiplos hospitais, editar nome, excluir com confirmação)
- [x] Evoluções: auto-preenchimento de Situação (S) e Background (B) da primeira evolução nas seguintes
- [x] Evoluções: somente o autor pode editar suas próprias evoluções (backend + frontend)
- [x] Evoluções: registrar quem fez o último ajuste e quando (lastEditedById, lastEditedAt)
- [x] Opção clara de uso individual do sistema (onboarding com escolha Individual vs Equipe)
- [x] Testar todos os fluxos: criar equipe, vincular/desvincular hospitais, editar, uso individual (testado no navegador)
- [x] Substituir campo CRM por Registro Profissional (global, suporte a CRM, CREFITO, CRN, COREN, NPI, GMC, etc.)

## v2.14 - Tradução PT-BR, Monitoramento e Mapeamento de Bugs
- [x] Traduzir onboarding completo para PT-BR (já estava em PT-BR)
- [x] Varredura completa de textos em inglês: index.html (lang, title), DashboardLayout (Sign in), tudo traduzido
- [x] Criar painel de monitoramento admin (banco de dados, logs, erros, saúde)
- [x] Mapear todos os bugs e issues restantes do sistema
- [x] Corrigir bugs identificados na varredura

## Segurança do Painel Admin
- [x] Painel admin em rota oculta /admin (sem links visíveis no sistema)
- [x] Verificação dupla no backend (role === 'admin') em todas as procedures
- [x] Promoção a admin apenas via banco de dados (impossível via interface)
- [x] Página admin com: stats do sistema, logs de atividade, evoluções/dia, lista de usuários
- [x] Redirecionar usuários não-admin que acessem /admin para o dashboard

## Correções Admin Panel (v2.14.1)
- [x] Corrigir gráfico "Evoluções por Dia" vazio (query SQL com referência incorreta à coluna createdAt)
- [x] Tradução das ações do activity log para PT-BR (Arquivou, Editou, Cadastrou, etc.)
- [x] Tratamento de erro na query evolutionsByDay para evitar crash do painel

## Bugs Reportados pelo Usuário (v2.14.2)
- [x] Criar equipe: botão "Vincular Hospitais" deve navegar para a página/aba de hospitais (não é intuitivo)
- [x] Erro SQL ao criar hospital: valor 'privat' truncado no campo type (enum incorreto, deveria ser 'privado' ou 'private')
- [x] Melhorar fluxo de criação de equipe para ser mais intuitivo

## Bugs Reportados pelo Usuário (v2.14.3)
- [x] Evoluções hoje mostra "2/1" - verificado: dado correto (2 evoluções para 1 paciente)
- [x] Cadastro de paciente por arquivo exige equipe/hospital antes - SetupWizard implementado
- [x] Erro SQL ao criar hospital - corrigido com código auto-gerado e busca CNES

## Setup Wizard - Fluxo Guiado (v2.14.4)
- [x] Criar componente SetupWizard com fluxo guiado: Hospital → Equipe → Paciente
- [x] Detectar automaticamente o que falta (hospital? equipe? ambos?) e iniciar no passo correto
- [x] Integrar wizard no Dashboard quando setup incompleto
- [x] Integrar wizard no fluxo de cadastro de paciente (quando tenta cadastrar sem hospital/equipe)
- [x] Integrar wizard no fluxo de cadastro por arquivo
- [x] Corrigir contador de evoluções hoje - verificado: dado correto
- [x] Corrigir erro SQL ao criar hospital (código auto-gerado + busca CNES)

## CID e Convênios (v2.14.5)
- [x] CID: identificação automática com sugestão e confirmação do usuário
- [x] CID: aceitar múltiplos códigos CID por paciente/internação
- [x] Convênios: substituir dropdown limitado (só Unimed) por lista completa de planos de saúde brasileiros
- [x] Convênios: campo aberto para digitação com autocomplete (combobox)


## Renomeação e Base CNES (v2.15.0)
- [x] Renomear SBAR Global → SBAR Health em todo o sistema (títulos, textos, logos, meta tags)
- [x] Importar base CNES de hospitais brasileiros (filtrar apenas hospitais) - 259 hospitais importados
- [x] Criar busca automática de hospitais com autocomplete
- [x] Gerar código de hospital automaticamente (invisível para o usuário)
- [x] Reconhecer unidades do mesmo hospital (ex: Mater Dei Contorno, Mater Dei Salvador)
- [x] Remover campo de código do formulário de criação de hospital
- [x] Criar SetupWizard guiado inline (Hospital→Equipe→Paciente)
- [x] Corrigir erro SQL de código duplicado ao criar hospital
- [x] Remover branding "desenvolvido por manus"

## Sistema de Reporte de Erros e Suporte (v2.15)
- [x] Criar tabela de tickets/reports no banco de dados
- [x] Criar procedures tRPC para enviar e listar reports
- [x] Página de Suporte funcional com formulário de reporte
- [x] Admin pode ver e gerenciar reports no painel admin
- [x] Notificar admin quando novo report é criado

## Integrações Pendentes (v2.15)
- [x] Integrar HospitalSearch no Onboarding (step 2)
- [x] Remover campo de código do hospital do Onboarding

## i18n e Página de Preços (v2.16.0)
- [x] Corrigir i18n na Home (landing page) - textos hardcoded em PT-BR
- [x] Corrigir i18n no Onboarding Tutorial - textos em inglês
- [x] Criar página de Preços com 3 planos (Básico R$29,90 / Profissional R$69,90 / Enterprise R$149,90)
- [x] Detecção automática de idioma por navigator.language
- [x] Detecção automática de moeda por geolocalização (IP)
- [x] Seletor manual de moeda (BRL/USD/EUR) na página de preços
- [x] Conversão visual de preços entre moedas
- [x] Desconto anual de 20% visível na página de preços
- [x] Botão "Começar Trial Grátis" (leva ao cadastro)
- [x] Tradução completa da Home para EN/ES/FR/CN
- [x] Tradução completa do Onboarding Tutorial para EN/ES/FR/CN

## Remoção de Branding (v2.16.1)
- [x] Remover todas as referências "desenvolvido por manus" do sistema
- [x] Remover meta tags e comentários que referenciem manus
- [x] Implementar proteção contra cópia (CSS copy-protect class)

## Cadastro com Verificação Profissional (v2.17)
- [x] Atualizar schema users com campos: cpf, professionalType, councilType, councilNumber, councilState, rqeNumber, university, graduationYear, verificationStatus, verificationDate
- [x] Criar enum professionalType: medico, enfermeiro, fisioterapeuta, nutricionista, farmaceutico, psicologo, estudante, gestor, outro
- [x] Criar enum verificationStatus: pending, verified, rejected, unverified
- [x] Criar procedure de validação de CPF (BrasilAPI)
- [x] Criar procedure de consulta CRM no CFM
- [x] Atualizar Onboarding step 1 (Perfil) com campos adaptativos por tipo profissional
- [x] Médicos: CRM + UF obrigatório, RQE opcional
- [x] Estudantes: universidade + ano de graduação previsto obrigatório
- [x] Enfermeiros/fisio/etc: conselho + número obrigatório
- [x] Gestores: cargo + instituição obrigatório
- [x] Badge de verificação no perfil do usuário (verificado/pendente/não verificado)
- [x] Painel admin: lista de verificações pendentes para aprovação manual
- [x] Proteção: usuários não verificados têm acesso limitado (trial)

## Bug Fix - Contador Evoluções (v2.17.1)
- [x] Contador "Evoluções hoje" mostra 2/1 em vez de 0/0 quando não há pacientes ativos
- [x] Limpar evoluções/admissões órfãs de testes anteriores e corrigir target para 0 quando sem pacientes

## MVP - Fluxo Intuitivo de Cadastro (v2.18.0)
- [x] Onboarding Passo 1: "Como você vai usar?" → Uso pessoal (cria equipe invisível) ou Com equipe
- [x] Onboarding Passo 2: "Em qual hospital você trabalha?" → busca CNES, vincular múltiplos
- [x] Onboarding Passo 3: "Cadastre seu primeiro paciente" → formulário simples inline
- [x] SetupWizard: quando usuário tenta cadastrar paciente sem equipe/hospital, guiar passo a passo na mesma tela (sanfona)
- [x] Opção "Uso pessoal": criar equipe pessoal automaticamente (invisível para o usuário)
- [x] Fluxo completo sem fricção: cadastro → hospital → equipe → paciente → evolução
- [x] Dashboard funcional após setup: mostrar 0/0 quando sem pacientes, guiar para cadastrar primeiro paciente

## Bug Fix - Importação PDF (v2.18.1)
- [x] Importação PDF limitada a 10 pacientes - prompt reescrito para extrair TODOS
- [x] Importação agora pergunta hospital/equipe antes de confirmar (step "assign")
- [x] CIDs corrigidos: prompt com regras explícitas de formato CID-10, diagnóstico salvo como "CID - Descrição"

## Bug Fix & Melhorias - v2.19.0
- [x] BUG: hospitals.list agora retorna apenas hospitais vinculados ao usuário (via teams ou hospitalAdmins)
- [x] BUG: Settings agora vincula hospital ao usuário automaticamente ao criar
- [x] BUG: Ronda corrigida - reseta campos ao mudar admissionId e usa última evolução do próprio paciente
- [x] MELHORIA: Importação PDF agora extrai Situação e Background e cria draft de evolução automaticamente
- [x] BUG: Pendências agora usa latestEvoMap - verifica se paciente tem evolução HOJE (não por tempo de admissão)
- [x] MELHORIA: Prompt de importação reescrito com instruções explícitas para extrair TODOS os pacientes
- [x] MELHORIA: DocumentImporter inclui step de vinculação hospital/equipe (vincular todos ao mesmo ou individual)
- [x] BUG: Unicode escapes corrigidos - "Médio", "Crítico", "Convênio", "Diagnóstico" agora exibem corretamente
- [x] BUG: CID corrigido - labels em UTF-8 real no NewPatient
- [x] MELHORIA: Trial 30 dias ilimitado - getUserPlanWithTrial verifica trialEndsAt ou 30 dias desde createdAt

## Bug Fix - Vinculação Hospital/Equipe na Importação (v2.19.1)
- [x] BUG: Step de vinculação hospital/equipe agora SEMPRE aparece (removido skip automático)
- [x] MELHORIA: Adicionado step "confirm" com resumo completo antes de executar a importação

## Feature - Detecção de Duplicados na Importação (v2.20.0)
- [x] Backend: checkBatchDuplicates no db.ts (busca por nome completo + primeiro/último nome)
- [x] Backend: procedure checkBatchDuplicates no routers.ts (max 100 nomes)
- [x] Frontend: Step "duplicates" automático entre review e assign com verificação em lote
- [x] UI: Pacientes duplicados com badge, matches existentes com ID/CPF/nascimento, botão "Desmarcar todos duplicados"
- [x] Confirmação: Step "confirm" lista duplicatas com badge amber
- [x] Barra de progresso visual nos steps (Revisão → Duplicados → Vincular → Confirmar)
- [x] 208 testes passando (10 novos para duplicados)

## Bug Fix - Convites (v2.20.1)
- [x] BUG: Link de convite agora usa window.location.origin (domínio correto)
- [x] BUG: Convite por email usa link correto + código gerado pelo backend
- [x] Tabela teamInvites já existia no schema (reutilizada)
- [x] Procedures: teams.createInvite, teams.getInvite (public), teams.acceptInvite, teams.listInvites, teams.revokeInvite
- [x] DB helpers: createTeamInvite, getTeamInviteByCode, getTeamInvitesByTeam, acceptTeamInvite, revokeTeamInvite
- [x] Página /join/:code com estados: loading, erro, não logado, aceitar, aceito
- [x] Settings: handleCopyLink e handleSendEmailInvite agora chamam createInvite do backend
- [x] 218 testes passando (10 novos para convites)

## Renomear - SBAR Health Clinical Intelligence Platform (v2.20.2)
- [x] Alterar título no index.html para "SBAR Health - Clinical Intelligence Platform"
- [x] Corrigir links sbarglobal.com para usar window.location.origin (PrivacyIndicator, TeamInviteSystem, UserMenu)
- [x] Corrigir email VAPID de sbar-global.com para sbarhealth.com

## Melhoria - Editar Hospital do Paciente (v2.20.3)
- [x] Adicionar campo de seleção de hospital na aba de edição de paciente (Select com hospitais vinculados ao usuário)
- [x] Backend: hospitalId adicionado ao input schema de admissions.update
