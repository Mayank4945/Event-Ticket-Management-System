"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Ticket as TicketIcon, Download, QrCode } from "lucide-react"
import { Ticket, Event, TicketType } from "@/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default function MyTicketsPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [loading, isAuthenticated, router])
  
  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingTickets(true);
        // Call the actual API endpoint
        const response = await fetch(`http://localhost:8080/api/tickets/user/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }
        
        const ticketsData = await response.json();
        
        // Enhance tickets with event details
        interface TicketData {
          id: string;
          eventId: string;
          type: string;
          price: number;
          ticketNumber: string;
          used: boolean;
        }

        interface EventData {
          title: string;
          eventDate: string;
          venueName?: string;
        }

        interface EnhancedTicket extends TicketData {
          eventTitle: string;
          eventDate: string;
          venueName: string;
        }

        const enhancedTickets: EnhancedTicket[] = await Promise.all(ticketsData.map(async (ticket: TicketData): Promise<EnhancedTicket> => {
          try {
            const eventResponse = await fetch(`http://localhost:8080/api/events/${ticket.eventId}`);
            if (eventResponse.ok) {
              const eventData: EventData = await eventResponse.json();
              return {
          ...ticket,
          eventTitle: eventData.title,
          eventDate: eventData.eventDate,
          venueName: eventData.venueName || "Venue information not available"
              };
            }
            return {
              ...ticket,
              eventTitle: "Unknown Event",
              eventDate: "Unknown Date",
              venueName: "Venue information not available"
            };
          } catch (error) {
            console.error("Error fetching event details:", error);
            return {
              ...ticket,
              eventTitle: "Unknown Event",
              eventDate: "Unknown Date",
              venueName: "Venue information not available"
            };
          }
        }));
        
        setTickets(enhancedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoadingTickets(false);
      }
    }
    
    if (isAuthenticated) {
      fetchTickets()
    }
  }, [isAuthenticated, user])
  
  if (loading || !isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }
  
  const upcomingTickets = tickets.filter(ticket => 
    !ticket.used && new Date(ticket.eventDate) > new Date()
  )
  
  const pastTickets = tickets.filter(ticket => 
    ticket.used || new Date(ticket.eventDate) <= new Date()
  )
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
        <p className="text-muted-foreground mb-6">Manage your event tickets</p>
        
        {loadingTickets ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming ({upcomingTickets.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastTickets.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {upcomingTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingTickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border rounded-lg bg-muted/20">
                  <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No upcoming tickets</h3>
                  <p className="text-muted-foreground mb-4">You don't have any upcoming event tickets</p>
                  <Button onClick={() => router.push("/events")}>Browse Events</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {pastTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastTickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} isPast />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border rounded-lg bg-muted/20">
                  <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No past tickets</h3>
                  <p className="text-muted-foreground">Your ticket history will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

function TicketCard({ ticket, isPast = false }: { ticket: any, isPast?: boolean }) {
  const eventDate = new Date(ticket.eventDate)
  
  return (
    <Card className={isPast ? "opacity-80" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{ticket.eventTitle}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {ticket.venueName}
            </CardDescription>
          </div>
          <Badge variant={ticket.used ? "outline" : isPast ? "destructive" : "default"}>
            {ticket.used ? "Used" : isPast ? "Missed" : "Valid"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
        </div>
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{format(eventDate, "h:mm a")}</span>
        </div>
        <div className="flex items-center text-sm">
          <TicketIcon className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium">{ticket.type} - ${ticket.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center text-sm">
          <QrCode className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-mono">{ticket.ticketNumber}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="w-full" disabled={isPast}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        {!isPast && (
          <Button variant="secondary" className="w-full">
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}