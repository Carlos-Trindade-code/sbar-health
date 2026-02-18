# Screenshot Analysis - v2.18.0

## Observações do Screenshot
1. O OnboardingTutorial (slides) está aparecendo em FRANCÊS ("Bienvenue sur SBAR Health", "Suivant")
   - Causa: o sistema de geolocalização detectou IP francês (sandbox pode estar em servidor francês)
   - O defaultLocale="pt-BR" foi adicionado ao I18nProvider mas a geolocalização pode estar sobrescrevendo
   - Precisa corrigir: a geolocalização não deve sobrescrever o defaultLocale quando ele é explicitamente definido

2. O floating card "Configure sua conta" está aparecendo corretamente:
   - "1 de 2 passos concluídos"
   - "Configurar hospital e equipe" marcado como concluído (verde)
   - "Cadastrar primeiro paciente" pendente
   - Botão "Cadastrar Paciente" funcional

3. O Dashboard mostra "Boa noite, Carlos!" e "Novo Paciente" no empty state

## Correção Necessária
- O i18n está detectando geolocalização e sobrescrevendo o defaultLocale
- Precisa priorizar: defaultLocale > geolocalização > browser language
