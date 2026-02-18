# Guia DRG - Referência para Desenvolvimento

## 1. O Que é o DRG?
- **Algoritmo de agrupamento e classificação** de pacientes
- Agrupa pacientes com diagnósticos semelhantes que consomem mesma quantidade de recursos
- Analogia: DRG é como classificar "tipo de instância" na nuvem (t2.micro vs p3.16xlarge)

## 2. Lógica de Processamento (Input -> Engine -> Output)

### A. Inputs (Dados de Entrada)
1. **CID-10 Principal**: Diagnóstico que motivou a internação
2. **CIDs Secundários**: Comorbidades (diabético? hipertenso?)
3. **Procedimentos**: O que foi feito (cirurgia, ventilação mecânica, etc.)
4. **Idade e Sexo**: Variáveis demográficas que alteram o risco
5. **Condição de Alta**: Curado, transferido ou faleceu?

### B. O Motor (Agrupador)
- Cruza dados para definir **Severidade** e **Risco de Mortalidade**
- **CC (Complication or Comorbidity)**: Complicação ou Comorbidade
- **MCC (Major Complication or Comorbidity)**: Complicação ou Comorbidade Maior
- *Nota: MCC muda paciente de categoria, aumentando tempo esperado e reembolso*

### C. Outputs (Dados de Saída)
1. **Peso Relativo**: Valor numérico de complexidade (1.0 = média, 4.5 = altíssima)
2. **ALOS (Average Length of Stay)**: Tempo médio de permanência esperado em dias
3. **Custo Esperado**: Quanto aquela internação deve custar para o hospital

## 3. User Personas e Visualizações

### A. Gestor Hospitalar (Visão Macro)
- **Foco**: Sustentabilidade financeira e planejamento estratégico
- **Uso do DRG**: Negociar contratos com operadoras, avaliar rentabilidade por especialidade
- **O que quer ver**: 
  - "Meu Case-Mix Index (CMI) está subindo ou descendo?"
  - "Quanto estamos economizando com redução de desperdícios?"

### B. Gestor de Equipe/Líder Clínico (Visão Micro/Operacional)
- **Foco**: Eficiência assistencial e qualidade técnica
- **Uso do DRG**: Comparar desempenho entre médicos/turnos, identificar outliers
- **O que quer ver**:
  - "O Dr. João tem tempo médio de permanência maior que a média do DRG?"
  - "Quais pacientes estão em atraso (outliers) hoje na minha enfermaria?"

## 4. Requisitos Funcionais para o Aplicativo
- **Módulo de Codificação em Tempo Real**: Inserir dados durante a jornada, não só na alta
- **Alertas de Desvio (Variance Tracking)**: Notificações para altas previstas que não ocorreram
- **Dashboard de Eficiência**: Comparar "Custo Real" vs "Custo DRG"
- **Filtros Granulares**: Filtrar por Unidade, Equipe Médica ou Médico individual

## 5. Principais KPIs (Métricas de Sucesso)
1. **Permanência Real vs. Esperada**: Se > 1, há ineficiência assistencial
2. **Taxa de Readmissão**: Indica se alta foi precoce ou mal conduzida
3. **Índice de Case-Mix (CMI)**: Indica o perfil de complexidade do hospital

## 6. Importância para o Negócio
- Modelo mudando de "Pagar por Serviço" (Fee-for-Service) para "Pagar por Performance" (Value-Based Healthcare)
- Software garante que hospital seja sustentável enquanto entrega melhor cuidado

## Resumo para o Código
```
Paciente + Diagnóstico + Complexidade = DRG
DRG = Previsão de Tempo + Previsão de Custo + Meta de Qualidade
```
