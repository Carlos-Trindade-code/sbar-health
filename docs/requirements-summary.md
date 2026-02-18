# SBAR Global - Resumo de Requisitos dos Documentos

## Modelo de Negócio - Planos e Precificação

### GRATUITO (Trial 30 dias)
- 5 pacientes ativos simultâneos
- 1 equipe (até 3 membros)
- 1 hospital
- 30 evoluções/mês
- Histórico 30 dias
- IA: 10 usos/dia
- Limitação: Marca d'água em exportações

### BÁSICO - $4.99/mês (R$24,90)
- 25 pacientes ativos
- 3 equipes (5 membros cada)
- 3 hospitais
- Evoluções ilimitadas
- Histórico 6 meses
- IA: 30 usos/dia
- Preditor de alta básico
- Suporte: Email (48h)

### PRO - $9.99/mês (R$49,90)
- Pacientes ILIMITADOS (por usuário)
- Equipes ilimitadas
- Hospitais ilimitados
- Histórico ilimitado
- IA: 100 usos/dia
- WhatsApp Bot: 200 msg/dia
- Preditor ML avançado
- API REST básica
- Suporte: Chat (24h)

### ADD-ONS (para PRO)
- IA ilimitada: +$3/mês
- WhatsApp ilimitado: +$5/mês
- Usuário extra: +$3/usuário
- Storage 100GB: +$3/mês
- Integração API: +$10/mês

### ENTERPRISE - $15-25/usuário/mês
- Mínimo 20 usuários
- Tudo ilimitado
- On-premise opcional
- SSO/LDAP
- White-label
- SLA 99.9%

## Funcionalidades Principais

### 1. FAB MASTER (Botão de Ação Contextual)
- Localização: Canto inferior direito, sempre visível
- Comportamento: Abre menu contextual
- Opções:
  - NOVO REGISTRO: Foto→OCR, Áudio→Transcrição IA, Manual→Formulário
  - AÇÕES RÁPIDAS: Cadastrar Novo Paciente, Evoluir Paciente, Dar Alta, Arquivar

### 2. Fluxos de Entrada
- A) FOTO (OCR): Tira foto → API OCR → Extrai dados → Pré-preenche → Verifica duplicatas
- B) ÁUDIO (Speech-to-Text): Grava áudio → API Speech → Transcreve → IA estrutura SBAR → Revisa
- C) MANUAL: Formulário tradicional com validações em tempo real

### 3. Detecção de Duplicatas
- Trigger: Ao digitar nome do paciente
- Lógica: Fuzzy matching (Levenshtein distance < 3)

## Requisitos do Usuário (pasted_content.txt)

### Botão Mestre Flutuante
- Disponível em todas as páginas
- Opções: cadastrar paciente, evoluir paciente via áudio/vídeo/transcrição de imagem

### Navegação Sanfona
- Expandir/colapsar seções sem trocar página
- Facilitar navegabilidade

### Integração Hospital
- Puxar pacientes do sistema do hospital
- Identificação inteligente de evoluções
- Opções: salvar, editar, cancelar

### Campo Aberto para Colar Evoluções
- Colar texto livre
- IA distribui em formato SBAR
- Perguntas sobre dúvidas
- Feedback visual (check)

### Edição em Todos os Locais
- Paciente, hospital, equipe, etc.

### WhatsApp Bot
- Reconhecer médico cadastrado
- Fazer alterações
- Resumo de pacientes internados
- Lista de pacientes por equipe

### Relacionamentos
- Médico pode estar em múltiplas equipes
- Equipe pode trabalhar em múltiplos hospitais
- Paciente pode ser olhado por múltiplas equipes
- Evoluções são específicas por equipe (não intercambiáveis)

### Chat da Equipe
- Comunicação entre membros
- Discussão sobre pacientes, plantões

### Escala de Trabalho
- Organizar escala mês/ano/semana/dia
- Evitar furos
- Redistribuição inteligente baseada em carga

### Gamificação
- Quem trabalhou mais pode olhar menos pacientes
- Pódium de médicos mais ativos

### Dashboard Hospital
- Produtividade médica e da equipe
- Associar internação/desfecho ao médico/equipe
- Consumo de suprimentos por médico
- Tempo de internação por médico
- Complicações por cirurgião

### Separação de Dados
- Hospital não vê dados individuais de médicos
- Médicos não veem métricas de gestão hospitalar

### Regras de Edição
- Somente autor pode editar própria evolução

### Tipos de Alta
- Alta da equipe (paciente continua internado)
- Alta hospitalar (paciente arquivado)
- Deletar paciente (erro de digitação)

### Configurações por Equipe
- Escalas de avaliação diversas
- Prioridades baseadas em gravidade
- Situações específicas

### Relatórios
- Nome, leito, hospital, número de atendimento
- Para gestores, diariamente ou sob demanda
- Fins de gestão e cobrança

### Internacionalização
- Múltiplas línguas
- Uso mundial
