"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Ticket, Event } from "@/types"
import { Calendar, Clock, Ticket as TicketIcon } from "lucide-react"

export function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return
      
      try {
        const response = await fetch(`http://localhost:8080/api/tickets/user/${user.id}`)
        if (!response.ok) throw new Error("Failed to fetch tickets")
        const data = await response.json()
        setTickets(data)
      } catch (error) {
        console.error("Error fetching tickets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [user])

  if (loading) {
    return <div className="text-center py-10">Loading your tickets...</div>
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-10">
        <TicketIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>You don't have any tickets yet.</p>
        <p className="mt-2">
          <Button onClick={() => window.location.href = "/"}>
            Browse Events
          </Button>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Tickets</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle>{ticket.eventTitle}</CardTitle>
              <CardDescription>Ticket #{ticket.ticketNumber}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 opacity-70" />
                  <span>{new Date(ticket.eventDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 opacity-70" />
                  <span>{new Date(ticket.eventDate).toLocaleTimeString()}</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Type: {ticket.type}</span>
                </div>
                <div>
                  <span className="font-medium">Price: ${ticket.price.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Download Ticket
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}