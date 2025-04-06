import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CalendarClock, Car, Truck, Phone } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductStatus, ProductCondition } from "@/types/product";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { id, name, price, description, image, category, status = 'available', condition = 'new', mileage } = product;
  const addToCart = useCartStore((state) => state.addToCart);
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (category === 'phones') {
      addToCart(product);
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
        duration: 2000,
      });
    }
  };

  const handleReserve = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show a toast notification
    toast({
      title: "Reservation",
      description: `You're about to reserve ${name}. Continue to details.`,
      duration: 2000,
    });
    
    // Navigate to the reserve page with the product ID
    navigate(`/reserve/${id}`);
  };

  // Status badge color
  const getStatusBadgeStyle = (status: ProductStatus) => {
    switch (status) {
      case 'available':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'reserved':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case 'sold':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Condition badge color
  const getConditionBadgeStyle = (condition: ProductCondition) => {
    switch (condition) {
      case 'new':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case 'pre-owned':
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Category icon
  const getCategoryIcon = () => {
    switch (category) {
      case 'cars':
        return <Car className="h-4 w-4 mr-1" />;
      case 'motorcycles':
        return <Truck className="h-4 w-4 mr-1" />;
      case 'phones':
        return <Phone className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md h-full">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg relative">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Badge className={`${getStatusBadgeStyle(status as ProductStatus)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          <Badge className={`${getConditionBadgeStyle(condition as ProductCondition)}`}>
            {condition === 'new' ? 'New' : 'Pre-owned'}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">{name}</h3>
          <Badge variant="outline" className="flex items-center">
            {getCategoryIcon()}
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mt-2">{description}</p>
        
        {/* Display mileage for cars and motorcycles */}
        {(category === 'cars' || category === 'motorcycles') && mileage && (
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-medium">Mileage:</span> {mileage.toLocaleString()} km
          </p>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold">{formatCurrency(price)}</span>
          <div className="flex space-x-2">
            {/* Phones get Add to Cart button, vehicles get Reserve button */}
            {category === 'phones' ? (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleAddToCart}
                className="flex items-center"
                disabled={status !== 'available'}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleReserve}
                className="flex items-center"
                disabled={status !== 'available'}
              >
                <CalendarClock className="h-4 w-4 mr-1" />
                Reserve
              </Button>
            )}
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/product/${id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
