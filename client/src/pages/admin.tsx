import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Search, Loader2, Pencil, Plus, Trash2, Image, RefreshCw, Filter, AlertTriangle, Save } from "lucide-react";
import { getProductDetails, getVehicleSuggestions, checkImageAvailability, generateProductThumbnail } from "@/lib/vehicle-api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { ProductStatus, ProductCondition } from "@/types/product";
import { formatCurrency } from "@/lib/utils";

type EditableProduct = {
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
  vehicleType?: string;
  displacement?: number;
  
  // Additional phone details
  processor?: string;
  ram?: string;
  storage?: string;
  batteryCapacity?: string;
  screenSize?: string;
  screenType?: string;
  refreshRate?: string;
  camera?: string;
  operatingSystem?: string;
  connectivity?: string;
  dimensions?: string;
  weight?: string;
  waterResistance?: string;
};

const AdminPage = () => {
  // Fetch products from the API
  const { data: apiProducts, isLoading: isLoadingProducts, refetch } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const allProducts = apiProducts || [];
  
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);
  const [newProduct, setNewProduct] = useState<EditableProduct & {categoryId?: number}>({
    id: "",
    name: "",
    price: 0,
    description: "",
    image: "",
    category: "phones",
    categoryId: 3, // Default to phones (id 3)
    status: "available",
    condition: "new"
  });
  
  // Image generation state
  const [generatingImageFor, setGeneratingImageFor] = useState<number | string | null>(null);
  const [imageOptions, setImageOptions] = useState<string[]>([]);
  const [openImageDropdown, setOpenImageDropdown] = useState<number | null>(null);
  // Track image generation errors
  const [imageGenErrors, setImageGenErrors] = useState<string[]>([]);
  
  // Vehicle search AI functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleSuggestions, setVehicleSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to fetch vehicle suggestions based on search query
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setVehicleSuggestions([]);
        return;
      }
      
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set a new timeout to avoid too many API calls
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const suggestions = await getVehicleSuggestions(searchQuery);
          setVehicleSuggestions(suggestions);
        } catch (error) {
          console.error('Error fetching vehicle suggestions:', error);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    };
    
    fetchSuggestions();
    
    // Clean up timeout
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);
  
  // Function to fetch product details and fill form fields
  const fetchVehicleDetails = async (productName: string) => {
    setIsLoadingDetails(true);
    try {
      // Make the search context-aware based on the selected category
      let searchQuery = productName;
      if (newProduct.category) {
        if (newProduct.category === 'phones') {
          searchQuery = `${productName} phone`; // Add 'phone' to make search more specific for phones
        } else if (newProduct.category === 'cars') {
          searchQuery = `${productName} car`; // Add 'car' to make search more specific for cars
        } else if (newProduct.category === 'motorcycles') {
          searchQuery = `${productName} motorcycle`; // Add 'motorcycle' to make search more specific
        }
      }
      
      const details = await getProductDetails(searchQuery);
      if (details) {
        // Map category to categoryId
        const categoryMap = { cars: 1, motorcycles: 2, phones: 3 };
        
        // Override the category from API with the selected category if we already selected one
        const category = newProduct.category || details.category;
        const categoryId = categoryMap[category];
        
        const productData = {
          ...newProduct,
          name: details.name,
          description: details.description,
          image: details.image,
          price: details.price,
          category: category,
          categoryId: categoryId,
          status: "available" as ProductStatus, // Add type assertion
          condition: details.condition,
          year: details.year
        };
        
        // Add vehicle-specific details
        if (category === 'cars' || category === 'motorcycles') {
          // Need to cast to VehicleDetails to access vehicle-specific properties
          const vehicleDetails = details as import('@/lib/vehicle-api').VehicleDetails;
          Object.assign(productData, {
            transmission: vehicleDetails.transmission,
            horsepower: vehicleDetails.horsepower,
            engineSize: vehicleDetails.engineSize,
            fuelType: vehicleDetails.fuelType,
            vehicleType: vehicleDetails.vehicleType,
            displacement: vehicleDetails.displacement
          });
        }
        
        // Add phone-specific details if it's a phone
        if (category === 'phones') {
          // Need to cast to PhoneDetails to access phone-specific properties
          const phoneDetails = details as import('@/lib/vehicle-api').PhoneDetails;
          Object.assign(productData, {
            processor: phoneDetails.processor,
            ram: phoneDetails.ram,
            storage: phoneDetails.storage,
            batteryCapacity: phoneDetails.batteryCapacity,
            screenSize: phoneDetails.screenSize,
            screenType: phoneDetails.screenType,
            refreshRate: phoneDetails.refreshRate,
            camera: phoneDetails.camera,
            operatingSystem: phoneDetails.operatingSystem,
            connectivity: phoneDetails.connectivity,
            dimensions: phoneDetails.dimensions,
            weight: phoneDetails.weight,
            waterResistance: phoneDetails.waterResistance
          });
        }

        setNewProduct(productData);
        
        toast({
          title: "Product details loaded!",
          description: `${details.name} details have been loaded. You can edit them before creating the product.`,
        });
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast({
        title: "Error fetching details",
        description: "There was a problem loading product details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetails(false);
      setPopoverOpen(false);
      setSearchQuery('');
    }
  };

  const handleEdit = (product: EditableProduct) => {
    setEditingProduct({ ...product });
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    
    try {
      await apiRequest('PUT', `/api/products/${editingProduct.id}`, editingProduct);
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
      setEditingProduct(null);
      refetch(); // Refresh the product list
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating the product.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest('DELETE', `/api/products/${id}`);
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });
      refetch(); // Refresh the product list
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Delete failed",
        description: "There was a problem deleting the product.",
        variant: "destructive"
      });
    }
  };

  // Generate product images using Google Images search
  const generateMultipleImages = async (product: any) => {
    console.log("Generating images for product:", product);
    
    // Check if the product object has all required fields
    if (!product) {
      toast({
        title: "Invalid product",
        description: "Cannot find images for an invalid product.",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure product has a name property
    if (!product.name) {
      toast({
        title: "Missing product name",
        description: "Product name is required to find images.",
        variant: "destructive"
      });
      return;
    }
    
    // For products from the database, the category might be a relationship object
    // or we need to determine it from categoryId
    let category = product.category;
    
    // If category is missing but we have categoryId, map it to the appropriate category name
    if (!category && product.categoryId) {
      const categoryMap: Record<number, string> = { 1: 'cars', 2: 'motorcycles', 3: 'phones' };
      category = categoryMap[product.categoryId];
    }
    
    if (!category) {
      toast({
        title: "Missing category",
        description: "Product category is required to find images.",
        variant: "destructive"
      });
      return;
    }
    
    // At this point we have both name and category
    console.log(`Generating images for: ${product.name} (${category})`);
    
    setGeneratingImageFor(product.id);
    setImageOptions([]);
    setImageGenErrors([]);
    
    try {
      // Find multiple images from Google Images
      const result = await generateProductThumbnail(product.name, category);
      
      if (result.imageOptions && result.imageOptions.length > 0) {
        // Show the options in the dropdown
        setImageOptions(result.imageOptions);
        setOpenImageDropdown(product.id);
        
        toast({
          title: "Images found",
          description: `Found ${result.imageOptions.length} images. Click on one to select it.`,
        });
        
        // If we only have one image, use it automatically
        if (result.imageOptions.length === 1 && result.imageUrl) {
          await updateProductImage(product.id, result.imageUrl);
        }
      } else if (result.imageUrl) {
        // If we have a single image but no options, update directly
        await updateProductImage(product.id, result.imageUrl);
        toast({
          title: "Image updated",
          description: "Product image has been updated with a result from Google Images."
        });
      } else {
        // Store the error message
        if (result.error) {
          setImageGenErrors([result.error]);
        }
        
        toast({
          title: "Image search failed",
          description: result.error || "Failed to find images from Google. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error finding images:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setImageGenErrors([errorMessage]);
      
      toast({
        title: "Image search failed",
        description: `Error: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setGeneratingImageFor(null);
    }
  };
  
  // Update product image
  const updateProductImage = async (productId: number, imageUrl: string) => {
    try {
      await apiRequest('PATCH', `/api/products/${productId}`, { image: imageUrl });
      
      toast({
        title: "Image updated",
        description: "The product image has been updated successfully."
      });
      
      // Reset states and refresh product list
      setOpenImageDropdown(null);
      setImageOptions([]);
      refetch();
    } catch (error) {
      console.error('Error updating product image:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating the product image.",
        variant: "destructive"
      });
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.image || newProduct.price <= 0) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Remove the id as it will be generated by the server
      const { id, ...productToCreate } = newProduct;
      
      await apiRequest('POST', '/api/products', productToCreate);
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
      
      // Reset form
      setNewProduct({
        id: "",
        name: "",
        price: 0,
        description: "",
        image: "",
        category: "phones",
        categoryId: 3, // Default to phones (id 3)
        status: "available",
        condition: "new"
      });
      
      // Refresh the product list
      refetch();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Creation failed",
        description: "There was a problem creating the product.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Manage Products</h2>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Export
            </Button>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>
                Create a new product listing in your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {newProduct.category && (
                <div className="mb-6 pb-6 border-b-2 border-gray-100">
                  <Label htmlFor="product-search" className="text-base font-medium mb-2 block">
                    AI-Powered {newProduct.category === "phones" ? "Phone" : "Vehicle"} Search
                  </Label>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <div className="flex relative">
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={popoverOpen}
                              className="w-full justify-between"
                              disabled={isLoadingDetails}
                            >
                              {searchQuery || `Search for a ${newProduct.category === "phones" ? "phone" : "vehicle"}...`}
                            </Button>
                            <div className="absolute inset-y-0 right-3 flex items-center">
                              {isSearching ? (
                                <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
                              ) : (
                                <Search className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5}>
                          <Command
                            filter={(value, search) => {
                              if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                              return 0;
                            }}
                          >
                            <CommandInput
                              placeholder={`Search for a ${newProduct.category === "phones" ? "phone" : "vehicle"}...`}
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                              className="h-9"
                            />
                            <CommandEmpty>No {newProduct.category === "phones" ? "phone" : "vehicle"} found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-auto">
                              {vehicleSuggestions.map((suggestion) => (
                                <CommandItem
                                  key={suggestion}
                                  value={suggestion}
                                  onSelect={() => fetchVehicleDetails(suggestion)}
                                >
                                  {suggestion}
                                  <Check
                                    className={`ml-auto h-4 w-4 opacity-0`}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button
                      disabled={isLoadingDetails}
                      onClick={() => fetchVehicleDetails(searchQuery)}
                    >
                      {isLoadingDetails ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      ) : null}
                      Auto-Fill
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Search for a {newProduct.category === "phones" ? "phone" : "vehicle"} to automatically fill product details using AI.
                  </p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="new-name">Product Name</Label>
                  <Input 
                    id="new-name" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter product name" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-price">Price ($)</Label>
                  <Input 
                    id="new-price" 
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    placeholder="Enter price" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-category">Category</Label>
                  <Select 
                    value={newProduct.category}
                    onValueChange={(value: "cars" | "motorcycles" | "phones") => {
                      // Update category and categoryId based on selection
                      const categoryMap = { cars: 1, motorcycles: 2, phones: 3 };
                      setNewProduct({
                        ...newProduct, 
                        category: value,
                        categoryId: categoryMap[value]
                      });
                    }}
                  >
                    <SelectTrigger id="new-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cars">Cars</SelectItem>
                      <SelectItem value="motorcycles">Motorcycles</SelectItem>
                      <SelectItem value="phones">Phones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-status">Status</Label>
                  <Select 
                    value={newProduct.status}
                    onValueChange={(value: ProductStatus) => 
                      setNewProduct({...newProduct, status: value})
                    }
                  >
                    <SelectTrigger id="new-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-condition">Condition</Label>
                  <Select 
                    value={newProduct.condition}
                    onValueChange={(value: ProductCondition) => 
                      setNewProduct({...newProduct, condition: value})
                    }
                  >
                    <SelectTrigger id="new-condition">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="pre-owned">Pre-owned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newProduct.category === "cars" || newProduct.category === "motorcycles") && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="new-mileage">Mileage</Label>
                      <Input 
                        id="new-mileage" 
                        type="number"
                        value={newProduct.mileage || 0}
                        onChange={(e) => setNewProduct({...newProduct, mileage: parseInt(e.target.value)})}
                        placeholder="Enter mileage" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-year">Year</Label>
                      <Input 
                        id="new-year" 
                        type="number"
                        value={newProduct.year || new Date().getFullYear()}
                        onChange={(e) => setNewProduct({...newProduct, year: parseInt(e.target.value)})}
                        placeholder="Enter year" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-transmission">Transmission</Label>
                      <Select 
                        value={newProduct.transmission}
                        onValueChange={(value: "automatic" | "manual") => 
                          setNewProduct({...newProduct, transmission: value})
                        }
                      >
                        <SelectTrigger id="new-transmission">
                          <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-horsepower">Horsepower</Label>
                      <Input 
                        id="new-horsepower" 
                        type="number"
                        value={newProduct.horsepower || 0}
                        onChange={(e) => setNewProduct({...newProduct, horsepower: parseInt(e.target.value)})}
                        placeholder="Enter horsepower" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-engine-size">Engine Size</Label>
                      <Input 
                        id="new-engine-size" 
                        value={newProduct.engineSize || ""}
                        onChange={(e) => setNewProduct({...newProduct, engineSize: e.target.value})}
                        placeholder="Enter engine size (e.g. 2.0L)" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-fuel-type">Fuel Type</Label>
                      <Input 
                        id="new-fuel-type" 
                        value={newProduct.fuelType || ""}
                        onChange={(e) => setNewProduct({...newProduct, fuelType: e.target.value})}
                        placeholder="Enter fuel type" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-vehicle-type">Vehicle Type</Label>
                      <Input 
                        id="new-vehicle-type" 
                        value={newProduct.vehicleType || ""}
                        onChange={(e) => setNewProduct({...newProduct, vehicleType: e.target.value})}
                        placeholder="Enter vehicle type (e.g. sedan, SUV)" 
                      />
                    </div>
                    {newProduct.category === "motorcycles" && (
                      <div className="grid gap-2">
                        <Label htmlFor="new-displacement">Displacement (cc)</Label>
                        <Input 
                          id="new-displacement" 
                          type="number"
                          value={newProduct.displacement || 0}
                          onChange={(e) => setNewProduct({...newProduct, displacement: parseInt(e.target.value)})}
                          placeholder="Enter displacement in cc" 
                        />
                      </div>
                    )}
                  </>
                )}
                <div className="grid gap-2 sm:col-span-2">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor="new-image" className="block mb-2">Image URL</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="new-image" 
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                          placeholder="Enter image URL"
                        />
                        <Popover open={openImageDropdown === -1} onOpenChange={(open) => {
                          if (!open) setOpenImageDropdown(null);
                        }}>
                          <PopoverTrigger asChild>
                            <Button 
                              disabled={generatingImageFor === 'new' || !newProduct.image}
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                if (openImageDropdown === -1) {
                                  setOpenImageDropdown(null);
                                } else if (imageOptions.length > 0) {
                                  setOpenImageDropdown(-1);
                                }
                              }}
                            >
                              <Image className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-64 p-2">
                            <div className="space-y-2">
                              <div className="font-medium text-sm">Select an image:</div>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                {imageOptions.map((img, index) => (
                                  <div 
                                    key={index} 
                                    className="relative cursor-pointer rounded-md overflow-hidden border border-border hover:border-primary group"
                                    onClick={() => {
                                      setNewProduct({...newProduct, image: img});
                                      setOpenImageDropdown(null);
                                    }}
                                  >
                                    <img 
                                      src={img} 
                                      alt={`Option ${index + 1}`}
                                      className="w-full aspect-square object-cover"
                                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                        e.currentTarget.src = "https://placehold.co/60x60/EEE/999?text=Error";
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Check className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button 
                          variant="outline"
                          disabled={generatingImageFor === 'new'}
                          onClick={async () => {
                            if (!newProduct.name || !newProduct.category) {
                              toast({
                                title: "Missing information",
                                description: "Please provide a product name and category first.",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            try {
                              setGeneratingImageFor('new');
                              const result = await generateProductThumbnail(newProduct.name, newProduct.category);
                              
                              if (result.imageOptions && result.imageOptions.length > 0) {
                                // If we have multiple image options, show them in a popover
                                setImageOptions(result.imageOptions);
                                
                                // Use the first image right away
                                if (result.imageUrl) {
                                  setNewProduct({...newProduct, image: result.imageUrl});
                                }
                                
                                // Set the current popover to show image options
                                setOpenImageDropdown(-1);
                                
                                toast({
                                  title: "Images found",
                                  description: `Found ${result.imageOptions.length} images. Click the image icon to see all options.`,
                                });
                              } else if (result.imageUrl) {
                                // If we only have one image, use it directly
                                setNewProduct({...newProduct, image: result.imageUrl});
                                toast({
                                  title: "Image found",
                                  description: "An image has been found from Google for this product."
                                });
                              } else {
                                // Show the specific error message if available
                                const errorMessage = result.error || "Failed to find an image from Google.";
                                toast({
                                  title: "Image search failed",
                                  description: `${errorMessage} Please try again or enter a URL manually.`,
                                  variant: "destructive"
                                });
                              }
                            } catch (error) {
                              console.error('Error generating thumbnail:', error);
                              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                              
                              toast({
                                title: "Generation failed",
                                description: `Error: ${errorMessage}. Please try again.`,
                                variant: "destructive"
                              });
                            } finally {
                              setGeneratingImageFor(null);
                            }
                          }}
                        >
                          {generatingImageFor === 'new' ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Find Images
                        </Button>
                      </div>
                    </div>
                    {newProduct.image && (
                      <div className="flex items-center gap-2">
                        <div className="relative w-20 h-20 border rounded overflow-hidden">
                          <img 
                            src={newProduct.image} 
                            alt="Product preview"
                            className="w-full h-full object-cover"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              e.currentTarget.src = "https://placehold.co/60x60/EEE/999?text=No+Image";
                            }}
                          />
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const isAvailable = await checkImageAvailability(newProduct.image);
                            if (isAvailable) {
                              toast({
                                title: "Image check",
                                description: "The image URL is valid and accessible."
                              });
                            } else {
                              toast({
                                title: "Image check",
                                description: "The image URL is not accessible. Please enter a valid URL or generate a new one.",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <Image className="h-4 w-4 mr-2" />
                          Check
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="new-description">Description</Label>
                  <Textarea 
                    id="new-description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Enter product description" 
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateProduct} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Create Product
              </Button>
            </CardFooter>
          </Card>
          
          <div className="rounded-md border">
            {isLoadingProducts ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading products...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiProducts && apiProducts.length > 0 ? (
                    apiProducts.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 rounded-md object-cover"
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.src = "https://placehold.co/60x60/EEE/999?text=No+Image";
                              }}
                            />
                            
                            <Popover open={openImageDropdown === product.id} onOpenChange={(open) => {
                              if (!open) setOpenImageDropdown(null);
                            }}>
                              <PopoverTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  disabled={!!editingProduct || generatingImageFor === product.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (openImageDropdown === product.id) {
                                      setOpenImageDropdown(null);
                                    } else {
                                      generateMultipleImages(product);
                                    }
                                  }}
                                >
                                  {generatingImageFor === product.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Image className="h-4 w-4" />
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="start" className="w-64 p-2">
                                <div className="space-y-2">
                                  <div className="font-medium text-sm">Select an image:</div>
                                  <div className="grid grid-cols-2 gap-2 mb-2">
                                    {imageOptions.map((img, index) => (
                                      <div 
                                        key={index} 
                                        className="relative cursor-pointer rounded-md overflow-hidden border border-border hover:border-primary group"
                                        onClick={() => updateProductImage(product.id, img)}
                                      >
                                        <img 
                                          src={img} 
                                          alt={`Option ${index + 1}`}
                                          className="w-full aspect-square object-cover"
                                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                            e.currentTarget.src = "https://placehold.co/60x60/EEE/999?text=Error";
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Check className="h-5 w-5 text-white" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <Button 
                                    className="w-full" 
                                    size="sm"
                                    variant="secondary"
                                    disabled={generatingImageFor === product.id}
                                    onClick={() => generateMultipleImages(product)}
                                  >
                                    {generatingImageFor === product.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                      </>
                                    ) : (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Generate More Options
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {editingProduct?.id === product.id ? (
                            <Input 
                              value={editingProduct?.name ?? ""} 
                              onChange={(e) => editingProduct && setEditingProduct({...editingProduct, name: e.target.value} as EditableProduct)}
                            />
                          ) : (
                            product.name
                          )}
                        </TableCell>
                        <TableCell>
                          {editingProduct?.id === product.id ? (
                            <Select 
                              value={editingProduct?.category ?? "phones"}
                              onValueChange={(value: "cars" | "motorcycles" | "phones") => 
                                editingProduct && setEditingProduct({...editingProduct, category: value} as EditableProduct)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cars">Cars</SelectItem>
                                <SelectItem value="motorcycles">Motorcycles</SelectItem>
                                <SelectItem value="phones">Phones</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            product.category ? (product.category.charAt(0).toUpperCase() + product.category.slice(1)) : 'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {editingProduct?.id === product.id ? (
                            <Select 
                              value={editingProduct?.status ?? "available"}
                              onValueChange={(value: ProductStatus) => 
                                editingProduct && setEditingProduct({...editingProduct, status: value} as EditableProduct)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="reserved">Reserved</SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            product.status || "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          {editingProduct?.id === product.id ? (
                            <Select 
                              value={editingProduct?.condition ?? "new"}
                              onValueChange={(value: ProductCondition) => 
                                editingProduct && setEditingProduct({...editingProduct, condition: value} as EditableProduct)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="pre-owned">Pre-owned</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            product.condition || "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          {editingProduct?.id === product.id ? (
                            <Input 
                              type="number"
                              value={editingProduct?.price ?? 0} 
                              onChange={(e) => editingProduct && setEditingProduct({...editingProduct, price: parseFloat(e.target.value)} as EditableProduct)}
                            />
                          ) : (
                            formatCurrency(product.price)
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingProduct?.id === product.id ? (
                            <Button size="sm" onClick={handleSave} className="mr-2">
                              <Save className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(product as EditableProduct)} className="mr-2">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {isLoadingProducts ? (
                          <span className="flex justify-center items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No products found.</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                View and manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-10">Order management features will be added soon</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                View and manage customer accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-10">Customer management features will be added soon</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                View sales and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-10">Analytics features will be added soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;