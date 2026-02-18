import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  Mic,
  Sparkles,
  Stethoscope,
  Users,
  User,
  Brain,
  Zap,
  Search,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  AlertCircle,
  XCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { HospitalSearch } from "@/components/HospitalSearch";
import { useTranslation } from "@/i18n";
import { Badge } from "@/components/ui/badge";

type ProfessionalType = 'medico' | 'enfermeiro' | 'fisioterapeuta' | 'nutricionista' | 'farmaceutico' | 'psicologo' | 'fonoaudiologo' | 'terapeuta_ocupacional' | 'estudante' | 'gestor' | 'outro';

const PROFESSIONAL_TYPES: { value: ProfessionalType; label: string; icon: React.ReactNode; council?: string }[] = [
  { value: 'medico', label: 'Médico(a)', icon: <Stethoscope className="w-5 h-5" />, council: 'CRM' },
  { value: 'enfermeiro', label: 'Enfermeiro(a)', icon: <Stethoscope className="w-5 h-5" />, council: 'COREN' },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta', icon: <Stethoscope className="w-5 h-5" />, council: 'CREFITO' },
  { value: 'nutricionista', label: 'Nutricionista', icon: <Stethoscope className="w-5 h-5" />, council: 'CRN' },
  { value: 'farmaceutico', label: 'Farmacêutico(a)', icon: <Stethoscope className="w-5 h-5" />, council: 'CRF' },
  { value: 'psicologo', label: 'Psicólogo(a)', icon: <Stethoscope className="w-5 h-5" />, council: 'CRP' },
  { value: 'fonoaudiologo', label: 'Fonoaudiólogo(a)', icon: <Stethoscope className="w-5 h-5" />, council: 'CRFa' },
  { value: 'terapeuta_ocupacional', label: 'Terapeuta Ocupacional', icon: <Stethoscope className="w-5 h-5" />, council: 'COFFITO' },
  { value: 'estudante', label: 'Estudante', icon: <GraduationCap className="w-5 h-5" /> },
  { value: 'gestor', label: 'Gestor Hospitalar', icon: <Briefcase className="w-5 h-5" /> },
  { value: 'outro', label: 'Outro Profissional', icon: <Users className="w-5 h-5" /> },
];

const BRAZILIAN_STATES = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
];

const SPECIALTIES = [
  'Acupuntura', 'Alergia e Imunologia', 'Anestesiologia', 'Angiologia', 'Cancerologia',
  'Cardiologia', 'Cirurgia Cardiovascular', 'Cirurgia da Mão', 'Cirurgia de Cabeça e Pescoço',
  'Cirurgia do Aparelho Digestivo', 'Cirurgia Geral', 'Cirurgia Pediátrica', 'Cirurgia Plástica',
  'Cirurgia Torácica', 'Cirurgia Vascular', 'Clínica Médica', 'Coloproctologia',
  'Dermatologia', 'Endocrinologia', 'Endoscopia', 'Gastroenterologia', 'Genética Médica',
  'Geriatria', 'Ginecologia e Obstetrícia', 'Hematologia', 'Homeopatia', 'Infectologia',
  'Mastologia', 'Medicina de Emergência', 'Medicina de Família e Comunidade',
  'Medicina do Trabalho', 'Medicina Esportiva', 'Medicina Física e Reabilitação',
  'Medicina Intensiva', 'Medicina Legal', 'Medicina Nuclear', 'Medicina Preventiva',
  'Nefrologia', 'Neurocirurgia', 'Neurologia', 'Nutrologia', 'Oftalmologia',
  'Ortopedia e Traumatologia', 'Otorrinolaringologia', 'Patologia', 'Pediatria',
  'Pneumologia', 'Psiquiatria', 'Radiologia', 'Radioterapia', 'Reumatologia',
  'Urologia'
];

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { t } = useTranslation();

  // Steps: 1=Profile, 2=Mode, 3=Hospital, 4=Team (team mode only), 5=Demo Patient
  const [step, setStep] = useState(1);
  const [useMode, setUseMode] = useState<"personal" | "team" | null>(null);

  // Display helpers for progress bar
  const totalSteps = useMode === "personal" ? 4 : 5;
  const displayStep = (useMode === "personal" && step === 5) ? 4 : step;

  // Step 1: Professional Profile
  const [professionalType, setProfessionalType] = useState<ProfessionalType | ''>('');
  const [specialty, setSpecialty] = useState("");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [cpf, setCpf] = useState("");
  const [councilNumber, setCouncilNumber] = useState("");
  const [councilState, setCouncilState] = useState("");
  const [rqeNumber, setRqeNumber] = useState("");
  const [rqeSpecialty, setRqeSpecialty] = useState("");
  const [university, setUniversity] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [institutionalRole, setInstitutionalRole] = useState("");
  const [phone, setPhone] = useState("");

  // Validation states
  const [cpfValid, setCpfValid] = useState<boolean | null>(null);
  const [cpfError, setCpfError] = useState("");
  const [crmValid, setCrmValid] = useState<boolean | null>(null);
  const [crmMessage, setCrmMessage] = useState("");

  // Step 3: Hospital
  const [selectedHospital, setSelectedHospital] = useState<{ id: number; name: string } | null>(null);
  const [newHospitalName, setNewHospitalName] = useState("");
  const [showNewHospitalForm, setShowNewHospitalForm] = useState(false);

  // Step 4: Team (team mode only)
  const [teamName, setTeamName] = useState("");

  // Step 5: Demo patient
  const [demoPatientName, setDemoPatientName] = useState("");
  const [demoBed, setDemoBed] = useState("");

  const updateProfile = trpc.profile.update.useMutation();
  const validateCpf = trpc.profile.validateCpf.useMutation();
  const verifyCRM = trpc.profile.verifyCRM.useMutation();
  const createHospital = trpc.hospitals.create.useMutation();
  const createTeam = trpc.teams.create.useMutation();
  const quickSetup = trpc.teams.quickSetup.useMutation();
  const createPatient = trpc.patients.create.useMutation();
  const createAdmission = trpc.admissions.create.useMutation();
  const completeOnboarding = trpc.profile.completeOnboarding.useMutation();

  const [isLoading, setIsLoading] = useState(false);
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);

  const selectedProfType = PROFESSIONAL_TYPES.find(p => p.value === professionalType);
  const needsCouncil = selectedProfType?.council !== undefined;
  const isStudent = professionalType === 'estudante';
  const isManager = professionalType === 'gestor';
  const isDoctor = professionalType === 'medico';

  const filteredSpecialties = useMemo(() => {
    if (!specialtySearch) return SPECIALTIES;
    return SPECIALTIES.filter(s => s.toLowerCase().includes(specialtySearch.toLowerCase()));
  }, [specialtySearch]);

  // CPF mask
  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  // Phone mask
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleCpfChange = (value: string) => {
    const formatted = formatCpf(value);
    setCpf(formatted);
    setCpfValid(null);
    setCpfError("");
  };

  const handleCpfBlur = async () => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length === 11) {
      const result = await validateCpf.mutateAsync({ cpf: cleanCpf });
      setCpfValid(result.valid);
      if (!result.valid) setCpfError(result.error || 'CPF inválido');
    }
  };

  const handleCrmBlur = async () => {
    if (councilNumber && councilState && isDoctor) {
      const result = await verifyCRM.mutateAsync({ crm: councilNumber, state: councilState });
      setCrmValid(result.valid);
      setCrmMessage(result.valid ? (result.message || '') : (result.error || ''));
    }
  };

  const handleBack = () => {
    // In personal mode, skip team step (step 4) when going backwards from demo patient (step 5)
    if (step === 5 && useMode === "personal") {
      setStep(3);
    } else {
      setStep(step - 1);
    }
  };

  const handleSkip = async () => {
    try {
      await completeOnboarding.mutateAsync();
    } catch {
      // non-critical
    }
    setLocation("/dashboard");
  };

  const handleNext = async () => {
    setIsLoading(true);

    try {
      switch (step) {
        case 1: // Professional Profile
          if (!professionalType) {
            toast.error("Selecione seu tipo profissional");
            return;
          }

          const profileData: any = {
            professionalType,
            phone: phone.replace(/\D/g, '') || undefined,
            cpf: cpf.replace(/\D/g, '') || undefined,
          };

          if (needsCouncil) {
            if (!councilNumber.trim()) {
              toast.error(`Informe o número do ${selectedProfType?.council}`);
              return;
            }
            if (!councilState) {
              toast.error("Selecione o estado (UF)");
              return;
            }
            profileData.councilType = selectedProfType?.council;
            profileData.councilNumber = councilNumber;
            profileData.councilState = councilState;
            profileData.specialty = specialty || undefined;

            if (isDoctor && rqeNumber) {
              profileData.rqeNumber = rqeNumber;
              profileData.rqeSpecialty = rqeSpecialty || specialty;
            }
          } else if (isStudent) {
            if (!university.trim()) {
              toast.error("Informe a universidade");
              return;
            }
            profileData.university = university;
            profileData.graduationYear = graduationYear ? parseInt(graduationYear) : undefined;
            profileData.enrollmentNumber = enrollmentNumber || undefined;
          } else if (isManager) {
            if (!institutionalRole.trim()) {
              toast.error("Informe seu cargo");
              return;
            }
            profileData.institutionalRole = institutionalRole;
          }

          await updateProfile.mutateAsync(profileData);
          break;

        case 2: // Mode selection — cards auto-advance, button is fallback
          if (!useMode) {
            toast.error("Selecione como vai usar o sistema");
            return;
          }
          break;

        case 3: // Hospital
          let resolvedHospitalId: number | null = null;
          if (selectedHospital) {
            resolvedHospitalId = selectedHospital.id;
          } else if (showNewHospitalForm && newHospitalName.trim()) {
            const code = newHospitalName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 5);
            const hospital = await createHospital.mutateAsync({
              name: newHospitalName,
              code: code + Math.random().toString(36).slice(2, 5).toUpperCase()
            });
            resolvedHospitalId = hospital.id;
          } else {
            toast.error("Selecione ou cadastre um hospital");
            return;
          }
          setHospitalId(resolvedHospitalId);

          if (useMode === "personal") {
            // Create personal team automatically and skip to demo patient
            const setup = await quickSetup.mutateAsync({
              mode: "personal",
              hospitalId: resolvedHospitalId
            });
            setTeamId(setup.teamId);
            setIsLoading(false);
            setStep(5);
            return;
          }
          break;

        case 4: // Team (team mode only)
          if (!hospitalId) {
            toast.error("Erro: hospital não encontrado");
            return;
          }
          if (!teamName.trim()) {
            toast.error("Informe o nome da equipe");
            return;
          }
          const team = await createTeam.mutateAsync({
            name: teamName,
            hospitalId
          });
          setTeamId(team.id);
          break;

        case 5: // Demo Patient
          if (!hospitalId || !teamId) {
            toast.error("Erro: dados incompletos");
            return;
          }
          if (!demoPatientName.trim()) {
            toast.error("Informe o nome do paciente");
            return;
          }
          const patient = await createPatient.mutateAsync({
            name: demoPatientName
          });
          const admission = await createAdmission.mutateAsync({
            patientId: patient.id,
            hospitalId,
            teamId,
            bed: demoBed || "A1",
            mainDiagnosis: "Pneumonia comunitária (Demo)",
            priority: "medium"
          });
          // personal mode already called completeOnboarding via quickSetup; team mode calls it here
          if (useMode !== "personal") {
            await completeOnboarding.mutateAsync();
          }
          utils.auth.me.invalidate();
          toast.success("Onboarding concluído! Bem-vindo ao SBAR Health!");
          setLocation(`/evolution/${admission.id}`);
          return;
      }

      setStep(step + 1);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Professional Profile
        return (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Bem-vindo(a), {user?.name?.split(' ')[0]}!</CardTitle>
              <CardDescription className="text-base">
                Vamos configurar seu perfil profissional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo Profissional */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Eu sou...</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PROFESSIONAL_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setProfessionalType(type.value);
                        setCouncilNumber("");
                        setCouncilState("");
                        setRqeNumber("");
                        setRqeSpecialty("");
                        setUniversity("");
                        setGraduationYear("");
                        setEnrollmentNumber("");
                        setInstitutionalRole("");
                      }}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-all ${
                        professionalType === type.value
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      {type.icon}
                      <span className="truncate">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos adaptativos baseados no tipo */}
              {professionalType && (
                <div className="space-y-4 pt-2 border-t">
                  {/* CPF - para todos */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      CPF
                      <span className="text-xs text-muted-foreground">(opcional)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        onBlur={handleCpfBlur}
                        maxLength={14}
                      />
                      {cpfValid === true && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                      {cpfValid === false && (
                        <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                      )}
                    </div>
                    {cpfError && <p className="text-xs text-red-500">{cpfError}</p>}
                  </div>

                  {/* Telefone - para todos */}
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      placeholder="(31) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      maxLength={15}
                    />
                  </div>

                  {/* Profissionais com conselho */}
                  {needsCouncil && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-2">
                          <Label>{selectedProfType?.council} *</Label>
                          <Input
                            placeholder={`Nº do ${selectedProfType?.council}`}
                            value={councilNumber}
                            onChange={(e) => { setCouncilNumber(e.target.value); setCrmValid(null); }}
                            onBlur={handleCrmBlur}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>UF *</Label>
                          <Select value={councilState} onValueChange={setCouncilState}>
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent>
                              {BRAZILIAN_STATES.map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {crmValid !== null && (
                        <div className={`flex items-center gap-2 text-xs ${crmValid ? 'text-green-600' : 'text-red-500'}`}>
                          {crmValid ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {crmMessage}
                        </div>
                      )}

                      {/* Especialidade */}
                      <div className="space-y-2 relative">
                        <Label>Especialidade</Label>
                        <Input
                          placeholder="Buscar especialidade..."
                          value={specialtySearch || specialty}
                          onChange={(e) => {
                            setSpecialtySearch(e.target.value);
                            setSpecialty("");
                            setShowSpecialtyDropdown(true);
                          }}
                          onFocus={() => setShowSpecialtyDropdown(true)}
                          onBlur={() => setTimeout(() => setShowSpecialtyDropdown(false), 200)}
                        />
                        {showSpecialtyDropdown && filteredSpecialties.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredSpecialties.map(s => (
                              <button
                                key={s}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                                onMouseDown={() => {
                                  setSpecialty(s);
                                  setSpecialtySearch("");
                                  setShowSpecialtyDropdown(false);
                                }}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                        {specialty && (
                          <Badge variant="secondary" className="mt-1">
                            {specialty}
                            <button onClick={() => { setSpecialty(""); setSpecialtySearch(""); }} className="ml-1">×</button>
                          </Badge>
                        )}
                      </div>

                      {/* RQE - apenas para médicos, opcional */}
                      {isDoctor && (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            RQE
                            <span className="text-xs text-muted-foreground">(opcional - Registro de Qualificação de Especialista)</span>
                          </Label>
                          <Input
                            placeholder="Número do RQE"
                            value={rqeNumber}
                            onChange={(e) => setRqeNumber(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Se você é residente ou generalista, pode deixar em branco. O RQE pode ser adicionado depois.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Estudantes */}
                  {isStudent && (
                    <>
                      <div className="space-y-2">
                        <Label>Universidade *</Label>
                        <Input
                          placeholder="Ex: UFMG, USP, UNICAMP..."
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Ano previsto de formatura</Label>
                          <Input
                            placeholder="Ex: 2027"
                            value={graduationYear}
                            onChange={(e) => setGraduationYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Matrícula</Label>
                          <Input
                            placeholder="Nº matrícula"
                            value={enrollmentNumber}
                            onChange={(e) => setEnrollmentNumber(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                          <GraduationCap className="w-4 h-4 mt-0.5 shrink-0" />
                          Estudantes têm acesso ao plano Básico gratuito durante a graduação. Após a formatura, você poderá atualizar seu registro profissional.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Gestores */}
                  {isManager && (
                    <>
                      <div className="space-y-2">
                        <Label>Cargo/Função *</Label>
                        <Input
                          placeholder="Ex: Diretor Clínico, Coordenador de Enfermagem..."
                          value={institutionalRole}
                          onChange={(e) => setInstitutionalRole(e.target.value)}
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
                          <Briefcase className="w-4 h-4 mt-0.5 shrink-0" />
                          Gestores hospitalares têm acesso a funcionalidades de analytics e gestão de equipes. A verificação será feita pela equipe SBAR Health.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Outro profissional */}
                  {professionalType === 'outro' && (
                    <div className="space-y-2">
                      <Label>Profissão/Função *</Label>
                      <Input
                        placeholder="Descreva sua profissão ou função"
                        value={institutionalRole}
                        onChange={(e) => setInstitutionalRole(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 2: // Mode selection
        return (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Como vai usar o SBAR Health?</CardTitle>
              <CardDescription className="text-base">
                Escolha seu modo de trabalho — pode mudar depois
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => { setUseMode("personal"); setStep(3); }}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  useMode === "personal"
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">Uso Individual</span>
                    <Badge variant="secondary" className="text-xs">Setup em 1 clique</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gerencie seus pacientes de forma independente. Ideal para consultório, plantão ou home care.
                  </p>
                </div>
              </button>

              <button
                onClick={() => { setUseMode("team"); setStep(3); }}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  useMode === "team"
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">Com Equipe</span>
                    <Badge variant="secondary" className="text-xs">Colaboração</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Colabore com residentes e colegas. Compartilhe pacientes e evoluções com sua equipe.
                  </p>
                </div>
              </button>
            </CardContent>
          </Card>
        );

      case 3: // Hospital
        return (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Vincule-se a um hospital</CardTitle>
              <CardDescription className="text-base">
                {useMode === "personal"
                  ? "Selecione o hospital e pronto! Sua equipe pessoal será criada automaticamente."
                  : "Busque na base com mais de 250 hospitais brasileiros ou cadastre um novo"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Buscar Hospital
                </Label>
                <HospitalSearch
                  onSelect={(hospital) => {
                    setSelectedHospital({ id: hospital.id, name: hospital.name });
                    setShowNewHospitalForm(false);
                    setNewHospitalName("");
                  }}
                  onCreateNew={(name) => {
                    setNewHospitalName(name);
                    setShowNewHospitalForm(true);
                    setSelectedHospital(null);
                  }}
                  selectedHospitalId={selectedHospital?.id}
                  placeholder="Digite o nome do hospital (ex: Mater Dei, Albert Einstein...)"
                  showCreateOption={true}
                />
              </div>

              {selectedHospital && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <div>
                      <p className="font-medium text-sm">Hospital selecionado</p>
                      <p className="text-xs">{selectedHospital.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {showNewHospitalForm && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Cadastrar novo hospital
                  </p>
                  <Input
                    value={newHospitalName}
                    onChange={(e) => setNewHospitalName(e.target.value)}
                    placeholder="Nome completo do hospital"
                  />
                  <p className="text-xs text-muted-foreground">
                    O código será gerado automaticamente. Você poderá completar os dados depois em Configurações.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 4: // Team (team mode only)
        return (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Crie sua equipe</CardTitle>
              <CardDescription className="text-base">
                Sua equipe será vinculada ao hospital selecionado. Você pode adicionar membros depois.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Equipe</Label>
                <Input
                  placeholder={isDoctor ? `Ex: Equipe ${specialty || 'Cardiologia'}` : "Ex: Equipe de Enfermagem"}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3 inline mr-1" />
                  Hospital vinculado: <strong>{selectedHospital?.name || newHospitalName || "—"}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 5: // Demo Patient
        return (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Veja o sistema em ação!</CardTitle>
              <CardDescription className="text-base">
                Vamos criar um paciente demo para você experimentar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Paciente (Demo)</Label>
                <Input
                  placeholder="Ex: João Silva"
                  value={demoPatientName}
                  onChange={(e) => setDemoPatientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Leito</Label>
                <Input
                  placeholder="Ex: A1"
                  value={demoBed}
                  onChange={(e) => setDemoBed(e.target.value.toUpperCase())}
                />
              </div>

              {/* Preview of features */}
              <div className="pt-4 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">O que você vai experimentar:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs">Evolução SBAR</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Mic className="w-4 h-4 text-primary" />
                    <span className="text-xs">Entrada por voz</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-xs">IA Preditiva</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs">Auto-save</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">SBAR Health</span>
        </div>
      </header>

      {/* Progress */}
      <div className="container max-w-lg px-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Passo {displayStep} de {totalSteps}</span>
          <span className="text-sm text-muted-foreground">{Math.round((displayStep / totalSteps) * 100)}%</span>
        </div>
        <Progress value={(displayStep / totalSteps) * 100} className="h-2" />
      </div>

      {/* Content */}
      <main className="flex-1 container max-w-lg px-6 py-8 overflow-y-auto">
        {renderStep()}
      </main>

      {/* Footer */}
      <footer className="p-6 container max-w-lg">
        {/* On mode selection step, cards auto-advance so we hide the main button */}
        {step !== 2 && (
          <Button
            size="lg"
            className="w-full"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : step === 5 ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Começar a usar
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        )}

        {step > 1 && (
          <Button
            variant="ghost"
            className="w-full mt-2"
            onClick={handleBack}
            disabled={isLoading}
          >
            Voltar
          </Button>
        )}

        <div className="text-center mt-3">
          <button
            onClick={handleSkip}
            disabled={isLoading || completeOnboarding.isPending}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Pular e ir direto ao painel
          </button>
        </div>
      </footer>
    </div>
  );
}
