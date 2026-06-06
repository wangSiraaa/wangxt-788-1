import { useState, useEffect, useCallback } from 'react';
import { Seat, Reservation, ClosedArea } from '../types';
import { INITIAL_SEATS, initialReservations, initialClosedAreas } from '../data/mockData';

const STORAGE_KEYS = {
  SEATS: 'studyroom_seats',
  RESERVATIONS: 'studyroom_reservations',
  CLOSED_AREAS: 'studyroom_closed_areas'
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
  }
  return defaultValue;
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
};

export const useStore = () => {
  const [seats, setSeats] = useState<Seat[]>(() => 
    loadFromStorage(STORAGE_KEYS.SEATS, INITIAL_SEATS)
  );
  
  const [reservations, setReservations] = useState<Reservation[]>(() => 
    loadFromStorage(STORAGE_KEYS.RESERVATIONS, initialReservations)
  );
  
  const [closedAreas, setClosedAreas] = useState<ClosedArea[]>(() => 
    loadFromStorage(STORAGE_KEYS.CLOSED_AREAS, initialClosedAreas)
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SEATS, seats);
  }, [seats]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RESERVATIONS, reservations);
  }, [reservations]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CLOSED_AREAS, closedAreas);
  }, [closedAreas]);

  const updateSeatStatus = useCallback((seatId: string, status: Seat['status']) => {
    setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status } : s));
  }, []);

  const toggleSeatCleaning = useCallback((seatId: string) => {
    setSeats(prev => prev.map(s => {
      if (s.id === seatId) {
        return { ...s, status: s.status === 'cleaning' ? 'available' : 'cleaning' as Seat['status'] };
      }
      return s;
    }));
  }, []);

  const addReservation = useCallback((reservation: Reservation) => {
    setReservations(prev => [...prev, reservation]);
  }, []);

  const addClosedArea = useCallback((area: ClosedArea) => {
    setClosedAreas(prev => [...prev, area]);
  }, []);

  const removeClosedArea = useCallback((areaId: string) => {
    setClosedAreas(prev => prev.filter(ca => ca.id !== areaId));
  }, []);

  const resetToInitial = useCallback(() => {
    setSeats(INITIAL_SEATS);
    setReservations(initialReservations);
    setClosedAreas(initialClosedAreas);
  }, []);

  return {
    seats,
    reservations,
    closedAreas,
    updateSeatStatus,
    toggleSeatCleaning,
    addReservation,
    addClosedArea,
    removeClosedArea,
    resetToInitial
  };
};

export { INITIAL_SEATS, initialReservations as INITIAL_RESERVATIONS, initialClosedAreas as INITIAL_CLOSED_AREAS };
