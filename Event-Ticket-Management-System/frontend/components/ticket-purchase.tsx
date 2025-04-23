"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Event, TicketType } from "@/types"

interface TicketPurchaseProps {
  event: Event
}

export function TicketPurchase({ event }: TicketPurchaseProps) {
  const [ticketType, setTicketType] = useState<TicketType>(TicketType.STANDARD)
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const ticketPrices = {
    [TicketType.STANDARD]: event.basePrice,
    [TicketType.VIP]: event.basePrice * 2,
    [TicketType.PREMIUM]: event.basePrice * 1.5,
    [TicketType.EARLY_BIRD]: event.basePrice * 0.85,
  }

  const calculateTotal = () => {
    return ticketPrices[ticketType] * quantity
  }

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to purchase tickets",
        variant: "destructive",
      })
      return
    }

    if (quantity > event.availableSeats) {
      toast({
        title: "Error",
        description: `Only ${event.availableSeats} seats are available`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        userId: user.id,
        eventId: event.id,
        ticketType,
        quantity,
        unitPrice: ticketPrices[ticketType],
        paymentMethod,
      }

      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) throw new Error("Failed to create order")

      const order = await response.json()

      toast({
        title: "Success",
        description: "Tickets purchased successfully!",
      })

      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("Error purchasing tickets:", error)
      toast({
        title: "Error",
        description: "Failed to purchase tickets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!event.published || event.availableSeats <= 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            {!event.published
              ? "This event is not available for booking yet."
              : "Sorry, this event is sold out."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Tickets</CardTitle>
        <CardDescription>
          {event.availableSeats} seats available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ticket-type">Ticket Type</Label>
          <Select
            value={ticketType}
            onValueChange={(value) => setTicketType(value as TicketType)}
          >
            <SelectTrigger id="ticket-type">
              <SelectValue placeholder="Select ticket type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TicketType.STANDARD}>
                Standard (${ticketPrices[TicketType.STANDARD]})
              </SelectItem>
              <SelectItem value={TicketType.VIP}>
                VIP (${ticketPrices[TicketType.VIP]})
              </SelectItem>
              <SelectItem value={TicketType.PREMIUM}>
                Premium (${ticketPrices[TicketType.PREMIUM]})
              </SelectItem>
              <SelectItem value={TicketType.EARLY_BIRD}>
                Early Bird (${ticketPrices[TicketType.EARLY_BIRD]})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={event.availableSeats}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-method">Payment Method</Label>
          <Select
            value={paymentMethod}
            onValueChange={setPaymentMethod}
          >
            <SelectTrigger id="payment-method">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
              <SelectItem value="PAYPAL">PayPal</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${(ticketPrices[ticketType] * quantity).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold mt-2">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handlePurchase} 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Purchase Tickets"}
        </Button>
      </CardFooter>
    </Card>
  )
}