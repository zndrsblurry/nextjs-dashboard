import { useReservationStore } from "@/stores/reservationStore";
import { v4 as uuidv4 } from "uuid";
import { products } from "@/lib/products";

// This is a helper utility to add a sample reservation for testing
export const addSampleReservation = () => {
  const { addReservation, reservations } = useReservationStore.getState();
  
  // Skip if we already have sample reservations
  if (reservations.length > 0) {
    return;
  }
  
  // Find a car product for the reservation
  const carProducts = products.filter(p => p.category === "cars");
  if (carProducts.length === 0) {
    return;
  }
  
  const product = carProducts[0];
  const fee = product.price * 0.1; // 10% reservation fee
  
  const newReservation = {
    id: uuidv4(),
    product,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    fee,
    status: 'pending' as const,
    contactInfo: {
      name: "Demo User",
      email: "demo@example.com",
      phone: "(555) 123-4567",
      message: "I'd like to see this vehicle in person."
    }
  };
  
  addReservation(newReservation);
  
  console.log("Sample reservation added:", newReservation);
};