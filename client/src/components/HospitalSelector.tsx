import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Phone,
  Globe,
  CheckCircle2,
  Hospital,
  Stethoscope,
  GraduationCap,
  Briefcase,
  Home,
  Star,
  Filter
} from "lucide-react";

// Lista de hospitais brasileiros (amostra representativa)
const brazilianHospitals = [
  // São Paulo - Públicos
  { id: 1, name: "Hospital das Clínicas da FMUSP", city: "São Paulo", state: "SP", type: "public", category: "university", beds: 2400 },
  { id: 2, name: "Hospital São Paulo - UNIFESP", city: "São Paulo", state: "SP", type: "public", category: "university", beds: 743 },
  { id: 3, name: "Santa Casa de São Paulo", city: "São Paulo", state: "SP", type: "philanthropic", category: "general", beds: 1200 },
  { id: 4, name: "Hospital do Servidor Público Estadual", city: "São Paulo", state: "SP", type: "public", category: "general", beds: 800 },
  { id: 5, name: "Hospital Municipal Dr. Moysés Deutsch", city: "São Paulo", state: "SP", type: "public", category: "general", beds: 380 },
  
  // São Paulo - Privados
  { id: 6, name: "Hospital Sírio-Libanês", city: "São Paulo", state: "SP", type: "private", category: "general", beds: 489 },
  { id: 7, name: "Hospital Albert Einstein", city: "São Paulo", state: "SP", type: "private", category: "general", beds: 662 },
  { id: 8, name: "Hospital Oswaldo Cruz", city: "São Paulo", state: "SP", type: "private", category: "general", beds: 350 },
  { id: 9, name: "Hospital Samaritano", city: "São Paulo", state: "SP", type: "private", category: "general", beds: 280 },
  { id: 10, name: "Hospital Nove de Julho", city: "São Paulo", state: "SP", type: "private", category: "general", beds: 320 },
  { id: 11, name: "Hospital Santa Catarina", city: "São Paulo", state: "SP", type: "private", category: "general", beds: 250 },
  { id: 12, name: "Hospital Beneficência Portuguesa", city: "São Paulo", state: "SP", type: "philanthropic", category: "general", beds: 900 },
  
  // Rio de Janeiro
  { id: 13, name: "Hospital Universitário Clementino Fraga Filho - UFRJ", city: "Rio de Janeiro", state: "RJ", type: "public", category: "university", beds: 450 },
  { id: 14, name: "Hospital Federal dos Servidores do Estado", city: "Rio de Janeiro", state: "RJ", type: "public", category: "general", beds: 520 },
  { id: 15, name: "Hospital Miguel Couto", city: "Rio de Janeiro", state: "RJ", type: "public", category: "emergency", beds: 380 },
  { id: 16, name: "Hospital Copa Star", city: "Rio de Janeiro", state: "RJ", type: "private", category: "general", beds: 180 },
  { id: 17, name: "Hospital Samaritano Botafogo", city: "Rio de Janeiro", state: "RJ", type: "private", category: "general", beds: 220 },
  { id: 18, name: "Hospital Quinta D'Or", city: "Rio de Janeiro", state: "RJ", type: "private", category: "general", beds: 350 },
  
  // Minas Gerais
  { id: 19, name: "Hospital das Clínicas da UFMG", city: "Belo Horizonte", state: "MG", type: "public", category: "university", beds: 510 },
  { id: 20, name: "Hospital João XXIII", city: "Belo Horizonte", state: "MG", type: "public", category: "emergency", beds: 420 },
  { id: 21, name: "Hospital Mater Dei", city: "Belo Horizonte", state: "MG", type: "private", category: "general", beds: 380 },
  { id: 22, name: "Hospital Felício Rocho", city: "Belo Horizonte", state: "MG", type: "philanthropic", category: "general", beds: 450 },
  
  // Rio Grande do Sul
  { id: 23, name: "Hospital de Clínicas de Porto Alegre", city: "Porto Alegre", state: "RS", type: "public", category: "university", beds: 842 },
  { id: 24, name: "Hospital Moinhos de Vento", city: "Porto Alegre", state: "RS", type: "private", category: "general", beds: 380 },
  { id: 25, name: "Hospital São Lucas da PUCRS", city: "Porto Alegre", state: "RS", type: "private", category: "university", beds: 600 },
  
  // Paraná
  { id: 26, name: "Hospital de Clínicas da UFPR", city: "Curitiba", state: "PR", type: "public", category: "university", beds: 643 },
  { id: 27, name: "Hospital Pequeno Príncipe", city: "Curitiba", state: "PR", type: "philanthropic", category: "pediatric", beds: 380 },
  { id: 28, name: "Hospital Marcelino Champagnat", city: "Curitiba", state: "PR", type: "private", category: "general", beds: 220 },
  
  // Bahia
  { id: 29, name: "Hospital Universitário Professor Edgard Santos - UFBA", city: "Salvador", state: "BA", type: "public", category: "university", beds: 270 },
  { id: 30, name: "Hospital Geral Roberto Santos", city: "Salvador", state: "BA", type: "public", category: "general", beds: 640 },
  { id: 31, name: "Hospital da Bahia", city: "Salvador", state: "BA", type: "private", category: "general", beds: 280 },
  
  // Pernambuco
  { id: 32, name: "Hospital das Clínicas da UFPE", city: "Recife", state: "PE", type: "public", category: "university", beds: 410 },
  { id: 33, name: "Hospital da Restauração", city: "Recife", state: "PE", type: "public", category: "emergency", beds: 550 },
  { id: 34, name: "Hospital Português", city: "Recife", state: "PE", type: "private", category: "general", beds: 320 },
  
  // Ceará
  { id: 35, name: "Hospital Universitário Walter Cantídio - UFC", city: "Fortaleza", state: "CE", type: "public", category: "university", beds: 260 },
  { id: 36, name: "Hospital Geral de Fortaleza", city: "Fortaleza", state: "CE", type: "public", category: "general", beds: 520 },
  { id: 37, name: "Hospital São Carlos", city: "Fortaleza", state: "CE", type: "private", category: "general", beds: 180 },
  
  // Distrito Federal
  { id: 38, name: "Hospital de Base do Distrito Federal", city: "Brasília", state: "DF", type: "public", category: "general", beds: 750 },
  { id: 39, name: "Hospital Universitário de Brasília - UnB", city: "Brasília", state: "DF", type: "public", category: "university", beds: 290 },
  { id: 40, name: "Hospital Santa Lúcia", city: "Brasília", state: "DF", type: "private", category: "general", beds: 250 },
  
  // Goiás
  { id: 41, name: "Hospital das Clínicas da UFG", city: "Goiânia", state: "GO", type: "public", category: "university", beds: 310 },
  { id: 42, name: "Hospital de Urgências de Goiânia", city: "Goiânia", state: "GO", type: "public", category: "emergency", beds: 280 },
  
  // Santa Catarina
  { id: 43, name: "Hospital Universitário da UFSC", city: "Florianópolis", state: "SC", type: "public", category: "university", beds: 274 },
  { id: 44, name: "Hospital Baía Sul", city: "Florianópolis", state: "SC", type: "private", category: "general", beds: 180 },
  
  // Espírito Santo
  { id: 45, name: "Hospital Universitário Cassiano Antonio Moraes - UFES", city: "Vitória", state: "ES", type: "public", category: "university", beds: 290 },
  { id: 46, name: "Hospital Estadual Dr. Jayme Santos Neves", city: "Serra", state: "ES", type: "public", category: "general", beds: 420 },
  
  // Pará
  { id: 47, name: "Hospital Universitário João de Barros Barreto - UFPA", city: "Belém", state: "PA", type: "public", category: "university", beds: 320 },
  { id: 48, name: "Hospital de Clínicas Gaspar Vianna", city: "Belém", state: "PA", type: "public", category: "general", beds: 280 },
  
  // Amazonas
  { id: 49, name: "Hospital Universitário Getúlio Vargas - UFAM", city: "Manaus", state: "AM", type: "public", category: "university", beds: 320 },
  { id: 50, name: "Hospital e Pronto-Socorro 28 de Agosto", city: "Manaus", state: "AM", type: "public", category: "emergency", beds: 380 },
];

const states = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

interface HospitalSelectorProps {
  isDemo?: boolean;
  onSelect?: (hospital: any) => void;
  selectedHospitals?: number[];
}

export default function HospitalSelector({ isDemo = false, onSelect, selectedHospitals = [] }: HospitalSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>(selectedHospitals);
  
  // Form para criar novo hospital
  const [newHospital, setNewHospital] = useState({
    name: "",
    city: "",
    state: "",
    type: "private",
    category: "general",
    address: "",
    phone: "",
    website: ""
  });

  // Custom hospitals criados pelo usuário
  const [customHospitals, setCustomHospitals] = useState<any[]>([
    { id: 1001, name: "Consultório Dr. Carlos", city: "São Paulo", state: "SP", type: "custom", category: "office", beds: 0, isCustom: true },
    { id: 1002, name: "Ambulatório de Ensino - Residência", city: "São Paulo", state: "SP", type: "custom", category: "teaching", beds: 0, isCustom: true },
  ]);

  const allHospitals = useMemo(() => {
    return [...brazilianHospitals, ...customHospitals];
  }, [customHospitals]);

  const filteredHospitals = useMemo(() => {
    return allHospitals.filter(hospital => {
      const matchesSearch = 
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesState = stateFilter === "all" || hospital.state === stateFilter;
      const matchesType = typeFilter === "all" || hospital.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || hospital.category === categoryFilter;
      
      return matchesSearch && matchesState && matchesType && matchesCategory;
    });
  }, [searchQuery, stateFilter, typeFilter, categoryFilter, allHospitals]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'public': return 'Público';
      case 'private': return 'Privado';
      case 'philanthropic': return 'Filantrópico';
      case 'custom': return 'Personalizado';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-blue-500';
      case 'private': return 'bg-purple-500';
      case 'philanthropic': return 'bg-green-500';
      case 'custom': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'university': return <GraduationCap className="w-4 h-4" />;
      case 'general': return <Hospital className="w-4 h-4" />;
      case 'emergency': return <Stethoscope className="w-4 h-4" />;
      case 'pediatric': return <Star className="w-4 h-4" />;
      case 'office': return <Briefcase className="w-4 h-4" />;
      case 'teaching': return <GraduationCap className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'university': return 'Universitário';
      case 'general': return 'Geral';
      case 'emergency': return 'Emergência';
      case 'pediatric': return 'Pediátrico';
      case 'office': return 'Consultório';
      case 'teaching': return 'Ensino';
      case 'home': return 'Home Care';
      default: return category;
    }
  };

  const handleSelectHospital = (hospitalId: number) => {
    const newSelected = selected.includes(hospitalId)
      ? selected.filter(id => id !== hospitalId)
      : [...selected, hospitalId];
    
    setSelected(newSelected);
    
    const hospital = allHospitals.find(h => h.id === hospitalId);
    if (onSelect && hospital) {
      onSelect(hospital);
    }
    
    toast.success(
      selected.includes(hospitalId) ? "Hospital removido" : "Hospital adicionado",
      { description: hospital?.name }
    );
  };

  const handleCreateHospital = () => {
    if (!newHospital.name || !newHospital.city || !newHospital.state) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const newId = 1000 + customHospitals.length + 1;
    const hospital = {
      id: newId,
      ...newHospital,
      beds: 0,
      isCustom: true
    };

    setCustomHospitals([...customHospitals, hospital]);
    setIsCreateDialogOpen(false);
    setNewHospital({
      name: "",
      city: "",
      state: "",
      type: "private",
      category: "general",
      address: "",
      phone: "",
      website: ""
    });

    toast.success("Local criado com sucesso!", {
      description: hospital.name
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Hospitais e Locais de Atendimento
              </CardTitle>
              <CardDescription>
                Selecione ou crie seus locais de trabalho
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Local
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Local</DialogTitle>
                  <DialogDescription>Adicione um novo hospital, clínica ou consultório</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tipo de Local *</Label>
                    <Select 
                      value={newHospital.category} 
                      onValueChange={(v) => setNewHospital({...newHospital, category: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Hospital Geral</SelectItem>
                        <SelectItem value="office">Consultório</SelectItem>
                        <SelectItem value="teaching">Ambulatório de Ensino</SelectItem>
                        <SelectItem value="home">Home Care</SelectItem>
                        <SelectItem value="emergency">Pronto-Socorro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input 
                      placeholder="Ex: Consultório Dr. João Silva"
                      value={newHospital.name}
                      onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Cidade *</Label>
                      <Input 
                        placeholder="São Paulo"
                        value={newHospital.city}
                        onChange={(e) => setNewHospital({...newHospital, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado *</Label>
                      <Select 
                        value={newHospital.state} 
                        onValueChange={(v) => setNewHospital({...newHospital, state: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input 
                      placeholder="Rua, número, bairro"
                      value={newHospital.address}
                      onChange={(e) => setNewHospital({...newHospital, address: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input 
                        placeholder="(11) 99999-9999"
                        value={newHospital.phone}
                        onChange={(e) => setNewHospital({...newHospital, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input 
                        placeholder="www.exemplo.com"
                        value={newHospital.website}
                        onChange={(e) => setNewHospital({...newHospital, website: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateHospital}>
                    Criar Local
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou cidade..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="public">Público</SelectItem>
                <SelectItem value="private">Privado</SelectItem>
                <SelectItem value="philanthropic">Filantrópico</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="university">Universitário</SelectItem>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="emergency">Emergência</SelectItem>
                <SelectItem value="office">Consultório</SelectItem>
                <SelectItem value="teaching">Ensino</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="h-9 px-3 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {filteredHospitals.length} resultados
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Hospital List */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {filteredHospitals.map((hospital) => (
                <div 
                  key={hospital.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    selected.includes(hospital.id) ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => handleSelectHospital(hospital.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getTypeColor(hospital.type)} flex items-center justify-center`}>
                        {getCategoryIcon(hospital.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{hospital.name}</h4>
                          {selected.includes(hospital.id) && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{hospital.city}, {hospital.state}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(hospital.type)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryLabel(hospital.category)}
                          </Badge>
                          {hospital.beds > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {hospital.beds} leitos
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredHospitals.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum hospital encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros ou criar um novo local</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Summary */}
      {selected.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selected.length} local(is) selecionado(s)</p>
                <p className="text-sm text-muted-foreground">
                  {allHospitals.filter(h => selected.includes(h.id)).map(h => h.name).join(", ")}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelected([])}>
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
