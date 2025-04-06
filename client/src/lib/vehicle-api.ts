import { apiRequest } from './queryClient';

export interface VehicleDetails {
  name: string;
  description: string;
  image: string;
  price: number;
  category: "cars" | "motorcycles";
  status: "available";
  condition: "new" | "pre-owned";
  year: number;
  transmission?: "automatic" | "manual";
  horsepower?: number;
  engineSize?: string;
  fuelType?: string;
  vehicleType?: string;
  displacement?: number;
}

export interface PhoneDetails {
  name: string;
  description: string;
  image: string;
  price: number;
  category: "phones";
  status: "available";
  condition: "new" | "pre-owned";
  year: number;
  processor: string;
  ram: string;
  storage: string;
  batteryCapacity: string;
  screenSize: string;
  screenType: string;
  refreshRate: string;
  camera: string;
  operatingSystem: string;
  connectivity: string;
  dimensions?: string;
  weight?: string;
  waterResistance?: string;
}

export type ProductDetails = VehicleDetails | PhoneDetails;

export async function getVehicleSuggestions(query: string): Promise<string[]> {
  try {
    if (!query || query.length < 2) return [];
    
    const response = await apiRequest(
      "GET", 
      `/api/vehicles/suggestions?query=${encodeURIComponent(query)}`
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching vehicle suggestions:', error);
    return [];
  }
}

export async function getProductDetails(name: string): Promise<ProductDetails | null> {
  try {
    if (!name) return null;
    
    const response = await apiRequest(
      "GET", 
      `/api/vehicles/details?name=${encodeURIComponent(name)}`
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
}

// Keep the original function for backward compatibility
export async function getVehicleDetails(name: string): Promise<VehicleDetails | null> {
  try {
    const product = await getProductDetails(name);
    
    // Check if the product is a vehicle
    if (product && (product.category === 'cars' || product.category === 'motorcycles')) {
      return product as VehicleDetails;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    return null;
  }
}

export async function checkImageAvailability(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) return false;
    
    const response = await apiRequest(
      "GET", 
      `/api/vehicles/check-image?url=${encodeURIComponent(imageUrl)}`
    );
    
    const data = await response.json();
    return data.isAvailable;
  } catch (error) {
    console.error('Error checking image availability:', error);
    return false;
  }
}

export async function generateProductThumbnail(
  productName: string, 
  category: string
): Promise<{ imageUrl: string | null; imageOptions?: string[]; error?: string }> {
  try {
    if (!productName || !category) {
      return { 
        imageUrl: null, 
        imageOptions: [],
        error: "Product name and category are required" 
      };
    }
    
    console.log(`Requesting images for ${productName} (${category})...`);
    
    const response = await apiRequest(
      "POST", 
      "/api/vehicles/generate-thumbnail",
      { productName, category }
    );
    
    const data = await response.json();
    
    // Handle cases where the server returns an error but with a 200 status code
    if (data.error) {
      console.warn('Server returned an error:', data.error);
      return { 
        imageUrl: null, 
        imageOptions: [],
        error: data.error 
      };
    }
    
    // Extract image options from the response
    const imageOptions = data.imageOptions || [];
    
    // If we have an imageUrl, confirm it exists by checking it
    if (data.imageUrl) {
      const isAvailable = await checkImageAvailability(data.imageUrl);
      
      if (!isAvailable) {
        return { 
          imageUrl: null,
          imageOptions, // Still return any other valid options
          error: "The primary image URL is not accessible" 
        };
      }
      
      console.log(`Successfully found image for ${productName}`);
      return { 
        imageUrl: data.imageUrl,
        imageOptions
      };
    }
    
    return { 
      imageUrl: null,
      imageOptions, 
      error: "No primary image URL was returned from the server" 
    };
  } catch (error) {
    console.error('Error generating product images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return { 
      imageUrl: null,
      imageOptions: [],
      error: `Failed to find product images: ${errorMessage}` 
    };
  }
}