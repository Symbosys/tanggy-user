import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkLocationPermission,
  getCurrentLocation,
  requestLocationPermission,
  turnOnLocation,
} from '../utils/permissions/location';

const OLA_API_KEY = 'AbLgb9uuCk5EsknyN9nd1hol4dk85ehUH7izgU1e';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  primaryLocation: string | null;
  secondaryLocation: string | null;
  setLocation: (lat: number, lng: number, primary?: string, secondary?: string) => void;
  setPrimaryLocation: (location: string) => void;
  setSecondaryLocation: (location: string) => void;
  clearLocation: () => void;
  initializeLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      latitude: null,
      longitude: null,
      primaryLocation: null,
      secondaryLocation: null,

      setLocation: (lat, lng, primary, secondary) =>
        set((state) => ({
          latitude: lat,
          longitude: lng,
          primaryLocation: primary !== undefined ? primary : state.primaryLocation,
          secondaryLocation: secondary !== undefined ? secondary : state.secondaryLocation,
        })),

      setPrimaryLocation: (location) =>
        set(() => ({
          primaryLocation: location,
        })),

      setSecondaryLocation: (location) =>
        set(() => ({
          secondaryLocation: location,
        })),

      clearLocation: () =>
        set(() => ({
          latitude: null,
          longitude: null,
          primaryLocation: null,
          secondaryLocation: null,
        })),

      initializeLocation: async () => {
        const { latitude, longitude } = get();
        // If location is already found in store, do nothing
        if (latitude && longitude) return;

        try {
          const hasPermission = await checkLocationPermission();
          if (!hasPermission) {
            const requested = await requestLocationPermission();
            if (!requested) return;
          }

          await turnOnLocation();
          const location = await getCurrentLocation();
          if (location) {
            set({ latitude: location.latitude, longitude: location.longitude });

            // Reverse Geocode using Ola Maps (matching SetLocation.tsx logic)
            try {
              const response = await fetch(
                `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${location.latitude},${location.longitude}&api_key=${OLA_API_KEY}`
              );
              const data = await response.json();

              if (data && data.status === 'ok' && data.results && data.results.length > 0) {
                const fullAddress = data.results[0].formatted_address;
                const primary = fullAddress.split(',')[0] || 'Unknown';
                const secondary = fullAddress.split(',').slice(1).join(', ').trim() || '';
                set({ primaryLocation: primary, secondaryLocation: secondary });
              }
            } catch (error) {
              console.error('Reverse geocoding error:', error);
            }
          }
        } catch (error) {
          console.error('Auto location error:', error);
        }
      },
    }),
    {
      name: 'location-storage', // storage key
      storage: createJSONStorage(() => AsyncStorage), // persist to AsyncStorage
    }
  )
);
