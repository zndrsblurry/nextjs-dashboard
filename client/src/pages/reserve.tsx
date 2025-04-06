import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BadgeCheck, Calendar as CalendarIcon, CreditCard, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { getProductById } from "@/lib/products";
import { useReservationStore } from "@/stores/reservationStore";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

const ReservePage = () => {
  const [match, params] = useRoute("/reserve/:id");
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // User will need to implement getProductById in lib/products.ts
  const product = params?.id ? getProductById(params.id) : null;
  
  const { addReservation } = useReservationStore();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
  );
  
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  
  const [isPending, setIsPending] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const reservationFee = product ? product.price * 0.1 : 0; // 10% reservation fee
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !selectedDate) return;
    
    setIsPending(true);
    
    // In a real application, we would make an API call to create the reservation here
    // For this frontend implementation, we'll simulate the API call with a timeout
    setTimeout(() => {
      const newReservation = {
        id: uuidv4(),
        product,
        date: selectedDate,
        fee: reservationFee,
        status: 'pending' as const,
        contactInfo
      };
      
      addReservation(newReservation);
      
      setIsPending(false);
      
      toast({
        title: "Reservation Created",
        description: "Your vehicle reservation has been successfully created.",
      });
      
      navigate("/reservations");
    }, 1500);
  };
  
  if (!product) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p>Product not found.</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Reserve a Vehicle</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Reservation Details</CardTitle>
              <CardDescription>
                Please provide your contact information and choose a date to reserve this vehicle.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="John Doe" 
                      value={contactInfo.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={contactInfo.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      placeholder="(123) 456-7890" 
                      value={contactInfo.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Appointment Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Additional Message (Optional)</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    placeholder="Any specific requirements or questions about the vehicle?" 
                    value={contactInfo.message}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
                
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h3 className="font-medium">Reservation Policy:</h3>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>A 10% reservation fee is required to hold the vehicle.</li>
                    <li>This fee is fully refundable if cancelled 48 hours before the appointment.</li>
                    <li>The reservation will be held for 7 days.</li>
                    <li>The fee will be deducted from the final purchase price if you decide to buy.</li>
                  </ul>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Reserve Now
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square rounded-md overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </p>
                
                <div className="flex gap-2 mb-4">
                  {product.condition && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                      {product.condition}
                    </Badge>
                  )}
                  {product.status && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                      {product.status}
                    </Badge>
                  )}
                </div>
                
                {product.mileage && (
                  <p className="text-sm font-medium mb-2">
                    Mileage: {product.mileage.toLocaleString()} miles
                  </p>
                )}
                
                <p className="text-sm mb-6">{product.description}</p>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Vehicle Price:</span>
                    <span className="font-medium">{formatCurrency(product.price)}</span>
                  </div>
                  
                  <div className="flex justify-between font-medium text-lg">
                    <span>Reservation Fee (10%):</span>
                    <span className="text-primary">{formatCurrency(reservationFee)}</span>
                  </div>
                  
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <BadgeCheck className="h-4 w-4 mr-1 text-green-500" />
                    <span>This fee will be applied to your purchase</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReservePage;