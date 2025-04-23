"use client"

import { useState, useEffect } from "react"
import { Ticket, BadgeCheck, Search, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Ticket as TicketType, Event } from "@/types"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function TicketManagement() {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTickets(tickets)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredTickets(
        tickets.filter(
          (ticket) =>
            ticket.ticketNumber.toLowerCase().includes(query) ||
            (ticket.event?.title.toLowerCase().includes(query))
        )
      )
    }
  }, [searchQuery, tickets])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8080/api/tickets")
      
      if (!response.ok) {
        throw new Error("Failed to fetch tickets")
      }
      
      const data = await response.json()
      
      // Fetch event details for each ticket
      const ticketsWithEvents = await Promise.all(
        data.map(async (ticket: TicketType) => {
          try {
            const eventResponse = await fetch(`http://localhost:8080/api/events/${ticket.eventId}`)
            if (eventResponse.ok) {
              const eventData = await eventResponse.json()
              return { ...ticket, event: eventData }
            }
            return ticket
          } catch {
            return ticket
          }
        })
      )
      
      setTickets(ticketsWithEvents)
      setFilteredTickets(ticketsWithEvents)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      toast({
        title: "Error",
        description: "Failed to load tickets. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleValidateTicket = async (ticketId: string) => {
    setIsValidating(true)
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/${ticketId}/validate`, {
        method: "PUT",
      })
      
      if (!response.ok) {
        throw new Error("Failed to validate ticket")
      }
      
      const updatedTicket = await response.json()
      
      // Update the ticket in the state
      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, used: true } : ticket
        )
      )
      
      toast({
        title: "Success",
        description: "Ticket has been validated successfully.",
      })
      
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error validating ticket:", error)
      toast({
        title: "Error",
        description: "Failed to validate ticket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleViewTicket = (ticket: TicketType) => {
    setSelectedTicket(ticket)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticket number or event..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={fetchTickets}>Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Management</CardTitle>
          <CardDescription>View and validate tickets for events</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading tickets...</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                        <TableCell>{ticket.event?.title || "Unknown Event"}</TableCell>
                        <TableCell>{ticket.type}</TableCell>
                        <TableCell>{format(new Date(ticket.purchaseDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant={ticket.used ? "outline" : "default"}>
                            {ticket.used ? "Used" : "Valid"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewTicket(ticket)}
                            >
                              <Ticket className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTicket(ticket)
                                handleValidateTicket(ticket.id)
                              }}
                              disabled={ticket.used}
                            >
                              <BadgeCheck className="h-4 w-4 mr-1" />
                              Validate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No tickets found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTicket && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ticket Details</DialogTitle>
              <DialogDescription>Information about this ticket</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <QrCode className="h-32 w-32" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Ticket Number:</span>
                <span className="font-medium">{selectedTicket.ticketNumber}</span>
                
                <span className="text-muted-foreground">Event:</span>
                <span>{selectedTicket.event?.title || "Unknown Event"}</span>
                
                <span className="text-muted-foreground">Date:</span>
                <span>
                  {selectedTicket.event?.eventDate 
                    ? format(new Date(selectedTicket.event.eventDate), "MMM d, yyyy 'at' h:mm a") 
                    : "Unknown"}
                </span>
                
                <span className="text-muted-foreground">Type:</span>
                <span>{selectedTicket.type}</span>
                
                <span className="text-muted-foreground">Price:</span>
                <span>${selectedTicket.price.toFixed(2)}</span>
                
                <span className="text-muted-foreground">Purchase Date:</span>
                <span>{format(new Date(selectedTicket.purchaseDate), "MMM d, yyyy")}</span>
                
                <span className="text-muted-foreground">Status:</span>
                <span>
                  <Badge variant={selectedTicket.used ? "outline" : "default"}>
                    {selectedTicket.used ? "Used" : "Valid"}
                  </Badge>
                </span>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
              {!selectedTicket.used && (
                <Button 
                  onClick={() => handleValidateTicket(selectedTicket.id)}
                  disabled={isValidating}
                >
                  {isValidating ? "Validating..." : "Validate Ticket"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}