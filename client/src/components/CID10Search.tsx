import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, X, Mic, MicOff, Loader2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// CID-10 2022 - Principais códigos (versão resumida para performance)
const CID10_DATABASE: Array<{ code: string; description: string; category: string }> = [
  // Doenças infecciosas e parasitárias (A00-B99)
  { code: "A00", description: "Cólera", category: "Infecciosas" },
  { code: "A01", description: "Febres tifoide e paratifoide", category: "Infecciosas" },
  { code: "A09", description: "Diarreia e gastroenterite de origem infecciosa presumível", category: "Infecciosas" },
  { code: "A15", description: "Tuberculose respiratória", category: "Infecciosas" },
  { code: "A16", description: "Tuberculose das vias respiratórias sem confirmação", category: "Infecciosas" },
  { code: "A37", description: "Coqueluche", category: "Infecciosas" },
  { code: "A38", description: "Escarlatina", category: "Infecciosas" },
  { code: "A39", description: "Infecção meningocócica", category: "Infecciosas" },
  { code: "A40", description: "Septicemia estreptocócica", category: "Infecciosas" },
  { code: "A41", description: "Outras septicemias", category: "Infecciosas" },
  { code: "A41.9", description: "Septicemia não especificada", category: "Infecciosas" },
  { code: "A46", description: "Erisipela", category: "Infecciosas" },
  { code: "A49", description: "Infecção bacteriana de localização não especificada", category: "Infecciosas" },
  { code: "A69.2", description: "Doença de Lyme", category: "Infecciosas" },
  { code: "B15", description: "Hepatite aguda A", category: "Infecciosas" },
  { code: "B16", description: "Hepatite aguda B", category: "Infecciosas" },
  { code: "B17", description: "Outras hepatites virais agudas", category: "Infecciosas" },
  { code: "B18", description: "Hepatite viral crônica", category: "Infecciosas" },
  { code: "B20", description: "Doença pelo HIV resultando em doenças infecciosas", category: "Infecciosas" },
  { code: "B24", description: "Doença pelo HIV não especificada", category: "Infecciosas" },
  { code: "B34", description: "Doença por vírus não especificada", category: "Infecciosas" },
  { code: "B37", description: "Candidíase", category: "Infecciosas" },
  { code: "B50", description: "Malária por Plasmodium falciparum", category: "Infecciosas" },
  { code: "B54", description: "Malária não especificada", category: "Infecciosas" },
  { code: "B57", description: "Doença de Chagas", category: "Infecciosas" },
  { code: "B65", description: "Esquistossomose", category: "Infecciosas" },
  { code: "B86", description: "Escabiose", category: "Infecciosas" },
  
  // Neoplasias (C00-D48)
  { code: "C16", description: "Neoplasia maligna do estômago", category: "Neoplasias" },
  { code: "C18", description: "Neoplasia maligna do cólon", category: "Neoplasias" },
  { code: "C20", description: "Neoplasia maligna do reto", category: "Neoplasias" },
  { code: "C22", description: "Neoplasia maligna do fígado e vias biliares", category: "Neoplasias" },
  { code: "C25", description: "Neoplasia maligna do pâncreas", category: "Neoplasias" },
  { code: "C34", description: "Neoplasia maligna dos brônquios e pulmões", category: "Neoplasias" },
  { code: "C43", description: "Melanoma maligno da pele", category: "Neoplasias" },
  { code: "C50", description: "Neoplasia maligna da mama", category: "Neoplasias" },
  { code: "C53", description: "Neoplasia maligna do colo do útero", category: "Neoplasias" },
  { code: "C56", description: "Neoplasia maligna do ovário", category: "Neoplasias" },
  { code: "C61", description: "Neoplasia maligna da próstata", category: "Neoplasias" },
  { code: "C64", description: "Neoplasia maligna do rim", category: "Neoplasias" },
  { code: "C67", description: "Neoplasia maligna da bexiga", category: "Neoplasias" },
  { code: "C71", description: "Neoplasia maligna do encéfalo", category: "Neoplasias" },
  { code: "C73", description: "Neoplasia maligna da tireoide", category: "Neoplasias" },
  { code: "C79", description: "Neoplasia maligna secundária de outras localizações", category: "Neoplasias" },
  { code: "C80", description: "Neoplasia maligna sem especificação de localização", category: "Neoplasias" },
  { code: "C91", description: "Leucemia linfoide", category: "Neoplasias" },
  { code: "C92", description: "Leucemia mieloide", category: "Neoplasias" },
  { code: "D50", description: "Anemia por deficiência de ferro", category: "Neoplasias" },
  { code: "D64", description: "Outras anemias", category: "Neoplasias" },
  
  // Endócrinas, nutricionais e metabólicas (E00-E90)
  { code: "E03", description: "Hipotireoidismo", category: "Endócrinas" },
  { code: "E05", description: "Tireotoxicose (hipertireoidismo)", category: "Endócrinas" },
  { code: "E10", description: "Diabetes mellitus tipo 1", category: "Endócrinas" },
  { code: "E11", description: "Diabetes mellitus tipo 2", category: "Endócrinas" },
  { code: "E11.9", description: "Diabetes mellitus tipo 2 sem complicações", category: "Endócrinas" },
  { code: "E13", description: "Outros tipos especificados de diabetes mellitus", category: "Endócrinas" },
  { code: "E14", description: "Diabetes mellitus não especificado", category: "Endócrinas" },
  { code: "E16", description: "Outros transtornos da secreção pancreática interna", category: "Endócrinas" },
  { code: "E21", description: "Hiperparatireoidismo", category: "Endócrinas" },
  { code: "E22", description: "Hiperfunção da hipófise", category: "Endócrinas" },
  { code: "E27", description: "Outros transtornos da glândula suprarrenal", category: "Endócrinas" },
  { code: "E44", description: "Desnutrição proteico-calórica", category: "Endócrinas" },
  { code: "E46", description: "Desnutrição proteico-calórica não especificada", category: "Endócrinas" },
  { code: "E66", description: "Obesidade", category: "Endócrinas" },
  { code: "E78", description: "Distúrbios do metabolismo de lipoproteínas e outras lipidemias", category: "Endócrinas" },
  { code: "E83", description: "Distúrbios do metabolismo de minerais", category: "Endócrinas" },
  { code: "E86", description: "Depleção de volume", category: "Endócrinas" },
  { code: "E87", description: "Outros transtornos do equilíbrio hidroeletrolítico e ácido-básico", category: "Endócrinas" },
  { code: "E87.1", description: "Hiposmolalidade e hiponatremia", category: "Endócrinas" },
  { code: "E87.6", description: "Hipopotassemia", category: "Endócrinas" },
  
  // Transtornos mentais (F00-F99)
  { code: "F10", description: "Transtornos mentais devidos ao uso de álcool", category: "Mental" },
  { code: "F11", description: "Transtornos mentais devidos ao uso de opiáceos", category: "Mental" },
  { code: "F14", description: "Transtornos mentais devidos ao uso de cocaína", category: "Mental" },
  { code: "F19", description: "Transtornos mentais devidos ao uso de múltiplas drogas", category: "Mental" },
  { code: "F20", description: "Esquizofrenia", category: "Mental" },
  { code: "F31", description: "Transtorno afetivo bipolar", category: "Mental" },
  { code: "F32", description: "Episódio depressivo", category: "Mental" },
  { code: "F33", description: "Transtorno depressivo recorrente", category: "Mental" },
  { code: "F41", description: "Outros transtornos ansiosos", category: "Mental" },
  { code: "F41.0", description: "Transtorno de pânico", category: "Mental" },
  { code: "F41.1", description: "Ansiedade generalizada", category: "Mental" },
  { code: "F43", description: "Reações ao estresse grave e transtornos de adaptação", category: "Mental" },
  { code: "F50", description: "Transtornos da alimentação", category: "Mental" },
  
  // Doenças do sistema nervoso (G00-G99)
  { code: "G00", description: "Meningite bacteriana", category: "Nervoso" },
  { code: "G03", description: "Meningite devida a outras causas", category: "Nervoso" },
  { code: "G04", description: "Encefalite, mielite e encefalomielite", category: "Nervoso" },
  { code: "G20", description: "Doença de Parkinson", category: "Nervoso" },
  { code: "G25", description: "Outros transtornos extrapiramidais e dos movimentos", category: "Nervoso" },
  { code: "G30", description: "Doença de Alzheimer", category: "Nervoso" },
  { code: "G35", description: "Esclerose múltipla", category: "Nervoso" },
  { code: "G40", description: "Epilepsia", category: "Nervoso" },
  { code: "G43", description: "Enxaqueca", category: "Nervoso" },
  { code: "G45", description: "Acidentes vasculares cerebrais isquêmicos transitórios", category: "Nervoso" },
  { code: "G47", description: "Distúrbios do sono", category: "Nervoso" },
  { code: "G50", description: "Transtornos do nervo trigêmeo", category: "Nervoso" },
  { code: "G56", description: "Mononeuropatias do membro superior", category: "Nervoso" },
  { code: "G61", description: "Polineuropatia inflamatória", category: "Nervoso" },
  { code: "G62", description: "Outras polineuropatias", category: "Nervoso" },
  { code: "G70", description: "Miastenia gravis", category: "Nervoso" },
  { code: "G80", description: "Paralisia cerebral", category: "Nervoso" },
  { code: "G91", description: "Hidrocefalia", category: "Nervoso" },
  
  // Doenças do olho (H00-H59)
  { code: "H10", description: "Conjuntivite", category: "Olho" },
  { code: "H25", description: "Catarata senil", category: "Olho" },
  { code: "H26", description: "Outras cataratas", category: "Olho" },
  { code: "H33", description: "Descolamento e defeitos da retina", category: "Olho" },
  { code: "H40", description: "Glaucoma", category: "Olho" },
  
  // Doenças do ouvido (H60-H95)
  { code: "H65", description: "Otite média não-supurativa", category: "Ouvido" },
  { code: "H66", description: "Otite média supurativa e as não especificadas", category: "Ouvido" },
  
  // Doenças do aparelho circulatório (I00-I99)
  { code: "I10", description: "Hipertensão essencial (primária)", category: "Circulatório" },
  { code: "I11", description: "Doença cardíaca hipertensiva", category: "Circulatório" },
  { code: "I13", description: "Doença cardíaca e renal hipertensiva", category: "Circulatório" },
  { code: "I20", description: "Angina pectoris", category: "Circulatório" },
  { code: "I21", description: "Infarto agudo do miocárdio", category: "Circulatório" },
  { code: "I21.0", description: "IAM da parede anterior", category: "Circulatório" },
  { code: "I21.1", description: "IAM da parede inferior", category: "Circulatório" },
  { code: "I21.9", description: "IAM não especificado", category: "Circulatório" },
  { code: "I25", description: "Doença isquêmica crônica do coração", category: "Circulatório" },
  { code: "I26", description: "Embolia pulmonar", category: "Circulatório" },
  { code: "I27", description: "Outras formas de doença cardíaca pulmonar", category: "Circulatório" },
  { code: "I34", description: "Transtornos não-reumáticos da valva mitral", category: "Circulatório" },
  { code: "I35", description: "Transtornos não-reumáticos da valva aórtica", category: "Circulatório" },
  { code: "I42", description: "Cardiomiopatia", category: "Circulatório" },
  { code: "I44", description: "Bloqueio atrioventricular e do ramo esquerdo", category: "Circulatório" },
  { code: "I45", description: "Outros transtornos de condução", category: "Circulatório" },
  { code: "I47", description: "Taquicardia paroxística", category: "Circulatório" },
  { code: "I48", description: "Flutter e fibrilação atrial", category: "Circulatório" },
  { code: "I49", description: "Outras arritmias cardíacas", category: "Circulatório" },
  { code: "I50", description: "Insuficiência cardíaca", category: "Circulatório" },
  { code: "I50.0", description: "Insuficiência cardíaca congestiva", category: "Circulatório" },
  { code: "I50.1", description: "Insuficiência ventricular esquerda", category: "Circulatório" },
  { code: "I50.9", description: "Insuficiência cardíaca não especificada", category: "Circulatório" },
  { code: "I60", description: "Hemorragia subaracnoide", category: "Circulatório" },
  { code: "I61", description: "Hemorragia intracerebral", category: "Circulatório" },
  { code: "I63", description: "Infarto cerebral", category: "Circulatório" },
  { code: "I64", description: "AVC não especificado", category: "Circulatório" },
  { code: "I67", description: "Outras doenças cerebrovasculares", category: "Circulatório" },
  { code: "I70", description: "Aterosclerose", category: "Circulatório" },
  { code: "I71", description: "Aneurisma e dissecção da aorta", category: "Circulatório" },
  { code: "I74", description: "Embolia e trombose arteriais", category: "Circulatório" },
  { code: "I77", description: "Outros transtornos de artérias e arteríolas", category: "Circulatório" },
  { code: "I80", description: "Flebite e tromboflebite", category: "Circulatório" },
  { code: "I83", description: "Varizes dos membros inferiores", category: "Circulatório" },
  
  // Doenças do aparelho respiratório (J00-J99)
  { code: "J00", description: "Nasofaringite aguda (resfriado comum)", category: "Respiratório" },
  { code: "J01", description: "Sinusite aguda", category: "Respiratório" },
  { code: "J02", description: "Faringite aguda", category: "Respiratório" },
  { code: "J03", description: "Amigdalite aguda", category: "Respiratório" },
  { code: "J06", description: "Infecções agudas das vias aéreas superiores", category: "Respiratório" },
  { code: "J10", description: "Influenza devida a vírus da influenza identificado", category: "Respiratório" },
  { code: "J11", description: "Influenza devida a vírus não identificado", category: "Respiratório" },
  { code: "J12", description: "Pneumonia viral", category: "Respiratório" },
  { code: "J13", description: "Pneumonia devida a Streptococcus pneumoniae", category: "Respiratório" },
  { code: "J14", description: "Pneumonia devida a Haemophilus infuenzae", category: "Respiratório" },
  { code: "J15", description: "Pneumonia bacteriana", category: "Respiratório" },
  { code: "J18", description: "Pneumonia por microrganismo não especificado", category: "Respiratório" },
  { code: "J18.9", description: "Pneumonia não especificada", category: "Respiratório" },
  { code: "J20", description: "Bronquite aguda", category: "Respiratório" },
  { code: "J21", description: "Bronquiolite aguda", category: "Respiratório" },
  { code: "J22", description: "Infecção aguda não especificada das vias aéreas inferiores", category: "Respiratório" },
  { code: "J30", description: "Rinite alérgica e vasomotora", category: "Respiratório" },
  { code: "J32", description: "Sinusite crônica", category: "Respiratório" },
  { code: "J35", description: "Doenças crônicas das amígdalas e adenoides", category: "Respiratório" },
  { code: "J40", description: "Bronquite não especificada como aguda ou crônica", category: "Respiratório" },
  { code: "J42", description: "Bronquite crônica não especificada", category: "Respiratório" },
  { code: "J43", description: "Enfisema", category: "Respiratório" },
  { code: "J44", description: "Outras doenças pulmonares obstrutivas crônicas", category: "Respiratório" },
  { code: "J44.1", description: "DPOC com exacerbação aguda", category: "Respiratório" },
  { code: "J45", description: "Asma", category: "Respiratório" },
  { code: "J46", description: "Estado de mal asmático", category: "Respiratório" },
  { code: "J47", description: "Bronquiectasia", category: "Respiratório" },
  { code: "J69", description: "Pneumonite devida a sólidos e líquidos", category: "Respiratório" },
  { code: "J80", description: "Síndrome do desconforto respiratório do adulto (SDRA)", category: "Respiratório" },
  { code: "J81", description: "Edema pulmonar", category: "Respiratório" },
  { code: "J84", description: "Outras doenças pulmonares intersticiais", category: "Respiratório" },
  { code: "J90", description: "Derrame pleural", category: "Respiratório" },
  { code: "J93", description: "Pneumotórax", category: "Respiratório" },
  { code: "J96", description: "Insuficiência respiratória", category: "Respiratório" },
  { code: "J96.0", description: "Insuficiência respiratória aguda", category: "Respiratório" },
  { code: "J96.1", description: "Insuficiência respiratória crônica", category: "Respiratório" },
  { code: "J98", description: "Outros transtornos respiratórios", category: "Respiratório" },
  
  // Doenças do aparelho digestivo (K00-K93)
  { code: "K20", description: "Esofagite", category: "Digestivo" },
  { code: "K21", description: "Doença de refluxo gastroesofágico", category: "Digestivo" },
  { code: "K25", description: "Úlcera gástrica", category: "Digestivo" },
  { code: "K26", description: "Úlcera duodenal", category: "Digestivo" },
  { code: "K27", description: "Úlcera péptica de localização não especificada", category: "Digestivo" },
  { code: "K29", description: "Gastrite e duodenite", category: "Digestivo" },
  { code: "K35", description: "Apendicite aguda", category: "Digestivo" },
  { code: "K40", description: "Hérnia inguinal", category: "Digestivo" },
  { code: "K42", description: "Hérnia umbilical", category: "Digestivo" },
  { code: "K43", description: "Hérnia ventral", category: "Digestivo" },
  { code: "K50", description: "Doença de Crohn", category: "Digestivo" },
  { code: "K51", description: "Colite ulcerativa", category: "Digestivo" },
  { code: "K56", description: "Íleo paralítico e obstrução intestinal sem hérnia", category: "Digestivo" },
  { code: "K57", description: "Doença diverticular do intestino", category: "Digestivo" },
  { code: "K59", description: "Outros transtornos funcionais do intestino", category: "Digestivo" },
  { code: "K65", description: "Peritonite", category: "Digestivo" },
  { code: "K70", description: "Doença alcoólica do fígado", category: "Digestivo" },
  { code: "K72", description: "Insuficiência hepática", category: "Digestivo" },
  { code: "K74", description: "Fibrose e cirrose hepáticas", category: "Digestivo" },
  { code: "K76", description: "Outras doenças do fígado", category: "Digestivo" },
  { code: "K80", description: "Colelitíase", category: "Digestivo" },
  { code: "K80.0", description: "Calculose da vesícula biliar com colecistite aguda", category: "Digestivo" },
  { code: "K81", description: "Colecistite", category: "Digestivo" },
  { code: "K85", description: "Pancreatite aguda", category: "Digestivo" },
  { code: "K86", description: "Outras doenças do pâncreas", category: "Digestivo" },
  { code: "K92", description: "Outras doenças do aparelho digestivo", category: "Digestivo" },
  { code: "K92.0", description: "Hematêmese", category: "Digestivo" },
  { code: "K92.1", description: "Melena", category: "Digestivo" },
  { code: "K92.2", description: "Hemorragia gastrointestinal não especificada", category: "Digestivo" },
  
  // Doenças da pele (L00-L99)
  { code: "L02", description: "Abscesso cutâneo, furúnculo e carbúnculo", category: "Pele" },
  { code: "L03", description: "Celulite", category: "Pele" },
  { code: "L08", description: "Outras infecções locais da pele e do tecido subcutâneo", category: "Pele" },
  { code: "L20", description: "Dermatite atópica", category: "Pele" },
  { code: "L40", description: "Psoríase", category: "Pele" },
  { code: "L50", description: "Urticária", category: "Pele" },
  { code: "L89", description: "Úlcera de decúbito", category: "Pele" },
  { code: "L97", description: "Úlcera dos membros inferiores", category: "Pele" },
  
  // Doenças do sistema osteomuscular (M00-M99)
  { code: "M05", description: "Artrite reumatoide soropositiva", category: "Osteomuscular" },
  { code: "M06", description: "Outras artrites reumatoides", category: "Osteomuscular" },
  { code: "M10", description: "Gota", category: "Osteomuscular" },
  { code: "M15", description: "Poliartrose", category: "Osteomuscular" },
  { code: "M16", description: "Coxartrose (artrose do quadril)", category: "Osteomuscular" },
  { code: "M17", description: "Gonartrose (artrose do joelho)", category: "Osteomuscular" },
  { code: "M19", description: "Outras artroses", category: "Osteomuscular" },
  { code: "M32", description: "Lúpus eritematoso sistêmico", category: "Osteomuscular" },
  { code: "M34", description: "Esclerose sistêmica", category: "Osteomuscular" },
  { code: "M35", description: "Outras doenças sistêmicas do tecido conjuntivo", category: "Osteomuscular" },
  { code: "M43", description: "Outras dorsopatias deformantes", category: "Osteomuscular" },
  { code: "M47", description: "Espondilose", category: "Osteomuscular" },
  { code: "M48", description: "Outras espondilopatias", category: "Osteomuscular" },
  { code: "M50", description: "Transtornos de discos cervicais", category: "Osteomuscular" },
  { code: "M51", description: "Outros transtornos de discos intervertebrais", category: "Osteomuscular" },
  { code: "M54", description: "Dorsalgia", category: "Osteomuscular" },
  { code: "M54.5", description: "Dor lombar baixa", category: "Osteomuscular" },
  { code: "M62", description: "Outros transtornos musculares", category: "Osteomuscular" },
  { code: "M75", description: "Lesões do ombro", category: "Osteomuscular" },
  { code: "M79", description: "Outros transtornos de tecidos moles", category: "Osteomuscular" },
  { code: "M80", description: "Osteoporose com fratura patológica", category: "Osteomuscular" },
  { code: "M81", description: "Osteoporose sem fratura patológica", category: "Osteomuscular" },
  { code: "M84", description: "Transtornos da continuidade do osso", category: "Osteomuscular" },
  
  // Doenças do aparelho geniturinário (N00-N99)
  { code: "N00", description: "Síndrome nefrítica aguda", category: "Geniturinário" },
  { code: "N03", description: "Síndrome nefrítica crônica", category: "Geniturinário" },
  { code: "N04", description: "Síndrome nefrótica", category: "Geniturinário" },
  { code: "N10", description: "Nefrite tubulo-intersticial aguda", category: "Geniturinário" },
  { code: "N12", description: "Nefrite tubulo-intersticial não especificada", category: "Geniturinário" },
  { code: "N17", description: "Insuficiência renal aguda", category: "Geniturinário" },
  { code: "N17.9", description: "Insuficiência renal aguda não especificada", category: "Geniturinário" },
  { code: "N18", description: "Insuficiência renal crônica", category: "Geniturinário" },
  { code: "N18.5", description: "Doença renal crônica estágio 5", category: "Geniturinário" },
  { code: "N19", description: "Insuficiência renal não especificada", category: "Geniturinário" },
  { code: "N20", description: "Calculose do rim e do ureter", category: "Geniturinário" },
  { code: "N23", description: "Cólica renal não especificada", category: "Geniturinário" },
  { code: "N30", description: "Cistite", category: "Geniturinário" },
  { code: "N39", description: "Outros transtornos do aparelho urinário", category: "Geniturinário" },
  { code: "N39.0", description: "Infecção do trato urinário", category: "Geniturinário" },
  { code: "N40", description: "Hiperplasia da próstata", category: "Geniturinário" },
  { code: "N41", description: "Doenças inflamatórias da próstata", category: "Geniturinário" },
  { code: "N80", description: "Endometriose", category: "Geniturinário" },
  { code: "N83", description: "Transtornos não-inflamatórios do ovário", category: "Geniturinário" },
  
  // Gravidez, parto e puerpério (O00-O99)
  { code: "O00", description: "Gravidez ectópica", category: "Gravidez" },
  { code: "O03", description: "Aborto espontâneo", category: "Gravidez" },
  { code: "O14", description: "Pré-eclâmpsia", category: "Gravidez" },
  { code: "O15", description: "Eclâmpsia", category: "Gravidez" },
  { code: "O20", description: "Hemorragia do início da gravidez", category: "Gravidez" },
  { code: "O24", description: "Diabetes mellitus na gravidez", category: "Gravidez" },
  { code: "O42", description: "Ruptura prematura de membranas", category: "Gravidez" },
  { code: "O60", description: "Trabalho de parto pré-termo", category: "Gravidez" },
  { code: "O72", description: "Hemorragia pós-parto", category: "Gravidez" },
  { code: "O80", description: "Parto único espontâneo", category: "Gravidez" },
  { code: "O82", description: "Parto único por cesariana", category: "Gravidez" },
  
  // Afecções perinatais (P00-P96)
  { code: "P07", description: "Transtornos relacionados com gestação de curta duração e peso baixo", category: "Perinatal" },
  { code: "P22", description: "Desconforto respiratório do recém-nascido", category: "Perinatal" },
  { code: "P36", description: "Septicemia bacteriana do recém-nascido", category: "Perinatal" },
  { code: "P59", description: "Icterícia neonatal", category: "Perinatal" },
  
  // Malformações congênitas (Q00-Q99)
  { code: "Q20", description: "Malformações congênitas das câmaras e das comunicações cardíacas", category: "Congênitas" },
  { code: "Q21", description: "Malformações congênitas dos septos cardíacos", category: "Congênitas" },
  { code: "Q23", description: "Malformações congênitas das valvas aórtica e mitral", category: "Congênitas" },
  { code: "Q25", description: "Malformações congênitas das grandes artérias", category: "Congênitas" },
  
  // Sintomas e sinais (R00-R99)
  { code: "R00", description: "Anormalidades do batimento cardíaco", category: "Sintomas" },
  { code: "R04", description: "Hemorragia das vias respiratórias", category: "Sintomas" },
  { code: "R05", description: "Tosse", category: "Sintomas" },
  { code: "R06", description: "Anormalidades da respiração", category: "Sintomas" },
  { code: "R06.0", description: "Dispneia", category: "Sintomas" },
  { code: "R07", description: "Dor de garganta e no peito", category: "Sintomas" },
  { code: "R07.4", description: "Dor torácica não especificada", category: "Sintomas" },
  { code: "R09.2", description: "Parada respiratória", category: "Sintomas" },
  { code: "R10", description: "Dor abdominal e pélvica", category: "Sintomas" },
  { code: "R11", description: "Náusea e vômitos", category: "Sintomas" },
  { code: "R13", description: "Disfagia", category: "Sintomas" },
  { code: "R17", description: "Icterícia não especificada", category: "Sintomas" },
  { code: "R18", description: "Ascite", category: "Sintomas" },
  { code: "R19.7", description: "Diarreia não especificada", category: "Sintomas" },
  { code: "R40", description: "Sonolência, estupor e coma", category: "Sintomas" },
  { code: "R42", description: "Tontura e instabilidade", category: "Sintomas" },
  { code: "R50", description: "Febre de origem desconhecida", category: "Sintomas" },
  { code: "R50.9", description: "Febre não especificada", category: "Sintomas" },
  { code: "R51", description: "Cefaleia", category: "Sintomas" },
  { code: "R55", description: "Síncope e colapso", category: "Sintomas" },
  { code: "R56", description: "Convulsões", category: "Sintomas" },
  { code: "R57", description: "Choque não classificado em outra parte", category: "Sintomas" },
  { code: "R57.0", description: "Choque cardiogênico", category: "Sintomas" },
  { code: "R57.1", description: "Choque hipovolêmico", category: "Sintomas" },
  { code: "R57.2", description: "Choque séptico", category: "Sintomas" },
  { code: "R58", description: "Hemorragia não classificada em outra parte", category: "Sintomas" },
  { code: "R59", description: "Aumento de volume dos gânglios linfáticos", category: "Sintomas" },
  { code: "R63", description: "Sintomas e sinais relativos à ingestão de alimentos e líquidos", category: "Sintomas" },
  { code: "R64", description: "Caquexia", category: "Sintomas" },
  { code: "R68.8", description: "Outros sintomas e sinais gerais especificados", category: "Sintomas" },
  
  // Lesões e causas externas (S00-T98)
  { code: "S06", description: "Traumatismo intracraniano", category: "Lesões" },
  { code: "S22", description: "Fratura de costela(s), esterno e coluna torácica", category: "Lesões" },
  { code: "S32", description: "Fratura da coluna lombar e da pelve", category: "Lesões" },
  { code: "S42", description: "Fratura do ombro e do braço", category: "Lesões" },
  { code: "S52", description: "Fratura do antebraço", category: "Lesões" },
  { code: "S62", description: "Fratura ao nível do punho e da mão", category: "Lesões" },
  { code: "S72", description: "Fratura do fêmur", category: "Lesões" },
  { code: "S72.0", description: "Fratura do colo do fêmur", category: "Lesões" },
  { code: "S82", description: "Fratura da perna, incluindo tornozelo", category: "Lesões" },
  { code: "S92", description: "Fratura do pé", category: "Lesões" },
  { code: "T14", description: "Traumatismo de região não especificada do corpo", category: "Lesões" },
  { code: "T30", description: "Queimadura e corrosão de região não especificada", category: "Lesões" },
  { code: "T36", description: "Intoxicação por antibióticos sistêmicos", category: "Lesões" },
  { code: "T40", description: "Intoxicação por narcóticos e psicodislépticos", category: "Lesões" },
  { code: "T42", description: "Intoxicação por antiepilépticos, sedativo-hipnóticos", category: "Lesões" },
  { code: "T50", description: "Intoxicação por diuréticos e outras drogas", category: "Lesões" },
  { code: "T78.2", description: "Choque anafilático não especificado", category: "Lesões" },
  { code: "T79", description: "Algumas complicações precoces de traumatismos", category: "Lesões" },
  { code: "T81", description: "Complicações de procedimentos", category: "Lesões" },
  { code: "T84", description: "Complicações de dispositivos protéticos ortopédicos internos", category: "Lesões" },
  { code: "T85", description: "Complicações de outros dispositivos protéticos internos", category: "Lesões" },
  { code: "T88", description: "Outras complicações de cuidados médicos e cirúrgicos", category: "Lesões" },
  
  // Causas externas (V01-Y98)
  { code: "W01", description: "Queda no mesmo nível por escorregão, tropeção ou passos em falso", category: "Externas" },
  { code: "W06", description: "Queda de um leito", category: "Externas" },
  { code: "W10", description: "Queda em ou de escadas ou degraus", category: "Externas" },
  { code: "W19", description: "Queda sem especificação", category: "Externas" },
  { code: "X59", description: "Exposição a fatores não especificados", category: "Externas" },
  
  // Fatores que influenciam o estado de saúde (Z00-Z99)
  { code: "Z00", description: "Exame geral e investigação de pessoas sem queixas", category: "Fatores" },
  { code: "Z03", description: "Observação e avaliação médica por doenças suspeitas", category: "Fatores" },
  { code: "Z23", description: "Necessidade de imunização", category: "Fatores" },
  { code: "Z51", description: "Outros cuidados médicos", category: "Fatores" },
  { code: "Z51.1", description: "Sessão de quimioterapia por neoplasia", category: "Fatores" },
  { code: "Z51.5", description: "Cuidado paliativo", category: "Fatores" },
  { code: "Z87", description: "História pessoal de outras doenças e afecções", category: "Fatores" },
  { code: "Z95", description: "Presença de implantes e enxertos cardíacos e vasculares", category: "Fatores" },
  { code: "Z96", description: "Presença de outros implantes funcionais", category: "Fatores" },
  
  // Dor (específicos)
  { code: "G89", description: "Dor não classificada em outra parte", category: "Nervoso" },
  { code: "G89.0", description: "Dor central não classificada em outra parte", category: "Nervoso" },
  { code: "G89.1", description: "Dor aguda não classificada em outra parte", category: "Nervoso" },
  { code: "G89.2", description: "Dor crônica não classificada em outra parte", category: "Nervoso" },
  { code: "G89.3", description: "Dor neoplásica (relacionada a tumor)", category: "Nervoso" },
  { code: "G89.4", description: "Síndrome dolorosa crônica", category: "Nervoso" },
  { code: "R52", description: "Dor não classificada em outra parte", category: "Sintomas" },
  { code: "M54.2", description: "Cervicalgia", category: "Osteomuscular" },
  { code: "M54.4", description: "Lumbago com ciática", category: "Osteomuscular" },
  { code: "M79.1", description: "Mialgia", category: "Osteomuscular" },
  { code: "M79.3", description: "Paniculite não especificada", category: "Osteomuscular" },
  { code: "M79.6", description: "Dor em membro", category: "Osteomuscular" },
  { code: "M79.7", description: "Fibromialgia", category: "Osteomuscular" },
];

// ==================== MULTI-CID COMPONENT ====================

interface CID10SearchProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  showVoiceButton?: boolean;
  multiple?: boolean;
}

export function CID10Search({
  value,
  onChange,
  label = "Diagnóstico (CID-10)",
  placeholder = "Digite o código CID ou nome da doença...",
  className,
  showVoiceButton = true,
  multiple = true,
}: CID10SearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<typeof CID10_DATABASE>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse multiple CIDs from value (separated by " | ")
  const selectedCIDs = value ? value.split(" | ").filter(Boolean) : [];

  // Filter results based on query
  useEffect(() => {
    if (query.length < 2) {
      setFilteredResults([]);
      setIsOpen(false);
      return;
    }

    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const results = CID10_DATABASE.filter((item) => {
      const normalizedCode = item.code.toLowerCase();
      const normalizedDesc = item.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Don't show already selected items
      const formattedValue = `${item.code} - ${item.description}`;
      if (selectedCIDs.includes(formattedValue)) return false;
      
      return normalizedCode.includes(normalizedQuery) || normalizedDesc.includes(normalizedQuery);
    }).slice(0, 20);

    setFilteredResults(results);
    setIsOpen(results.length > 0);
    setSelectedIndex(0);
  }, [query, value]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          selectItem(filteredResults[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  }, [isOpen, filteredResults, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectItem = (item: typeof CID10_DATABASE[0]) => {
    const formattedValue = `${item.code} - ${item.description}`;
    
    if (multiple) {
      // Add to existing selections
      const newCIDs = [...selectedCIDs, formattedValue];
      onChange(newCIDs.join(" | "));
    } else {
      onChange(formattedValue);
    }
    
    setQuery("");
    setIsOpen(false);
    
    // Keep focus for adding more
    if (multiple) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const removeCID = (cidToRemove: string) => {
    const newCIDs = selectedCIDs.filter(c => c !== cidToRemove);
    onChange(newCIDs.join(" | "));
  };

  const clearAll = () => {
    onChange("");
    setQuery("");
    inputRef.current?.focus();
  };

  const handleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      toast.success(`Buscando: "${transcript}"`);
    };

    recognition.onerror = (event: any) => {
      toast.error("Erro no reconhecimento de voz");
      console.error(event.error);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  }, []);

  return (
    <div className={cn("space-y-2 relative", className)} ref={containerRef}>
      {label && <Label>{label}</Label>}
      
      {/* Selected CIDs display */}
      {selectedCIDs.length > 0 && (
        <div className="space-y-1.5">
          {selectedCIDs.map((cid, index) => {
            const code = cid.split(" - ")[0];
            const desc = cid.split(" - ").slice(1).join(" - ");
            return (
              <div 
                key={index} 
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-lg border",
                  index === 0 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-muted/30 border-border"
                )}
              >
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-mono text-xs shrink-0",
                    index === 0 && "bg-primary/10 text-primary border-primary/30"
                  )}
                >
                  {code}
                </Badge>
                {index === 0 && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Principal
                  </Badge>
                )}
                <span className="flex-1 text-sm truncate">{desc}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => removeCID(cid)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search input - always visible for adding more CIDs */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.length >= 2 && setIsOpen(true)}
              placeholder={
                selectedCIDs.length > 0 
                  ? "Adicionar outro CID..." 
                  : placeholder
              }
              className="pl-10"
            />
          </div>
          {showVoiceButton && (
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={handleVoiceInput}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
          {selectedCIDs.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearAll}
              title="Limpar todos"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Dropdown results */}
        {isOpen && filteredResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg">
            <ScrollArea className="max-h-[300px]">
              <div ref={listRef} className="p-1">
                {filteredResults.map((item, index) => (
                  <div
                    key={item.code}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                      index === selectedIndex
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                    onClick={() => selectItem(item)}
                  >
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-mono text-xs shrink-0",
                        index === selectedIndex && "bg-primary/20 border-primary/40"
                      )}
                    >
                      {item.code}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.description}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* No results message */}
        {query.length >= 2 && filteredResults.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
            Nenhum CID encontrado para "{query}"
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {multiple 
          ? "Digite o código CID (ex: J18.9) ou o nome da doença. O primeiro CID adicionado será o principal. Pode adicionar vários."
          : "Digite o código CID (ex: J18.9) ou o nome da doença (ex: pneumonia)"
        }
      </p>
    </div>
  );
}

export default CID10Search;
