import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Loader2, 
  Check, 
  X, 
  Edit2, 
  AlertCircle,
  Volume2,
  Pause,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ExtractedData {
  name: string;
  age?: string;
  diagnosis?: string;
  diagnosisCode?: string;
  bed?: string;
  insurance?: string;
  confidence: number;
}

interface VoicePatientInputProps {
  onDataExtracted: (data: ExtractedData) => void;
  onClose: () => void;
}

export function VoicePatientInput({ onDataExtracted, onClose }: VoicePatientInputProps) {
  const { t } = useTranslation();
  
  const [step, setStep] = useState<"recording" | "processing" | "review">("recording");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  const analyzeVoice = trpc.patients.analyzeVoice.useMutation();

  const startRecording = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Reconhecimento de voz requer Chrome ou Edge com HTTPS. Tente usar a opção de colar texto.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript(prev => prev + finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'no-speech') {
        toast.error("Erro no reconhecimento de voz");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const processTranscript = async () => {
    if (!transcript.trim()) {
      toast.error("Nenhum texto foi capturado. Tente novamente.");
      return;
    }

    setStep("processing");
    setIsProcessing(true);

    try {
      const result = await analyzeVoice.mutateAsync({ transcript });
      
      setExtractedData({
        name: result.name || "",
        age: result.age || "",
        diagnosis: result.diagnosis || "",
        diagnosisCode: result.diagnosisCode || "",
        bed: result.bed || "",
        insurance: result.insurance || "",
        confidence: result.confidence || 0,
      });
      
      setStep("review");
    } catch (error) {
      console.error("Error processing voice:", error);
      toast.error("Erro ao processar áudio. Tente novamente.");
      setStep("recording");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmData = () => {
    if (!extractedData) return;
    
    if (!extractedData.name) {
      toast.error("Nome do paciente é obrigatório");
      return;
    }
    
    onDataExtracted(extractedData);
    toast.success("Dados extraídos com sucesso!");
    onClose();
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return <Badge className="bg-green-500">Alta confiança ({confidence}%)</Badge>;
    } else if (confidence >= 70) {
      return <Badge className="bg-yellow-500">Média confiança ({confidence}%)</Badge>;
    } else {
      return <Badge className="bg-red-500">Baixa confiança ({confidence}%)</Badge>;
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Cadastro por Voz
          </DialogTitle>
          <DialogDescription>
            {step === "recording" && "Fale os dados do paciente de forma natural"}
            {step === "processing" && "Processando sua fala..."}
            {step === "review" && "Revise os dados extraídos antes de confirmar"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Recording */}
        {step === "recording" && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Dica:</strong> Fale naturalmente, por exemplo:
              </p>
              <p className="text-sm italic">
                "Paciente João da Silva, 45 anos, leito 201-A, diagnóstico de pneumonia, convênio Unimed"
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 py-6">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className={cn(
                  "w-24 h-24 rounded-full",
                  isRecording && "animate-pulse"
                )}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <MicOff className="w-10 h-10" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                {isRecording ? "Clique para parar" : "Clique para gravar"}
              </p>
            </div>

            {transcript && (
              <div className="space-y-2">
                <Label>Texto capturado:</Label>
                <div className="p-3 bg-muted rounded-lg text-sm max-h-32 overflow-y-auto">
                  {transcript}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Processing */}
        {step === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Analisando sua fala...</p>
            <p className="text-sm text-muted-foreground">
              Extraindo dados do paciente
            </p>
          </div>
        )}

        {/* Step 3: Review */}
        {step === "review" && extractedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confiança da extração:</span>
              {getConfidenceBadge(extractedData.confidence)}
            </div>

            <div className="space-y-3">
              <div>
                <Label>Nome do paciente *</Label>
                <Input
                  value={extractedData.name}
                  onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Idade</Label>
                  <Input
                    value={extractedData.age}
                    onChange={(e) => setExtractedData({ ...extractedData, age: e.target.value })}
                    placeholder="Ex: 45 anos"
                  />
                </div>
                <div>
                  <Label>Leito</Label>
                  <Input
                    value={extractedData.bed}
                    onChange={(e) => setExtractedData({ ...extractedData, bed: e.target.value })}
                    placeholder="Ex: 201-A"
                  />
                </div>
              </div>

              <div>
                <Label>Diagnóstico</Label>
                <Input
                  value={extractedData.diagnosis}
                  onChange={(e) => setExtractedData({ ...extractedData, diagnosis: e.target.value })}
                  placeholder="Diagnóstico principal"
                />
              </div>

              <div>
                <Label>Código CID-10</Label>
                <Input
                  value={extractedData.diagnosisCode}
                  onChange={(e) => setExtractedData({ ...extractedData, diagnosisCode: e.target.value })}
                  placeholder="Ex: J18.9"
                />
              </div>

              <div>
                <Label>Convênio</Label>
                <Input
                  value={extractedData.insurance}
                  onChange={(e) => setExtractedData({ ...extractedData, insurance: e.target.value })}
                  placeholder="Ex: Unimed, Particular"
                />
              </div>
            </div>

            {/* Warning for low confidence */}
            {extractedData.confidence < 70 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  A confiança da extração está baixa. Por favor, revise todos os campos cuidadosamente.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === "recording" && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={processTranscript}
                disabled={!transcript.trim() || isRecording}
              >
                <Check className="w-4 h-4 mr-2" />
                Processar
              </Button>
            </>
          )}
          
          {step === "processing" && (
            <Button variant="outline" onClick={() => setStep("recording")}>
              Cancelar
            </Button>
          )}
          
          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => {
                setStep("recording");
                setTranscript("");
              }}>
                Gravar novamente
              </Button>
              <Button onClick={confirmData}>
                <Check className="w-4 h-4 mr-2" />
                Confirmar dados
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VoicePatientInput;
