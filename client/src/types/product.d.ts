export type ProductStatus = 'available' | 'reserved' | 'sold';
export type ProductCondition = 'new' | 'pre-owned';

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: "cars" | "motorcycles" | "phones";
  status?: ProductStatus;
  condition?: ProductCondition;
  mileage?: number;
  categoryId?: number;
  
  // Additional vehicle details
  transmission?: "automatic" | "manual";
  horsepower?: number;
  engineSize?: string;
  year?: number;
  fuelType?: string;
  vehicleType?: string; // sedan, SUV, compact, etc.
  displacement?: number; // for motorcycles (cc)
}

export type ShippingMethod = {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}
