import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  primaryLocation: string | null;
  secondaryLocation: string | null;
  setLocation: (lat: number, lng: number) => void;
  setPrimaryLocation: (location: string) => void;
  setSecondaryLocation: (location: string) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      primaryLocation: null,
      secondaryLocation: null,

      setLocation: (lat, lng) =>
        set(() => ({
          latitude: lat,
          longitude: lng,
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
    }),
    {
      name: 'location-storage', // storage key
      storage: createJSONStorage(() => AsyncStorage), // persist to AsyncStorage
    }
  )
);
