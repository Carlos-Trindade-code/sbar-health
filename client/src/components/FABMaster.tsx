import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  X,
  Camera,
  Mic,
  FileText,
  UserPlus,
  ClipboardList,
  LogOut,
  Archive,
  Loader2,
  Check,
  Sparkles,
  Upload,
  MicOff,
  Clipboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FABMasterProps {
  onNewPatient?: () => void;
  onNewEvolution?: (patientId?: number) => void;
  onDischarge?: (patientId?: number) => void;
  onArchive?: (patientId?: number) => void;
  currentPatientId?: number;
  isDemo?: boolean;
}

export default function FABMaster({
  onNewPatient,
  onNewEvolution,
  onDischarge,
  onArchive,
  currentPatientId,
  isDemo = false
}: FABMasterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [structuredSBAR, setStructuredSBAR] = useState<{S: string, B: string, A: string, R: string} | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (isDemo) {
      toast.success("Foto processada com sucesso!", {
        description: "Dados extraídos: Nome: João Silva, Leito: UTI-05, Diagnóstico: Pneumonia",
        icon: <Check className="w-4 h-4" />
      });
    }
    
    setIsProcessing(false);
    setShowPhotoDialog(false);
    setIsOpen(false);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    toast.info("Gravação iniciada", { description: "Fale claramente próximo ao microfone" });
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Simulate transcription processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    if (isDemo) {
      setStructuredSBAR({
        S: "Paciente consciente, orientado, afebril. PA 120x80, FC 78bpm, SpO2 98%.",
        B: "Internado há 3 dias por pneumonia comunitária. Em uso de Ceftriaxona D3.",
        A: "Boa evolução clínica. Melhora do padrão respiratório. Sem sinais de sepse.",
        R: "Manter antibioticoterapia. Solicitar RX de controle. Avaliar alta em 48h."
      });
      toast.success("Áudio transcrito e estruturado!", {
        icon: <Check className="w-4 h-4" />
      });
    }
    
    setIsProcessing(false);
  };

  const handlePasteAndProcess = async () => {
    if (!pastedText.trim()) {
      toast.error("Cole o texto da evolução primeiro");
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (isDemo) {
      // Simulate AI structuring the pasted text into SBAR
      setStructuredSBAR({
        S: "Paciente estável, sem queixas no momento. Sinais vitais dentro da normalidade.",
        B: pastedText.slice(0, 100) + "...",
        A: "Evolução favorável. Sem intercorrências nas últimas 24h.",
        R: "Manter conduta atual. Reavaliar amanhã para possível alta."
      });
      toast.success("Texto estruturado em formato SBAR!", {
        icon: <Check className="w-4 h-4" />
      });
    }
    
    setIsProcessing(false);
  };

  const handleSaveSBAR = () => {
    toast.success("Evolução salva com sucesso!", {
      icon: <Check className="w-4 h-4" />,
      description: "A evolução foi registrada no prontuário do paciente"
    });
    setStructuredSBAR(null);
    setPastedText("");
    setShowAudioDialog(false);
    setShowPasteDialog(false);
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: Camera,
      label: "Foto (OCR)",
      description: "Tire foto do prontuário",
      color: "bg-blue-500",
      onClick: () => setShowPhotoDialog(true)
    },
    {
      icon: Mic,
      label: "Áudio",
      description: "Dite a evolução",
      color: "bg-purple-500",
      onClick: () => setShowAudioDialog(true)
    },
    {
      icon: Clipboard,
      label: "Colar Texto",
      description: "Cole e estruture em SBAR",
      color: "bg-orange-500",
      onClick: () => setShowPasteDialog(true)
    },
    {
      icon: FileText,
      label: "Manual",
      description: "Formulário tradicional",
      color: "bg-gray-500",
      onClick: () => {
        if (onNewEvolution) onNewEvolution(currentPatientId);
        setIsOpen(false);
      }
    }
  ];

  const quickActions = [
    {
      icon: UserPlus,
      label: "Novo Paciente",
      color: "text-green-600",
      onClick: () => {
        if (onNewPatient) onNewPatient();
        setIsOpen(false);
      }
    },
    {
      icon: ClipboardList,
      label: "Nova Evolução",
      color: "text-blue-600",
      onClick: () => {
        if (onNewEvolution) onNewEvolution(currentPatientId);
        setIsOpen(false);
      }
    },
    {
      icon: LogOut,
      label: "Dar Alta",
      color: "text-amber-600",
      onClick: () => {
        if (onDischarge) onDischarge(currentPatientId);
        setIsOpen(false);
      }
    },
    {
      icon: Archive,
      label: "Arquivar",
      color: "text-gray-600",
      onClick: () => {
        if (onArchive) onArchive(currentPatientId);
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      {/* FAB Button */}
      <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 w-72"
            >
              <Card className="p-4 shadow-2xl border-2">
                {/* New Registration Section */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Novo Registro
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={item.onClick}
                        className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-muted transition-colors text-center"
                      >
                        <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t my-3" />

                {/* Quick Actions Section */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Ações Rápidas
                  </p>
                  <div className="space-y-1">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                        <span className="text-sm font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
            isOpen ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
          }`}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Plus className="w-6 h-6 text-white" />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-500" />
              Captura por Foto (OCR)
            </DialogTitle>
            <DialogDescription>
              Tire uma foto do prontuário ou prescrição. O sistema extrairá automaticamente os dados.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors"
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Processando imagem...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-10 h-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para tirar foto ou selecionar imagem
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Audio Dialog */}
      <Dialog open={showAudioDialog} onOpenChange={setShowAudioDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-500" />
              Evolução por Áudio
            </DialogTitle>
            <DialogDescription>
              Dite a evolução do paciente. A IA transcreverá e estruturará em formato SBAR.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!structuredSBAR ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isProcessing}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
                    isRecording 
                      ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                      : isProcessing
                        ? "bg-gray-300"
                        : "bg-purple-500 hover:bg-purple-600"
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </motion.button>
                
                {isRecording && (
                  <div className="text-center">
                    <p className="text-2xl font-mono font-bold text-red-500">
                      {formatTime(recordingTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">Gravando...</p>
                  </div>
                )}
                
                {isProcessing && (
                  <p className="text-sm text-muted-foreground">
                    Transcrevendo e estruturando...
                  </p>
                )}
                
                {!isRecording && !isProcessing && (
                  <p className="text-sm text-muted-foreground">
                    Toque para iniciar gravação
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Estruturado pela IA</span>
                </div>
                
                {Object.entries(structuredSBAR).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className={`text-sm font-semibold ${
                      key === 'S' ? 'text-red-600' :
                      key === 'B' ? 'text-blue-600' :
                      key === 'A' ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {key === 'S' ? 'Situação' :
                       key === 'B' ? 'Background' :
                       key === 'A' ? 'Avaliação' :
                       'Recomendação'}
                    </label>
                    <Textarea 
                      value={value} 
                      onChange={(e) => setStructuredSBAR({...structuredSBAR, [key]: e.target.value})}
                      className="text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {structuredSBAR && (
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStructuredSBAR(null)}>
                Regravar
              </Button>
              <Button onClick={handleSaveSBAR} className="gap-2">
                <Check className="w-4 h-4" />
                Salvar Evolução
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Paste Dialog */}
      <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-orange-500" />
              Colar e Estruturar em SBAR
            </DialogTitle>
            <DialogDescription>
              Cole o texto da evolução. A IA identificará e estruturará automaticamente em formato SBAR.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!structuredSBAR ? (
              <>
                <Textarea
                  placeholder="Cole aqui o texto da evolução médica..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                
                <Button 
                  onClick={handlePasteAndProcess} 
                  disabled={isProcessing || !pastedText.trim()}
                  className="w-full gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Estruturar com IA
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Texto estruturado com sucesso!</span>
                </div>
                
                {Object.entries(structuredSBAR).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className={`text-sm font-semibold ${
                      key === 'S' ? 'text-red-600' :
                      key === 'B' ? 'text-blue-600' :
                      key === 'A' ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {key === 'S' ? 'Situação' :
                       key === 'B' ? 'Background' :
                       key === 'A' ? 'Avaliação' :
                       'Recomendação'}
                    </label>
                    <Textarea 
                      value={value} 
                      onChange={(e) => setStructuredSBAR({...structuredSBAR, [key]: e.target.value})}
                      className="text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {structuredSBAR && (
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => {
                setStructuredSBAR(null);
                setPastedText("");
              }}>
                Recomeçar
              </Button>
              <Button onClick={handleSaveSBAR} className="gap-2">
                <Check className="w-4 h-4" />
                Salvar Evolução
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
