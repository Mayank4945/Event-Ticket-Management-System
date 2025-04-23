"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Users, CreditCard, Ticket } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Event, Venue, TicketType, User } from "@/types" // Added User type
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function EventDetails() {
  const { id } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [ticketType, setTicketType] = useState<TicketType>(TicketType.STANDARD)
  const [quantity, setQuantity] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (id) {
      fetchEventDetails()
    }
  }, [id])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      const eventResponse = await fetch(`http://localhost:8080/api/events/${id}`)
      
      if (!eventResponse.ok) {
        throw new Error("Failed to fetch event details")
      }
      
      const eventData = await eventResponse.json()
      setEvent(eventData)
      
      // Fetch venue details
      if (eventData.venueId) {
        const venueResponse = await fetch(`http://localhost:8080/api/venues/${eventData.venueId}`)
        
        if (venueResponse.ok) {
          const venueData = await venueResponse.json()
          setVenue(venueData)
        }
      }
    } catch (error) {
      console.error("Error fetching event details:", error)
      toast({
        title: "Error",
        description: "Failed to load event details. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculatePrice = () => {
    if (!event) return 0
    
    let multiplier = 1
    switch (ticketType) {
      case TicketType.VIP:
        multiplier = 2
        break
      case TicketType.PREMIUM:
        multiplier = 1.5
        break
      case TicketType.EARLY_BIRD:
        multiplier = 0.8
        break
      default:
        multiplier = 1
    }
    
    return event.basePrice * multiplier * quantity
  }

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase tickets.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }
    
    setIsProcessing(true)
    try {
      // Create order
      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          eventId: event?.id,
          quantity: quantity,
          ticketType: ticketType,
          totalAmount: calculatePrice()
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to complete purchase")
      }
      
      const orderData = await response.json()
      
      toast({
        title: "Purchase Successful",
        description: "Your tickets have been purchased successfully!",
      })
      
      // Redirect to order confirmation
      router.push(`/orders/${orderData.id}`)
    } catch (error) {
      console.error("Error purchasing tickets:", error)
      toast({
        title: "Error",
        description: "Failed to complete your purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setIsDialogOpen(false)
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading event details...</div>
  }

  if (!event) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-4" onClick={() => router.push("/events")}>
          Browse Events
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <img
          src={event.imageUrl || "https://via.placeholder.com/1200x400?text=Event"}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.eventDate), "EEEE, MMMM d, yyyy")}</span>
            <span className="mx-1">•</span>
            <Clock className="h-4 w-4" />
            <span>{format(new Date(event.eventDate), "h:mm a")}</span>
          </div>
          
          <div className="flex gap-2 mb-4 flex-wrap">
            {event.categories.map((category, index) => (
              <Badge key={index} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{venue?.name || "Location TBA"}</div>
                    {venue && (
                      <div className="text-sm text-muted-foreground">
                        {venue.address.street}, {venue.address.city}, {venue.address.state}, {venue.address.zipCode}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Capacity</div>
                    <div className="text-sm text-muted-foreground">
                      {event.availableSeats} / {event.totalSeats} seats available
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Base Price</div>
                    <div className="text-sm text-muted-foreground">
                      ${event.basePrice.toFixed(2)} per ticket
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="prose max-w-none">
            <h3 className="text-xl font-medium mb-2">About this Event</h3>
            <p>{event.description}</p>
          </div>
        </div>
        
        <div className="w-full md:w-72">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Tickets</CardTitle>
              <CardDescription>Select ticket type and quantity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ticket Type</label>
                <Select 
                  value={ticketType} 
                  onValueChange={(value) => setTicketType(value as TicketType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ticket type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TicketType.STANDARD}>Standard (${event.basePrice.toFixed(2)})</SelectItem>
                    <SelectItem value={TicketType.VIP}>VIP (${(event.basePrice * 2).toFixed(2)})</SelectItem>
                    <SelectItem value={TicketType.PREMIUM}>Premium (${(event.basePrice * 1.5).toFixed(2)})</SelectItem>
                    <SelectItem value={TicketType.EARLY_BIRD}>Early Bird (${(event.basePrice * 0.8).toFixed(2)})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Select 
                  value={quantity.toString()} 
                  onValueChange={(value) => setQuantity(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(Math.min(10, event.availableSeats))].map((_, i) => (
                      <SelectItem key={i} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>${calculatePrice().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => setIsDialogOpen(true)}
                disabled={event.availableSeats === 0}
              >
                {event.availableSeats > 0 ? (
                  <>
                    <Ticket className="mr-2 h-4 w-4" />
                    Buy Tickets
                  </>
                ) : (
                  "Sold Out"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>You are about to purchase tickets for {event.title}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Event:</span>
              <span className="font-medium">{event.title}</span>
              
              <span className="text-muted-foreground">Date:</span>
              <span>{format(new Date(event.eventDate), "MMM d, yyyy 'at' h:mm a")}</span>
              
              <span className="text-muted-foreground">Ticket Type:</span>
              <span>{ticketType}</span>
              
              <span className="text-muted-foreground">Quantity:</span>
              <span>{quantity}</span>
              
              <span className="text-muted-foreground">Price per Ticket:</span>
              <span>${(calculatePrice() / quantity).toFixed(2)}</span>
              
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold">${calculatePrice().toFixed(2)}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePurchase} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}