import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/stores/cartStore";
import { formatCurrency } from "@/lib/utils";
import { 
  CreditCard, 
  ShoppingBag, 
  MapPin, 
  Truck, 
  CheckCircle,
  ArrowLeft,
  Smartphone
} from "lucide-react";

const shippingMethods = [
  { id: "standard", name: "Standard Shipping", price: 5.99, estimatedDays: "3-5 business days" },
  { id: "express", name: "Express Shipping", price: 14.99, estimatedDays: "1-2 business days" },
  { id: "next-day", name: "Next Day Air", price: 29.99, estimatedDays: "Next business day" },
];

const CheckoutPage = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { cart, getTotalPrice, clearCart } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Philippines",
    email: "",
    phone: ""
  });
  
  const [shippingMethod, setShippingMethod] = useState(shippingMethods[0].id);
  
  const [paymentMethod, setPaymentMethod] = useState<'creditCard' | 'gcash'>('gcash');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isProcessingGcash, setIsProcessingGcash] = useState(false);
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });
  
  const [gcashInfo, setGcashInfo] = useState({
    mobileNumber: "",
    otp: ""
  });
  
  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGcashInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGcashInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address || 
        !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode || 
        !shippingInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep(2);
  };
  
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on payment method
    if (paymentMethod === 'creditCard') {
      if (!paymentInfo.cardName || !paymentInfo.cardNumber || 
          !paymentInfo.expiryDate || !paymentInfo.cvv) {
        toast({
          title: "Missing Information",
          description: "Please fill out all credit card details.",
          variant: "destructive",
        });
        return;
      }
    } else if (paymentMethod === 'gcash') {
      if (!gcashInfo.mobileNumber) {
        toast({
          title: "Missing Information",
          description: "Please enter your GCash mobile number.",
          variant: "destructive",
        });
        return;
      }
      
      // If OTP field is hidden (not yet sent)
      if (!gcashInfo.otp && !isProcessingGcash) {
        setIsProcessingGcash(true);
        
        // Simulate sending OTP to mobile number
        toast({
          title: "OTP Sent",
          description: `We've sent a verification code to ${gcashInfo.mobileNumber}. Please enter it to complete your payment.`,
        });
        
        // Show OTP field
        setShowOtpField(true);
        setIsProcessingGcash(false);
        return;
      }
      
      // Validate OTP
      if (showOtpField && !gcashInfo.otp) {
        toast({
          title: "Missing OTP",
          description: "Please enter the verification code sent to your mobile number.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Process payment based on method
    setCurrentStep(3);
    
    // Simulate order completion based on payment method
    setTimeout(() => {
      clearCart();
      if (paymentMethod === 'gcash') {
        toast({
          title: "GCash Payment Successful!",
          description: "Your payment via GCash has been processed. Thank you for your purchase!",
        });
      } else {
        toast({
          title: "Credit Card Payment Successful!",
          description: "Your credit card payment has been processed. Thank you for your purchase!",
        });
      }
    }, 1500);
  };
  
  const getSelectedShippingMethod = () => {
    return shippingMethods.find(method => method.id === shippingMethod) || shippingMethods[0];
  };
  
  const calculateTotal = () => {
    const subtotal = getTotalPrice();
    const shipping = getSelectedShippingMethod().price;
    const tax = subtotal * 0.08; // 8% tax rate
    return subtotal + shipping + tax;
  };
  
  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            You don't have any items in your cart to checkout.
          </p>
          <Button onClick={() => navigate("/")} className="mx-auto">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 flex items-center gap-1" 
        onClick={() => navigate("/cart")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Button>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                1
              </div>
              <div className={`w-10 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                2
              </div>
              <div className={`w-10 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                3
              </div>
            </div>
          </div>
          
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shipping Information
                </CardTitle>
                <CardDescription>Enter your shipping details</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="shipping-form" onSubmit={handleSubmitShipping} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        value={shippingInfo.firstName}
                        onChange={handleShippingInfoChange}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        value={shippingInfo.lastName}
                        onChange={handleShippingInfoChange}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email"
                      value={shippingInfo.email}
                      onChange={handleShippingInfoChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={handleShippingInfoChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={shippingInfo.address}
                      onChange={handleShippingInfoChange}
                      required 
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={shippingInfo.city}
                        onChange={handleShippingInfoChange}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province *</Label>
                      <Input 
                        id="state" 
                        name="state" 
                        value={shippingInfo.state}
                        onChange={handleShippingInfoChange}
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                      <Input 
                        id="zipCode" 
                        name="zipCode" 
                        value={shippingInfo.zipCode}
                        onChange={handleShippingInfoChange}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select 
                        defaultValue={shippingInfo.country}
                        onValueChange={(value) => 
                          setShippingInfo(prev => ({ ...prev, country: value }))
                        }
                      >
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Philippines">Philippines</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" form="shipping-form">Continue to Shipping Method</Button>
              </CardFooter>
            </Card>
          )}
          
          {currentStep === 2 && (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Shipping Method
                  </CardTitle>
                  <CardDescription>Select your preferred shipping option</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {shippingMethods.map((method) => (
                      <div 
                        key={method.id}
                        className={`border rounded-md p-4 cursor-pointer transition-colors ${shippingMethod === method.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                        onClick={() => setShippingMethod(method.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border ${shippingMethod === method.id ? 'border-4 border-primary' : 'border-muted-foreground'}`}></div>
                            <div>
                              <h3 className="font-medium">{method.name}</h3>
                              <p className="text-sm text-muted-foreground">{method.estimatedDays}</p>
                            </div>
                          </div>
                          <div className="font-semibold">{formatCurrency(method.price)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>Enter your payment details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="payment-form" onSubmit={handleSubmitPayment} className="space-y-6">
                    <div className="space-y-4">
                      <Label>Payment Method</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          className={`border rounded-md p-4 cursor-pointer transition-colors ${paymentMethod === 'creditCard' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                          onClick={() => setPaymentMethod('creditCard')}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'creditCard' ? 'border-4 border-primary' : 'border-muted-foreground'}`}></div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium">Credit Card</span>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-4 cursor-pointer transition-colors ${paymentMethod === 'gcash' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                          onClick={() => setPaymentMethod('gcash')}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'gcash' ? 'border-4 border-primary' : 'border-muted-foreground'}`}></div>
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <Smartphone className="h-3 w-3 text-white" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-blue-500">GCash</span>
                                <span className="text-xs text-muted-foreground">Mobile Wallet</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {paymentMethod === 'creditCard' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Name on Card *</Label>
                          <Input 
                            id="cardName" 
                            name="cardName" 
                            value={paymentInfo.cardName}
                            onChange={handlePaymentInfoChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number *</Label>
                          <Input 
                            id="cardNumber" 
                            name="cardNumber" 
                            placeholder="1234 5678 9012 3456"
                            value={paymentInfo.cardNumber}
                            onChange={handlePaymentInfoChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date *</Label>
                            <Input 
                              id="expiryDate" 
                              name="expiryDate" 
                              placeholder="MM/YY"
                              value={paymentInfo.expiryDate}
                              onChange={handlePaymentInfoChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input 
                              id="cvv" 
                              name="cvv" 
                              placeholder="123"
                              value={paymentInfo.cvv}
                              onChange={handlePaymentInfoChange}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'gcash' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="mobileNumber">GCash Mobile Number *</Label>
                          <Input 
                            id="mobileNumber" 
                            name="mobileNumber"
                            placeholder="09XX XXX XXXX"
                            value={gcashInfo.mobileNumber}
                            onChange={handleGcashInfoChange}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter the mobile number linked to your GCash account
                          </p>
                        </div>
                        
                        {showOtpField && (
                          <div className="space-y-2">
                            <Label htmlFor="otp">Verification Code (OTP) *</Label>
                            <Input 
                              id="otp" 
                              name="otp"
                              placeholder="Enter 6-digit code"
                              value={gcashInfo.otp}
                              onChange={handleGcashInfoChange}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter the verification code sent to your mobile number
                            </p>
                          </div>
                        )}

                        {isProcessingGcash && (
                          <div className="flex items-center justify-center p-4">
                            <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-primary rounded-full"></div>
                            <p>Processing...</p>
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                  <Button type="submit" form="payment-form">Place Order</Button>
                </CardFooter>
              </Card>
            </>
          )}
          
          {currentStep === 3 && (
            <Card>
              <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
                {paymentMethod === 'gcash' ? (
                  <CardDescription className="text-lg font-medium">
                    Your GCash payment was successful. Thank you for your purchase!
                  </CardDescription>
                ) : (
                  <CardDescription className="text-lg font-medium">
                    Your credit card payment was successful. Thank you for your purchase!
                  </CardDescription>
                )}
                <p className="text-muted-foreground mt-2">
                  Your order has been received and is being processed.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4 bg-muted/30">
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="text-sm space-y-1">
                    <p>Order ID: <span className="font-medium">ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span></p>
                    <p>Date: <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
                    <p>Email: <span className="font-medium">{shippingInfo.email}</span></p>
                    <p>Shipping Method: <span className="font-medium">{getSelectedShippingMethod().name}</span></p>
                    <p>Payment Method: <span className="font-medium">{paymentMethod === 'gcash' ? 'GCash' : 'Credit Card'}</span></p>
                    {paymentMethod === 'gcash' && <p>GCash Mobile: <span className="font-medium">{gcashInfo.mobileNumber}</span></p>}
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <div className="text-sm">
                    <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                    <p>{shippingInfo.address}</p>
                    <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                    <p>{shippingInfo.country}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => navigate("/")}>Continue Shopping</Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded" 
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(getSelectedShippingMethod().price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>{formatCurrency(getTotalPrice() * 0.08)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;