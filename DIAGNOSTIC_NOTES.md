# Diagnóstico do Fluxo - MVP

## Estado Atual (screenshot)
- Dashboard mostra "Bienvenue sur SBAR Health" em francês (OnboardingTutorial detectando idioma errado)
- Mostra 0/0 evoluções, 0 críticos - correto
- "Adicione seu primeiro paciente" com botão "Novo Paciente"
- Bottom nav: Início, Novo, Config
- OnboardingTutorial modal aparecendo por cima do dashboard

## Pontos de Fricção Identificados

### 1. OnboardingTutorial aparece em francês
- Componente OnboardingTutorial detecta idioma do navegador e mostra em francês
- Deveria respeitar o idioma configurado pelo usuário

### 2. Fluxo NewPatient sem equipe/hospital
- Quando usuário clica "Novo Paciente" sem ter equipe/hospital:
  - SetupWizard aparece inline (bom!)
  - Mas NÃO oferece opção "Uso pessoal"
  - Obriga criar hospital + equipe manualmente
  - Formulário de paciente fica desabilitado (botão disabled)

### 3. Falta opção "Uso Pessoal"
- Nenhum lugar oferece "Uso pessoal" que cria equipe invisível
- Médico solo deveria poder usar sem criar equipe explicitamente

### 4. Onboarding.tsx (pós-login)
- Step 1: Perfil profissional (bom)
- Step 2: Hospital (bom, mas obrigatório)
- Step 3: Equipe (obrigatório, sem opção pessoal)
- Step 4: Paciente demo (bom)

## Solução Planejada

### Reescrever Onboarding.tsx
- Step 1: Perfil profissional (manter)
- Step 2: "Como vai usar?" → Pessoal (auto-cria equipe) OU Com equipe
- Step 3: Hospital (busca CNES)
- Step 4: Se "Com equipe" → nome da equipe; Se "Pessoal" → pula
- Step 5: Paciente demo (manter)

### Reescrever SetupWizard.tsx
- Adicionar opção "Uso pessoal" que cria equipe invisível + vincula hospital
- Fluxo sanfona: tudo na mesma tela, sem navegar para outra página

### Dashboard.tsx
- Quando sem equipe/hospital: mostrar card guiado em vez de empty state genérico
- "Configure em 30 segundos" → SetupWizard inline
