import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  error: string | null;
  loading: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000, // Cache for 1 minute
  watchPosition: false,
};

export function useGeolocation(options: GeolocationOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
    loading: false,
    permissionStatus: 'unknown',
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  // Check permission status
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setState(prev => ({ ...prev, permissionStatus: 'unknown' }));
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setState(prev => ({ ...prev, permissionStatus: result.state as GeolocationState['permissionStatus'] }));
      
      result.addEventListener('change', () => {
        setState(prev => ({ ...prev, permissionStatus: result.state as GeolocationState['permissionStatus'] }));
      });
    } catch {
      setState(prev => ({ ...prev, permissionStatus: 'unknown' }));
    }
  }, []);

  // Success handler
  const onSuccess = useCallback((position: GeolocationPosition) => {
    setState(prev => ({
      ...prev,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
      error: null,
      loading: false,
    }));
  }, []);

  // Error handler
  const onError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Erro ao obter localização';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Permissão de localização negada';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Localização indisponível';
        break;
      case error.TIMEOUT:
        errorMessage = 'Tempo esgotado ao obter localização';
        break;
    }

    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false,
    }));
  }, []);

  // Get current position
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalização não suportada pelo navegador',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      {
        enableHighAccuracy: mergedOptions.enableHighAccuracy,
        timeout: mergedOptions.timeout,
        maximumAge: mergedOptions.maximumAge,
      }
    );
  }, [onSuccess, onError, mergedOptions.enableHighAccuracy, mergedOptions.timeout, mergedOptions.maximumAge]);

  // Start watching position
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalização não suportada pelo navegador',
      }));
      return;
    }

    if (watchId !== null) return; // Already watching

    const id = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      {
        enableHighAccuracy: mergedOptions.enableHighAccuracy,
        timeout: mergedOptions.timeout,
        maximumAge: mergedOptions.maximumAge,
      }
    );

    setWatchId(id);
  }, [watchId, onSuccess, onError, mergedOptions.enableHighAccuracy, mergedOptions.timeout, mergedOptions.maximumAge]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Request permission and get location
  const requestLocation = useCallback(() => {
    getCurrentPosition();
    toast.info('Obtendo sua localização...', { icon: '📍', duration: 2000 });
  }, [getCurrentPosition]);

  // Get formatted location string
  const getLocationString = useCallback(() => {
    if (state.latitude && state.longitude) {
      return `${state.latitude.toFixed(6)}, ${state.longitude.toFixed(6)}`;
    }
    return null;
  }, [state.latitude, state.longitude]);

  // Get approximate address (would need reverse geocoding API in production)
  const getApproximateLocation = useCallback(() => {
    if (!state.latitude || !state.longitude) return null;
    
    // In production, use a reverse geocoding API
    // For demo, return coordinates with accuracy
    const accuracyText = state.accuracy 
      ? `±${Math.round(state.accuracy)}m` 
      : '';
    
    return {
      coords: `${state.latitude.toFixed(4)}, ${state.longitude.toFixed(4)}`,
      accuracy: accuracyText,
      timestamp: state.timestamp ? new Date(state.timestamp).toLocaleTimeString('pt-BR') : null,
    };
  }, [state.latitude, state.longitude, state.accuracy, state.timestamp]);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Auto-start watching if option is set
  useEffect(() => {
    if (mergedOptions.watchPosition) {
      startWatching();
    }

    return () => {
      stopWatching();
    };
  }, [mergedOptions.watchPosition, startWatching, stopWatching]);

  return {
    ...state,
    getCurrentPosition,
    requestLocation,
    startWatching,
    stopWatching,
    getLocationString,
    getApproximateLocation,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
}

export default useGeolocation;
