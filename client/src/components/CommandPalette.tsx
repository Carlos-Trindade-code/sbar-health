import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  User,
  FileText,
  Activity,
  Settings,
  Plus,
  Building2,
  Users,
  Brain,
  Clock,
  ArrowRight,
  Command,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: 'patient' | 'evolution' | 'action' | 'page';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
  badgeColor?: string;
}

interface CommandPaletteProps {
  patients?: Array<{
    id: number;
    name: string;
    bed?: string;
    hospital?: string;
    status?: string;
  }>;
  onNewPatient?: () => void;
  onNewEvolution?: (patientId?: number) => void;
}

export default function CommandPalette({ 
  patients = [], 
  onNewPatient,
  onNewEvolution 
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Atalho de teclado Command+K ou Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focar no input quando abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Ações rápidas
  const quickActions: SearchResult[] = [
    {
      id: "new-patient",
      type: "action",
      title: "Novo Paciente",
      subtitle: "Cadastrar um novo paciente",
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        setOpen(false);
        if (onNewPatient) onNewPatient();
        else setLocation("/patient/new");
      },
      badge: "Ação",
      badgeColor: "bg-green-500",
    },
    {
      id: "new-evolution",
      type: "action",
      title: "Nova Evolução",
      subtitle: "Criar evolução SBAR",
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        setOpen(false);
        if (onNewEvolution) onNewEvolution();
        else setLocation("/evolution/new");
      },
      badge: "Ação",
      badgeColor: "bg-blue-500",
    },
  ];

  // Páginas do sistema
  const pages: SearchResult[] = [
    {
      id: "dashboard",
      type: "page",
      title: "Dashboard",
      subtitle: "Visão geral dos pacientes",
      icon: <Activity className="w-4 h-4" />,
      action: () => {
        setOpen(false);
        setLocation("/dashboard");
      },
    },
    {
      id: "analytics",
      type: "page",
      title: "Analytics",
      subtitle: "Métricas e estatísticas",
      icon: <Brain className="w-4 h-4" />,
      action: () => {
        setOpen(false);
        setLocation("/analytics");
      },
    },
    {
      id: "settings",
      type: "page",
      title: "Configurações",
      subtitle: "Perfil, equipes e plano",
      icon: <Settings className="w-4 h-4" />,
      action: () => {
        setOpen(false);
        setLocation("/settings");
      },
    },
    {
      id: "demo",
      type: "page",
      title: "Modo Demo",
      subtitle: "Explorar funcionalidades",
      icon: <Building2 className="w-4 h-4" />,
      action: () => {
        setOpen(false);
        setLocation("/demo");
      },
    },
  ];

  // Converter pacientes em resultados de busca
  const patientResults: SearchResult[] = patients.map((p) => ({
    id: `patient-${p.id}`,
    type: "patient" as const,
    title: p.name,
    subtitle: p.bed ? `Leito ${p.bed} • ${p.hospital || ""}` : p.hospital,
    icon: <User className="w-4 h-4" />,
    action: () => {
      setOpen(false);
      // Navegar para o paciente ou expandir no dashboard
      setLocation(`/patient/${p.id}`);
    },
    badge: p.status === "critical" ? "Crítico" : undefined,
    badgeColor: p.status === "critical" ? "bg-red-500" : undefined,
  }));

  // Filtrar resultados baseado na query
  const filterResults = useCallback((items: SearchResult[], searchQuery: string) => {
    if (!searchQuery.trim()) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle?.toLowerCase().includes(lowerQuery)
    );
  }, []);

  // Todos os resultados filtrados
  const allResults = [
    ...filterResults(quickActions, query),
    ...filterResults(patientResults, query),
    ...filterResults(pages, query),
  ];

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (allResults[selectedIndex]) {
          allResults[selectedIndex].action();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, allResults]);

  // Scroll para o item selecionado
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Resetar seleção quando query muda
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "patient": return "Paciente";
      case "evolution": return "Evolução";
      case "action": return "Ação";
      case "page": return "Página";
      default: return "";
    }
  };

  return (
    <>
      {/* Botão de atalho visível */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg border transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Buscar...</span>
        <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-background border rounded">
          <Command className="w-3 h-3 inline" />K
        </kbd>
      </button>

      {/* Botão mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Modal de busca */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden" aria-describedby="command-palette-desc">
          <VisuallyHidden>
            <DialogTitle>Busca rápida</DialogTitle>
            <DialogDescription id="command-palette-desc">Buscar pacientes, ações e páginas</DialogDescription>
          </VisuallyHidden>
          {/* Header com input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar pacientes, ações, páginas..."
              className="border-0 p-0 h-auto text-base focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
            <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-muted border rounded">
              ESC
            </kbd>
          </div>

          {/* Lista de resultados */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {allResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum resultado encontrado</p>
                <p className="text-sm">Tente buscar por nome, leito ou ação</p>
              </div>
            ) : (
              <>
                {/* Ações rápidas */}
                {query === "" && (
                  <div className="px-3 py-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ações Rápidas
                    </span>
                  </div>
                )}
                
                {allResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={result.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      index === selectedIndex ? "bg-primary/20" : "bg-muted"
                    }`}>
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{result.title}</span>
                        {result.badge && (
                          <Badge className={`text-[10px] px-1.5 py-0 ${result.badgeColor} text-white`}>
                            {result.badge}
                          </Badge>
                        )}
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{getTypeLabel(result.type)}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Footer com dicas */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-background border rounded">↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded">↵</kbd>
                selecionar
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />K para abrir
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
