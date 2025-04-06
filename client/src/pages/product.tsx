import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, CalendarClock, Car, Truck, Phone, CheckCircle2, Info, Clock, BoomBox, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProductById } from "@/lib/products";
import { useCartStore } from "@/stores/cartStore";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ProductStatus, ProductCondition } from "@/types/product";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useReservationStore } from "@/stores/reservationStore";
import { v4 as uuidv4 } from "uuid";

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const product = getProductById(id);
  const addToCart = useCartStore((state) => state.addToCart);
  const { addReservation } = useReservationStore();
  const [reservationFormOpen, setReservationFormOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [isQuickReserving, setIsQuickReserving] = useState(false);

  const handleAddToCart = () => {
    if (product && product.category === 'phones') {
      addToCart(product);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const handleCheckout = () => {
    if (product && product.category === 'phones') {
      // Navigate to the checkout page directly
      addToCart(product);
      navigate("/checkout");
    }
  };

  const handleReserve = () => {
    if (product && (product.category === 'cars' || product.category === 'motorcycles')) {
      // Navigate to the reservation page
      navigate(`/reserve/${product.id}`);
    }
  };

  const handleQuickReserve = () => {
    if (product && (product.category === 'cars' || product.category === 'motorcycles')) {
      setIsQuickReserving(true);
      
      // Create a quick reservation with default values
      setTimeout(() => {
        const reservationFee = product.price * 0.1; // 10% reservation fee
        const newReservation = {
          id: uuidv4(),
          product: product,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          fee: reservationFee,
          status: 'pending' as const,
          contactInfo: {
            name: "Quick Reservation",
            email: "update@example.com",
            phone: "Please update",
            message: "This is a quick reservation. Please update your contact details."
          }
        };
        
        addReservation(newReservation);
        setIsQuickReserving(false);
        
        toast({
          title: "Vehicle Reserved!",
          description: "Your vehicle has been added to My Reservations. You can update your details there.",
        });
        
        navigate("/reservations");
      }, 800);
    }
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Reservation Submitted",
      description: `Your reservation for ${product?.name} has been received. We'll contact you shortly.`,
    });
    setReservationFormOpen(false);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Order Placed Successfully",
      description: "Thank you for your purchase! Your order has been confirmed.",
    });
    setShowCheckout(false);
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">Sorry, we couldn't find the product you're looking for.</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  const { name, price, description, image, category, status = 'available', condition = 'new', mileage } = product;

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
        return <Car className="h-5 w-5 mr-1" />;
      case 'motorcycles':
        return <Truck className="h-5 w-5 mr-1" />;
      case 'phones':
        return <Phone className="h-5 w-5 mr-1" />;
      default:
        return null;
    }
  };

  // Shipping options for phones
  const shippingOptions = [
    { id: "standard", name: "Standard Shipping", price: 5.99, estimatedDays: "3-5 business days" },
    { id: "express", name: "Express Shipping", price: 14.99, estimatedDays: "1-2 business days" },
    { id: "next_day", name: "Next Day Delivery", price: 29.99, estimatedDays: "Next business day" }
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 md:px-6">
        <Button
          variant="outline"
          size="sm"
          className="mb-6"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="overflow-hidden rounded-lg relative">
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Badge className={`${getStatusBadgeStyle(status as ProductStatus)} text-sm px-3 py-1`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Badge className={`${getConditionBadgeStyle(condition as ProductCondition)} text-sm px-3 py-1`}>
                {condition === 'new' ? 'Brand New' : 'Pre-owned'}
              </Badge>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
              <Badge variant="outline" className="flex items-center text-base">
                {getCategoryIcon()}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
            </div>
            
            <div className="mt-4 flex items-center">
              <h2 className="text-3xl font-bold">{formatCurrency(price)}</h2>
              {category !== 'phones' && (
                <p className="ml-2 text-sm text-gray-500">
                  (${Math.round(price * 0.1).toLocaleString()} reservation fee)
                </p>
              )}
            </div>
            
            {/* Status indicators */}
            <div className="mt-4 flex flex-wrap gap-3">
              {status === 'available' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-5 w-5 mr-1" />
                  <span>In Stock</span>
                </div>
              )}
              {status === 'reserved' && (
                <div className="flex items-center text-yellow-600">
                  <Clock className="h-5 w-5 mr-1" />
                  <span>Reserved</span>
                </div>
              )}
              {condition === 'new' && (
                <div className="flex items-center text-blue-600">
                  <Info className="h-5 w-5 mr-1" />
                  <span>Brand New</span>
                </div>
              )}
            </div>
            
            {/* Mileage for vehicles */}
            {(category === 'cars' || category === 'motorcycles') && mileage && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h3 className="font-medium">Vehicle Details</h3>
                <div className="mt-2 flex">
                  <span className="font-medium mr-2">Mileage:</span>
                  <span>{mileage.toLocaleString()} km</span>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-base font-medium">Description</h3>
              <p className="mt-2 text-gray-700">{description}</p>
            </div>
            
            <Separator className="my-6" />
            
            {/* Different actions based on category */}
            {category === 'phones' ? (
              <div className="mt-6">
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleAddToCart} 
                    className="flex items-center"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button 
                    onClick={handleCheckout}
                    variant="default"
                    size="lg"
                    className="flex items-center"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Buy Now
                  </Button>
                  <Button 
                    onClick={() => navigate("/cart")} 
                    variant="outline"
                    size="lg"
                    className="flex items-center"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    View Cart
                  </Button>
                </div>
                
                {/* Phone checkout dialog */}
                <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Complete Your Purchase</DialogTitle>
                      <DialogDescription>
                        Enter your shipping details to complete your purchase of {name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mb-4 flex gap-2">
                      <Button variant="outline" className="w-1/2">Sign In</Button>
                      <Button variant="secondary" className="w-1/2">Create Account</Button>
                    </div>
                    <div className="mb-4 flex items-center">
                      <div className="h-px bg-gray-200 flex-grow"></div>
                      <span className="px-2 text-sm text-gray-500">OR</span>
                      <div className="h-px bg-gray-200 flex-grow"></div>
                    </div>
                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-md mb-4">
                        <p className="text-sm text-blue-800">Checking out as guest</p>
                      </div>
                    
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Shipping Address</Label>
                        <Input id="address" required />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input id="state" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Zip Code</Label>
                          <Input id="zipCode" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Shipping Method</Label>
                        <RadioGroup 
                          value={shippingMethod} 
                          onValueChange={setShippingMethod}
                          className="space-y-2"
                        >
                          {shippingOptions.map(option => (
                            <div key={option.id} className="flex items-center justify-between border p-3 rounded-md">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={option.id} id={option.id} />
                                <Label htmlFor={option.id} className="cursor-pointer">
                                  <div className="font-medium">{option.name}</div>
                                  <div className="text-sm text-gray-500">{option.estimatedDays}</div>
                                </Label>
                              </div>
                              <div className="font-medium">{formatCurrency(option.price)}</div>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      <div className="mt-4 border-t pt-4">
                        <div className="flex justify-between mb-2">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(price)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Shipping:</span>
                          <span>{formatCurrency(shippingOptions.find(o => o.id === shippingMethod)?.price || 0)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(price + (shippingOptions.find(o => o.id === shippingMethod)?.price || 0))}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="submit"
                          className="w-full"
                        >
                          Complete Purchase
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              /* Cars and motorcycles get reservation option */
              <div className="mt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleQuickReserve} 
                    className="flex items-center"
                    size="lg"
                    variant="default"
                    disabled={status !== 'available' || isQuickReserving}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    {isQuickReserving ? (
                      <>
                        <span className="mr-2">Reserving...</span>
                        <span className="animate-spin">⚪</span>
                      </>
                    ) : (
                      <>Reserve Now (${Math.round(price * 0.1).toLocaleString()} fee)</>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleReserve} 
                    className="flex items-center"
                    size="lg"
                    variant="outline"
                    disabled={status !== 'available'}
                  >
                    <CalendarClock className="mr-2 h-5 w-5" />
                    Reserve with Details
                  </Button>
                </div>
                
                {/* Reservation dialog */}
                <Dialog open={reservationFormOpen} onOpenChange={setReservationFormOpen}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Reserve {name}</DialogTitle>
                      <DialogDescription>
                        Fill out this form to reserve this {category === 'cars' ? 'car' : 'motorcycle'} with a ${Math.round(price * 0.1).toLocaleString()} reservation fee.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReservationSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea id="notes" placeholder="Any specific questions or requirements?" />
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-md mt-4">
                        <p className="text-sm text-blue-800">
                          By submitting this reservation, you agree to pay a non-refundable reservation fee of ${Math.round(price * 0.1).toLocaleString()}. This fee will be applied to the final purchase price if you proceed with the purchase.
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setReservationFormOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Submit Reservation
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;
