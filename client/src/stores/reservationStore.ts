import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";

export type Reservation = {
  id: string;
  product: Product;
  date: Date;
  fee: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    message?: string;
  };
};

type ReservationState = {
  reservations: Reservation[];
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation> | { contactInfo: { name: string; email: string; phone: string; message?: string; } }) => void;
  removeReservation: (id: string) => void;
  clearReservations: () => void;
  getReservationCount: () => number;
};

export const useReservationStore = create<ReservationState>()(
  persist(
    (set, get) => ({
      reservations: [],
      
      addReservation: (reservation) => {
        set((state) => ({
          reservations: [...state.reservations, reservation]
        }));
      },
      
      updateReservation: (id, updates) => {
        set((state) => ({
          reservations: state.reservations.map((reservation) => 
            reservation.id === id ? { ...reservation, ...updates } : reservation
          )
        }));
      },
      
      removeReservation: (id) => {
        set((state) => ({
          reservations: state.reservations.filter((reservation) => reservation.id !== id)
        }));
      },
      
      clearReservations: () => {
        set({ reservations: [] });
      },
      
      getReservationCount: () => {
        return get().reservations.length;
      }
    }),
    {
      name: "shop-reservations",
      // Use the standard storage with a few patches to handle Date objects
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          try {
            const parsed = JSON.parse(str, (key, value) => {
              // Convert date strings back to Date objects
              if (typeof value === 'string' && 
                  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
                return new Date(value);
              }
              return value;
            });

            // Ensure all reservation dates are Date objects
            if (parsed?.state?.reservations) {
              parsed.state.reservations = parsed.state.reservations.map((res: any) => ({
                ...res,
                date: res.date instanceof Date ? res.date : new Date(res.date)
              }));
            }
            
            return parsed;
          } catch (e) {
            console.error("Error parsing stored state:", e);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.error("Error storing state:", e);
          }
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);