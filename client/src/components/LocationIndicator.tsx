import { useState } from 'react';
import { MapPin, MapPinOff, Navigation, Loader2, RefreshCw, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { GeolocationState } from '@/hooks/useGeolocation';

interface LocationIndicatorProps {
  state: GeolocationState & {
    hasLocation: boolean;
    isSupported: boolean;
  };
  onRequestLocation: () => void;
  nearestHospital?: {
    name: string;
    distance: string;
  } | null;
  className?: string;
}

// Mock nearby hospitals based on coordinates (in production, use real API)
const mockNearbyHospitals = [
  { name: 'Hospital das Clínicas', lat: -23.5558, lng: -46.6696, distance: '0.5 km' },
  { name: 'Hospital Albert Einstein', lat: -23.5989, lng: -46.7135, distance: '2.3 km' },
  { name: 'Hospital Sírio-Libanês', lat: -23.5553, lng: -46.6625, distance: '1.1 km' },
  { name: 'Santa Casa de São Paulo', lat: -23.5505, lng: -46.6333, distance: '1.8 km' },
];

export function LocationIndicator({
  state,
  onRequestLocation,
  nearestHospital,
  className,
}: LocationIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = () => {
    if (state.loading) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    if (state.error || !state.isSupported) {
      return <MapPinOff className="w-4 h-4 text-red-500" />;
    }
    if (state.hasLocation) {
      return <MapPin className="w-4 h-4 text-green-500" />;
    }
    return <MapPin className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (state.loading) return 'Localizando...';
    if (state.error) return 'Erro';
    if (!state.isSupported) return 'Não suportado';
    if (state.hasLocation) return 'Localizado';
    return 'Localização';
  };

  const formatCoords = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
  };

  // Find nearest hospital from mock data
  const findNearestHospital = () => {
    if (!state.latitude || !state.longitude) return null;
    // In production, calculate real distances
    return mockNearbyHospitals[0];
  };

  const nearest = nearestHospital || findNearestHospital();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'relative gap-1.5 px-2 transition-all duration-300',
            state.error && 'bg-red-50 hover:bg-red-100',
            state.hasLocation && 'bg-green-50 hover:bg-green-100',
            className
          )}
        >
          {getStatusIcon()}
          <span className="text-xs font-medium hidden sm:inline">{getStatusText()}</span>
          {state.hasLocation && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        {/* Header */}
        <div className={cn(
          'p-4 text-white rounded-t-lg',
          state.hasLocation 
            ? 'bg-gradient-to-r from-green-500 to-teal-500' 
            : 'bg-gradient-to-r from-gray-500 to-gray-600'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              <span className="font-semibold">Geolocalização</span>
            </div>
            {state.hasLocation && (
              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                Ativo
              </Badge>
            )}
          </div>
          {state.hasLocation && state.accuracy && (
            <p className="text-xs text-white/80 mt-1">
              Precisão: ±{Math.round(state.accuracy)}m
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {state.hasLocation && state.latitude && state.longitude ? (
            <>
              {/* Coordinates */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Coordenadas
                </h4>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
                  {formatCoords(state.latitude, state.longitude)}
                </div>
              </div>

              {/* Nearest Hospital */}
              {nearest && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    Hospital Mais Próximo
                  </h4>
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                    <p className="font-medium text-sm">{nearest.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Distância: {nearest.distance}
                    </p>
                  </div>
                </div>
              )}

              {/* Last Update */}
              {state.timestamp && (
                <p className="text-xs text-muted-foreground text-center">
                  Atualizado: {new Date(state.timestamp).toLocaleTimeString('pt-BR')}
                </p>
              )}

              {/* Refresh Button */}
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={onRequestLocation}
                disabled={state.loading}
              >
                <RefreshCw className={cn('w-4 h-4 mr-2', state.loading && 'animate-spin')} />
                Atualizar Localização
              </Button>
            </>
          ) : (
            <>
              {/* No Location */}
              <div className="text-center py-4">
                <MapPinOff className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium">Localização não disponível</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {state.error || 'Clique para ativar a geolocalização'}
                </p>
              </div>

              {state.isSupported && (
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={onRequestLocation}
                  disabled={state.loading}
                >
                  {state.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Obtendo localização...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Ativar Localização
                    </>
                  )}
                </Button>
              )}

              {!state.isSupported && (
                <p className="text-xs text-red-500 text-center">
                  Seu navegador não suporta geolocalização
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-muted/30 border-t text-xs text-muted-foreground">
          <p>📍 A localização é registrada nas evoluções para auditoria e compliance.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default LocationIndicator;
