import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useReservationStore, Reservation } from "@/stores/reservationStore";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarClock, FileClock, Clock, Calendar, PhoneCall, Mail, CheckCircle, X, AlertCircle, Plus, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addSampleReservation } from "@/utils/addSampleReservation";

const ReservationsPage = () => {
  const [location, navigate] = useLocation();
  const { reservations, removeReservation, updateReservation } = useReservationStore();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [editedContactInfo, setEditedContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const { toast } = useToast();

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailsOpen(true);
  };
  
  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditedContactInfo({
      name: reservation.contactInfo.name === "Quick Reservation" ? "" : reservation.contactInfo.name,
      email: reservation.contactInfo.email,
      phone: reservation.contactInfo.phone === "Please update" ? "" : reservation.contactInfo.phone,
      message: reservation.contactInfo.message || ""
    });
    setIsEditOpen(true);
  };
  
  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsCancelOpen(true);
  };
  
  const handlePayReservationFee = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsPaymentOpen(true);
  };
  
  const handleCompletePayment = () => {
    if (selectedReservation) {
      updateReservation(selectedReservation.id, { status: 'confirmed' });
      toast({
        title: "Payment Successful",
        description: "Your reservation fee has been paid and your appointment is confirmed.",
      });
      setIsPaymentOpen(false);
    }
  };
  
  const saveContactInfo = () => {
    if (selectedReservation && 
        editedContactInfo.name.trim() !== "" && 
        editedContactInfo.email.trim() !== "" && 
        editedContactInfo.phone.trim() !== "") {
      
      updateReservation(selectedReservation.id, { 
        contactInfo: editedContactInfo
      });
      
      setIsEditOpen(false);
      
      toast({
        title: "Contact Information Updated",
        description: "Your reservation details have been updated successfully.",
      });
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
    }
  };

  const confirmCancelReservation = () => {
    if (selectedReservation) {
      // In a real app, we'd make an API call here
      updateReservation(selectedReservation.id, { status: 'cancelled' });
      toast({
        title: "Reservation Cancelled",
        description: "Your reservation has been cancelled successfully.",
      });
      setIsCancelOpen(false);
    }
  };

  // Check if contact info needs to be updated (from a quick reservation)
  const needsContactUpdate = (reservation: Reservation) => {
    return reservation.contactInfo.name === "Quick Reservation" || 
           reservation.contactInfo.phone === "Please update";
  };

  const getStatusBadge = (status: Reservation['status'], reservation?: Reservation) => {
    const baseStatus = (className: string, text: string) => (
      <Badge variant="outline" className={className}>{text}</Badge>
    );
    
    // First determine the status badge
    let badge;
    switch (status) {
      case 'pending':
        badge = baseStatus("bg-yellow-100 text-yellow-800 border-yellow-200", "Pending");
        break;
      case 'confirmed':
        badge = baseStatus("bg-blue-100 text-blue-800 border-blue-200", "Confirmed");
        break;
      case 'completed':
        badge = baseStatus("bg-green-100 text-green-800 border-green-200", "Completed");
        break;
      case 'cancelled':
        badge = baseStatus("bg-red-100 text-red-800 border-red-200", "Cancelled");
        break;
      default:
        badge = null;
    }
    
    // If reservation is provided and needs contact update, add a second badge
    if (reservation && needsContactUpdate(reservation)) {
      return (
        <div className="flex flex-col gap-1">
          {badge}
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            Update Details
          </Badge>
        </div>
      );
    }
    
    return badge;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Reservations</h1>
        <Button onClick={() => navigate("/")}>
          Browse Vehicles
        </Button>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileClock className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Reservations</h2>
            <p className="text-muted-foreground text-center mb-6">
              You haven't made any vehicle reservations yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => navigate("/category/cars")}>Browse Cars</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  addSampleReservation();
                  toast({
                    title: "Sample Reservation Added",
                    description: "A sample reservation has been added for demo purposes.",
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sample Reservation
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Vehicle Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Reservation Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={reservation.product.image}
                          alt={reservation.product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium">{reservation.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {reservation.product.category.charAt(0).toUpperCase() + reservation.product.category.slice(1)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{format(reservation.date, 'MMM dd, yyyy')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reservation.status, reservation)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(reservation.fee)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(reservation)}
                        className="mr-1"
                      >
                        Details
                      </Button>
                      {reservation.status !== 'cancelled' && (
                        <Button
                          variant={needsContactUpdate(reservation) ? "default" : "outline"}
                          size="sm"
                          className={!needsContactUpdate(reservation) ? "mr-1" : "text-white mr-1"}
                          onClick={() => handleEditReservation(reservation)}
                        >
                          {needsContactUpdate(reservation) ? "Update Info" : "Edit"}
                        </Button>
                      )}
                      {reservation.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50 mr-1"
                          onClick={() => handlePayReservationFee(reservation)}
                        >
                          Pay Fee
                        </Button>
                      )}
                      {reservation.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleCancelReservation(reservation)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Reservation Details Dialog */}
      {selectedReservation && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Reservation Details</DialogTitle>
              <DialogDescription>
                Details for your reservation of {selectedReservation.product.name}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedReservation.product.image} 
                  alt={selectedReservation.product.name} 
                  className="w-20 h-20 rounded-md object-cover" 
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedReservation.product.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedReservation.product.category.charAt(0).toUpperCase() + selectedReservation.product.category.slice(1)}
                  </p>
                  <p className="font-medium text-lg mt-1">
                    {formatCurrency(selectedReservation.product.price)}
                  </p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Reservation Status</Label>
                <div className="flex items-center">
                  {selectedReservation.status === 'pending' && <Clock className="h-4 w-4 mr-2 text-yellow-500" />}
                  {selectedReservation.status === 'confirmed' && <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />}
                  {selectedReservation.status === 'completed' && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
                  {selectedReservation.status === 'cancelled' && <X className="h-4 w-4 mr-2 text-red-500" />}
                  {getStatusBadge(selectedReservation.status, selectedReservation)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Appointment Date</Label>
                  <div className="flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2 text-primary" />
                    <span>{format(selectedReservation.date, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Reservation Fee</Label>
                  <p className="font-medium">{formatCurrency(selectedReservation.fee)}</p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label>Contact Information</Label>
                  {selectedReservation.status !== 'cancelled' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => {
                        setIsDetailsOpen(false);
                        handleEditReservation(selectedReservation);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit Contact Info
                    </Button>
                  )}
                </div>
                <div className="rounded-md border p-3 space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedReservation.contactInfo.name}</p>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{selectedReservation.contactInfo.email}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneCall className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{selectedReservation.contactInfo.phone}</span>
                  </div>
                  {selectedReservation.contactInfo.message && (
                    <div>
                      <p className="font-medium mb-1">Additional Notes:</p>
                      <p className="text-sm text-muted-foreground">{selectedReservation.contactInfo.message}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">What's Next?</p>
                    {selectedReservation.status === 'pending' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Your reservation is pending confirmation. A team member will contact you shortly to confirm your appointment.
                      </p>
                    )}
                    {selectedReservation.status === 'confirmed' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Your appointment is confirmed! Please arrive at the dealership on the scheduled date with a valid ID.
                      </p>
                    )}
                    {selectedReservation.status === 'completed' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        This reservation has been completed. Thank you for your business!
                      </p>
                    )}
                    {selectedReservation.status === 'cancelled' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        This reservation has been cancelled. The reservation fee may be refunded based on our cancellation policy.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
              {selectedReservation.status === 'pending' && (
                <Button 
                  variant="default"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handlePayReservationFee(selectedReservation);
                  }}
                >
                  Pay Reservation Fee
                </Button>
              )}
              {selectedReservation.status !== 'cancelled' && (
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleCancelReservation(selectedReservation);
                  }}
                >
                  Cancel Reservation
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Confirmation Dialog */}
      {selectedReservation && (
        <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Reservation</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your reservation for {selectedReservation.product.name}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-3">
              <p className="text-sm text-muted-foreground mb-2">
                Cancellation Policy:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>If cancelled more than 48 hours before your appointment, your reservation fee will be fully refunded.</li>
                <li>If cancelled less than 48 hours before your appointment, your reservation fee is non-refundable.</li>
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
                Keep Reservation
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmCancelReservation}
              >
                Cancel Reservation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Dialog */}
      {selectedReservation && (
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pay Reservation Fee</DialogTitle>
              <DialogDescription>
                Complete payment for your {selectedReservation.product.name} reservation.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <img 
                  src={selectedReservation.product.image} 
                  alt={selectedReservation.product.name} 
                  className="h-16 w-16 rounded-md object-cover" 
                />
                <div>
                  <h3 className="font-medium">{selectedReservation.product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Reservation Fee: {formatCurrency(selectedReservation.fee)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Appointment Date: {format(selectedReservation.date, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Payment Method</h3>
                <div className="border rounded-md p-3 flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full border border-primary flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                  </div>
                  <span>Credit Card</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input id="cardName" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input id="expiryDate" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-medium">
                  <span>Total to pay:</span>
                  <span className="text-lg">{formatCurrency(selectedReservation.fee)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This reservation fee will be applied to your purchase when you buy the vehicle.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCompletePayment}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Edit Contact Information Dialog */}
      {selectedReservation && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Contact Information</DialogTitle>
              <DialogDescription>
                Update your contact details for this reservation.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={editedContactInfo.name} 
                  onChange={handleContactInfoChange}
                  placeholder="John Doe"
                  className={needsContactUpdate(selectedReservation) && !editedContactInfo.name ? "border-red-500" : ""}
                />
                {needsContactUpdate(selectedReservation) && !editedContactInfo.name && (
                  <p className="text-xs text-red-500 mt-1">Please enter your name</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={editedContactInfo.email} 
                  onChange={handleContactInfoChange}
                  placeholder="john@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={editedContactInfo.phone} 
                  onChange={handleContactInfoChange}
                  placeholder="(123) 456-7890"
                  className={needsContactUpdate(selectedReservation) && !editedContactInfo.phone ? "border-red-500" : ""}
                />
                {needsContactUpdate(selectedReservation) && !editedContactInfo.phone && (
                  <p className="text-xs text-red-500 mt-1">Please enter your phone number</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Additional Message (Optional)</Label>
                <Input 
                  id="message" 
                  name="message" 
                  value={editedContactInfo.message} 
                  onChange={handleContactInfoChange}
                  placeholder="Any specific requirements or questions?"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveContactInfo}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReservationsPage;