import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, X, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Lista completa de convênios e planos de saúde do Brasil
const INSURANCE_PROVIDERS = [
  // Particular
  { id: "particular", name: "Particular", category: "particular" },
  
  // SUS
  { id: "sus", name: "SUS - Sistema Único de Saúde", category: "public" },
  
  // Grandes operadoras nacionais
  { id: "unimed", name: "Unimed", category: "cooperative" },
  { id: "bradesco_saude", name: "Bradesco Saúde", category: "insurance" },
  { id: "sulamerica", name: "SulAmérica Saúde", category: "insurance" },
  { id: "amil", name: "Amil", category: "insurance" },
  { id: "notredame", name: "NotreDame Intermédica", category: "insurance" },
  { id: "hapvida", name: "Hapvida", category: "insurance" },
  { id: "prevent_senior", name: "Prevent Senior", category: "insurance" },
  { id: "porto_seguro", name: "Porto Seguro Saúde", category: "insurance" },
  { id: "golden_cross", name: "Golden Cross", category: "insurance" },
  { id: "medial", name: "Medial Saúde", category: "insurance" },
  { id: "omint", name: "Omint", category: "insurance" },
  { id: "allianz", name: "Allianz Saúde", category: "insurance" },
  { id: "sompo", name: "Sompo Saúde", category: "insurance" },
  { id: "care_plus", name: "Care Plus", category: "insurance" },
  { id: "mediservice", name: "Mediservice", category: "insurance" },
  { id: "assim", name: "Assim Saúde", category: "insurance" },
  { id: "santa_casa", name: "Santa Casa Saúde", category: "insurance" },
  { id: "one_health", name: "One Health", category: "insurance" },
  { id: "seguros_unimed", name: "Seguros Unimed", category: "insurance" },
  { id: "classes_laboriosas", name: "Classes Laboriosas", category: "insurance" },
  { id: "notre_dame_seguradora", name: "Notre Dame Seguradora", category: "insurance" },
  { id: "gndi", name: "GNDI - Grupo NotreDame Intermédica", category: "insurance" },
  { id: "qsaude", name: "QSaúde", category: "insurance" },
  { id: "alice", name: "Alice", category: "insurance" },
  { id: "sami", name: "Sami", category: "insurance" },
  { id: "kipp_saude", name: "Kipp Saúde", category: "insurance" },
  { id: "blue_med", name: "Blue Med", category: "insurance" },
  
  // Cooperativas Unimed regionais
  { id: "unimed_bh", name: "Unimed BH", category: "cooperative" },
  { id: "unimed_rio", name: "Unimed Rio", category: "cooperative" },
  { id: "unimed_sp", name: "Unimed São Paulo", category: "cooperative" },
  { id: "unimed_curitiba", name: "Unimed Curitiba", category: "cooperative" },
  { id: "unimed_poa", name: "Unimed Porto Alegre", category: "cooperative" },
  { id: "unimed_fortaleza", name: "Unimed Fortaleza", category: "cooperative" },
  { id: "unimed_recife", name: "Unimed Recife", category: "cooperative" },
  { id: "unimed_salvador", name: "Unimed Salvador", category: "cooperative" },
  { id: "unimed_campinas", name: "Unimed Campinas", category: "cooperative" },
  { id: "unimed_goiania", name: "Unimed Goiânia", category: "cooperative" },
  { id: "unimed_belém", name: "Unimed Belém", category: "cooperative" },
  { id: "unimed_manaus", name: "Unimed Manaus", category: "cooperative" },
  { id: "unimed_vitoria", name: "Unimed Vitória", category: "cooperative" },
  { id: "unimed_natal", name: "Unimed Natal", category: "cooperative" },
  { id: "unimed_joao_pessoa", name: "Unimed João Pessoa", category: "cooperative" },
  { id: "unimed_maceio", name: "Unimed Maceió", category: "cooperative" },
  { id: "unimed_teresina", name: "Unimed Teresina", category: "cooperative" },
  { id: "unimed_sao_luis", name: "Unimed São Luís", category: "cooperative" },
  { id: "unimed_campo_grande", name: "Unimed Campo Grande", category: "cooperative" },
  { id: "unimed_cuiaba", name: "Unimed Cuiabá", category: "cooperative" },
  { id: "unimed_florianopolis", name: "Unimed Florianópolis", category: "cooperative" },
  { id: "unimed_londrina", name: "Unimed Londrina", category: "cooperative" },
  { id: "unimed_maringa", name: "Unimed Maringá", category: "cooperative" },
  { id: "unimed_ribeirao", name: "Unimed Ribeirão Preto", category: "cooperative" },
  { id: "unimed_santos", name: "Unimed Santos", category: "cooperative" },
  { id: "unimed_sorocaba", name: "Unimed Sorocaba", category: "cooperative" },
  { id: "unimed_juiz_fora", name: "Unimed Juiz de Fora", category: "cooperative" },
  { id: "unimed_uberlandia", name: "Unimed Uberlândia", category: "cooperative" },
  { id: "unimed_contagem", name: "Unimed Contagem", category: "cooperative" },
  
  // Autogestão
  { id: "cassi", name: "CASSI (Banco do Brasil)", category: "autogestao" },
  { id: "geap", name: "GEAP (Servidores Federais)", category: "autogestao" },
  { id: "petrobras", name: "Petrobras Saúde (AMS)", category: "autogestao" },
  { id: "saude_caixa", name: "Saúde Caixa (CEF)", category: "autogestao" },
  { id: "eletros", name: "Eletros Saúde", category: "autogestao" },
  { id: "fapes", name: "FAPES (BNDES)", category: "autogestao" },
  { id: "postal_saude", name: "Postal Saúde (Correios)", category: "autogestao" },
  { id: "serpros", name: "Serpros (Serpro)", category: "autogestao" },
  { id: "embratel", name: "Embratel Saúde", category: "autogestao" },
  { id: "vale_saude", name: "Vale Saúde", category: "autogestao" },
  { id: "gerdau_saude", name: "Gerdau Saúde", category: "autogestao" },
  { id: "itau_saude", name: "Itaú Saúde", category: "autogestao" },
  { id: "real_grandeza", name: "Real Grandeza (Furnas)", category: "autogestao" },
  { id: "funcef", name: "FUNCEF Saúde", category: "autogestao" },
  { id: "previ", name: "PREVI Saúde", category: "autogestao" },
  { id: "sabesp_saude", name: "Sabesp Saúde", category: "autogestao" },
  { id: "cemig_saude", name: "CEMIG Saúde", category: "autogestao" },
  { id: "copel_saude", name: "Copel Saúde", category: "autogestao" },
  { id: "embraer_saude", name: "Embraer Saúde", category: "autogestao" },
  
  // Militares e Forças Armadas
  { id: "fusex", name: "FUSEX (Exército)", category: "military" },
  { id: "sammed", name: "SAMMED (Marinha)", category: "military" },
  { id: "pame", name: "PAME (Aeronáutica)", category: "military" },
  { id: "pm_saude", name: "Polícia Militar Saúde", category: "military" },
  { id: "ipsemg", name: "IPSEMG", category: "military" },
  
  // Odontológicas com plano médico
  { id: "odontoprev", name: "OdontoPrev", category: "dental" },
  { id: "metlife", name: "MetLife", category: "dental" },
  { id: "interodonto", name: "Interodonto", category: "dental" },
  { id: "uniodonto", name: "Uniodonto", category: "dental" },
  
  // Regionais e locais
  { id: "saude_sim", name: "Saúde Sim", category: "regional" },
  { id: "clinipam", name: "Clinipam", category: "regional" },
  { id: "sao_cristovao", name: "São Cristóvão Saúde", category: "regional" },
  { id: "trasmontano", name: "Trasmontano", category: "regional" },
  { id: "cruz_azul", name: "Cruz Azul Saúde", category: "regional" },
  { id: "santa_helena", name: "Santa Helena Saúde", category: "regional" },
  { id: "greenline", name: "Greenline Saúde", category: "regional" },
  { id: "biovida", name: "Biovida Saúde", category: "regional" },
  { id: "life_empresarial", name: "Life Empresarial", category: "regional" },
  { id: "medical_health", name: "Medical Health", category: "regional" },
  { id: "samaritano", name: "Samaritano Saúde", category: "regional" },
  { id: "plansaude", name: "PlanSaúde", category: "regional" },
  { id: "ameplan", name: "Ameplan", category: "regional" },
  { id: "biosaude", name: "BioSaúde", category: "regional" },
  { id: "santa_major", name: "Santa Major", category: "regional" },
  { id: "vitallis", name: "Vitallis", category: "regional" },
  { id: "minas_saude", name: "Minas Saúde", category: "regional" },
  { id: "plamheg", name: "Plamheg", category: "regional" },
  { id: "medsenior", name: "MedSenior", category: "regional" },
  { id: "samp", name: "SAMP", category: "regional" },
  { id: "saude_excelsior", name: "Saúde Excelsior", category: "regional" },
  { id: "smile_saude", name: "Smile Saúde", category: "regional" },
  { id: "medical", name: "Medical", category: "regional" },
  { id: "plamed", name: "Plamed", category: "regional" },
  { id: "hapvida_ndi", name: "Hapvida NDI", category: "regional" },
  { id: "unimed_central", name: "Unimed Central Nacional", category: "cooperative" },
  
  // Seguradoras internacionais com atuação no Brasil
  { id: "cigna", name: "Cigna", category: "international" },
  { id: "aetna", name: "Aetna", category: "international" },
  { id: "bupa", name: "Bupa", category: "international" },
  { id: "april", name: "April International", category: "international" },
  { id: "axa", name: "AXA", category: "international" },
  { id: "mapfre_saude", name: "Mapfre Saúde", category: "international" },
];

interface InsuranceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  allowCustom?: boolean;
}

export function InsuranceSelector({
  value,
  onChange,
  label = "Convênio / Plano de Saúde",
  placeholder = "Digite para buscar convênio...",
  className,
  allowCustom = true,
}: InsuranceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter providers based on search
  const filteredProviders = searchQuery.length >= 1
    ? INSURANCE_PROVIDERS.filter((provider) => {
        const normalizedQuery = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedName = provider.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedName.includes(normalizedQuery);
      }).slice(0, 30)
    : INSURANCE_PROVIDERS.slice(0, 15); // Show first 15 when no search

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "particular": return "Particular";
      case "public": return "Público";
      case "cooperative": return "Cooperativas";
      case "insurance": return "Seguradoras";
      case "autogestao": return "Autogestão";
      case "military": return "Militares";
      case "dental": return "Odontológicas";
      case "regional": return "Regionais";
      case "international": return "Internacionais";
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "particular": return "text-green-600";
      case "public": return "text-blue-600";
      case "cooperative": return "text-emerald-600";
      case "insurance": return "text-purple-600";
      case "autogestao": return "text-amber-600";
      case "military": return "text-slate-600";
      case "dental": return "text-cyan-600";
      case "regional": return "text-orange-600";
      case "international": return "text-indigo-600";
      default: return "text-muted-foreground";
    }
  };

  const handleSelect = (providerName: string) => {
    onChange(providerName);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleCustomSubmit = () => {
    if (searchQuery.trim()) {
      onChange(searchQuery.trim());
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const clearSelection = () => {
    onChange("");
    setSearchQuery("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredProviders.length));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex < filteredProviders.length) {
          handleSelect(filteredProviders[selectedIndex].name);
        } else if (allowCustom && searchQuery.trim()) {
          handleCustomSubmit();
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  }, [isOpen, filteredProviders, selectedIndex, searchQuery]);

  // Scroll selected into view
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

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Find selected provider for badge
  const selectedProvider = INSURANCE_PROVIDERS.find(
    (p) => p.name.toLowerCase() === value.toLowerCase() || p.id === value
  );

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      {label && <Label>{label}</Label>}

      {/* Selected value display */}
      {value && (
        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <CreditCard className="h-4 w-4 text-primary" />
          <span className="flex-1 text-sm font-medium">{value}</span>
          {selectedProvider && (
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(selectedProvider.category)}
            </Badge>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={clearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Search input with autocomplete */}
      {!value && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pl-10"
            />
          </div>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg">
              <ScrollArea className="max-h-[300px]">
                <div ref={listRef} className="p-1">
                  {filteredProviders.map((provider, index) => (
                    <div
                      key={provider.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors",
                        index === selectedIndex
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => handleSelect(provider.name)}
                    >
                      <CreditCard className={cn("h-4 w-4", getCategoryColor(provider.category))} />
                      <span className="flex-1 text-sm">{provider.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {getCategoryLabel(provider.category)}
                      </span>
                    </div>
                  ))}

                  {/* No results + custom entry */}
                  {filteredProviders.length === 0 && searchQuery && (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      Nenhum convênio encontrado para "{searchQuery}"
                    </div>
                  )}

                  {/* Custom entry option */}
                  {allowCustom && searchQuery.trim() && (
                    <div className="border-t mt-1 pt-1">
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors text-primary",
                          selectedIndex === filteredProviders.length
                            ? "bg-primary/10"
                            : "hover:bg-muted"
                        )}
                        onClick={handleCustomSubmit}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Usar "{searchQuery.trim()}" como convênio
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Digite o nome do convênio ou selecione da lista. Pode digitar qualquer nome.
      </p>
    </div>
  );
}

export default InsuranceSelector;
