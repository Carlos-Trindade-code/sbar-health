import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, MapPin, Plus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Hospital {
  id: number;
  name: string;
  code: string;
  city: string | null;
  state: string | null;
  type: "public" | "private" | "mixed";
  isPreRegistered: boolean;
}

interface HospitalSearchProps {
  onSelect: (hospital: Hospital) => void;
  onCreateNew?: (name: string) => void;
  selectedHospitalId?: number;
  placeholder?: string;
  className?: string;
  showCreateOption?: boolean;
  excludeIds?: number[];
}

export function HospitalSearch({
  onSelect,
  onCreateNew,
  selectedHospitalId,
  placeholder = "Digite o nome do hospital...",
  className,
  showCreateOption = true,
  excludeIds = [],
}: HospitalSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading } = trpc.hospitals.search.useQuery(
    { query: query.trim() },
    { enabled: query.trim().length >= 2 }
  );

  const filteredResults = (searchResults || []).filter(
    (h) => !excludeIds.includes(h.id)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((hospital: Hospital) => {
    onSelect(hospital);
    setQuery(hospital.name);
    setIsOpen(false);
  }, [onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    const totalItems = filteredResults.length + (showCreateOption && query.trim().length >= 2 ? 1 : 0);
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      if (selectedIndex < filteredResults.length) {
        handleSelect(filteredResults[selectedIndex]);
      } else if (showCreateOption && onCreateNew) {
        onCreateNew(query.trim());
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "public": return "Público";
      case "private": return "Privado";
      case "mixed": return "Misto";
      default: return type;
    }
  };

  const typeBadgeVariant = (type: string) => {
    switch (type) {
      case "public": return "default" as const;
      case "private": return "secondary" as const;
      case "mixed": return "outline" as const;
      default: return "outline" as const;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.trim().length >= 2);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full bg-popover text-popover-foreground border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {filteredResults.length === 0 && !isLoading && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Nenhum hospital encontrado para "{query}"
            </div>
          )}

          {filteredResults.map((hospital, index) => (
            <button
              key={hospital.id}
              onClick={() => handleSelect(hospital)}
              className={cn(
                "w-full text-left px-3 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0",
                selectedIndex === index && "bg-accent text-accent-foreground",
                selectedHospitalId === hospital.id && "bg-primary/10"
              )}
            >
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{hospital.name}</span>
                    {selectedHospitalId === hospital.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {(hospital.city || hospital.state) && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {[hospital.city, hospital.state].filter(Boolean).join(" / ")}
                      </span>
                    )}
                    <Badge variant={typeBadgeVariant(hospital.type)} className="text-[10px] px-1.5 py-0">
                      {typeLabel(hospital.type)}
                    </Badge>
                    {hospital.isPreRegistered && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-300">
                        Verificado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {showCreateOption && query.trim().length >= 2 && onCreateNew && (
            <button
              onClick={() => {
                onCreateNew(query.trim());
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors border-t",
                selectedIndex === filteredResults.length && "bg-accent text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-2 text-primary">
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Cadastrar "{query.trim()}" como novo hospital
                </span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
